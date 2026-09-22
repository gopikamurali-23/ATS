import React from 'react';
import { CheckCircle2, Clock, Calendar, Check, XCircle } from 'lucide-react';
import { StatusBadge } from './Badge';

export const ApplicationTimeline = ({ application }) => {
  if (!application) return null;

  const currentStatus = (application.status || 'APPLIED').toUpperCase();
  const stages = [
    { id: 'APPLIED', label: 'Application Submitted', date: application.appliedAt || 'Recently' },
    { id: 'UNDER_REVIEW', label: 'Under HR Review', date: 'In Progress' },
    { id: 'SHORTLISTED', label: 'Shortlisted for Next Round', date: 'Pending' },
    { id: 'INTERVIEW', label: 'Interview Scheduled', date: 'Pending' },
    { id: 'SELECTED', label: 'Final Decision / Offer', date: 'Pending' }
  ];

  // Determine stage progress index
  const statusIndexMap = {
    APPLIED: 0,
    UNDER_REVIEW: 1,
    SHORTLISTED: 2,
    INTERVIEW: 3,
    INTERVIEWING: 3,
    SELECTED: 4,
    OFFERED: 4,
    REJECTED: -1
  };

  const currentIndex = statusIndexMap[currentStatus] ?? 0;
  const isRejected = currentStatus === 'REJECTED';

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{application.job?.companyName || 'Company'}</div>
          <div className="text-base font-bold text-slate-900">{application.job?.title || 'Applied Position'}</div>
          <div className="text-xs text-slate-500 mt-1">Application ID: #{application.id} • Applied on {new Date(application.appliedAt || Date.now()).toLocaleDateString()}</div>
        </div>
        <div>
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Journey Timeline</h4>

        {isRejected ? (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <div className="font-bold">Application Status: Not Selected</div>
              <div>Thank you for applying. The recruiter decided not to move forward with your profile for this specific role at this time.</div>
            </div>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {stages.map((stage, idx) => {
              const isPassed = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={stage.id} className="relative flex items-start gap-4">
                  {/* Circle Marker */}
                  <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${
                    isPassed
                      ? isCurrent ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-emerald-600'
                      : 'bg-slate-300'
                  }`}>
                    {isPassed ? <Check className="w-3 h-3 stroke-[3]" /> : (idx + 1)}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className={`text-xs font-bold ${isCurrent ? 'text-blue-600' : isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {stage.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {isCurrent ? 'Currently active stage' : isPassed ? 'Completed' : 'Upcoming stage'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Extracted Application Resume Snapshot */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <div className="text-xs font-bold text-slate-700">Submitted Candidate Resume Snapshot</div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono space-y-1">
          <div><span className="font-semibold text-slate-900">File Name:</span> {application.resumeFileName || 'Candidate_Resume.pdf'}</div>
          <div><span className="font-semibold text-slate-900">Calculated ATS Score:</span> {application.matchScore || 85}%</div>
          {application.extractedSkills && (
            <div><span className="font-semibold text-slate-900">Extracted Skills:</span> {application.extractedSkills}</div>
          )}
        </div>
      </div>
    </div>
  );
};
