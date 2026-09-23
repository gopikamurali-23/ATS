import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { 
  BarChart3, TrendingUp, Users, Award, Clock, ArrowUpRight, 
  CheckCircle2, Sparkles, Filter, ShieldCheck, Briefcase 
} from 'lucide-react';

export const AnalyticsPage = () => {
  const { navigate } = useRouter();
  const [timeRange, setTimeRange] = useState('30d');

  const funnelStages = [
    { label: 'Applications Received', count: 4850, percent: 100, color: 'bg-blue-600' },
    { label: 'Passed ATS Resume Screening', count: 3780, percent: 78, color: 'bg-indigo-600' },
    { label: 'Technical & HR Interviews', count: 1820, percent: 38, color: 'bg-amber-500' },
    { label: 'Final Offers Extended', count: 640, percent: 13, color: 'bg-emerald-500' }
  ];

  const topSkills = [
    { skill: 'React & Frontend UI', demand: 96, growth: '+18%' },
    { skill: 'Java & Spring Boot', demand: 92, growth: '+14%' },
    { skill: 'Cloud & DevOps (AWS/Docker)', demand: 89, growth: '+24%' },
    { skill: 'Python & Data Engineering', demand: 85, growth: '+12%' },
    { skill: 'TypeScript & Node.js', demand: 81, growth: '+16%' }
  ];

  return (
    <div className="space-y-8 pb-12 transition-colors">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 edge-glow-hover">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Intelligence &amp; Placement Metrics
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Enterprise Talent Analytics Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Real-time telemetry on candidate shortlisting velocities, hiring funnel conversions, and market skill demands.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3.5 py-1.5 text-xs bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Placement Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">94.8%</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +3.2% vs last cycle
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Average Time-to-Hire</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">14.2 Days</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> 45% faster than benchmark
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">Total Verified Jobs</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">12,400+</div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +120 requisitions this week
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">ATS Accuracy</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">99.1%</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Deterministic keyword parsing
          </div>
        </div>

      </div>

      {/* Visual Funnel and Skills Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Recruitment Funnel */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hiring Conversion Funnel</h3>
            <span className="text-xs text-slate-400 font-semibold">Active Session Pipeline</span>
          </div>
          
          <div className="space-y-4 pt-2">
            {funnelStages.map((stage, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  <span>{stage.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{stage.count.toLocaleString()} ({stage.percent}%)</span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stage.color} rounded-full transition-all duration-700`}
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Technical Skills in Demand */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Most Requested Technical Skills</h3>
            <span className="text-xs text-slate-400 font-semibold">Requisition Index</span>
          </div>

          <div className="space-y-3 pt-2">
            {topSkills.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{item.skill}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">Employer match priority: {item.demand}/100</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  {item.growth}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
