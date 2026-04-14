from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from threading import Thread
import os
import uuid
import shutil
from bson.objectid import ObjectId
from app import db
from app.config import Config
from app.services.auth_service import token_required
from app.services.ai_service import create_vector_store_for_file

file_bp = Blueprint('files', __name__)

@file_bp.route('/delete/<file_id>', methods=['DELETE'])
@token_required
def delete_file(current_user_id, file_id):
    files_collection = db['files']
    
    # Find file and verify ownership
    file_doc = files_collection.find_one({"_id": ObjectId(file_id), "user_id": current_user_id})
    if not file_doc:
        return jsonify({"message": "File not found or unauthorized"}), 404
    
    # 1. Delete Physical File
    filepath = file_doc.get('filepath')
    if filepath and os.path.exists(filepath):
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"Error deleting physical file: {e}")
            
    # 2. Delete Vector Store index
    index_path = os.path.join(Config.VECTOR_STORE_DIR, str(file_id))
    if os.path.exists(index_path):
        try:
            shutil.rmtree(index_path)
        except Exception as e:
            print(f"Error deleting vector store: {e}")
            
    # 3. Delete from DB
    files_collection.delete_one({"_id": ObjectId(file_id)})
    
    return jsonify({"message": "File deleted successfully"}), 200

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@file_bp.route('/upload', methods=['POST'])
@token_required
def upload_file(current_user_id):
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Give a unique ID to avoid overwriting
        unique_id = str(uuid.uuid4())
        saved_filename = f"{unique_id}_{filename}"
        filepath = os.path.join(Config.UPLOAD_FOLDER, saved_filename)
        
        # Ensure directory exists
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        file.save(filepath)
        
        # Save metadata to DB
        files_collection = db['files']
        file_doc = {
            "user_id": current_user_id,
            "original_filename": filename,
            "saved_filename": saved_filename,
            "filepath": filepath,
            "status": "uploaded" # can be 'processed' later when vector DB is synced
        }
        file_id = files_collection.insert_one(file_doc).inserted_id
        
        # Trigger AI Background Processing here (Extraction + Embedding)
        def process_file_bg(fp, fid):
            success = create_vector_store_for_file(fp, fid)
            if success:
                files_collection.update_one({"_id": file_id}, {"$set": {"status": "processed"}})
            else:
                files_collection.update_one({"_id": file_id}, {"$set": {"status": "failed_or_skipped"}})
        
        Thread(target=process_file_bg, args=(filepath, file_id)).start()
        
        return jsonify({"message": "File uploaded successfully", "file_id": str(file_id)}), 200

    return jsonify({"message": "File type not allowed"}), 400

@file_bp.route('/list', methods=['GET'])
@token_required
def list_files(current_user_id):
    files_collection = db['files']
    user_files = list(files_collection.find({"user_id": current_user_id}))
    
    for f in user_files:
        f['_id'] = str(f['_id'])
        
    return jsonify({"files": user_files}), 200
