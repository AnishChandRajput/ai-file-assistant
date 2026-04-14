import os
from dotenv import load_dotenv

load_dotenv()
print(f"DEBUG: Loading config from {os.path.abspath('.env')}")

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_secret_key')
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/ai_file_assistant')
    NVIDIA_API_KEY = os.environ.get('NVIDIA_API_KEY', '')
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
    VECTOR_STORE_DIR = os.path.join(os.getcwd(), 'vector_store')
    
    # Verify load
    if SECRET_KEY == 'default_secret_key':
        print("WARNING: SECRET_KEY not found in .env, using default!")
    else:
        print(f"SUCCESS: SECRET_KEY loaded (Length: {len(SECRET_KEY)})")
