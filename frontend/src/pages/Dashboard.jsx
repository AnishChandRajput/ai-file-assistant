import React, { useState, useEffect } from 'react';
import { fetchFiles, uploadFile, deleteFile } from '../api';
import { Link } from 'react-router-dom';
import { FileText, UploadCloud, Search, CheckCircle, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const loadFiles = async () => {
    try {
      const { data } = await fetchFiles();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      await uploadFile(file);
      loadFiles(); // Refresh list
    } catch (err) {
      alert("Failed to upload file. " + (err.response?.data?.message || ''));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e, fileId) => {
    e.preventDefault(); // Prevent navigating to document view
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this file? This will also remove its AI memory.")) return;
    
    try {
      await deleteFile(fileId);
      setFiles(files.filter(f => f._id !== fileId));
    } catch (err) {
      alert("Failed to delete file.");
    }
  };

  const filteredFiles = files.filter(f => f.original_filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Library</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and chat with your documents</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <label className="cursor-pointer bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-primary/20 transition flex items-center gap-2 flex-shrink-0">
            <UploadCloud className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload File'}
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.docx" disabled={uploading} />
          </label>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No files found</h3>
          <p className="text-slate-500 dark:text-slate-400">Upload your first document to start exploring AI features.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <Link 
              key={file._id} 
              to={`/document/${file._id}`}
              state={{ file }}
              className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-primary dark:hover:border-primary hover:shadow-lg transition flex flex-col"
            >
              <button 
                onClick={(e) => handleDelete(e, file._id)}
                className="absolute top-3 right-3 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Delete file"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-blue-50 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate mb-1" title={file.original_filename}>
                {file.original_filename}
              </h3>
              <div className="mt-auto flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                {file.status === 'processed' ? (
                  <><CheckCircle className="w-4 h-4 text-green-500" /> Processed</>
                ) : (
                  <span className="capitalize text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">{file.status}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
