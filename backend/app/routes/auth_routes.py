from flask import Blueprint, request, jsonify
from app import db
import bcrypt
import jwt
import datetime
from bson.objectid import ObjectId
from app.config import Config

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = (data.get('email') or '').strip() or None
    username = (data.get('username') or data.get('name') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    users_collection = db['users']
    if users_collection.find_one({"username": username}) or users_collection.find_one({"name": username}):
        return jsonify({"message": "User already exists"}), 400

    if email and users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user_id = users_collection.insert_one({
        "name": username,
        "username": username,
        "email": email,
        "password": hashed_password
    }).inserted_id

    return jsonify({"message": "User registered successfully", "user_id": str(user_id)}), 201

@auth_bp.route('/users', methods=['GET'])
def list_users():
    users_collection = db['users']
    users = list(users_collection.find({}, {"password": 0}).sort("_id", -1))

    return jsonify({
        "users": [
            {
                "_id": str(user["_id"]),
                "name": user.get("name") or user.get("username") or "User",
                "username": user.get("username") or user.get("name") or "",
                "email": user.get("email") or "",
            }
            for user in users
        ]
    }), 200

@auth_bp.route('/select', methods=['POST'])
def select_user():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({"message": "User ID required"}), 400

    try:
        object_id = ObjectId(user_id)
    except Exception:
        return jsonify({"message": "Invalid user ID"}), 400

    users_collection = db['users']
    user = users_collection.find_one({"_id": object_id})

    if not user:
        return jsonify({"message": "User not found"}), 404

    token = jwt.encode({
        "user_id": str(user['_id']),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=365)
    }, Config.SECRET_KEY, algorithm="HS256")

    return jsonify({
        "token": token,
        "user_id": str(user['_id']),
        "email": user.get('email', ''),
        "name": user.get('name') or user.get('username') or 'User'
    }), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username') or data.get('name') or data.get('email')
    password = data.get('password')

    users_collection = db['users']
    user = users_collection.find_one({"username": username}) or users_collection.find_one({"name": username}) or users_collection.find_one({"email": username})

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    try:
        password_match = bcrypt.checkpw(password.encode('utf-8'), user['password'])
    except Exception as e:
        return jsonify({"message": "Authentication error"}), 401
    
    if not password_match:
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode({
        "user_id": str(user['_id']),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=365)
    }, Config.SECRET_KEY, algorithm="HS256")

    return jsonify({"token": token, "email": user.get('email', ''), "name": user.get('username') or user.get('name', 'User')}), 200
