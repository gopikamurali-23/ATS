import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { 
  Loader, Users, FileText, CheckCircle, BarChart2, Eye, 
  ShieldAlert, BrainCircuit, Sparkles, Search, Calendar, 
  Clock, Video, MapPin, Check, Plus, AlertCircle, 
  TrendingUp, Award, Zap, HelpCircle, Columns
} from 'lucide-react';
import { openResumeUrl } from '../utils/documentHelper';

// Helper to draw a custom SVG Radar Chart
const RadarChart = ({ scores }) => {
  // scores is an object like { Skills: 80, Experience: 75, Education: 90, Projects: 85, Keywords: 70, Communication: 85 }
  const keys = Object.keys(scores);
  const data = Object.values(scores);
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const totalSides = keys.length;

  // Compute vertices for regular polygon
  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / totalSides) * index - Math.PI / 2;
    const distance = (value / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  // Outer polygon points
  const outerPoints = Array.from({ length: totalSides }).map((_, i) => {
    const coord = getCoordinates(i, 100);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  // Mid polygon points (50%)
  const midPoints = Array.from({ length: totalSides }).map((_, i) => {
    const coord = getCoordinates(i, 50);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  // Active data points path
  const activePoints = keys.map((_, i) => {
    const coord = getCoordinates(i, data[i]);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/40 p-4 rounded-3xl border border-slate-200/20">
      <svg width={size} height={size} className="overflow-visible">
        {/* Outer Grid polygon */}
        <polygon points={outerPoints} fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />
        <polygon points={midPoints} fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" strokeDasharray="3" />
        
        {/* Core axes */}
        {keys.map((_, i) => {
          const outer = getCoordinates(i, 100);
          return (
            <line 
              key={i} 
              x1={center} y1={center} x2={outer.x} y2={outer.y} 
              className="stroke-slate-200 dark:stroke-slate-800" 
              strokeWidth="1" 
            />
          );
        })}

        {/* Labels */}
        {keys.map((label, i) => {
          const coord = getCoordinates(i, 115);
          return (
            <text 
              key={i} 
              x={coord.x} y={coord.y} 
              textAnchor="middle" 
              alignmentBaseline="middle" 
              className="fill-slate-400 dark:fill-slate-500 font-bold text-[9px] uppercase tracking-wider"
            >
              {label}
            </text>
          );
        })}

        {/* Active data area */}
        <polygon points={activePoints} fill="rgba(99, 102, 241, 0.2)" className="stroke-brand-500" strokeWidth="2" />
        
        {/* Dots */}
        {keys.map((_, i) => {
          const coord = getCoordinates(i, data[i]);
          return (
            <circle 
              key={i} 
              cx={coord.x} cy={coord.y} r="3.5" 
              className="fill-indigo-500 stroke-white dark:stroke-slate-900" 
              strokeWidth="1" 
            />
          );
        })}
      </svg>
    </div>
  );
};

const CompanyCandidates = () => {
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ type: '', text: '' });
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Compare mode states
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Scheduling states
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

  const fetchCandidatesData = async () => {
    try {
      const appResponse = await api.get('/api/applications/company');
      setApplications(appResponse.data);

      const jobResponse = await api.get('/api/jobs');
      setJobs(jobResponse.data);
    } catch (err) {
      setError('Failed to fetch candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatesData();
  }, []);

  useEffect(() => {
    if (location.state && location.state.jobId) {
      setSelectedJobId(location.state.jobId.toString());
    }
  }, [location.state]);

  const triggerToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: '', text: '' }), 5000);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await api.put(`/api/applications/${appId}/status?status=${newStatus}`);
      fetchCandidatesData(); // Reload
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
      triggerToast('success', `Candidate application funnel step updated to ${newStatus}.`);
    } catch (err) {
      triggerToast('error', 'Failed to update candidate status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit Schedule Form
  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setSchedulingLoader(true);
    try {
      const payload = {
        applicationId: scheduleAppId,
        ...scheduleData
      };
      await api.post('/api/interviews/schedule', payload);
      triggerToast('success', 'Interview round scheduled successfully. Candidate has been notified.');
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
      fetchCandidatesData(); // reload status changes
    } catch (err) {
      triggerToast('error', err.response?.data?.message || 'Error scheduling interview round.');
    } finally {
      setSchedulingLoader(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-250/20';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-250/20';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-250/20';
  };

  const handleSelectCompare = (app) => {
    const isSelected = selectedForCompare.some((item) => item.id === app.id);
    if (isSelected) {
      setSelectedForCompare(selectedForCompare.filter((item) => item.id !== app.id));
    } else {
      if (selectedForCompare.length >= 3) {
        triggerToast('error', 'You can compare a maximum of 3 candidates simultaneously.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, app]);
    }
  };

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const matchesSearch = app.candidateName.toLowerCase().includes(search.toLowerCase()) || 
                          app.candidateTitle.toLowerCase().includes(search.toLowerCase());
    const matchesJob = selectedJobId === '' || app.jobId === BigInt(selectedJobId);
    const matchesStatus = selectedStatus === '' || app.status === selectedStatus;
    return matchesSearch && matchesJob && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-10 w-10 text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Candidates Screening Pipeline</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Review, sort, search, and manage candidate workflows by matching scorecards.</p>
        </div>

        {selectedForCompare.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="px-4.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10 flex items-center gap-1.5 cursor-pointer animate-pulse"
          >
            <Columns className="h-4 w-4" /> Compare Selected ({selectedForCompare.length}/3)
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 shadow-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"><Search className="h-4 w-4" /></span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates by name or title..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm animate-fade-in"
          />
        </div>

        <div>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm cursor-pointer"
          >
            <option value="">All Job Positions</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 overflow-hidden shadow-sm">
        {filteredApps.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No Candidates Found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 font-semibold border-b border-slate-200/30">
                <tr>
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4 text-center">ATS Match</th>
                  <th className="px-6 py-4">Date Applied</th>
                  <th className="px-6 py-4">Funnel Step</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/20">
                {filteredApps.map((app) => {
                  const isChecked = selectedForCompare.some((item) => item.id === app.id);
                  return (
                    <tr key={app.id} className="hover:bg-white/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectCompare(app)}
                          className="h-4 w-4 rounded border-slate-350 dark:border-slate-800 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </td>
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
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setScheduleAppId(app.id);
                            setShowScheduleModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-500/10 hover:bg-brand-500/25 border border-brand-500/30 text-brand-500 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5" /> Schedule
                        </button>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Overall ATS Score</span>
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
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      {selectedApp.strengths.map((str, i) => <li key={i}>{str}</li>)}
                    </ul>
                  </div>
                )}
                {selectedApp.weaknesses && selectedApp.weaknesses.length > 0 && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-rose-500 block">Identified Gaps</span>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
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
                className="flex-1 py-3 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm text-center"
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

      {/* Candidate Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh] shadow-2xl animate-fade-in space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Columns className="h-6 w-6 text-brand-500 animate-pulse" /> Side-by-Side Candidate Matrix
                </h3>
                <p className="text-xs text-slate-500">Comparing matching core metrics and probabilities for selected shortlist applicants.</p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {selectedForCompare.map((app) => (
                <div key={app.id} className="p-5 border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 rounded-3xl space-y-5 relative">
                  <button 
                    onClick={() => handleSelectCompare(app)}
                    className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-2.5 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                  
                  <div>
                    <h4 className="text-base font-extrabold text-slate-950 dark:text-white">{app.candidateName}</h4>
                    <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">{app.candidateTitle}</span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-brand-500/5 rounded-2xl border border-brand-500/10">
                    <span className="text-xs font-bold text-slate-400">ATS Matching Score</span>
                    <strong className="text-2xl font-black text-indigo-500">{app.finalAtsScore}%</strong>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200/10 pb-1.5">
                      <span className="text-slate-550">Technical Skills</span>
                      <strong className="text-slate-800 dark:text-slate-200">{app.skillMatchScore}%</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/10 pb-1.5">
                      <span className="text-slate-550">Experience Alignment</span>
                      <strong className="text-slate-800 dark:text-slate-200">{app.experienceMatchScore}%</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/10 pb-1.5">
                      <span className="text-slate-550">Education Rank</span>
                      <strong className="text-slate-800 dark:text-slate-200">{app.educationMatchScore}%</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/10 pb-1.5">
                      <span className="text-slate-550">Project Relevance</span>
                      <strong className="text-slate-800 dark:text-slate-200">{app.projectMatchScore ?? 75}%</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/10 pb-1.5">
                      <span className="text-slate-550">Interview Probability</span>
                      <strong className="text-emerald-500">{app.interviewSuccessProbability ?? 72}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550">Hiring Probability</span>
                      <strong className="text-blue-500">{app.hiringSuccessProbability ?? 78}%</strong>
                    </div>
                  </div>

                  {app.strengths && app.strengths.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Key Strengths</span>
                      <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                        {app.strengths.slice(0, 2).join('. ')}.
                      </p>
                    </div>
                  )}

                  {app.weaknesses && app.weaknesses.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Key Gaps</span>
                      <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
                        {app.weaknesses.slice(0, 2).join('. ')}.
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setScheduleAppId(app.id);
                        setShowScheduleModal(true);
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => openResumeUrl(app.resumeUrl)}
                      className="p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      title="View Resume"
                    >
                      Resume
                    </button>
                  </div>

                </div>
              ))}
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

export default CompanyCandidates;
