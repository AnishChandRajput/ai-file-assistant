import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Cloud } from 'lucide-react';

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Cloud className="text-primary w-8 h-8" />
            <Link to="/" className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">AI File<span className="text-primary">Assistant</span></Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary px-3 py-2 font-medium transition">Login</Link>
                <Link to="/register" className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-primary/20 transition">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
