import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { chatWithFile, summarizeFile, generateMCQ } from '../api';
import { ArrowLeft, Send, Sparkles, FileText, Loader2 } from 'lucide-react';

const DocumentView = () => {
  const { fileId } = useParams();
  const location = useLocation();
  const file = location.state?.file || { original_filename: 'Document' };
  
  const [messages, setMessages] = useState([{ role: 'system', content: 'Hello! I am ready to answer questions about this document.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatWithFile(fileId, userMsg);
      setMessages(prev => [...prev, { role: 'system', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Sorry, I encountered an error answering that.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType) => {
    setActionLoading(true);
    try {
      let res;
      if (actionType === 'summary') res = await summarizeFile(fileId);
      if (actionType === 'mcq') res = await generateMCQ(fileId);
      
      const content = actionType === 'summary' ? res.data.summary : res.data.mcq;
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `**Generated ${actionType.toUpperCase()}**\n\n${content}` 
      }]);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to perform action.';
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      {/* Left panel: File details & Actions */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-primary transition font-medium w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </Link>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex-1">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white break-words mb-2">{file.original_filename}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">AI is connected to this document.</p>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Actions
            </h3>
            <button 
              onClick={() => handleAction('summary')}
              disabled={actionLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white py-3 px-4 rounded-xl font-medium transition flex justify-between items-center disabled:opacity-70"
            >
              Generate Summary
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </button>
            <button 
              onClick={() => handleAction('mcq')}
              disabled={actionLoading}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white py-3 px-4 rounded-xl font-medium transition flex justify-between items-center disabled:opacity-70"
            >
              Generate Flashcards / MCQ
              {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: Chat UI */}
      <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-full">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-semibold">Chat with Document</h3>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-none' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
              }`}>
                <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex justify-start">
               <div className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-primary" /> Thinking...
               </div>
             </div>
          )}
        </div>
        
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Ask a question about the document..."
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentView;
