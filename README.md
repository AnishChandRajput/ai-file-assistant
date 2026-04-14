# AI-Powered File Sharing & Document Assistant

## Features
- **Frontend**: Built with React (Vite) and Tailwind CSS with a modern UI (including Dark Mode).
- **Backend**: Built with Python (Flask) and MongoDB.
- **AI Integration**: Uses OpenAI, PyPDF2, LangChain, and FAISS for text extraction, chunking, vector storage, and Retrieval-Augmented Generation (RAG).
- **Functionality**:
  - Secure Login / Registration
  - File Uploading (PDF, TXT, DOCX)
  - Ask Questions about your uploaded files in real-time
  - Generate automatic Summaries
  - Generate flashcards / MCQs

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB properly installed and running locally on `localhost:27017`
- Your OpenAI API Key

### Backend Setup
1. Open a terminal and navigate to `backend/`.
2. Ensure you have activated the virtual environment:
   - On Windows: `.\venv\Scripts\activate`
3. If not already installed, install dependencies: `pip install -r requirements.txt` (or manually run `pip install flask flask-cors pymongo pyjwt langchain langchain-community langchain-openai faiss-cpu openai pypdf2 python-dotenv bcrypt python-docx werkzeug`)
4. Open `backend/.env` and insert your actual `OPENAI_API_KEY`.
5. Run the server:
   ```bash
   python run.py
   ```
   The backend will start at `http://localhost:5000`.

### Frontend Setup
1. Open another terminal and navigate to `frontend/`.
2. Install dependencies (already done if built via AI assistant): `npm install`
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at the URL provided by Vite (usually `http://localhost:5173`).

### Usage
- Create a new account or log in.
- Upload a document. Wait for the status to change to "processed".
- Click on the document to open the File Detail & Chat View.
- Ask questions on the right pane, or use the "AI Actions" on the left pane to generate summaries and MCQs.

Enjoy your AI-Powered Document Assistant!
