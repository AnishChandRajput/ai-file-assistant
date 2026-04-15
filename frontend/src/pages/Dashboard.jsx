import React, { useEffect, useMemo, useState } from 'react';
import { fetchFiles, uploadFile, deleteFile } from '../api';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  FolderOpen,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const { data } = await fetchFiles();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
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
      await loadFiles();
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

  const filteredFiles = files.filter((f) => f.original_filename.toLowerCase().includes(search.toLowerCase()));
  const processedFiles = files.filter((file) => file.status === 'processed');
  const pendingFiles = files.filter((file) => file.status !== 'processed');
  const latestFile = files[0];
  const name = localStorage.getItem('name') || 'there';

  const metrics = useMemo(
    () => [
      { label: 'Total docs', value: files.length, hint: 'documents in your vault' },
      { label: 'Processed', value: processedFiles.length, hint: 'ready for chat' },
      { label: 'Pending', value: pendingFiles.length, hint: 'still indexing' },
      { label: 'Visible results', value: filteredFiles.length, hint: 'matching your search' },
    ],
    [files.length, filteredFiles.length, pendingFiles.length, processedFiles.length]
  );

  return (
    <div className="relative mx-auto max-w-7xl py-6 sm:py-8">
      <div className="dashboard-orb dashboard-orb-left" />
      <div className="dashboard-orb dashboard-orb-right" />

      <section className="neon-panel relative mb-8 overflow-hidden">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Welcome back, {name}.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              Upload documents, jump into AI chat, and keep the workspace moving with quick neon actions.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <label className="neon-button neon-button-primary cursor-pointer">
                <UploadCloud className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload document'}
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.docx" disabled={uploading} />
              </label>

              <button type="button" onClick={loadFiles} className="neon-button neon-button-secondary">
                <RefreshCw className={`h-4 w-4 ${loadingFiles ? 'animate-spin' : ''}`} />
                Refresh library
              </button>

              <Link
                to={latestFile ? `/document/${latestFile._id}` : '/dashboard'}
                state={latestFile ? { file: latestFile } : undefined}
                className={`neon-button neon-button-ghost ${!latestFile ? 'pointer-events-none opacity-50' : ''}`}
              >
                <FolderOpen className="h-4 w-4" />
                Open latest file
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:min-w-[38rem]">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-600 dark:text-slate-400">{metric.label}</div>
                <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metric.value}</div>
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">{metric.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="feature-card">
          <Zap className="h-5 w-5 text-cyan-500 dark:text-cyan-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Instant AI actions</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Open any document to generate summaries, flashcards, and fast Q&A.</p>
        </div>
        <div className="feature-card">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Processed at a glance</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">See which files are ready for chat and which ones are still being indexed.</p>
        </div>
        <div className="feature-card">
          <Sparkles className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Neon workflow</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Fast buttons, glowing panels, and a sharper command-center layout.</p>
        </div>
      </section>

      <section className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your library</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Showing {filteredFiles.length} of {files.length} files</p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-600 dark:text-cyan-300/80" />
          <input
            type="text"
            className="neon-input"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {loadingFiles ? (
        <div className="neon-panel p-10 text-center text-slate-600 dark:text-slate-300">Loading your library...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="neon-panel p-10 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-600 dark:text-cyan-200 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
            <FileText className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No files found</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 dark:text-slate-400">Upload your first document to unlock summaries, document chat, and MCQ generation.</p>
          <div className="mt-6 flex justify-center">
            <label className="neon-button neon-button-primary cursor-pointer">
              <UploadCloud className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload your first file'}
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.docx" disabled={uploading} />
            </label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredFiles.map((file) => (
            <Link
              key={file._id}
              to={`/document/${file._id}`}
              state={{ file }}
              className="group relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-slate-950/70 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_0_30px_rgba(34,211,238,0.12)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-fuchsia-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <button
                onClick={(e) => handleDelete(e, file._id)}
                className="absolute right-4 top-4 z-10 rounded-lg border border-red-400/20 bg-slate-900/80 p-2 text-slate-400 opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="relative z-10 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.16)] transition-transform group-hover:scale-105">
                  <FileText className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white" title={file.original_filename}>
                    {file.original_filename}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-600 dark:text-slate-500">Document file</p>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex items-center justify-between gap-3">
                {file.status === 'processed' ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Processed
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold capitalize text-amber-200">
                    {file.status}
                  </div>
                )}

                <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-200 transition group-hover:translate-x-1">
                  Open
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
