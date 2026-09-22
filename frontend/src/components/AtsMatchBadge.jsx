import React from 'react';

export const AtsMatchBadge = ({ score, size = 'md' }) => {
  const numScore = score != null ? Math.round(score) : 0;

  let badgeStyle = "badge-score-low";
  let textColor = "text-red-400";
  let strokeColor = "#f87171";
  let label = "Low Fit";

  if (numScore >= 85) {
    badgeStyle = "badge-score-high";
    textColor = "text-emerald-400";
    strokeColor = "#34d399";
    label = "Great Match";
  } else if (numScore >= 70) {
    badgeStyle = "badge-score-mid";
    textColor = "text-amber-400";
    strokeColor = "#fbbf24";
    label = "Moderate Match";
  }

  if (size === 'lg') {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (numScore / 100) * circumference;

    return (
      <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle cx="32" cy="32" r={radius} stroke="#1e293b" strokeWidth="5" fill="transparent" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke={strokeColor}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className={`absolute font-bold text-sm ${textColor}`}>{numScore}%</span>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">ATS Fit Score</div>
          <div className={`text-base font-bold ${textColor}`}>{label}</div>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeStyle}`}>
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }}></span>
      ATS Match: {numScore}%
    </span>
  );
};
