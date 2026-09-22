import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, Menu, X, UserCheck, Building2, LogOut, ArrowRight, Layers, BarChart3, Users, CheckCircle2
} from 'lucide-react';

export const MainNavbar = ({ currentNav, onNavigate, onOpenAuthModal, onSelectRole }) => {
  const { user, loginAsDemo, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (nav, href) => {
    setMobileMenuOpen(false);
    if (nav) {
      onNavigate(nav);
    }
    if (href) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Emblem */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => handleNavClick('home')}
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
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-600 dark:text-zinc-300">
          
          <button
            onClick={() => handleNavClick('home')}
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${currentNav === 'home' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : ''}`}
          >
            Home
          </button>

          <a
            href="#features"
            onClick={(e) => { e.preventDefault(); handleNavClick('home', '#features'); }}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Features
          </a>

          <button
            onClick={() => handleNavClick('jobs')}
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${currentNav === 'jobs' ? 'text-blue-600 dark:text-blue-400 font-extrabold' : ''}`}
          >
            Talent Pool &amp; Jobs
          </button>

          <a
            href="#analytics"
            onClick={(e) => { e.preventDefault(); handleNavClick('home', '#analytics'); }}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Analytics
          </a>

          <a
            href="#contact"
            onClick={(e) => { e.preventDefault(); handleNavClick('home', '#contact'); }}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Enterprise HQ
          </a>

        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Quick Demo Switcher Pills */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-full text-xs border border-slate-200 dark:border-zinc-800">
            <span className="px-2 text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Demo:</span>
            <button
              onClick={() => { loginAsDemo('candidate'); onNavigate('portal'); }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                user?.role === 'ROLE_CANDIDATE' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Candidate
            </button>
            <button
              onClick={() => { loginAsDemo('recruiter'); onNavigate('portal'); }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                user?.role === 'ROLE_COMPANY' ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              Recruiter
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('portal')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold uppercase">
                  {(user.fullName || user.username).substring(0, 1)}
                </div>
                <span className="max-w-[100px] truncate">{user.fullName || user.username}</span>
              </button>
              <button
                onClick={() => { logout(); onNavigate('home'); }}
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
                Portal Login
              </button>

              <button
                onClick={() => onSelectRole('candidate')}
                className="pill-btn px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hidden sm:flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-6 space-y-4 shadow-2xl">
          <nav className="space-y-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
            <button
              onClick={() => handleNavClick('home')}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Home
            </button>
            <a
              href="#features"
              onClick={(e) => { e.preventDefault(); handleNavClick('home', '#features'); }}
              className="block py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Features &amp; Modules
            </a>
            <button
              onClick={() => handleNavClick('jobs')}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Talent Pool &amp; Verified Jobs
            </button>
            <a
              href="#analytics"
              onClick={(e) => { e.preventDefault(); handleNavClick('home', '#analytics'); }}
              className="block py-2.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              Analytics Dashboard
            </a>
            
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="w-full py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl"
              >
                Portal Login
              </button>
              <button
                onClick={() => onSelectRole('candidate')}
                className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      )}

    </header>
  );
};

