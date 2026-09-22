import React from 'react';
import { 
  Building2, Briefcase, Calendar, Sparkles, BookOpen, CheckCircle2, 
  ExternalLink, ArrowRight, Award, Zap, ShieldCheck 
} from 'lucide-react';

export const NewsTicker = ({ onNavigateToJobs, onSelectRole }) => {
  const jobDrops = [
    {
      id: 1,
      company: 'Google',
      role: 'Senior Java Backend Engineer',
      location: 'Mountain View, CA',
      salary: '$160,000 - $190,000',
      deadline: 'Sept 25, 2026',
      badge: 'Urgent Hiring'
    },
    {
      id: 2,
      company: 'Microsoft',
      role: 'Full Stack React Engineer',
      location: 'Redmond, WA (Hybrid)',
      salary: '$140,000 - $175,000',
      deadline: 'Sept 28, 2026',
      badge: 'Featured'
    },
    {
      id: 3,
      company: 'Amazon',
      role: 'Cloud Microservices Architect',
      location: 'Seattle, WA (Remote)',
      salary: '$180,000 - $210,000',
      deadline: 'Oct 02, 2026',
      badge: 'New Requisition'
    },
    {
      id: 4,
      company: 'Salesforce',
      role: 'Senior Frontend UI/UX Developer',
      location: 'San Francisco, CA',
      salary: '$150,000 - $180,000',
      deadline: 'Oct 05, 2026',
      badge: 'Verified'
    }
  ];

  const careerInsights = [
    {
      id: 1,
      tag: 'Resume Strategy',
      title: 'Top 5 ATS Formatting Mistakes That Get Candidates Rejected Instantly',
      readTime: '4 min read',
      snippet: 'Learn how rigid tables, text boxes, and complex graphics break standard ATS parsers and how standard section headers double your callback rate.'
    },
    {
      id: 2,
      tag: 'Recruiter Insights',
      title: 'How Enterprise HR Teams Use Keyword Density Metrics for 48-Hour Shortlisting',
      readTime: '5 min read',
      snippet: 'Discover the exact matching formulas automated ATS engines use to evaluate experience years and technical skill density against job requisitions.'
    }
  ];

  const corporatePartners = [
    'Google', 'Microsoft', 'Amazon', 'Salesforce', 'TCS', 'Infosys', 'Deloitte', 'TechCorp', 'Innovate Labs'
  ];

  return (
    <section className="space-y-6">
      
      {/* 3-Column Institutional Feed Layout */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Latest Recruitment Drives & Job Drops (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 edge-glow-hover transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Latest Recruitment Drives
              </h3>
            </div>
            <button 
              onClick={onNavigateToJobs}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {jobDrops.map((job) => (
              <div 
                key={job.id} 
                className="p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
                onClick={() => onSelectRole('candidate')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{job.role}</h4>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">{job.company} • {job.location}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[9px] uppercase">
                    {job.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-700/40 text-[11px]">
                  <span className="font-extrabold text-slate-900 dark:text-white">{job.salary}</span>
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Closes: {job.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER COLUMN: ATS & Career Insights Spotlight (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 edge-glow-hover transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                ATS &amp; Career Insights
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {careerInsights.map((article) => (
              <div 
                key={article.id} 
                className="p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
                onClick={() => onSelectRole('candidate')}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-blue-600 dark:text-blue-400 uppercase tracking-wider">{article.tag}</span>
                  <span className="text-slate-400 dark:text-zinc-500">{article.readTime}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {article.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {article.snippet}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Corporate Hiring Partners Grid (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 edge-glow-hover transition-colors">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Building2 className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Hiring Partners
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Over 1,200+ global enterprises &amp; institutions hire via TalentPulse.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {corporatePartners.map((partner, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-xl text-center font-black text-xs text-slate-800 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {partner}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-center">
            <button
              onClick={() => onSelectRole('recruiter')}
              className="pill-btn w-full py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold text-xs rounded-full shadow-sm"
            >
              Partner With Us
            </button>
          </div>
        </div>

      </div>

    </section>
  );
};
