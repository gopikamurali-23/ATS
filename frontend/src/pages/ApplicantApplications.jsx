import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader, FileText, CheckCircle2, XCircle, Clock, ChevronRight, Award, ShieldAlert, Sparkles, BrainCircuit } from 'lucide-react';

const ApplicantApplications = () => {
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

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/40';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/40';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/40';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-10 w-10 text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Applications Log</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review the details and scan scorecards for all your job submissions.</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl p-8 border border-slate-200/50">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No Job Applications Yet</h3>
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
