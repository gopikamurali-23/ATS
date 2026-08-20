import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { openResumeUrl } from '../utils/documentHelper';
import {
  FileText,
  Loader,
  CheckCircle2,
  ChevronRight,
  XCircle,
  Clock,
  Sparkles,
  BrainCircuit,
  ShieldAlert,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch applications
        const appResponse = await api.get('/api/applications/candidate');
        setApplications(appResponse.data);

        // Fetch jobs for recommendations
        const jobsResponse = await api.get('/api/jobs');
        // Filter out jobs already applied to
        const appliedJobIds = appResponse.data.map(app => app.jobId);
        const filtered = jobsResponse.data.filter(job => !appliedJobIds.includes(job.id));
        setRecommendedJobs(filtered.slice(0, 3));
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHORTLISTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40"><CheckCircle2 className="h-3 w-3" /> Shortlisted</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40"><XCircle className="h-3 w-3" /> Rejected</span>;
      case 'UNDER_REVIEW':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40"><Clock className="h-3 w-3" /> Under Review</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40"><Clock className="h-3 w-3" /> Applied</span>;
    }
  };

  // Metrics calculations
  const totalApplied = applications.length;
  const latestApp = [...applications]
    .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))[0];
  const latestResumeName = latestApp && latestApp.resumeUrl 
    ? latestApp.resumeUrl.split(/[\\/]/).pop() 
    : 'No Resume';

  // Dummy Profile completion calculation based on properties
  const calculateProfileCompletion = () => {
    let completion = 30; // base registered account
    if (latestApp && latestApp.resumeUrl) completion += 35; // uploaded resume
    if (totalApplied > 0) completion += 15; // submitted application
    if (totalApplied > 2) completion += 20; // active profile history
    return Math.min(completion, 100);
  };
  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Applicant Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Welcome back! Track your pipeline progress and explore recommended vacancies.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-10 w-10 text-brand-500" />
        </div>
      ) : (
        <>
          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Uploaded Resume Card */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Active Resume File</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 block truncate max-w-[150px]">{latestResumeName}</strong>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl"><FileText className="h-6 w-6" /></div>
            </div>

            {/* Applied Jobs Card */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Applied Positions</span>
                <strong className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{totalApplied}</strong>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl"><Briefcase className="h-6 w-6" /></div>
            </div>

            {/* Profile Completion Card */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between">
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-semibold text-slate-500">Profile Completion</span>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
                <div className="bg-brand-600 dark:bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section: Recent Activity / Submissions */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity & Submissions</h2>
                <Link to="/applicant/applications" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  View All Applications <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16 glass rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/20 bg-white/20 dark:bg-slate-900/20">
                  <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">No Job Submissions Found</h3>
                  <p className="text-sm text-slate-500 mt-1 mb-6">You haven't submitted any job applications yet.</p>
                  <Link to="/applicant/jobs" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-md transition-all text-xs cursor-pointer">
                    Search Open Vacancies
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/30 flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{app.jobTitle}</h3>
                        <p className="text-xs text-slate-500 font-semibold">{app.companyName}</p>
                        <div className="flex gap-4 items-center pt-1">
                          <span className="text-[10px] text-slate-400">Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Section: Recommended Jobs */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended For You</h2>
                <Link to="/applicant/jobs" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  Browse All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recommendedJobs.length === 0 ? (
                <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 bg-white/20 dark:bg-slate-900/20 text-center py-10">
                  <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No new job recommendations at the moment. Check back later!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/30 dark:bg-slate-900/30 hover:bg-white/50 dark:hover:bg-slate-900/50 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{job.title}</h4>
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 dark:text-brand-400 px-2 py-0.5 rounded-full w-fit block border border-brand-100/30">
                          {job.companyName}
                        </span>
                        <div className="flex items-center gap-2 pt-2 text-[10px] text-slate-400">
                          <span>📍 {job.location}</span>
                          <span>•</span>
                          <span>💰 {job.salaryRange}</span>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <Link
                          to={`/applicant/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg transition-all"
                        >
                          View & Apply <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CandidateDashboard;
