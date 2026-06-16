import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Loader, BarChart2, Briefcase, Award, Users, TrendingUp, ArrowLeft } from 'lucide-react';

const CompanyAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    avgScore: 0,
    shortlistedCount: 0,
    underReviewCount: 0,
    rejectedCount: 0,
  });

  const [jobStats, setJobStats] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const appResponse = await api.get('/api/applications/company');
        const apps = appResponse.data;

        const jobResponse = await api.get(`/api/jobs/company/${user.profileId}`);
        const jobs = jobResponse.data;

        const totalApplicants = apps.length;
        const totalJobs = jobs.length;
        const avgScore = totalApplicants > 0
          ? Math.round(apps.reduce((acc, a) => acc + a.finalAtsScore, 0) / totalApplicants * 10) / 10
          : 0;

        const shortlistedCount = apps.filter(a => a.status === 'SHORTLISTED').length;
        const underReviewCount = apps.filter(a => a.status === 'UNDER_REVIEW').length;
        const rejectedCount = apps.filter(a => a.status === 'REJECTED').length;

        setStats({
          totalJobs,
          totalApplicants,
          avgScore,
          shortlistedCount,
          underReviewCount,
          rejectedCount
        });

        // Compute stats per job
        const jobMap = jobs.map(job => {
          const jobApps = apps.filter(app => app.jobId === job.id);
          const jobAvg = jobApps.length > 0
            ? Math.round(jobApps.reduce((acc, a) => acc + a.finalAtsScore, 0) / jobApps.length * 10) / 10
            : 0;
          return {
            id: job.id,
            title: job.title,
            applicantsCount: jobApps.length,
            averageScore: jobAvg,
            status: job.status
          };
        });
        setJobStats(jobMap);
      } catch (err) {
        setError('Failed to fetch hiring analytics.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.profileId) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-10 w-10 text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Recruitment & Job Performance Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Detailed statistical insights into matching scores and conversion pipelines.</p>
      </div>

      {/* Analytics KPI Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Avg Applicant ATS Score</span>
            <strong className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1 block">{stats.avgScore}%</strong>
          </div>
          <div className="p-3 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-2xl"><Award className="h-6 w-6" /></div>
        </div>

        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Shortlisted Applicants</span>
            <strong className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.shortlistedCount}</strong>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Users className="h-6 w-6" /></div>
        </div>

        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate (Shortlisted)</span>
            <strong className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
              {stats.totalApplicants > 0 ? Math.round((stats.shortlistedCount / stats.totalApplicants) * 100) : 0}%
            </strong>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl"><TrendingUp className="h-6 w-6" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recruitment Pipeline Funnel Chart */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            Recruitment Funnel Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Total Applications</span>
                <span>{stats.totalApplicants}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full w-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Under Review</span>
                <span>{stats.underReviewCount}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.totalApplicants ? (stats.underReviewCount / stats.totalApplicants) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Shortlisted</span>
                <span>{stats.shortlistedCount}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.totalApplicants ? (stats.shortlistedCount / stats.totalApplicants) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                <span>Rejected</span>
                <span>{stats.rejectedCount}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${stats.totalApplicants ? (stats.rejectedCount / stats.totalApplicants) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Job posts metrics table */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Vacancy Performance</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="text-slate-500 font-semibold border-b border-slate-200/20">
                <tr>
                  <th className="pb-3">Job Title</th>
                  <th className="pb-3 text-center">Applicants</th>
                  <th className="pb-3 text-center">Avg ATS Match</th>
                  <th className="pb-3 text-right">Job Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/20">
                {jobStats.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">{job.title}</td>
                    <td className="py-3.5 text-center text-slate-600 dark:text-slate-400">{job.applicantsCount}</td>
                    <td className="py-3.5 text-center font-bold text-brand-600 dark:text-brand-400">
                      {job.averageScore > 0 ? `${job.averageScore}%` : 'N/A'}
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        job.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalytics;
