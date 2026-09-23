import React from 'react';
import { HeroBanner } from './home/HeroBanner';
import { MetricsStrip } from './home/MetricsStrip';
import { EcosystemTabs } from './home/EcosystemTabs';
import { NewsTicker } from './home/NewsTicker';
import { 
  FileSearch, Users, BarChart3, Mail, Building2, ShieldCheck, ArrowRight 
} from 'lucide-react';

export const LandingPage = ({ onNavigateToJobs, onNavigateToAnalyzer, onOpenAuthModal, onSelectRole }) => {
  return (
    <div className="space-y-12 pb-12 transition-colors">
      
      {/* 1. INSTITUTIONAL HERO SHOWCASE */}
      <HeroBanner 
        onNavigateToJobs={onNavigateToJobs}
        onNavigateToAnalyzer={onNavigateToAnalyzer}
        onSelectRole={onSelectRole}
      />

      {/* 2. PLACEMENT & IMPACT METRICS DASHBOARD STRIP */}
      <MetricsStrip />

      {/* 3. TABBED ECOSYSTEM SHOWCASE (Candidate vs Recruiter) */}
      <EcosystemTabs 
        onSelectRole={onSelectRole}
        onNavigateToJobs={onNavigateToJobs}
      />

      {/* 4. ANNOUNCEMENTS, SPOTLIGHT & HIRING PARTNERS GRID */}
      <NewsTicker 
        onNavigateToJobs={onNavigateToJobs}
        onSelectRole={onSelectRole}
      />

      {/* 5. ABOUT TALENTPULSE SECTION */}
      <section id="about" className="scroll-mt-24">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 lg:p-12 shadow-sm space-y-8 edge-glow-hover transition-colors">
          
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">Institutional Governance</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
              Eliminating Hiring Inefficiencies for Ambitious Talent &amp; Recruiters
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              TalentPulse was engineered to solve the core bottlenecks in modern recruitment. Qualified applicants are often filtered out by rigid unparsed keywords, while HR teams spend hours sifting through unformatted resumes. TalentPulse combines real-time ATS scoring for job seekers with pre-ranked candidate shortlisting for enterprise employers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <FileSearch className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Candidate Career Center</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Know your exact ATS score before applying. Build ATS-optimized resumes and track application status in real time.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Enterprise Talent Suite</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Receive pre-ranked candidate applications with automated skill extraction, one-click shortlisting, and interview scheduling.
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">ATS Intelligence Engine</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                High-precision algorithm evaluating keyword match, required experience years, education, and formatting compliance.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CONTACT & INSTITUTIONAL CTA SECTION */}
      <section id="contact" className="scroll-mt-24">
        <div className="bg-[#0F2942] dark:bg-zinc-900 text-white rounded-3xl p-8 lg:p-12 shadow-md flex flex-col md:flex-row items-center justify-between gap-8 edge-glow-hover border border-blue-900/60">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider">
              Institutional Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Upgrade Your Recruitment Engine?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Join thousands of applicants and recruiters on TalentPulse. Contact our enterprise support team 24/7.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 justify-center md:justify-start text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-400" /> support@talentpulse.io
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-400" /> Enterprise Recruitment HQ
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="pill-btn px-7 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md text-center transition-all border border-slate-700"
            >
              Log In (Existing User)
            </button>
            <button
              onClick={() => onOpenAuthModal('signup')}
              className="pill-btn px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md text-center transition-all"
            >
              Sign Up (New User)
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

