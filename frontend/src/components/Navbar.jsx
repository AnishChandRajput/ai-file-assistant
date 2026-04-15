import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Cloud, LayoutDashboard } from 'lucide-react';

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') === 'light' ? 'light' : 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));

  const isDark = theme === 'dark';

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${isDark ? 'border-cyan-400/10 bg-slate-950/75 shadow-[0_8px_30px_rgba(2,6,23,0.45)]' : 'border-cyan-300/20 bg-white/75 shadow-[0_8px_30px_rgba(15,23,42,0.12)]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-300 ${isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)]' : 'border-cyan-300/25 bg-cyan-100 text-cyan-700 shadow-[0_0_20px_rgba(34,211,238,0.12)]'}`}>
              <Cloud className="w-6 h-6" />
            </div>
            <Link to="/" className={`font-bold text-xl tracking-tight transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>AI File<span className={isDark ? 'text-cyan-300' : 'text-cyan-600'}>Assistant</span></Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`rounded-full border p-2 transition-all duration-300 ${isDark ? 'border-cyan-400/10 bg-white/5 text-slate-100 hover:border-cyan-300/25 hover:bg-cyan-300/10' : 'border-cyan-300/20 bg-cyan-50 text-slate-900 hover:border-cyan-400/30 hover:bg-cyan-100'}`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="neon-button neon-button-primary hidden sm:inline-flex py-2.5 px-4">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="neon-button neon-button-secondary py-2.5 px-4"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className={`rounded-full px-3 py-2 font-medium transition ${isDark ? 'text-slate-300 hover:text-cyan-200' : 'text-slate-700 hover:text-cyan-700'}`}>Accounts</Link>
                <Link to="/register" className="neon-button neon-button-primary py-2.5 px-4">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
