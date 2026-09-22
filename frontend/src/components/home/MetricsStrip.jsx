import React from 'react';
import { Award, Users, Building2, Clock, Sparkles } from 'lucide-react';

export const MetricsStrip = () => {
  const metrics = [
    {
      id: 1,
      stat: '94.8%',
      label: 'ATS Pass Rate',
      subtext: 'Top 10% keyword match compliance',
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/50'
    },
    {
      id: 2,
      stat: '50,000+',
      label: 'Resumes Processed',
      subtext: 'Automated skill extraction',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/50'
    },
    {
      id: 3,
      stat: '1,200+',
      label: 'Hiring Partners',
      subtext: 'Verified corporate employers',
      icon: Building2,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/50'
    },
    {
      id: 4,
      stat: '48-Hour',
      label: 'Average Shortlist Time',
      subtext: 'Rapid interview scheduling',
      icon: Clock,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50'
    }
  ];

  return (
    <section id="metrics" className="scroll-mt-24">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6 edge-glow-hover transition-colors">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Institutional Placement Dashboard
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              TalentPulse Impact &amp; Performance Benchmarks
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
            Updated Daily • Q3 2026 Audit Report
          </span>
        </div>

        {/* 4 Stat Cards Grid with Pill Styling & Ambient Glow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id}
                className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl p-5 space-y-3 transition-all hover:scale-[1.02] hover:shadow-md hover:ring-2 hover:ring-blue-500/20 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center font-bold`}>
                    <IconComponent className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    Verified
                  </span>
                </div>

                <div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.stat}
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {item.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
