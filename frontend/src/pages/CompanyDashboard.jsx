import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  Loader, Users, FileText, CheckCircle, BarChart2, Award, 
  Briefcase, Eye, ShieldAlert, BrainCircuit, Sparkles, 
  TrendingUp, UserCheck, Calendar, Clock, Video, MapPin, 
  Check, X, AlertCircle
} from 'lucide-react';
import { openResumeUrl } from '../utils/documentHelper';

// Helper to draw a custom SVG Radar Chart
const RadarChart = ({ scores }) => {
  const keys = Object.keys(scores);
  const data = Object.values(scores);
  const size = 160;
  const center = size / 2;
  const radius = 55;
  const totalSides = keys.length;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / totalSides) * index - Math.PI / 2;
    const distance = (value / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  const outerPoints = Array.from({ length: totalSides }).map((_, i) => {
    const coord = getCoordinates(i, 100);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  const midPoints = Array.from({ length: totalSides }).map((_, i) => {
    const coord = getCoordinates(i, 50);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  const activePoints = keys.map((_, i) => {
    const coord = getCoordinates(i, data[i]);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/45 p-3 rounded-2xl border border-slate-200/20">
      <svg width={size} height={size} className="overflow-visible">
        <polygon points={outerPoints} fill="none" className="stroke-slate-250 dark:stroke-slate-800" strokeWidth="1" />
        <polygon points={midPoints} fill="none" className="stroke-slate-250 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="2" />
        {keys.map((_, i) => {
          const outer = getCoordinates(i, 100);
          return <line key={i} x1={center} y1={center} x2={outer.x} y2={outer.y} className="stroke-slate-250 dark:stroke-slate-800" strokeWidth="1" />;
        })}
        {keys.map((label, i) => {
          const coord = getCoordinates(i, 120);
          return (
            <text key={i} x={coord.x} y={coord.y} textAnchor="middle" alignmentBaseline="middle" className="fill-slate-400 dark:fill-slate-500 font-bold text-[8px] uppercase tracking-wider">
              {label}
            </text>
          );
        })}
        <polygon points={activePoints} fill="rgba(99, 102, 241, 0.15)" className="stroke-brand-500" strokeWidth="1.5" />
        {keys.map((_, i) => {
          const coord = getCoordinates(i, data[i]);
          return <circle key={i} cx={coord.x} cy={coord.y} r="2.5" className="fill-indigo-500 stroke-white dark:stroke-slate-900" strokeWidth="1" />;
        })}
      </svg>
    </div>
  );
};

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ type: '', text: '' });
  
  // Analytics
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    newApplications: 0,
    candidateMatches: 0,
  });

  // Scheduling state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleAppId, setScheduleAppId] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    interviewDate: '',
    interviewTime: '',
    interviewMode: 'ONLINE',
    meetingLink: '',
    officeAddress: '',
    interviewRound: 'Technical'
  });
  const [schedulingLoader, setSchedulingLoader] = useState(false);

  // Modal Detail
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const appResponse = await api.get('/api/applications/company');
      setApplications(appResponse.data);

      const jobResponse = await api.get(`/api/jobs/company/${user.profileId}`);
      const jobs = jobResponse.data;

      // Compute metrics
      const totalApplicants = appResponse.data.length;
      const totalJobs = jobs.length;
      const newApplications = appResponse.data.filter(a => a.status === 'APPLIED').length;
      const candidateMatches = appResponse.data.filter(a => a.finalAtsScore >= 75).length;

      setStats({ totalJobs, totalApplicants, newApplications, candidateMatches });
    } catch (err) {
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.profileId) {
      fetchDashboardData();
    }
  }, [user]);

  const triggerToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 5000);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.put(`/api/applications/${appId}/status?status=${newStatus}`);
      fetchDashboardData(); // Reload
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
      triggerToast('success', ` funnel status updated successfully.`);
    } catch (err) {
      triggerToast('error', 'Failed to update applicant status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setSchedulingLoader(true);
    try {
      const payload = {
        applicationId: scheduleAppId,
        ...scheduleData
      };
      await api.post('/api/interviews/schedule', payload);
      triggerToast('success', 'Interview round scheduled successfully.');
      setShowScheduleModal(false);
      
      // Reset form
      setScheduleData({
        interviewDate: '',
        interviewTime: '',
        interviewMode: 'ONLINE',
        meetingLink: '',
        officeAddress: '',
        interviewRound: 'Technical'
      });
      fetchDashboardData(); // reload status changes
    } catch (err) {
      triggerToast('error', err.response?.data?.message || 'Error scheduling interview round.');
    } finally {
      setSchedulingLoader(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/40';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/40';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/40';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Toast Alert */}
      {toast.text && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 backdrop-blur-md' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 backdrop-blur-md'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Company Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review candidate applications ranked by TalentPulse AI match scoring.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-10 w-10 text-brand-500" />
        </div>
      ) : (
        <>
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Posted Jobs</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.totalJobs}</strong>
              </div>
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-2xl"><Briefcase className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total Applicants</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.totalApplicants}</strong>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl"><Users className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">New Applications</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.newApplications}</strong>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl"><TrendingUp className="h-6 w-6" /></div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">High Matches (75%+)</span>
                <strong className="text-3xl font-black text-slate-900 dark:text-white mt-1 block">{stats.candidateMatches}</strong>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl"><UserCheck className="h-6 w-6" /></div>
            </div>
          </div>

          {/* SVG Professional Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 shadow-sm animate-fade-in">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-6">
                <BarChart2 className="h-5 w-5 text-brand-500" /> Candidate Score Distributions
              </h3>
              <div className="relative h-60 w-full flex items-end justify-between px-6 pt-4 border-b border-l border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <div className="w-12 bg-rose-500/80 rounded-t-lg transition-all duration-500 animate-slide-up" style={{ height: `${applications.length ? applications.filter(a=>a.finalAtsScore<50).length/applications.length*100 : 0}%`, minHeight: '10px' }}></div>
                  <span className="text-[10px] text-slate-500 font-bold">Low (&lt;50)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <div className="w-12 bg-amber-500/80 rounded-t-lg transition-all duration-500 animate-slide-up" style={{ height: `${applications.length ? applications.filter(a=>a.finalAtsScore>=50 && a.finalAtsScore<75).length/applications.length*100 : 0}%`, minHeight: '10px' }}></div>
                  <span className="text-[10px] text-slate-500 font-bold">Mid (50-74)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-1/3">
                  <div className="w-12 bg-emerald-500/80 rounded-t-lg transition-all duration-500 animate-slide-up" style={{ height: `${applications.length ? applications.filter(a=>a.finalAtsScore>=75).length/applications.length*100 : 0}%`, minHeight: '10px' }}></div>
                  <span className="text-[10px] text-slate-500 font-bold">High (75+)</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" /> Recruitment Funnel Progress
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
                        <div className="bg-brand-650 dark:bg-brand-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Applicants Table</h3>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/20 px-3 py-1 rounded-full">Score Rank Pipeline</span>
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
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-white/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        <div>
                          <span>{app.candidateName}</span>
                          <span className="block text-[10px] text-slate-400 font-medium">{app.candidateTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-605 dark:text-slate-400 font-medium">{app.jobTitle}</td>
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
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-slate-200/50 dark:border-slate-800/40 animate-slide-in">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/30 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">ATS Score</span>
                  <strong className="text-3xl font-black text-indigo-650 dark:text-indigo-400 block mt-1">{selectedApp.finalAtsScore}%</strong>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/30 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Interview Success</span>
                  <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                    {selectedApp.interviewSuccessProbability ?? 72}%
                  </strong>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/30 text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Hiring Suitability</span>
                  <strong className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">
                    {selectedApp.hiringSuccessProbability ?? 78}%
                  </strong>
                </div>
              </div>

              {selectedApp.resumeUrl && (
                <div>
                  <button
                    onClick={() => openResumeUrl(selectedApp.resumeUrl)}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold rounded-xl border border-slate-200/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer shadow-sm"
                  >
                    <FileText className="h-4 w-4 text-brand-500" /> View Candidate Resume
                  </button>
                </div>
              )}

              {/* Sub-score grid and radar map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <RadarChart 
                  scores={{
                    Skills: selectedApp.skillMatchScore,
                    Experience: selectedApp.experienceMatchScore,
                    Education: selectedApp.educationMatchScore,
                    Projects: selectedApp.projectMatchScore ?? 75,
                    Keywords: selectedApp.keywordMatchScore,
                    Communication: selectedApp.communicationMatchScore ?? 80
                  }}
                />

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs"><BarChart2 className="h-4 w-4" /> Match Breakdown</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Technical Skills:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedApp.skillMatchScore}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Experience Level:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedApp.experienceMatchScore}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Education Level:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedApp.educationMatchScore}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Project Relevance:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedApp.projectMatchScore ?? 75}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Keyword Density:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedApp.keywordMatchScore}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Communication Index:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{selectedApp.communicationMatchScore ?? 80}%</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill by Skill Matches */}
              {selectedApp.skillBySkillScores && Object.keys(selectedApp.skillBySkillScores).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skill-by-Skill Scores Breakdown</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(selectedApp.skillBySkillScores).map(([skillName, scoreVal], idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-brand-50/50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-md border border-brand-100/10">
                        {skillName}: {scoreVal}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Scores Match */}
              {selectedApp.projectScoresBreakdown && Object.keys(selectedApp.projectScoresBreakdown).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Relevance Breakdowns</span>
                  <div className="space-y-1.5">
                    {Object.entries(selectedApp.projectScoresBreakdown).map(([projTitle, scoreVal], idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-200/15">
                        <span className="text-slate-600 dark:text-slate-350 truncate pr-4">{projTitle}</span>
                        <strong className="text-brand-500 shrink-0 font-extrabold">{scoreVal}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedApp.strengths && selectedApp.strengths.length > 0 && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-emerald-500 block">Candidate Strengths</span>
                    <ul className="list-disc pl-4 text-[11px] text-slate-650 dark:text-slate-300 space-y-1">
                      {selectedApp.strengths.map((str, i) => <li key={i}>{str}</li>)}
                    </ul>
                  </div>
                )}
                {selectedApp.weaknesses && selectedApp.weaknesses.length > 0 && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-rose-500 block">Identified Gaps</span>
                    <ul className="list-disc pl-4 text-[11px] text-slate-650 dark:text-slate-300 space-y-1">
                      {selectedApp.weaknesses.map((weak, i) => <li key={i}>{weak}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* AI summaries */}
              <div className="space-y-4 text-xs leading-relaxed">
                {selectedApp.missingKeywords && selectedApp.missingKeywords.length > 0 && (
                  <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-amber-500"><ShieldAlert className="h-4 w-4" /> Missing Key Terms</h4>
                    <p className="mt-1 text-slate-600 dark:text-slate-400 font-semibold">{selectedApp.missingKeywords.join(', ')}</p>
                  </div>
                )}

                <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-brand-500" /> AI Candidate Summary</h4>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/30">{selectedApp.candidateSummary}</p>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><BrainCircuit className="h-4 w-4 text-emerald-500" /> Recruiter Fit Analysis</h4>
                  <p className="mt-1 text-slate-600 dark:text-slate-400 bg-emerald-50/10 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-500/20 italic font-semibold">{selectedApp.interviewRecommendation}</p>
                </div>
              </div>

            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200/50 dark:border-slate-800/30 mt-6">
              <button
                onClick={() => {
                  setScheduleAppId(selectedApp.id);
                  setShowScheduleModal(true);
                }}
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white cursor-pointer shadow-sm text-center font-bold"
              >
                Schedule Round
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedApp.id, 'SHORTLISTED')}
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
              >
                Shortlist Candidate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl animate-fade-in">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="h-5 w-5 text-brand-500" /> Schedule Interview Slot
                </h3>
                <p className="text-xs text-slate-500 mt-1">Set date and time parameters for candidate screening round.</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleInterview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduleData.interviewDate}
                    onChange={(e) => setScheduleData({ ...scheduleData, interviewDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Time</label>
                  <input
                    type="text"
                    value={scheduleData.interviewTime}
                    onChange={(e) => setScheduleData({ ...scheduleData, interviewTime: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Interview Round</label>
                  <select
                    value={scheduleData.interviewRound}
                    onChange={(e) => setScheduleData({ ...scheduleData, interviewRound: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs cursor-pointer"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="System Design">System Design</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mode</label>
                  <select
                    value={scheduleData.interviewMode}
                    onChange={(e) => setScheduleData({ ...scheduleData, interviewMode: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs cursor-pointer"
                  >
                    <option value="ONLINE">Online (Virtual)</option>
                    <option value="OFFLINE">Offline (In-Person)</option>
                  </select>
                </div>
              </div>

              {scheduleData.interviewMode === 'ONLINE' ? (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Meeting Invite Link</label>
                  <input
                    type="url"
                    value={scheduleData.meetingLink}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                    required={scheduleData.interviewMode === 'ONLINE'}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Office / Venue Address</label>
                  <textarea
                    rows={2}
                    value={scheduleData.officeAddress}
                    onChange={(e) => setScheduleData({ ...scheduleData, officeAddress: e.target.value })}
                    placeholder="Block C, Zoho Estuary campus, Chennai..."
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
                    required={scheduleData.interviewMode === 'OFFLINE'}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={schedulingLoader}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  {schedulingLoader ? <Loader className="animate-spin h-3.5 w-3.5" /> : 'Confirm Interview'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CompanyDashboard;
