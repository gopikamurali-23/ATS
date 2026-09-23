import React from 'react';
import { useRouter } from '../context/RouterContext';
import { 
  Sparkles, Search, FileSearch, FileText, ArrowRight, ShieldCheck, 
  Award, Zap, Users, Building2, CheckCircle2, BarChart3, Lock 
} from 'lucide-react';

export const HomePage = ({ onOpenAuthModal }) => {
  const { navigate } = useRouter();

  return (
    <div className="space-y-16 pb-12 transition-colors">
      
      {/* 1. HERO SHOWCASE */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-zinc-800 transition-colors edge-glow-hover">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(15, 41, 66, 0.95), rgba(15, 41, 66, 0.8), rgba(37, 99, 235, 0.55)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none z-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-24 text-white text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
            <span>Next-Gen Enterprise ATS &amp; Career Intelligence</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-md">
              Empowering Careers, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-blue-200 to-white">
                Engineering Elite Hiring Workflows.
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow">
              TalentPulse connects top-tier talent with world-class employers. Candidates optimize their resumes with real-time AI scoring, while enterprise hiring teams automate screening, shortlisting, and interview scheduling.
            </p>
          </div>

          {/* Quick Page Navigation Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto">
            <button
              onClick={() => navigate('/jobs')}
              className="pill-btn px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2 group transition-all"
            >
              <Search className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
              <span>Explore Open Jobs</span>
              <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/analyzer')}
              className="pill-btn px-6 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2 group transition-all"
            >
              <FileSearch className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Scan Resume ATS Score</span>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/builder')}
              className="pill-btn px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 group transition-all"
            >
              <FileText className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Build ATS Resume</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Automated Resume Parsing
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" /> ISO 27001 Certified Security
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" /> Real-Time Applicant Matching
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED PLATFORM PILLARS GRID */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Enterprise Modular Platform
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Dedicated Tools for Candidates &amp; Employers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            Navigate to dedicated purpose-built pages designed for each stage of the talent lifecycle.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: Talent Pool & Verified Jobs */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between edge-glow-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Talent Pool &amp; Verified Jobs</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Browse real corporate openings with transparent salary ranges, skill requirements, and instant 1-click application submissions.
              </p>
            </div>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 pt-2 group"
            >
              <span>Explore Job Board</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: ATS Resume Score Analyzer */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between edge-glow-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">ATS Resume Score Analyzer</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Scan your resume against any job description. Receive instant 0–100 match ratings, missing keyword alerts, and actionable improvements.
              </p>
            </div>
            <button
              onClick={() => navigate('/analyzer')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1.5 pt-2 group"
            >
              <span>Launch ATS Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 3: Interactive Resume Builder */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between edge-glow-hover">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Interactive Resume Builder</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Create ATS-friendly resumes with live section reordering, formatting checks, and one-click text/PDF export.
              </p>
            </div>
            <button
              onClick={() => navigate('/builder')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5 pt-2 group"
            >
              <span>Build Your Resume</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* 3. KEY METRICS STRIP */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-10 shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black">94.8%</div>
            <div className="text-xs text-blue-100 font-semibold uppercase tracking-wider">ATS Parse Accuracy</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black">&lt; 3.2s</div>
            <div className="text-xs text-blue-100 font-semibold uppercase tracking-wider">Candidate Match Latency</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black">12,400+</div>
            <div className="text-xs text-blue-100 font-semibold uppercase tracking-wider">Active Verified Jobs</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-4xl font-black">100%</div>
            <div className="text-xs text-blue-100 font-semibold uppercase tracking-wider">Client-Side Zero Latency</div>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION FOR LOG IN & SIGN UP */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-sm edge-glow-hover transition-colors">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-extrabold uppercase tracking-wider">
              Get Started Today
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready to Accelerate Your Recruitment or Career?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Sign in with an existing account or register in seconds as a candidate or recruiter to access full portal workflows.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="pill-btn px-7 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold text-xs shadow-sm text-center border border-slate-300 dark:border-zinc-700 transition-all flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Log In (Existing User)</span>
            </button>
            <button
              onClick={() => onOpenAuthModal('signup')}
              className="pill-btn px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md text-center transition-all flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Sign Up (New User)</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
