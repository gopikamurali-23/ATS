import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { 
  Sparkles, UserCheck, Building2, FileText, FileSearch, Search, 
  CheckSquare, Briefcase, Award, BarChart3, Calendar, ArrowRight, 
  ShieldCheck, Zap, Layers, Check 
} from 'lucide-react';

export const FeaturesPage = ({ onOpenAuthModal }) => {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState('candidate');

  return (
    <div className="space-y-12 pb-12 transition-colors">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4 text-center max-w-3xl mx-auto edge-glow-hover">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Platform Capabilities
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Comprehensive ATS &amp; Recruitment Ecosystem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
          Engineered for dual-sided productivity: giving candidates the upper hand in job applications and providing enterprise recruiters with automated candidate shortlisting, ranking, and scheduling.
        </p>

        {/* Tab Switcher */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('candidate')}
              className={`pill-btn px-5 py-2 rounded-full transition-all flex items-center gap-2 ${
                activeTab === 'candidate'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Candidate Career Suite</span>
            </button>
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`pill-btn px-5 py-2 rounded-full transition-all flex items-center gap-2 ${
                activeTab === 'recruiter'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Employer Talent Acquisition</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      {activeTab === 'candidate' ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interactive Resume Builder</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Design ATS-formatted resumes with live section reordering and export clean text/PDF formats.
                </p>
              </div>
              <button
                onClick={() => navigate('/builder')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Launch Builder</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <FileSearch className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time ATS Checker</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Calculate overall match scores (0–100%), view matched vs missing keywords, and get actionable tips.
                </p>
              </div>
              <button
                onClick={() => navigate('/analyzer')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Launch Analyzer</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filtered Job Discovery</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Filter open positions by title, location, salary range, and required technical skills.
                </p>
              </div>
              <button
                onClick={() => navigate('/jobs')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Browse Jobs</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Application Tracking</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Track stages (Applied, Under Review, Interviewing, Offered) with real-time updates and interview invites.
                </p>
              </div>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Log In to View</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Job Requisition Publisher</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Publish open positions specifying required skills, experience years, and salary ranges with instant board dispatch.
                </p>
              </div>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Post Requisition</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Automated Candidate Ranking</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Applications are automatically pre-scored and ranked by calculated ATS match percentage against the requisition.
                </p>
              </div>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Review Pipeline</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interview Scheduler Modal</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Schedule technical or HR rounds with Google Meet / Teams links and instant meeting notifications.
                </p>
              </div>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>Schedule Interview</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hiring Funnel Analytics</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Monitor candidate conversion, interview scheduling velocity, and requisition fulfillment rates.
                </p>
              </div>
              <button
                onClick={() => navigate('/analytics')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline pt-2"
              >
                <span>View Analytics</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Comparison Matrix */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Why Top Institutions Choose TalentPulse
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                <th className="py-3 px-4 font-bold">Capability</th>
                <th className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">TalentPulse ATS</th>
                <th className="py-3 px-4 font-bold text-slate-400">Traditional Portals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-zinc-200">Real-Time ATS Resume Match Scoring</td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Included (0–100%)</td>
                <td className="py-3 px-4 text-slate-400">Not Available</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-zinc-200">Zero-Latency Client Engine &amp; Offline Persistence</td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Included</td>
                <td className="py-3 px-4 text-slate-400">Server Dependent</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-zinc-200">End-to-End Type Safety &amp; Zod Runtime Schemas</td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> 100% Boundary Validated</td>
                <td className="py-3 px-4 text-slate-400">Partial / Unvalidated</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-zinc-200">Integrated Interview Scheduler with Meet Sync</td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Included</td>
                <td className="py-3 px-4 text-slate-400">Separate Tool Required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
