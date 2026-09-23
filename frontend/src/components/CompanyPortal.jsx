import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useJobs } from '../hooks/useJobs';
import { useApplications } from '../hooks/useApplications';
import { TableRowSkeleton } from './common/Skeleton';
import { InterviewSchedulerModal } from './InterviewSchedulerModal';
import { 
  Building2, LayoutDashboard, Briefcase, Plus, Users, UserCheck, Award, 
  Calendar, BarChart3, Bell, Settings, LogOut, CheckCircle2, XCircle, 
  Eye, FileText, Search, Filter, Edit, Trash2, ArrowRight, Check, X, ArrowLeft
} from 'lucide-react';

export const CompanyPortal = ({ onBackToHome }) => {
  const { user, logout } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Domain Hooks (Architectural Rule 1 & 3: Decoupled Fetching & Resilient Updates)
  const { jobs: allJobs, loading: jobsLoading, postJob } = useJobs();
  const { applications, loading: appsLoading, updateStatus: updateAppStatus } = useApplications(true);

  // Active navigation tab inside Recruiter Portal
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filter & Pagination States (Architectural Rule 5: Virtualized/Paginated Lists)
  const [selectedJobIdFilter, setSelectedJobIdFilter] = useState('ALL');
  const [appPage, setAppPage] = useState(1);
  const appsPerPage = 5;
  
  // Modals & Viewers
  const [selectedCandidateForResume, setSelectedCandidateForResume] = useState(null);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);

  // Job Posting Form State
  const [postTitle, setPostTitle] = useState('');
  const [postLocation, setPostLocation] = useState('Remote');
  const [postType, setPostType] = useState('Full-Time');
  const [postExpYears, setPostExpYears] = useState(3);
  const [postSkills, setPostSkills] = useState('');
  const [postSalary, setPostSalary] = useState('$130,000 - $160,000');
  const [postDesc, setPostDesc] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  // Scheduled Interviews State
  const [scheduledInterviews, setScheduledInterviews] = useState([
    {
      id: 1,
      candidateName: 'John Doe',
      jobTitle: 'Senior Java Backend Engineer',
      date: '2026-09-18',
      time: '10:30 AM PST',
      type: 'Technical Screening',
      status: 'SCHEDULED'
    }
  ]);

  const companyName = user?.companyName || 'Google';
  const companyJobs = allJobs.filter(j => !j.companyName || j.companyName.toLowerCase() === companyName.toLowerCase() || user?.role === 'ROLE_ADMIN');

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle || !postDesc) return;

    try {
      const newJobData = {
        title: postTitle,
        description: postDesc,
        companyName: user?.companyName || 'Google',
        location: postLocation,
        employmentType: postType,
        requiredExperienceYears: Number(postExpYears),
        requiredSkills: postSkills,
        salaryRange: postSalary,
        active: true
      };

      await postJob(newJobData);
      toastSuccess(`Job requisition "${postTitle}" posted successfully!`);
      setPostSuccess(`Job requisition "${postTitle}" posted successfully!`);
      
      setPostTitle(''); setPostDesc(''); setPostSkills('');
      setTimeout(() => {
        setPostSuccess('');
        setActiveTab('manage-jobs');
      }, 1200);
    } catch (err) {
      toastError("Failed to post job: " + err.message);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await updateAppStatus(appId, newStatus);
      toastSuccess(`Application status updated to ${newStatus}`);
    } catch (e) {
      toastError("Failed to update status: " + e.message);
    }
  };

  const handleInterviewScheduled = (details) => {
    const newInterview = {
      id: Date.now(),
      candidateName: details.candidateName,
      jobTitle: details.jobTitle,
      date: details.date,
      time: details.time,
      type: details.type,
      status: 'SCHEDULED'
    };
    setScheduledInterviews([newInterview, ...scheduledInterviews]);
    toastSuccess(`Interview invitation dispatched to ${details.candidateName}`);
  };

  // Metrics Calculations
  const activeJobsCount = companyJobs.filter(j => j.active !== false).length;
  const totalAppsCount = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'INTERVIEWING' || a.status === 'OFFERED').length;
  const hiredCount = applications.filter(a => a.status === 'OFFERED').length;

  const filteredApplications = selectedJobIdFilter === 'ALL'
    ? applications
    : applications.filter(a => a.jobId === Number(selectedJobIdFilter) || a.job?.id === Number(selectedJobIdFilter));

  const totalAppPages = Math.ceil(filteredApplications.length / appsPerPage) || 1;
  const paginatedApplications = filteredApplications.slice((appPage - 1) * appsPerPage, appPage * appsPerPage);

  return (
    <div className="space-y-4">
      {/* Universal Top-Left Back Button */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
        <button
          onClick={onBackToHome || (() => activeTab !== 'dashboard' ? setActiveTab('dashboard') : window.history.back())}
          className="pill-btn bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold px-4 py-2 flex items-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Page</span>
        </button>
        
        <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
          Recruiter Control Suite • <span className="capitalize text-blue-600 dark:text-blue-400 font-bold">{activeTab.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Mobile Horizontal Tab Navigation (Visible on mobile/tablet screens < md) */}
      <div className="md:hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 shadow-sm overflow-x-auto flex items-center gap-2 text-xs font-bold">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'applications', label: `Applications (${applications.length})`, icon: Users },
          { id: 'manage-jobs', label: `Jobs (${companyJobs.length})`, icon: Briefcase },
          { id: 'post-job', label: 'Post Job', icon: Plus },
          { id: 'shortlisted', label: `Shortlisted (${shortlistedCount})`, icon: Award },
          { id: 'interviews', label: `Interviews (${scheduledInterviews.length})`, icon: Calendar },
          { id: 'reports', label: 'Analytics', icon: BarChart3 },
          { id: 'company-profile', label: 'Profile', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[700px] flex flex-col md:flex-row gap-6">
        
        {/* RECRUITER SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden md:block w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-6 flex-shrink-0">
          
          {/* Recruiter Identity Card */}
          <div className="p-4 bg-slate-900 dark:bg-zinc-800 text-white rounded-2xl space-y-1 shadow-md">
            <div className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wider">Recruiter Portal</div>
            <div className="font-extrabold text-sm truncate">{user?.companyName || 'Enterprise Employer'}</div>
            <div className="text-[11px] text-slate-300 dark:text-zinc-400 truncate">{user?.fullName || user?.username}</div>
          </div>

          {/* Navigation Item Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Recruitment Dashboard
            </button>

            <button
              onClick={() => setActiveTab('company-profile')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'company-profile'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Company Profile
            </button>

            <button
              onClick={() => setActiveTab('post-job')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'post-job'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Plus className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Post New Job
            </button>

            <button
              onClick={() => setActiveTab('manage-jobs')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'manage-jobs'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Briefcase className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Manage Job Openings ({companyJobs.length})
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'applications'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Users className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Applications ({applications.length})
            </button>

            <button
              onClick={() => setActiveTab('shortlisted')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'shortlisted'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Award className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Shortlisted Talent ({shortlistedCount})
            </button>

            <button
              onClick={() => setActiveTab('interviews')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'interviews'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Interviews ({scheduledInterviews.length})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'reports'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Hiring Analytics
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'notifications'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bell className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Notifications
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'settings'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white font-bold shadow-md'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Settings className="w-4 h-4 text-blue-500 dark:text-blue-300" /> Settings
            </button>

          </nav>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={logout}
              className="w-full px-3.5 py-2.5 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

        </aside>

      {/* RECRUITER MAIN DISPLAY */}
      <main className="flex-1 space-y-6">
        
        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Recruiter Control Hub</span>
                <h2 className="text-xl font-extrabold mt-0.5">{user?.companyName || 'Google'} Hiring Dashboard</h2>
                <p className="text-xs text-slate-300 mt-1">Review active jobs, inspect candidate ATS scores, and schedule interviews.</p>
              </div>

              <button
                onClick={() => setActiveTab('post-job')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hidden sm:flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Post New Job Requisition
              </button>
            </div>

            {/* Top 6 KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 text-left">
              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm space-y-1">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Active Jobs</div>
                <div className="text-xl font-black text-slate-900">{activeJobsCount}</div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm space-y-1">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Applications</div>
                <div className="text-xl font-black text-blue-600">{totalAppsCount}</div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm space-y-1">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Candidates</div>
                <div className="text-xl font-black text-slate-900">{totalAppsCount}</div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm space-y-1">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Shortlisted</div>
                <div className="text-xl font-black text-indigo-600">{shortlistedCount}</div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm space-y-1">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Interviews</div>
                <div className="text-xl font-black text-amber-600">{scheduledInterviews.length}</div>
              </div>

              <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm space-y-1">
                <div className="text-[10px] font-extrabold uppercase text-slate-400">Hired</div>
                <div className="text-xl font-black text-emerald-600">{hiredCount}</div>
              </div>
            </div>

            {/* Candidate Applications Table */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Candidate Submissions</h3>
                <button onClick={() => setActiveTab('applications')} className="text-xs text-blue-600 font-bold hover:underline">
                  View All Applications →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Job Position</th>
                      <th>ATS Match Score</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app.id}>
                        <td className="font-bold text-slate-900">
                          {app.candidate?.fullName || app.candidate?.username || 'John Doe'}
                          <div className="text-[11px] font-normal text-slate-500">{app.candidate?.email}</div>
                        </td>
                        <td>{app.job?.title}</td>
                        <td>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                            {app.matchScore}% Match
                          </span>
                        </td>
                        <td>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            app.status === 'OFFERED' ? 'badge-selected' :
                            app.status === 'INTERVIEWING' ? 'badge-interview' :
                            'badge-applied'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="text-right space-x-2">
                          <button
                            onClick={() => setSelectedCandidateForResume(app)}
                            className="p-1.5 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-100"
                            title="View Candidate Resume"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedCandidateForInterview(app); setIsSchedulerOpen(true); }}
                            className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold text-[11px]"
                          >
                            Interview
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 2. COMPANY PROFILE TAB */}
        {activeTab === 'company-profile' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Company Profile Settings</h2>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  defaultValue={user?.companyName || 'Google'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Official Email</label>
                <input
                  type="text"
                  defaultValue={user?.companyEmail || user?.email || 'careers@google.com'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HQ Location</label>
                <input
                  type="text"
                  defaultValue="Mountain View, CA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Website</label>
                <input
                  type="text"
                  defaultValue="https://careers.google.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={() => alert("Company Profile Saved!")}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Update Company Branding
            </button>
          </div>
        )}

        {/* 3. POST NEW JOB TAB */}
        {activeTab === 'post-job' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Post New Requisition / Job Opening</h2>
            
            {postSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{postSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePostJobSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Job Title <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Senior Java Microservices Engineer"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Location <span className="text-rose-500 font-bold ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="Mountain View, CA (Hybrid)"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Employment Type <span className="text-rose-500 font-bold ml-1">*</span>
                  </label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg bg-white"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Required Experience (Years) <span className="text-rose-500 font-bold ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    value={postExpYears}
                    onChange={(e) => setPostExpYears(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Required Skills (Comma Separated) <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={postSkills}
                  onChange={(e) => setPostSkills(e.target.value)}
                  placeholder="Java, Spring Boot, PostgreSQL, Docker, REST API"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Salary Range <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={postSalary}
                  onChange={(e) => setPostSalary(e.target.value)}
                  placeholder="$140,000 - $180,000"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Detailed Job Description &amp; Responsibilities <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder="Describe role responsibilities, team structure, and qualifications..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Publish Job Requisition
              </button>

            </form>
          </div>
        )}

        {/* 4. MANAGE JOBS TAB */}
        {activeTab === 'manage-jobs' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Manage Job Requisitions ({companyJobs.length})</h2>

            <div className="space-y-3">
              {companyJobs.map((job) => (
                <div key={job.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">{job.title}</div>
                    <div className="text-slate-500">{job.location} • {job.salaryRange}</div>
                    <div className="text-[11px] text-slate-600">Skills: {job.requiredSkills}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active</span>
                    <button onClick={() => alert("Editing job " + job.title)} className="p-1.5 rounded border border-slate-200 bg-white">
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CANDIDATE APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Candidate Applications ({filteredApplications.length})</h2>

              <select
                value={selectedJobIdFilter}
                onChange={(e) => setSelectedJobIdFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="ALL">Filter by All Open Jobs</option>
                {companyJobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Job</th>
                    <th>Extracted Education</th>
                    <th>ATS Match Score</th>
                    <th>Status Action</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appsLoading ? (
                    <TableRowSkeleton cols={6} rows={4} />
                  ) : paginatedApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500 dark:text-zinc-400">
                        No candidate applications found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedApplications.map((app) => (
                      <tr key={app.id}>
                        <td className="font-bold text-slate-900 dark:text-white">
                          {app.candidate?.fullName || app.candidate?.username || 'John Doe'}
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">{app.candidate?.email}</div>
                        </td>
                        <td className="dark:text-zinc-200">{app.job?.title}</td>
                        <td className="text-slate-600 dark:text-zinc-400 text-xs">{app.extractedEducation || 'Computer Science'}</td>
                        <td>
                          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold text-xs">
                            {app.matchScore}% Match
                          </span>
                        </td>
                        <td>
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 dark:text-zinc-200 font-semibold"
                          >
                            <option value="APPLIED">APPLIED</option>
                            <option value="UNDER_REVIEW">UNDER REVIEW</option>
                            <option value="INTERVIEWING">INTERVIEWING</option>
                            <option value="OFFERED">OFFERED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>
                        <td className="text-right space-x-1">
                          <button
                            onClick={() => setSelectedCandidateForResume(app)}
                            className="p-1.5 rounded text-slate-600 dark:text-zinc-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="View Resume Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedCandidateForInterview(app); setIsSchedulerOpen(true); }}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px]"
                          >
                            Schedule
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalAppPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                <div>
                  Showing {(appPage - 1) * appsPerPage + 1} to {Math.min(appPage * appsPerPage, filteredApplications.length)} of {filteredApplications.length} candidates
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={appPage === 1}
                    onClick={() => setAppPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">Page {appPage} of {totalAppPages}</span>
                  <button
                    disabled={appPage >= totalAppPages}
                    onClick={() => setAppPage(p => Math.min(totalAppPages, p + 1))}
                    className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. SHORTLISTED TALENT TAB */}
        {activeTab === 'shortlisted' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Shortlisted Candidates ({shortlistedCount})</h2>
            
            <div className="space-y-3">
              {applications.filter(a => a.status === 'INTERVIEWING' || a.status === 'OFFERED').map((app) => (
                <div key={app.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{app.candidate?.fullName || app.candidate?.username}</div>
                    <div className="text-slate-500">{app.job?.title} • {app.matchScore}% ATS Score</div>
                  </div>
                  <button
                    onClick={() => { setSelectedCandidateForInterview(app); setIsSchedulerOpen(true); }}
                    className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                  >
                    Schedule Interview
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. INTERVIEWS TAB */}
        {activeTab === 'interviews' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recruiter Scheduled Interviews</h2>
              <button
                onClick={() => { setSelectedCandidateForInterview(applications[0]); setIsSchedulerOpen(true); }}
                className="px-3.5 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-lg flex items-center gap-1"
              >
                + Schedule Interview
              </button>
            </div>

            {scheduledInterviews.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{item.candidateName} — {item.jobTitle}</span>
                  <span className="text-indigo-600">{item.status}</span>
                </div>
                <div className="text-slate-500">Date: {item.date} at {item.time} ({item.type})</div>
              </div>
            ))}
          </div>
        )}

        {/* 8. REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Recruitment Reports &amp; Funnel Metrics</h2>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Application Funnel Breakdown</div>
                <div>Under Review: {applications.filter(a => a.status === 'UNDER_REVIEW').length}</div>
                <div>Interviewing: {applications.filter(a => a.status === 'INTERVIEWING').length}</div>
                <div>Offered: {hiredCount}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Top Candidate Skills</div>
                <div>Java &amp; Spring Boot: 85% of applicants</div>
                <div>React &amp; TypeScript: 70% of applicants</div>
              </div>
            </div>
          </div>
        )}

        {/* 9. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Recruiter System Notifications</h2>
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs space-y-1">
              <div className="font-bold">New Candidate Application Submitted</div>
              <div>John Doe applied for Senior Java Backend Engineer (92% ATS Match Score).</div>
            </div>
          </div>
        )}

        {/* 10. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Recruiter Portal Settings</h2>
            <div className="text-xs text-slate-600">Email Notification Preferences: Instant Alert on Application</div>
          </div>
        )}

      </main>

      {/* CANDIDATE RESUME VIEWER MODAL */}
      {selectedCandidateForResume && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCandidateForResume.candidate?.fullName || 'Candidate Resume'}
                </h3>
                <div className="text-xs text-slate-500">
                  Applied for {selectedCandidateForResume.job?.title} • {selectedCandidateForResume.matchScore}% ATS Score
                </div>
              </div>
              <button onClick={() => setSelectedCandidateForResume(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-900">Extracted Candidate Skills:</div>
                <div className="text-blue-800 font-medium">{selectedCandidateForResume.extractedSkills || 'Java, Spring Boot, React, SQL'}</div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-1">Education:</div>
                <div className="text-slate-700">{selectedCandidateForResume.extractedEducation || 'Bachelor of Science in Computer Science'}</div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-1">Raw Resume Text:</div>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 whitespace-pre-wrap">
                  {selectedCandidateForResume.resumeText || selectedCandidateForResume.resumeFileName}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCandidateForResume(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs"
              >
                Close Viewer
              </button>
              <button
                onClick={() => {
                  const candidate = selectedCandidateForResume;
                  setSelectedCandidateForResume(null);
                  setSelectedCandidateForInterview(candidate);
                  setIsSchedulerOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW SCHEDULER MODAL */}
      <InterviewSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        candidate={selectedCandidateForInterview}
        jobTitle={selectedCandidateForInterview?.job?.title}
        onScheduled={handleInterviewScheduled}
      />

      </div>
    </div>
  );
};
