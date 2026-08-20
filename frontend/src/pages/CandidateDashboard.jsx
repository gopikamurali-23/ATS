import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Loader, CheckCircle2, ChevronRight, XCircle, Clock, Sparkles, BrainCircuit, ShieldAlert, Award } from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
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
        setError('Failed to fetch applications list.');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHORTLISTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40"><CheckCircle2 className="h-3.5 w-3.5" /> Shortlisted</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40"><XCircle className="h-3.5 w-3.5" /> Rejected</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40"><Clock className="h-3.5 w-3.5" /> Under Review</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40"><Clock className="h-3.5 w-3.5" /> Applied</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Columns: Applications List */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          My Applications
        </h1>

        {loading ? (
          <div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8 text-brand-500" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 glass rounded-3xl p-8 border border-slate-200/50">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No Applications Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Submit your resume for open vacancies to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`glass p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedApp?.id === app.id
                    ? 'border-brand-500 bg-white/70 dark:bg-slate-900/70 shadow'
                    : 'border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/30 hover:bg-white/60 dark:hover:bg-slate-900/60'
                }`}
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{app.jobTitle}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{app.companyName}</p>
                  <p className="text-[10px] text-slate-400">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(app.status)}
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: ATS Report Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" /> ATS Report Analysis
        </h2>

        {selectedApp ? (
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{selectedApp.jobTitle}</h3>
              <p className="text-xs font-semibold text-slate-500">{selectedApp.companyName}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/30 text-center relative overflow-hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATS Match Score</span>
              <div className="text-5xl font-black text-brand-600 dark:text-brand-400 my-2">{selectedApp.finalAtsScore}%</div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Award className="h-4 w-4 text-indigo-500" /> Sub-scores</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl">
                    <span className="text-slate-400 block">Skills</span>
                    <strong className="text-slate-700 dark:text-slate-300">{selectedApp.skillMatchScore}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl">
                    <span className="text-slate-400 block">Experience</span>
                    <strong className="text-slate-700 dark:text-slate-300">{selectedApp.experienceMatchScore}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl">
                    <span className="text-slate-400 block">Education</span>
                    <strong className="text-slate-700 dark:text-slate-300">{selectedApp.educationMatchScore}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl">
                    <span className="text-slate-400 block">Keywords</span>
                    <strong className="text-slate-700 dark:text-slate-300">{selectedApp.keywordMatchScore}%</strong>
                  </div>
                </div>
              </div>

              {selectedApp.missingSkills && selectedApp.missingSkills.toLowerCase() !== 'none' && (
                <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-red-500"><ShieldAlert className="h-4 w-4" /> Missing Key Skills</h4>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{selectedApp.missingSkills}</p>
                </div>
              )}

              <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-500" /> Summary AI Insight</h4>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-950/20 p-3 rounded-xl">{selectedApp.candidateSummary}</p>
              </div>

              <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><BrainCircuit className="h-4 w-4 text-emerald-500" /> Interview Guide</h4>
                <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl italic font-medium">{selectedApp.interviewRecommendation}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 glass rounded-3xl p-6 border border-slate-200/50">
            <p className="text-slate-500 text-sm">Select an application on the left to see the AI report.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
