import React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, FileSearch, Sparkles, BrainCircuit, ShieldCheck, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-[90vh] bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col justify-center py-16">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/45 border border-brand-100 dark:border-brand-900/50 text-xs font-bold text-brand-700 dark:text-brand-400 mx-auto animate-bounce">
          <Sparkles className="h-4 w-4 text-brand-500" />
          <span>Next Generation Recruitment AI</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            AI-Powered ATS{' '}
            <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
              Resume Analyzer
            </span>{' '}
            & Recruitment Platform
          </h1>
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Bridge the gap between talent and opportunities. Applicants scan, match, and optimize resumes against requirements, while hiring managers rank candidates instantly with machine learning.
          </p>
        </div>

        {/* Portal Entry Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-6">
          {/* Applicant Portal Card */}
          <div className="group glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/70 transition-all hover:scale-[1.02] duration-300 flex flex-col justify-between text-left shadow-lg">
            <div className="space-y-4">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/25 rounded-2xl w-fit text-brand-600 dark:text-brand-400">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">Applicant Portal</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Scan your resume against target job roles, view matching sub-scores, highlight missing skills, and instantly track applications with real-time feedback.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/applicant/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer group-hover:gap-3"
              >
                <span>Enter Applicant Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Company Portal Card */}
          <div className="group glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/70 transition-all hover:scale-[1.02] duration-300 flex flex-col justify-between text-left shadow-lg">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/25 rounded-2xl w-fit text-indigo-600 dark:text-indigo-400">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">Company Portal</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Publish open vacancies, screen and filter submitted candidate profiles dynamically, evaluate AI-driven match breakdowns, and hire the top talent in seconds.
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/company/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer group-hover:gap-3"
              >
                <span>Enter Recruiter Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12 text-left">
          <div className="flex gap-4 p-5 glass rounded-2xl border border-slate-200/30 dark:border-slate-800/20 bg-white/20 dark:bg-slate-900/20">
            <FileSearch className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Real-time ATS Scoring</h4>
              <p className="text-xs text-slate-500 mt-1">Instant scoring based on keyword match, experience, education, and specific skills.</p>
            </div>
          </div>
          <div className="flex gap-4 p-5 glass rounded-2xl border border-slate-200/30 dark:border-slate-800/20 bg-white/20 dark:bg-slate-900/20">
            <BrainCircuit className="h-6 w-6 text-brand-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">AI Interview Insights</h4>
              <p className="text-xs text-slate-500 mt-1">Generates customized interview recommendations and strengths/weaknesses breakdowns.</p>
            </div>
          </div>
          <div className="flex gap-4 p-5 glass rounded-2xl border border-slate-200/30 dark:border-slate-800/20 bg-white/20 dark:bg-slate-900/20">
            <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Secure Role Separation</h4>
              <p className="text-xs text-slate-500 mt-1">Separate applicant and company workflows, ensuring data security and proper portals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
