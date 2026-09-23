import React, { useState } from 'react';
import { 
  UserCheck, Building2, FileText, FileSearch, Search, CheckSquare, 
  Briefcase, Award, BarChart3, Calendar, ArrowRight, CheckCircle2, Sparkles 
} from 'lucide-react';

export const EcosystemTabs = ({ onSelectRole, onNavigateToJobs }) => {
  const [activeTab, setActiveTab] = useState('candidate'); // 'candidate' vs 'recruiter'

  return (
    <section id="features" className="scroll-mt-24 space-y-6">
      
      {/* Tab Switcher Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6 edge-glow-hover transition-colors">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Purpose-Built Platform Modules
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              TalentPulse Institutional Ecosystem
            </h2>
          </div>

          {/* High-Radius Pill Tab Switcher */}
          <div className="flex flex-wrap sm:flex-nowrap bg-slate-100 dark:bg-zinc-800 p-1 sm:p-1.5 rounded-2xl sm:rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-bold w-full sm:w-auto gap-1">
            <button
              onClick={() => setActiveTab('candidate')}
              className={`pill-btn px-3 sm:px-5 py-2 rounded-xl sm:rounded-full transition-all flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial ${
                activeTab === 'candidate'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Candidate Career Center</span>
              <span className="sm:hidden">Candidate Center</span>
            </button>
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`pill-btn px-3 sm:px-5 py-2 rounded-xl sm:rounded-full transition-all flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial ${
                activeTab === 'recruiter'
                  ? 'bg-[#0F2942] text-amber-400 shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Enterprise Talent Acquisition</span>
              <span className="sm:hidden">Enterprise Acquisition</span>
            </button>
          </div>
        </div>

        {/* CANDIDATE TAB VIEW */}
        {activeTab === 'candidate' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 edge-glow-hover">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interactive Resume Builder</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Build ATS-formatted resumes with live section reordering and export clean text/PDF formats.
                </p>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  ✓ Section Reordering Included
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 edge-glow-hover">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileSearch className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time ATS Checker</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Calculate overall match scores (0-100), view matched vs missing keywords, and get actionable tips.
                </p>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  ✓ Keyword Breakdown Meters
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 edge-glow-hover">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filtered Job Discovery</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Filter open positions by title, location, salary range, and required technical skills.
                </p>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  ✓ Verified Corporate Openings
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 edge-glow-hover">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">1-Click Applications</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Track live application statuses (Applied, Interviewing, Offered) in your personalized dashboard.
                </p>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  ✓ Instant Recruiter Alerts
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => onSelectRole('candidate')}
                className="pill-btn px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4" /> Enter Candidate Career Center <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* RECRUITER TAB VIEW */}
        {activeTab === 'recruiter' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 edge-glow-hover">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Job Requisition Publisher</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Publish open positions specifying required skills, experience years, and salary ranges.
                </p>
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  ✓ Instant Requisition Dispatch
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 edge-glow-hover">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Automated Candidate Ranking</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Applications are automatically pre-scored and ranked by calculated ATS match percentage.
                </p>
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  ✓ Pre-Ranked Talent Pipeline
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 edge-glow-hover">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interview Scheduler Modal</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Schedule interviews with Google Meet / Teams links and instant email notifications.
                </p>
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  ✓ Google Meet / Teams Sync
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 edge-glow-hover">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hiring Funnel Analytics</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Monitor candidate conversion, interview scheduling rates, and offer acceptance velocity.
                </p>
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  ✓ Executive Funnel Metrics
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => onSelectRole('recruiter')}
                className="pill-btn px-7 py-3 bg-[#0F2942] hover:bg-slate-800 text-amber-400 font-extrabold text-xs rounded-full shadow-md flex items-center gap-2 transition-all"
              >
                <Building2 className="w-4 h-4" /> Enter Recruiter Talent Suite <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

      </div>

    </section>
  );
};
