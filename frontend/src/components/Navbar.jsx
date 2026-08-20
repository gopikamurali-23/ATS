import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Briefcase, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (user && user.role === 'COMPANY') {
      navigate('/company/login');
    } else {
      navigate('/applicant/login');
    }
  };

  const getHomeLink = () => {
    if (!user) return '/';
    if (user.role === 'APPLICANT') return '/applicant/dashboard';
    if (user.role === 'COMPANY') return '/company/dashboard';
    if (user.role === 'ROLE_ADMIN') return '/admin';
    return '/';
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="bg-brand-600 dark:bg-brand-500 p-2 rounded-xl text-white shadow-md shadow-brand-500/20">
          <Briefcase className="h-6 w-6" />
        </div>
        <Link to={getHomeLink()} className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
          TalentPulse
        </Link>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/60 py-1.5 px-3.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                <UserIcon className="h-4 w-4 text-brand-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {user.username} ({user.role === 'APPLICANT' ? 'Applicant' : user.role === 'COMPANY' ? 'Recruiter' : 'Admin'})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold">
              <Link to="/applicant/login" className="text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">
                Applicant Login
              </Link>
              <Link to="/company/login" className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-all shadow-sm">
                Recruiter Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
