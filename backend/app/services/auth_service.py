from functools import wraps
from flask import request, jsonify
import jwt
from app.config import Config

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            print("AUTH ERROR: Token has expired")
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError as e:
            print(f"AUTH ERROR: Invalid token - {str(e)}")
            return jsonify({'message': f'Token is invalid! {str(e)}'}), 401
        except Exception as e:
            print(f"AUTH ERROR: Unexpected error - {str(e)}")
            return jsonify({'message': 'Authentication failed!'}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated
