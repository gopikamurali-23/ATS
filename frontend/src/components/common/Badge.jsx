import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalizedStatus = (status || '').toUpperCase();

  const statusConfigs = {
    APPLIED: { label: 'Applied', className: 'badge-applied' },
    UNDER_REVIEW: { label: 'Under Review', className: 'badge-under-review' },
    SHORTLISTED: { label: 'Shortlisted', className: 'badge-shortlisted' },
    INTERVIEW: { label: 'Interview', className: 'badge-interview' },
    INTERVIEWING: { label: 'Interviewing', className: 'badge-interview' },
    SELECTED: { label: 'Selected', className: 'badge-selected' },
    OFFERED: { label: 'Offered', className: 'badge-selected' },
    REJECTED: { label: 'Rejected', className: 'badge-rejected' }
  };

  const config = statusConfigs[normalizedStatus] || {
    label: status || 'Pending',
    className: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};

export const AtsScoreBadge = ({ score, size = 'md' }) => {
  const numericScore = Number(score) || 0;
  
  let scoreColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let scoreText = 'Strong Match';
  if (numericScore < 60) {
    scoreColor = 'bg-rose-50 text-rose-700 border-rose-200';
    scoreText = 'Low Match';
  } else if (numericScore < 80) {
    scoreColor = 'bg-amber-50 text-amber-700 border-amber-200';
    scoreText = 'Moderate Match';
  }

  if (size === 'lg') {
    return (
      <div className={`p-4 rounded-lg border flex items-center justify-between ${scoreColor}`}>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider opacity-80">ATS Score</div>
          <div className="text-sm font-semibold mt-0.5">{scoreText}</div>
        </div>
        <div className="text-3xl font-black tracking-tight">{numericScore}%</div>
      </div>
    );
  }

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border inline-flex items-center gap-1.5 ${scoreColor}`}>
      <span>ATS</span>
      <span className="font-extrabold">{numericScore}%</span>
    </span>
  );
};
