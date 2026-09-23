import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from '../../context/RouterContext';
import { 
  Sparkles, Menu, X, UserCheck, Building2, LogOut, ArrowRight, Layers, BarChart3, Users, CheckCircle2,
  Sun, Moon, Shield, FileSearch, FileText, Briefcase
} from 'lucide-react';

export const MainNavbar = ({ onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentPage, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { label: 'Home', path: '/', key: 'home' },
    { label: 'Jobs', path: '/jobs', key: 'jobs' },
    { label: 'ATS Analyzer', path: '/analyzer', key: 'analyzer' },
    { label: 'Resume Builder', path: '/builder', key: 'builder' },
    { label: 'Features', path: '/features', key: 'features' },
    { label: 'Analytics', path: '/analytics', key: 'analytics' },
    { label: 'Enterprise HQ', path: '/contact', key: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Emblem */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => handleNavClick('/')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
              Talent<span className="text-blue-600 dark:text-blue-400">Pulse</span>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-zinc-400 font-extrabold tracking-widest uppercase hidden sm:block">
              Talent &amp; Recruitment Platform
            </div>
          </div>
        </div>

        {/* Desktop Enterprise Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs font-bold text-slate-600 dark:text-zinc-300">
          {navLinks.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.path)}
              className={`transition-colors py-1 ${
                currentPage === item.key 
                  ? 'text-blue-600 dark:text-blue-400 font-extrabold border-b-2 border-blue-600 dark:border-blue-400' 
                  : 'hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Controls: Only Log In & Sign Up */}
        <div className="flex items-center gap-3">

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('/portal')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold uppercase">
                  {(user.fullName || user.username).substring(0, 1)}
                </div>
                <span className="max-w-[100px] truncate">{user.fullName || user.username}</span>
              </button>
              <button
                onClick={() => { logout(); handleNavClick('/'); }}
                title="Sign Out"
                className="p-2 rounded-full text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Log In
              </button>

              <button
                onClick={() => onOpenAuthModal('signup')}
                className="pill-btn px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-5 space-y-4 shadow-2xl transition-colors">
          
          {/* Mobile Theme Switcher Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800/70 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Display Appearance</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
              <span>{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
            </button>
          </div>

          <nav className="space-y-1 text-xs font-bold text-slate-700 dark:text-zinc-300">
            {navLinks.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.path)}
                className={`w-full text-left py-2.5 px-3 rounded-xl transition-colors ${
                  currentPage === item.key
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => handleNavClick('/portal')}
                    className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" /> Go to My Dashboard
                  </button>
                  <button
                    onClick={() => { logout(); handleNavClick('/'); }}
                    className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900/60"
                  >
                    Sign Out ({user.fullName || user.username})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { onOpenAuthModal('signup'); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Sign Up</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

    </header>
  );
};
