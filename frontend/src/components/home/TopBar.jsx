import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, Moon, Sparkles, ShieldCheck, UserCheck, Building2, PhoneCall 
} from 'lucide-react';

export const TopBar = ({ onSelectRole, onNavigate }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-[#0b1727] text-white text-[11px] font-medium border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between gap-3">
        
        {/* Left: Enterprise Announcement Strip */}
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-extrabold uppercase tracking-wider flex-shrink-0">
            <Sparkles className="w-3 h-3 text-blue-400" /> Platform Release
          </span>
          <div className="truncate text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-semibold">
            <span className="hidden sm:inline">TalentPulse 3.0: Next-Gen AI Candidate Matching &amp; Resume Intelligence Live</span>
            <span className="sm:hidden">TalentPulse 3.0 AI Live</span>
            <span className="mx-2 text-slate-600 hidden md:inline">|</span>
            <span className="text-amber-300 font-bold hidden md:inline">50k+ Active Enterprise Profiles</span>
          </div>
        </div>

        {/* Right: Quick Links, Theme Switcher & Direct Access */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          
          <div className="hidden md:flex items-center gap-3 text-slate-300 border-r border-slate-800 pr-4">
            <a 
              href="#contact" 
              className="hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" /> Enterprise Sales
            </a>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> SOC2 &amp; ISO 27001 Certified
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-300" />
            )}
          </button>

          {/* Role Access Buttons (Responsive on sm+) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onSelectRole('candidate')}
              className="pill-btn px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all"
            >
              <UserCheck className="w-3 h-3" /> Candidate Portal
            </button>
            <button
              onClick={() => onSelectRole('recruiter')}
              className="pill-btn px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] shadow-sm flex items-center gap-1 transition-all"
            >
              <Building2 className="w-3 h-3" /> Recruiter Portal
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
