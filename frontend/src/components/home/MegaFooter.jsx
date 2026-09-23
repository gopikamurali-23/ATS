import React from 'react';
import { 
  Sparkles, ShieldCheck, Mail, PhoneCall, MapPin, ArrowUp, ArrowLeft 
} from 'lucide-react';

export const MegaFooter = ({ onNavigate, onOpenAuthModal, onSelectRole }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0F2942] text-white border-t border-blue-900/60 pt-14 pb-10 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Column 1: Institutional Brand Info (2 cols) */}
          <div className="col-span-2 space-y-4 pr-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-amber-400 font-black shadow-md border border-amber-400/30">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div className="font-extrabold text-xl tracking-tight">
                Talent<span className="text-blue-400">Pulse</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              TalentPulse is an enterprise Applicant Tracking System and Career Intelligence Platform serving premier academic placement cells, corporate recruiters, and ambitious job seekers worldwide.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-300 font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> ISO 27001 Certified Security
              </div>
            </div>
          </div>

          {/* Column 2: Candidate Hub */}
          <div className="space-y-3">
            <div className="font-extrabold text-white text-xs uppercase tracking-wider text-amber-400">
              Candidate Hub
            </div>
            <ul className="space-y-2 text-slate-300 font-medium">
              <li><button onClick={() => onSelectRole('candidate')} className="hover:text-amber-300 transition-colors">Candidate Login</button></li>
              <li><button onClick={() => onSelectRole('candidate')} className="hover:text-amber-300 transition-colors">Resume Builder</button></li>
              <li><button onClick={() => onSelectRole('candidate')} className="hover:text-amber-300 transition-colors">ATS Score Analyzer</button></li>
              <li><button onClick={() => onNavigate('jobs')} className="hover:text-amber-300 transition-colors">Browse Job Board</button></li>
            </ul>
          </div>

          {/* Column 3: Recruiter Suite */}
          <div className="space-y-3">
            <div className="font-extrabold text-white text-xs uppercase tracking-wider text-amber-400">
              Recruiter Suite
            </div>
            <ul className="space-y-2 text-slate-300 font-medium">
              <li><button onClick={() => onOpenAuthModal('signup')} className="hover:text-amber-300 transition-colors">Employer Sign Up</button></li>
              <li><button onClick={() => onSelectRole('recruiter')} className="hover:text-amber-300 transition-colors">Post Requisitions</button></li>
              <li><button onClick={() => onSelectRole('recruiter')} className="hover:text-amber-300 transition-colors">Shortlist Candidate Pipeline</button></li>
              <li><button onClick={() => onSelectRole('recruiter')} className="hover:text-amber-300 transition-colors">Interview Scheduler</button></li>
            </ul>
          </div>

          {/* Column 4: Institutional Info */}
          <div className="space-y-3">
            <div className="font-extrabold text-white text-xs uppercase tracking-wider text-amber-400">
              Institutional HQ
            </div>
            <div className="space-y-2 text-slate-300 leading-relaxed text-[11px]">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>Enterprise Recruitment Tower, Suite 400, Tech Park</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>support@talentpulse.io</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>+1 (800) 555-PULSE</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Back Controls & Copyright */}
        <div className="pt-8 border-t border-blue-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="pill-btn px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-all"
              title="Return to Main Portal Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Top Header
            </button>
            <span>© 2026 TalentPulse Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-slate-200 transition-colors">Privacy Policy</a>
            <a href="#about" className="hover:text-slate-200 transition-colors">Terms of Service</a>
            <a href="#contact" className="hover:text-slate-200 transition-colors">Security Compliance</a>
            
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md"
              title="Scroll to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};
