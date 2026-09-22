import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { ResumeBuilder } from './ResumeBuilder';
import { AtsScoreAnalyzer } from './AtsScoreAnalyzer';
import { 
  LayoutDashboard, User, FileText, FileSearch, Sparkles, Search, 
  Bookmark, CheckSquare, Calendar, Bell, Settings, LogOut, Briefcase, 
  MapPin, DollarSign, Clock, ArrowRight, CheckCircle2, AlertCircle, X, Send, ArrowLeft
} from 'lucide-react';

export const CandidatePortal = ({ onBackToHome }) => {
  const { user, logout } = useAuth();

  // Active tab inside Applicant Portal
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data States
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([2]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [applyResumeText, setApplyResumeText] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState('');

  // Sample Interviews data
  const [interviews, setInterviews] = useState([
    {
      id: 1,
      company: 'Google',
      jobTitle: 'Senior Java Backend Engineer',
      date: '2026-09-18',
      time: '10:30 AM PST',
      interviewer: 'Sarah Jenkins (Senior Technical Recruiter)',
      link: 'https://meet.google.com/abc-defg-hij',
      status: 'SCHEDULED'
    }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const fetchedJobs = await api.getJobs();
      setJobs(fetchedJobs || []);
      const fetchedApps = await api.getMyApplications();
      setMyApplications(fetchedApps || []);
    } catch (e) {
      console.warn("Failed to load portal data", e);
    }
  };

  const handleToggleSaveJob = (jobId) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter(id => id !== jobId));
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobForApply) return;

    setIsApplying(true);
    try {
      const formData = new FormData();
      formData.append('jobId', selectedJobForApply.id);
      formData.append('resumeText', applyResumeText || 'Experienced Software Engineer with Java, React, SQL');

      await api.applyToJob(formData);
      setApplySuccessMessage(`Successfully applied for ${selectedJobForApply.title} at ${selectedJobForApply.companyName}!`);
      
      setTimeout(() => {
        setApplySuccessMessage('');
        setSelectedJobForApply(null);
        setApplyResumeText('');
        loadData();
        setActiveTab('applications');
      }, 1500);
    } catch (err) {
      alert("Failed to submit application: " + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const loc = locationFilter.toLowerCase();
    const titleMatch = j.title.toLowerCase().includes(q) || j.requiredSkills.toLowerCase().includes(q);
    const locMatch = !loc || j.location.toLowerCase().includes(loc);
    return titleMatch && locMatch;
  });

  const savedJobsList = jobs.filter(j => savedJobIds.includes(j.id));

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
          Applicant Workspace • <span className="capitalize text-blue-600 dark:text-blue-400 font-bold">{activeTab.replace('-', ' ')}</span>
        </div>
      </div>

      <div className="min-h-[700px] flex flex-col md:flex-row gap-6">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-6 flex-shrink-0">
          
          {/* User Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-1">
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Candidate Portal</div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{user?.fullName || user?.username || 'Candidate'}</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{user?.email}</div>
          </div>

          {/* Sidebar Nav List */}
          <nav className="space-y-1.5 text-xs font-semibold">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <User className="w-4 h-4" /> My Profile
            </button>

            <button
              onClick={() => setActiveTab('builder')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'builder'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-4 h-4" /> Resume Builder
            </button>

            <button
              onClick={() => setActiveTab('analyzer')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FileSearch className="w-4 h-4" /> ATS Score Checker
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'jobs'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Search className="w-4 h-4" /> Find Jobs
            </button>

            <button
              onClick={() => setActiveTab('saved-jobs')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'saved-jobs'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bookmark className="w-4 h-4" /> Saved Jobs ({savedJobIds.length})
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <CheckSquare className="w-4 h-4" /> My Applications
            </button>

            <button
              onClick={() => setActiveTab('interviews')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'interviews'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Calendar className="w-4 h-4" /> Interviews ({interviews.length})
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full px-3.5 py-2.5 rounded-full flex items-center gap-2.5 transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Settings className="w-4 h-4" /> Account Settings
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

        {/* RIGHT MAIN CONTENT DISPLAY */}
        <main className="flex-1 space-y-6">
          
          {/* 1. APPLICANT DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Welcome Header */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-center justify-between edge-glow-hover">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Welcome back, {user?.fullName || 'Candidate'}!
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Track your active job applications, ATS resume score, and upcoming interviews.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('jobs')}
                  className="pill-btn px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all hidden sm:block"
                >
                  Browse Active Jobs
                </button>
              </div>

              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-1 edge-glow-hover">
                  <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-zinc-500">Total Applications</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{myApplications.length}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active Submissions</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-1 edge-glow-hover">
                  <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-zinc-500">Average ATS Score</div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">88/100</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">Top 10% Match Rate</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-1 edge-glow-hover">
                  <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-zinc-500">Interviews Scheduled</div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{interviews.length}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Next: Sept 18</div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-1 edge-glow-hover">
                  <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-zinc-500">Saved Positions</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{savedJobIds.length}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">Ready to apply</div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* ATS Quick Action Card */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3 edge-glow-hover">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <FileSearch className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Optimize Resume ATS Score
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Upload your latest resume to check keyword matches against open job requisitions.
                  </p>
                  <button
                    onClick={() => setActiveTab('analyzer')}
                    className="pill-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    Open ATS Analyzer <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Resume Builder Action Card */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3 edge-glow-hover">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Build Professional Resume
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Create and reorder resume sections online. Download ATS-compliant text format.
                  </p>
                  <button
                    onClick={() => setActiveTab('builder')}
                    className="pill-btn px-4 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    Open Resume Builder <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Recent Applications Preview */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 edge-glow-hover">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Recent Applications</h3>
                  <button onClick={() => setActiveTab('applications')} className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    View All ({myApplications.length})
                  </button>
                </div>

                <div className="space-y-2.5">
                  {myApplications.map((app) => (
                    <div key={app.id} className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl flex items-center justify-between gap-4 text-xs">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{app.job?.title || 'Senior Software Engineer'}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{app.job?.companyName || 'Google'} • Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
                          {app.matchScore || 90}% ATS Match
                        </span>
                        <span className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                          app.status === 'OFFERED' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                          app.status === 'INTERVIEWING' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' :
                          'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 2. MY PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6 edge-glow-hover">
              <div className="border-b border-slate-100 dark:border-zinc-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Candidate Profile</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Manage your contact details, bio, and key skills.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.fullName || 'John Doe'}
                    className="w-full px-3.5 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    defaultValue={user?.email || 'john.doe@example.com'}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 text-slate-500 dark:text-zinc-400 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    defaultValue={user?.phone || '+1 (555) 019-2831'}
                    className="w-full px-3.5 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Location</label>
                  <input
                    type="text"
                    defaultValue="San Francisco, CA"
                    className="w-full px-3.5 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  defaultValue="Senior Software Engineer with 6+ years experience in Java Spring Boot, React, and cloud microservices."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-xl"
                />
              </div>

              <button
                onClick={() => alert("Profile updated successfully!")}
                className="pill-btn px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
              >
                Save Profile Changes
              </button>
            </div>
          )}

          {/* 3. RESUME BUILDER TAB */}
          {activeTab === 'builder' && <ResumeBuilder onBack={() => setActiveTab('dashboard')} />}

          {/* 4. ATS SCORE CHECKER TAB */}
          {activeTab === 'analyzer' && <AtsScoreAnalyzer availableJobs={jobs} onBack={() => setActiveTab('dashboard')} />}

          {/* 5. FIND JOBS TAB */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              
              {/* Search Controls */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search job title, skills (e.g. Java, React, Docker)..."
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="w-full sm:w-48 relative">
                  <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Location (e.g. Remote)..."
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Job Listings Grid */}
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3 edge-glow-hover">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{job.title}</h3>
                        <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">{job.companyName} • {job.location} ({job.employmentType})</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSaveJob(job.id)}
                          className={`p-2 rounded-full border text-xs transition-colors ${
                            savedJobIds.includes(job.id)
                              ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-bold'
                              : 'border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedJobForApply(job)}
                          className="pill-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{job.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.split(',').map((skill, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full text-[11px] text-slate-700 dark:text-zinc-300 font-medium">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-white">{job.salaryRange}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 6. SAVED JOBS TAB */}
          {activeTab === 'saved-jobs' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Saved Jobs ({savedJobsList.length})</h2>
              {savedJobsList.map((job) => (
                <div key={job.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-2 edge-glow-hover">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{job.title}</h3>
                      <div className="text-xs text-slate-500 dark:text-zinc-400">{job.companyName} • {job.location}</div>
                    </div>
                    <button
                      onClick={() => setSelectedJobForApply(job)}
                      className="pill-btn px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 7. MY APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 edge-glow-hover">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Job Applications ({myApplications.length})</h2>
              
              <div className="space-y-3">
                {myApplications.map((app) => (
                  <div key={app.id} className="p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{app.job?.title || 'Backend Engineer'}</div>
                      <div className="text-xs text-slate-500 dark:text-zinc-400">{app.job?.companyName || 'Google'} • Applied on {new Date(app.appliedAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-600 dark:text-zinc-300">Extracted Skills: {app.extractedSkills}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs">
                        {app.matchScore || 92}% ATS Score
                      </span>
                      <span className="px-3 py-1 rounded-full font-bold text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. INTERVIEWS TAB */}
          {activeTab === 'interviews' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 edge-glow-hover">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Scheduled Candidate Interviews</h2>
              
              {interviews.map((item) => (
                <div key={item.id} className="p-5 border border-slate-200 dark:border-zinc-700/60 rounded-2xl space-y-3 bg-slate-50 dark:bg-zinc-800/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.jobTitle}</h3>
                      <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">{item.company}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs">
                      {item.status}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-zinc-300">
                    <div><strong>Date &amp; Time:</strong> {item.date} at {item.time}</div>
                    <div><strong>Interviewer:</strong> {item.interviewer}</div>
                  </div>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Join Google Meet Interview <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* 9. NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 edge-glow-hover">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Notifications</h2>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 rounded-2xl text-xs space-y-1">
                <div className="font-bold">Google Recruiter scheduled an interview</div>
                <div>Interview for Senior Java Backend Engineer scheduled for Sept 18 at 10:30 AM PST.</div>
              </div>
            </div>
          )}

          {/* 10. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 edge-glow-hover">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Settings</h2>
              <div className="text-xs text-slate-600 dark:text-zinc-400">Email Notifications: Enabled</div>
              <div className="text-xs text-slate-600 dark:text-zinc-400">ATS Auto-Match Alerts: Enabled</div>
            </div>
          )}

        </main>

        {/* JOB APPLY MODAL */}
        {selectedJobForApply && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Apply for {selectedJobForApply.title}</h3>
                  <div className="text-xs text-slate-500 dark:text-zinc-400">{selectedJobForApply.companyName} • {selectedJobForApply.location}</div>
                </div>
                <button onClick={() => setSelectedJobForApply(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {applySuccessMessage ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{applySuccessMessage}</span>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Attach Saved / Custom Resume Text for ATS Matching
                    </label>
                    <textarea
                      rows={6}
                      value={applyResumeText}
                      onChange={(e) => setApplyResumeText(e.target.value)}
                      placeholder="Paste or edit your resume text for ATS match scoring..."
                      className="w-full px-3.5 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedJobForApply(null)}
                      className="pill-btn px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="pill-btn px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center gap-1.5"
                    >
                      {isApplying ? 'Submitting Application...' : 'Submit Application'} <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
