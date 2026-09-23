import React from 'react';
import { ResumeBuilder } from '../components/ResumeBuilder';
import { useRouter } from '../context/RouterContext';
import { Sparkles, FileText, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';

export const ResumeBuilderPage = () => {
  const { navigate } = useRouter();

  return (
    <div className="space-y-8 pb-12 transition-colors">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 edge-glow-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> ATS-Optimized Document Engine
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Interactive Resume Builder
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Build clean, ATS-compliant resumes with real-time section reordering, formatting guidance, and instant text/PDF export.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/analyzer')}
              className="pill-btn px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-full shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Test Resume in ATS Analyzer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Resume Builder Workspace */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <ResumeBuilder />
      </div>

    </div>
  );
};
