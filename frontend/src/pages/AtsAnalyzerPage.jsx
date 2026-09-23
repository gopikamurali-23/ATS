import React from 'react';
import { useJobs } from '../hooks/useJobs';
import { AtsScoreAnalyzer } from '../components/AtsScoreAnalyzer';
import { useRouter } from '../context/RouterContext';
import { Sparkles, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

export const AtsAnalyzerPage = () => {
  const { jobs } = useJobs();
  const { navigate } = useRouter();

  return (
    <div className="space-y-8 pb-12 transition-colors">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 edge-glow-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Client AI Scoring Engine
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              ATS Resume Match &amp; Keyword Analyzer
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Simulate enterprise ATS applicant screening. Calculate overall match ratings (0–100%), discover missing keywords, and optimize your resume before submitting.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/jobs')}
              className="pill-btn px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5"
            >
              <span>View Open Requisitions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Analyzer Component */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <AtsScoreAnalyzer availableJobs={jobs} />
      </div>

    </div>
  );
};
