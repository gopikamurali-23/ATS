import React from 'react';
import { 
  Sparkles, FileSearch, Search, Briefcase, ArrowRight, ShieldCheck, 
  Building2, UserCheck, Award, Zap 
} from 'lucide-react';

export const HeroBanner = ({ onNavigateToJobs, onNavigateToAnalyzer, onSelectRole }) => {
  return (
    <section className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-zinc-800 transition-colors edge-glow-hover">
      
      {/* Background Wide-Angle Image & Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 41, 66, 0.95), rgba(15, 41, 66, 0.75), rgba(37, 99, 235, 0.5)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80')`
        }}
      />

      {/* Decorative Grid Overlay Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none z-0" />

      {/* Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 lg:py-24 text-white text-center space-y-8">
        
        {/* Top Institution Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400 fill-current" />
          <span>Premier Academic &amp; Corporate ATS Portal</span>
        </div>

        {/* High-Authority Headline & Subtitle */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-md">
            Empowering Careers, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-blue-200 to-white">
              Engineering Elite Workflows.
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow">
            TalentPulse connects top-tier candidates with leading hiring institutions. Job seekers optimize resumes with real-time AI scoring, while enterprise recruiters automate candidate shortlisting, review, and scheduling.
          </p>
        </div>

        {/* Floating Oval Quick Action Pills Over Banner */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-3xl mx-auto">
          
          <button
            onClick={() => onSelectRole('candidate')}
            className="pill-btn px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2 group transition-all"
          >
            <FileSearch className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
            <span>Scan Resume ATS Score</span>
            <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onNavigateToJobs}
            className="pill-btn px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2 group transition-all"
          >
            <Search className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
            <span>Browse Verified Openings</span>
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onSelectRole('recruiter')}
            className="pill-btn px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 group transition-all"
          >
            <Building2 className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>Post an Enterprise Job</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

        {/* Trust Badges Strip Under Banner */}
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
  );
};
