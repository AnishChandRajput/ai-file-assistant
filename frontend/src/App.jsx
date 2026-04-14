import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocumentView from './pages/DocumentView';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  const handleSetToken = (t) => {
    localStorage.setItem('token', t);
    setToken(t);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    setToken(null);
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Navbar isAuthenticated={!!token} handleLogout={handleLogout} />
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/login" element={!token ? <Login setToken={handleSetToken} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/document/:fileId" element={token ? <DocumentView /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
