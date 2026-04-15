from flask import Blueprint, request, jsonify
from app import db
from app.services.auth_service import token_required
from app.services.ai_service import ask_question_on_file, generate_summary, generate_mcq

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/chat', methods=['POST'])
@token_required
def chat(current_user_id):
    data = request.get_json()
    file_id = data.get('file_id')
    question = data.get('question')
    
    if not file_id or not question:
        return jsonify({"message": "file_id and question are required"}), 400
    
    try:
        answer = ask_question_on_file(file_id, question)
    except Exception as e:
        return jsonify({"message": str(e)}), 503
    return jsonify({"answer": answer}), 200

@ai_bp.route('/summary', methods=['POST'])
@token_required
def summary(current_user_id):
    data = request.get_json()
    file_id = data.get('file_id')
    
    if not file_id:
        return jsonify({"message": "file_id is required"}), 400
        
    try:
        summary_text = generate_summary(file_id)
    except Exception as e:
        return jsonify({"message": str(e)}), 503
    return jsonify({"summary": summary_text}), 200

@ai_bp.route('/mcq', methods=['POST'])
@token_required
def mcq(current_user_id):
    data = request.get_json()
    file_id = data.get('file_id')
    
    if not file_id:
        return jsonify({"message": "file_id is required"}), 400
        
    try:
        mcq_text = generate_mcq(file_id)
    except Exception as e:
        return jsonify({"message": str(e)}), 503
    return jsonify({"mcq": mcq_text}), 200
