import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Loader, FileText, CheckCircle2, XCircle, Clock, ChevronRight, 
  Award, ShieldAlert, Sparkles, BrainCircuit, ArrowLeft 
} from 'lucide-react';

const ApplicantApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('/api/applications/candidate');
        setApplications(response.data);
      } catch (err) {
        setError('Failed to fetch applications.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHORTLISTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40"><CheckCircle2 className="h-3.5 w-3.5" /> Shortlisted</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40"><XCircle className="h-3.5 w-3.5" /> Rejected</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40"><Clock className="h-3.5 w-3.5" /> Under Review</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40"><Clock className="h-3.5 w-3.5" /> Applied</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-10 w-10 text-brand-500" />
      </div>
    );
  }

  if (selectedApp) {
    const app = selectedApp;
    const hasAts = app.analyzed;
    const score = app.finalAtsScore || app.overallScore || 0;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => setSelectedApp(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to applications log
        </button>

        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 px-3 py-1 rounded-full border border-brand-100 dark:border-brand-900/40">
              {app.companyName}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{app.jobTitle}</h1>
            <p className="text-xs text-slate-500 mt-1">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(app.status)}
            <button
              onClick={() => navigate('/applicant/resume-builder', { state: { targetRole: app.jobTitle } })}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" /> Optimize Resume
            </button>
          </div>
        </div>

        {hasAts ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: ATS Score Gauge & Category Breakdown */}
            <div className="lg:col-span-1 space-y-6">
              {/* Score Gauge */}
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col items-center text-center">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-4">Overall ATS Match Score</h3>
                <div className="relative flex items-center justify-center h-32 w-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * score) / 100}
                      className={`transition-all duration-1000 ${
                        score >= 75
                          ? 'text-emerald-500'
                          : score >= 50
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{Math.round(score)}%</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Match</span>
                  </div>
                </div>
                <div className="mt-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {score >= 75
                    ? 'Excellent compatibility for this position.'
                    : score >= 50
                    ? 'Good profile alignment. Room for minor tweaks.'
                    : 'Low score match. Highly recommended to optimize.'}
                </div>
              </div>

              {/* Score Breakdown List */}
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Scoring Category Breakdown</h3>
                <div className="space-y-3.5">
                  {[
                    { label: 'Skills Alignment', score: app.skillMatchScore || app.skillsScore },
                    { label: 'Experience Correlation', score: app.experienceMatchScore || app.experienceScore },
                    { label: 'Education Verification', score: app.educationMatchScore || app.educationScore },
                    { label: 'Target Keywords Match', score: app.keywordMatchScore || app.keywordScore },
                    { label: 'Formatting Compliance', score: app.formatMatchScore || app.formatScore },
                    { label: 'Project Contributions', score: app.projectMatchScore || app.projectScore },
                    { label: 'Certifications Check', score: app.certificationMatchScore || app.certificationScore },
                    { label: 'Communication Assessment', score: app.communicationMatchScore || 0 }
                  ].map((cat, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-605 dark:text-slate-400">{cat.label}</span>
                        <span className={`${
                          cat.score >= 75
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : cat.score >= 50
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-450'
                        }`}>{Math.round(cat.score || 0)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-550 ${
                            cat.score >= 75
                              ? 'bg-emerald-500'
                              : cat.score >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${cat.score || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Analysis details & Feedback */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              {app.candidateSummary && (
                <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-2.5">
                  <h3 className="font-bold text-sm text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                    <BrainCircuit className="h-4 w-4 text-brand-500" />
                    AI Profile Fit Analysis
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    {app.candidateSummary}
                  </p>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Identified Strengths
                  </h3>
                  {app.strengths && app.strengths.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-355">
                      {app.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 shrink-0 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No specific strengths listed.</p>
                  )}
                </div>

                {/* Weaknesses */}
                <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-500" />
                    Areas to Improve
                  </h3>
                  {app.weaknesses && app.weaknesses.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-355">
                      {app.weaknesses.map((weak, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500 shrink-0 font-bold">•</span>
                          <span>{weak}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No specific weaknesses flagged.</p>
                  )}
                </div>
              </div>

              {/* Missing Skills & Keywords */}
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
                <h3 className="font-bold text-sm text-slate-850 dark:text-slate-200">Missing Critical Requirements</h3>
                <div className="space-y-4">
                  {/* Missing Skills */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-2">Missing Candidate Skills</span>
                    {app.missingSkills && app.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {app.missingSkills.map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/45">
                            {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">None. Resume matches all identified skill targets!</span>
                    )}
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <span className="text-xs font-bold text-slate-500 block mb-2">Missing Job Description Keywords</span>
                    {app.missingKeywords && app.missingKeywords.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {app.missingKeywords.map((kw, idx) => (
                          <span key={idx} className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/45">
                            {kw}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">None. Resume captures all key target phrases!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Improvement Suggestions */}
              {app.improvementSuggestions && app.improvementSuggestions.length > 0 && (
                <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-3">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-brand-500" />
                    Actionable Improvement Guidelines
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-650 dark:text-slate-350">
                    {app.improvementSuggestions.map((sug, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400 border border-brand-100/40 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Probabilities */}
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Outcome Probability Assessments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-405">Interview Call Probability</span>
                      <span className="text-brand-600 dark:text-brand-400">{Math.round(app.interviewSuccessProbability || 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-500 h-full rounded-full transition-all duration-750"
                        style={{ width: `${app.interviewSuccessProbability || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-405">Hiring Probability</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{Math.round(app.hiringSuccessProbability || 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-750"
                        style={{ width: `${app.hiringSuccessProbability || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass p-12 text-center rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
            <ShieldAlert className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">ATS Match Pending</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your resume analysis matches for this application are currently processing. If you uploaded a legacy document format, update your profile actively with our Resume Builder.
            </p>
            <button
              onClick={() => navigate('/applicant/resume-builder', { state: { targetRole: app.jobTitle } })}
              className="mt-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" /> Go to AI Resume Builder
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Applications Log</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review the details and scan scorecards for all your job submissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between hover:scale-[1.02] transition-all duration-200">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Resume Builder</h3>
            <p className="text-xs text-slate-500">Draft, edit and download standard resumes formatted dynamically using AI.</p>
          </div>
          <button
            onClick={() => navigate('/applicant/resume-builder')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 ml-4 cursor-pointer"
          >
            Open Builder
          </button>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between hover:scale-[1.02] transition-all duration-200">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">ATS Analyzer</h3>
            <p className="text-xs text-slate-500">Scan your resume against target roles and analyze matching keyword scoring details.</p>
          </div>
          <button
            onClick={() => navigate('/applicant/resume')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 ml-4 cursor-pointer"
          >
            Run Analyzer
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl p-8 border border-slate-200/50">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No Job Job Applications Yet</h3>
          <p className="text-sm text-slate-500 mt-1">Submit your resume for open vacancies to start tracking.</p>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-semibold border-b border-slate-200/30">
                <tr>
                  <th className="px-6 py-4">Vacancy Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4">Pipeline Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/20">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-white/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {app.jobTitle}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{app.companyName}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 dark:hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>View Analysis</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantApplications;
