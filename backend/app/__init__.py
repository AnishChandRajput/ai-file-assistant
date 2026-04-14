from flask import Flask
from flask_cors import CORS
from app.config import Config
from pymongo import MongoClient

# Database instance
db = None

def create_app():
    global db
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Init MongoDB
    client = MongoClient(app.config['MONGO_URI'])
    db = client.get_database()

    # Import routes
    from app.routes.auth_routes import auth_bp
    from app.routes.file_routes import file_bp
    from app.routes.ai_routes import ai_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(file_bp, url_prefix='/api/files')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')

    return app
