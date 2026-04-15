import os
import PyPDF2
import docx
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_nvidia_ai_endpoints import ChatNVIDIA, NVIDIAEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from app.config import Config

os.environ["NVIDIA_API_KEY"] = Config.NVIDIA_API_KEY


def _chat_model():
    return ChatNVIDIA(model=Config.NVIDIA_CHAT_MODEL)

def extract_text_from_file(filepath):
    ext = filepath.rsplit('.', 1)[1].lower()
    text = ""
    try:
        if ext == 'txt':
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
        elif ext == 'pdf':
            with open(filepath, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        elif ext == 'docx':
            doc = docx.Document(filepath)
            for para in doc.paragraphs:
                text += para.text + "\n"
    except Exception as e:
        print(f"Error extracting text: {e}")
    return text

def create_vector_store_for_file(filepath, file_id):
    if not Config.NVIDIA_API_KEY:
        return False

    text = extract_text_from_file(filepath)
    if not text.strip():
        return False
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_text(text)
    
    embeddings = NVIDIAEmbeddings(model="nvidia/nv-embedqa-e5-v5")
    vectorstore = FAISS.from_texts(splits, embeddings)
    
    index_path = os.path.join(Config.VECTOR_STORE_DIR, str(file_id))
    os.makedirs(index_path, exist_ok=True)
    vectorstore.save_local(index_path)
    
    return True

def get_retriever_for_file(file_id):
    index_path = os.path.join(Config.VECTOR_STORE_DIR, str(file_id))
    if not os.path.exists(index_path) or not Config.NVIDIA_API_KEY:
        return None
    
    embeddings = NVIDIAEmbeddings(model="nvidia/nv-embedqa-e5-v5")
    vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
    return vectorstore.as_retriever()

def ask_question_on_file(file_id, question):
    retriever = get_retriever_for_file(file_id)
    if not retriever:
        return "AI features are unavailable. Ensure NVIDIA_API_KEY is set in .env and file is processed."

    llm = _chat_model()
    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer the question. "
        "If you don't know the answer, say that you don't know. "
        "Context: {context}"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
        
    rag_chain = (
        {"context": retriever | format_docs, "input": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    try:
        result = rag_chain.invoke(question)
    except Exception as e:
        raise RuntimeError(f"AI chat is currently unavailable: {str(e)}") from e
    return result

def generate_summary(file_id):
    retriever = get_retriever_for_file(file_id)
    if not retriever:
        return "AI features are unavailable."
    
    docs = retriever.invoke("What are the main points of this document?")
    context = "\n".join([doc.page_content for doc in docs])
    
    llm = _chat_model()
    prompt = ChatPromptTemplate.from_template("Summarize the following text comprehensively:\n{context}")
    chain = prompt | llm | StrOutputParser()
    try:
        res = chain.invoke({"context": context})
    except Exception as e:
        raise RuntimeError(f"AI summary is currently unavailable: {str(e)}") from e
    return res

def generate_mcq(file_id):
    retriever = get_retriever_for_file(file_id)
    if not retriever:
        return "AI features are unavailable."
    
    docs = retriever.invoke("Important facts and figures for a test")
    context = "\n".join([doc.page_content for doc in docs])
    
    llm = _chat_model()
    prompt = ChatPromptTemplate.from_template(
        "Generate 3 Multiple Choice Questions (MCQs) based on the following text. "
        "Format as: Q: [Question]\nA) [Opt]\nB) [Opt]\nC) [Opt]\nD) [Opt]\nAnswer: [Ans]\n\n"
        "Text:\n{context}"
    )
    chain = prompt | llm | StrOutputParser()
    try:
        res = chain.invoke({"context": context})
    except Exception as e:
        raise RuntimeError(f"AI MCQ generation is currently unavailable: {str(e)}") from e
    return res
