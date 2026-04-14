from flask import Blueprint, request, jsonify
from app import db
import bcrypt
import jwt
import datetime
from app.config import Config

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    username = data.get('username') or data.get('name')
    password = data.get('password')

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

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username') or data.get('name') or data.get('email')
    password = data.get('password')

    users_collection = db['users']
    user = users_collection.find_one({"username": username}) or users_collection.find_one({"name": username}) or users_collection.find_one({"email": username})

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode({
        "user_id": str(user['_id']),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=365) # Extended for "permanent" local use
    }, Config.SECRET_KEY, algorithm="HS256")

    return jsonify({"token": token, "email": user.get('email', ''), "name": user.get('username') or user.get('name', 'User')}), 200
