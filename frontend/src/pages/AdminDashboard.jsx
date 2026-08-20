import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Loader, Users, FileText, Settings, ShieldAlert, Award, Briefcase, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('users');

  const fetchAdminData = async () => {
    try {
      const analyticRes = await api.get('/api/admin/analytics');
      setAnalytics(analyticRes.data);

      const userRes = await api.get('/api/admin/users');
      setUsers(userRes.data);

      const compRes = await api.get('/api/admin/companies');
      setCompanies(compRes.data);

      const jobRes = await api.get('/api/admin/jobs');
      setJobs(jobRes.data);

      const appRes = await api.get('/api/admin/applications');
      setApplications(appRes.data);
    } catch (err) {
      setError('Failed to fetch admin workspace details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All profile metrics will be removed.')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      fetchAdminData(); // Refresh
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review system metrics, manage database profiles, and edit listings.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-10 w-10 text-brand-500" />
        </div>
      ) : (
        <>
          {/* Dashboard KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Registered Users</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{users.length}</strong>
              </div>
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-2xl"><Users className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Posted Jobs</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{analytics.totalJobs}</strong>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Briefcase className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Submissions Scanned</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{analytics.totalApplications}</strong>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl"><FileText className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">System Avg ATS</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{analytics.averageAtsScore}%</strong>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl"><Award className="h-6 w-6" /></div>
            </div>
          </div>

          {/* Database Admin Tabs */}
          <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 overflow-hidden shadow-sm">
            <div className="flex bg-slate-100/50 dark:bg-slate-950/20 p-2 border-b border-slate-200/50 dark:border-slate-800/40">
              {['users', 'companies', 'jobs', 'applications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/30 text-slate-500">
                        <th className="pb-3">ID</th>
                        <th className="pb-3">Username</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/20">
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="py-3.5 text-slate-500 font-semibold">{u.id}</td>
                          <td className="py-3.5 font-bold text-slate-900 dark:text-white">{u.username}</td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">{u.email}</td>
                          <td className="py-3.5">
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {u.username !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'companies' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/30 text-slate-500">
                        <th className="pb-3">Company Name</th>
                        <th className="pb-3">Industry</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3">Website</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/20">
                      {companies.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3.5 font-bold text-slate-900 dark:text-white">{c.name}</td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">{c.industry || 'N/A'}</td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">{c.location || 'N/A'}</td>
                          <td className="py-3.5">
                            {c.website ? (
                              <a href={c.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                                Visit site
                              </a>
                            ) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'jobs' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/30 text-slate-500">
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Employer</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/20">
                      {jobs.map((j) => (
                        <tr key={j.id}>
                          <td className="py-3.5 font-bold text-slate-900 dark:text-white">{j.title}</td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">{j.company.name}</td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">{j.location}</td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                              j.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                            }`}>
                              {j.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'applications' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/30 text-slate-500">
                        <th className="pb-3">Candidate</th>
                        <th className="pb-3">Job Vacancy</th>
                        <th className="pb-3">Pipeline Status</th>
                        <th className="pb-3">Date Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/20">
                      {applications.map((a) => (
                        <tr key={a.id}>
                          <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                            {a.candidate.firstName} {a.candidate.lastName}
                          </td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400">{a.job.title}</td>
                          <td className="py-3.5">
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-xs text-slate-500">{new Date(a.appliedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
