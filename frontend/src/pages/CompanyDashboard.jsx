import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Loader, Users, FileText, CheckCircle, BarChart2, Award, Briefcase, ChevronRight, Eye, ShieldAlert, BrainCircuit, Sparkles } from 'lucide-react';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Analytics
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    avgScore: 0,
    actionNeeded: 0,
  });

  // Modal Detail
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const appResponse = await api.get('/api/applications/company');
      setApplications(appResponse.data);

      const jobResponse = await api.get(`/api/jobs/company/${user.profileId}`);
      const jobs = jobResponse.data;

      // Compute stats
      const totalApplicants = appResponse.data.length;
      const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length;
      const actionNeeded = appResponse.data.filter(a => a.status === 'APPLIED').length;
      const avgScore = totalApplicants > 0
        ? Math.round(appResponse.data.reduce((acc, a) => acc + a.finalAtsScore, 0) / totalApplicants * 10) / 10
        : 0;

      setStats({ activeJobs, totalApplicants, avgScore, actionNeeded });
    } catch (err) {
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.profileId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.put(`/api/applications/${appId}/status?status=${newStatus}`);
      fetchDashboardData(); // Reload
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update applicant status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/40';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/40';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/40';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Hiring Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review candidates ranked by TalentPulse AI match scoring.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-10 w-10 text-brand-500" />
        </div>
      ) : (
        <>
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Active Vacancies</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.activeJobs}</strong>
              </div>
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-2xl"><Briefcase className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Submissions</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.totalApplicants}</strong>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Users className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Average ATS Match</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.avgScore}%</strong>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Award className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Action Required</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.actionNeeded}</strong>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl"><FileText className="h-6 w-6" /></div>
            </div>
          </div>

          {/* SVG Professional Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-6">
                <BarChart2 className="h-5 w-5 text-brand-500" /> Candidate Score Distributions
              </h3>
              {/* Custom SVG Bar Chart */}
              <div className="relative h-60 w-full flex items-end justify-between px-6 pt-4 border-b border-l border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <div className="w-12 bg-rose-500/80 rounded-t-lg transition-all duration-500" style={{ height: `${applications.length ? applications.filter(a=>a.finalAtsScore<50).length/applications.length*100 : 0}%`, minHeight: '10px' }}></div>
                  <span className="text-[10px] text-slate-500 font-bold">Low (&lt;50)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <div className="w-12 bg-amber-500/80 rounded-t-lg transition-all duration-500" style={{ height: `${applications.length ? applications.filter(a=>a.finalAtsScore>=50 && a.finalAtsScore<75).length/applications.length*100 : 0}%`, minHeight: '10px' }}></div>
                  <span className="text-[10px] text-slate-500 font-bold">Mid (50-74)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <div className="w-12 bg-emerald-500/80 rounded-t-lg transition-all duration-500" style={{ height: `${applications.length ? applications.filter(a=>a.finalAtsScore>=75).length/applications.length*100 : 0}%`, minHeight: '10px' }}></div>
                  <span className="text-[10px] text-slate-500 font-bold">High (75+)</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> Recruitment Progress
                </h3>
                <p className="text-xs text-slate-500">Applications count by funnel step.</p>
              </div>

              <div className="space-y-3 pt-6 flex-1 flex flex-col justify-center">
                {['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED'].map((status) => {
                  const count = applications.filter(a => a.status === status).length;
                  const pct = applications.length ? (count / applications.length) * 100 : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600 dark:text-slate-400 capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                        <span>{count} applicants</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-brand-600 dark:bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Candidate Ranking Table */}
          <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Candidate Ranking Pipeline</h3>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/20 px-3 py-1 rounded-full">Sorted by Match Score</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-semibold border-b border-slate-200/30">
                  <tr>
                    <th className="px-6 py-4">Candidate Name</th>
                    <th className="px-6 py-4">Applied Job</th>
                    <th className="px-6 py-4 text-center">ATS Score</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Pipeline Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/20">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        <div>
                          <span>{app.candidateName}</span>
                          <span className="block text-[10px] text-slate-400 font-medium">{app.candidateTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{app.jobTitle}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(app.finalAtsScore)}`}>
                          {app.finalAtsScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select
                          value={app.status}
                          disabled={updatingId === app.id}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className="text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="SHORTLISTED">Shortlist</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" /> View Match Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Slide-out Report Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-slate-200/50 dark:border-slate-800/40">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{selectedApp.candidateName}</h2>
                  <p className="text-sm font-semibold text-slate-500">{selectedApp.candidateTitle}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Grid detail stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/30 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">ATS Score</span>
                  <strong className="text-3xl font-black text-brand-600 dark:text-brand-400 block mt-1">{selectedApp.finalAtsScore}%</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/30 flex flex-col justify-center text-xs">
                  <span className="text-slate-400">Email: <strong className="text-slate-700 dark:text-slate-300">{selectedApp.candidateEmail}</strong></span>
                  <span className="text-slate-400 mt-1">Phone: <strong className="text-slate-700 dark:text-slate-300">{selectedApp.candidatePhone || 'N/A'}</strong></span>
                </div>
              </div>

              {/* Sub-score bars */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs"><BarChart2 className="h-4 w-4" /> Match Breakdown</h4>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-bold">
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl">
                    <span className="text-slate-400 block">Skills Score</span>
                    <strong className="text-slate-700 dark:text-slate-300 text-xs">{selectedApp.skillMatchScore}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl">
                    <span className="text-slate-400 block">Experience Score</span>
                    <strong className="text-slate-700 dark:text-slate-300 text-xs">{selectedApp.experienceMatchScore}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl">
                    <span className="text-slate-400 block">Education Score</span>
                    <strong className="text-slate-700 dark:text-slate-300 text-xs">{selectedApp.educationMatchScore}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl">
                    <span className="text-slate-400 block">Keywords Score</span>
                    <strong className="text-slate-700 dark:text-slate-300 text-xs">{selectedApp.keywordMatchScore}%</strong>
                  </div>
                </div>
              </div>

              {/* AI Summaries */}
              <div className="space-y-4 text-xs leading-relaxed">
                {selectedApp.missingSkills && selectedApp.missingSkills.toLowerCase() !== 'none' && (
                  <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-red-500"><ShieldAlert className="h-4 w-4" /> Missing Required Skills</h4>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">{selectedApp.missingSkills}</p>
                  </div>
                )}

                <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-500" /> AI Candidate Profile</h4>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/30">{selectedApp.candidateSummary}</p>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><BrainCircuit className="h-4 w-4 text-emerald-500" /> Recruiter Interview Guide</h4>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 bg-emerald-50/10 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/20 italic font-semibold">{selectedApp.interviewRecommendation}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/30 mt-6">
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'SHORTLISTED')}
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                Shortlist Candidate
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'REJECTED')}
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Reject Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
