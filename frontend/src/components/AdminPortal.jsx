import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './common/Badge';
import { Modal } from './common/Modal';
import { EmptyState } from './common/EmptyState';
import { 
  ShieldCheck, LayoutDashboard, Users, Building2, Briefcase, 
  BarChart3, Activity, Terminal, Settings, UserX, UserCheck, 
  Trash2, RefreshCw, CheckCircle2, AlertTriangle, Shield
} from 'lucide-react';

export const AdminPortal = () => {
  const { user } = useAuth();
  
  // Active Admin Sidebar Tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'companies', 'jobs', 'analytics', 'health', 'logs', 'settings'

  // System Audit Logs Mock State
  const [systemLogs, setSystemLogs] = useState([
    { id: 101, action: 'User Authenticated', user: 'john_doe (Candidate)', time: '2 mins ago', status: 'SUCCESS', ip: '192.168.1.45' },
    { id: 102, action: 'Resume AI Parse Executed', user: 'john_doe (Candidate)', time: '5 mins ago', status: 'SUCCESS', ip: '192.168.1.45' },
    { id: 103, action: 'Job Requisition Published', user: 'google (Recruiter)', time: '12 mins ago', status: 'SUCCESS', ip: '10.0.0.12' },
    { id: 104, action: 'Application Status Updated', user: 'google (Recruiter)', time: '18 mins ago', status: 'SUCCESS', ip: '10.0.0.12' },
    { id: 105, action: 'New Candidate Registered', user: 'alex_m (Candidate)', time: '45 mins ago', status: 'SUCCESS', ip: '172.16.0.4' }
  ]);

  // System Users Mock State
  const [usersList, setUsersList] = useState([
    { id: 1, username: 'john_doe', fullName: 'John Doe', email: 'john@example.com', role: 'ROLE_CANDIDATE', status: 'ACTIVE', registeredDate: '2026-08-01' },
    { id: 2, username: 'google', fullName: 'Google Recruiter', email: 'recruiter@google.com', role: 'ROLE_COMPANY', status: 'ACTIVE', registeredDate: '2026-07-15' },
    { id: 3, username: 'admin', fullName: 'Platform Admin', email: 'admin@talentpulse.io', role: 'ROLE_ADMIN', status: 'ACTIVE', registeredDate: '2026-01-01' },
    { id: 4, username: 'sarah_j', fullName: 'Sarah Jenkins', email: 'sarah@acme.com', role: 'ROLE_COMPANY', status: 'ACTIVE', registeredDate: '2026-08-20' },
    { id: 5, username: 'alex_m', fullName: 'Alex Morgan', email: 'alex@example.com', role: 'ROLE_CANDIDATE', status: 'ACTIVE', registeredDate: '2026-09-02' }
  ]);

  // Data States
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const jobList = await api.getJobs();
    setJobs(jobList);
    const apps = await api.getCompanyApplications();
    setApplications(apps);
  };

  const toggleUserStatus = (userId) => {
    setUsersList(usersList.map(u => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  const deleteUser = (userId) => {
    if (confirm("Are you sure you want to remove this user from TalentPulse?")) {
      setUsersList(usersList.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* ADMIN SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-4 space-y-6 flex-shrink-0">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Platform Administration</div>
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Super Admin'}</div>
              <div className="text-[10px] text-emerald-400 font-semibold uppercase">System Administrator</div>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="space-y-1 text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'users', label: 'Manage Users', icon: Users, badge: usersList.length },
            { id: 'companies', label: 'Manage Companies', icon: Building2 },
            { id: 'jobs', label: 'Manage Jobs', icon: Briefcase, badge: jobs.length },
            { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
            { id: 'health', label: 'System Health', icon: Activity },
            { id: 'logs', label: 'System Audit Logs', icon: Terminal, badge: systemLogs.length },
            { id: 'settings', label: 'Admin Settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-emerald-800' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ADMIN MAIN CONTENT PANEL */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-slate-50 space-y-6">

        {/* 1. ADMIN DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">System Dashboard &amp; Operational Health</h1>
                <p className="text-xs text-slate-500 mt-1">Supervise user registrations, ATS parse performance, and server status.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Operational (100% Uptime)
              </div>
            </div>

            {/* Metrics Counter Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Users</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{usersList.length}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Companies</div>
                <div className="text-2xl font-black text-indigo-600 mt-1">14</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requisitions</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{jobs.length}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications Submitted</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{applications.length}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Status</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">Healthy</div>
              </div>
            </div>

            {/* Platform Analytics Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Funnel breakdown */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Candidate Application Funnel</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1"><span>Applied</span><span>100%</span></div>
                    <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-blue-600 h-full rounded-full w-full"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1"><span>Under HR Review</span><span>65%</span></div>
                    <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-purple-600 h-full rounded-full w-[65%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1"><span>Shortlisted</span><span>35%</span></div>
                    <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-emerald-600 h-full rounded-full w-[35%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1"><span>Interview Scheduled</span><span>18%</span></div>
                    <div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-amber-600 h-full rounded-full w-[18%]"></div></div>
                  </div>
                </div>
              </div>

              {/* System Audit logs snapshot */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Audit Trail</h3>
                  <button onClick={() => setActiveTab('logs')} className="text-xs font-semibold text-emerald-700 hover:underline">
                    View Logs →
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {systemLogs.slice(0, 4).map(log => (
                    <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{log.action}</div>
                        <div className="text-[11px] text-slate-500">{log.user} • {log.ip}</div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. MANAGE USERS PAGE */}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Registered Users Management ({usersList.length})</h2>
              <button onClick={() => alert("Add User Modal")} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold">
                + Add User
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id}>
                      <td className="font-mono text-slate-500">#{u.id}</td>
                      <td className="font-bold text-slate-900">{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ROLE_CANDIDATE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          u.role === 'ROLE_COMPANY' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="text-slate-500">{u.registeredDate}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold"
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. MANAGE COMPANIES PAGE */}
        {activeTab === 'companies' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Registered Companies & Employer Accounts</h2>
                <p className="text-xs text-slate-500">Monitor partner organizations and corporate accounts posting job requisitions.</p>
              </div>
              <button onClick={() => alert("Add Company Modal")} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold">
                + Add Company
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Contact Email</th>
                    <th>Active Jobs</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 1, name: 'Google', industry: 'Software & Technology', email: 'careers@google.com', jobs: 3, status: 'VERIFIED' },
                    { id: 2, name: 'Microsoft', industry: 'Cloud & Enterprise', email: 'recruitment@microsoft.com', jobs: 2, status: 'VERIFIED' },
                    { id: 3, name: 'Acme Technologies', industry: 'Fintech', email: 'hr@acme-corp.com', jobs: 1, status: 'PENDING' },
                    { id: 4, name: 'Stripe', industry: 'Payment Infrastructure', email: 'jobs@stripe.com', jobs: 4, status: 'VERIFIED' }
                  ].map(comp => (
                    <tr key={comp.id}>
                      <td className="font-bold text-slate-900">{comp.name}</td>
                      <td className="text-slate-600">{comp.industry}</td>
                      <td className="text-slate-600">{comp.email}</td>
                      <td className="font-semibold text-blue-600">{comp.jobs} Open Roles</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {comp.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => alert(`View ${comp.name}`)} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            View Profile
                          </button>
                          <button onClick={() => alert(`Toggle ${comp.name}`)} className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                            {comp.status === 'VERIFIED' ? 'Suspend' : 'Verify'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. MANAGE JOBS PAGE */}
        {activeTab === 'jobs' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">All Platform Job Requisitions ({jobs.length})</h2>
                <p className="text-xs text-slate-500">Supervise active, draft, and closed job postings across all employer accounts.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Salary Range</th>
                    <th>Posted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td className="font-bold text-slate-900">{j.title}</td>
                      <td className="text-slate-700">{j.companyName}</td>
                      <td className="text-slate-600">{j.location}</td>
                      <td><span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">{j.employmentType}</span></td>
                      <td className="font-semibold text-emerald-700">{j.salaryRange}</td>
                      <td className="text-slate-500">{new Date(j.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => alert("Flag job posting")} className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. PLATFORM ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">Platform-Wide Recruitment Analytics</h2>
              <p className="text-xs text-slate-500 mb-6">Aggregated performance indicators, top matching technical skills, and candidate conversion stats.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-700">Top In-Demand Skills</div>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex justify-between font-medium"><span>Java &amp; Spring Boot</span><span className="font-bold text-slate-900">32%</span></li>
                    <li className="flex justify-between font-medium"><span>React &amp; TypeScript</span><span className="font-bold text-slate-900">28%</span></li>
                    <li className="flex justify-between font-medium"><span>PostgreSQL &amp; SQL</span><span className="font-bold text-slate-900">22%</span></li>
                    <li className="flex justify-between font-medium"><span>Docker &amp; Kubernetes</span><span className="font-bold text-slate-900">18%</span></li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-700">Average ATS Match Score</div>
                  <div className="text-3xl font-black text-blue-600">86.5 / 100</div>
                  <p className="text-[11px] text-slate-500">Calculated across 48 automated resume parsing executions.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-700">Recruiter Selection Rate</div>
                  <div className="text-3xl font-black text-emerald-600">14.2%</div>
                  <p className="text-[11px] text-slate-500">Shortlisted candidates moving to technical interview stage.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. SYSTEM HEALTH */}
        {activeTab === 'health' && (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Platform &amp; Client Engine Health Monitor</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Real-time status of client-side ATS intelligence services, persistent storage, and worker threads.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="text-emerald-800 dark:text-emerald-300 font-bold">TalentPulse Client Engine</div>
                <div className="text-lg font-black text-emerald-900 dark:text-emerald-100">CLIENT ARCH - ONLINE</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Latency: 0ms • High Resiliency</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <div className="text-emerald-800 dark:text-emerald-300 font-bold">Resume Parser Engine</div>
                <div className="text-lg font-black text-emerald-900 dark:text-emerald-100">ACTIVE</div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">ATS Keyword Matcher Ready</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-1">
                <div className="text-slate-700 dark:text-zinc-300 font-bold">State &amp; Local Persistence</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">HEALTHY</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">localStorage sync operational</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-1">
                <div className="text-slate-700 dark:text-zinc-300 font-bold">Role-Based Auth Guard</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">OPERATIONAL</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">Session JWT simulation active</div>
              </div>
            </div>
          </div>
        )}

        {/* 7. SYSTEM AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">System Audit Trail ({systemLogs.length})</h2>
                <p className="text-xs text-slate-500">Chronological security and action logs for audit compliance.</p>
              </div>
              <button onClick={() => alert("Logs exported to CSV")} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded text-xs font-semibold">
                Export Audit Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Action</th>
                    <th>User Context</th>
                    <th>IP Address</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {systemLogs.map(log => (
                    <tr key={log.id}>
                      <td className="font-mono text-slate-400">#{log.id}</td>
                      <td className="font-bold text-slate-900">{log.action}</td>
                      <td className="text-slate-700">{log.user}</td>
                      <td className="font-mono text-slate-500">{log.ip}</td>
                      <td className="text-slate-500">{log.time}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. ADMIN SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 max-w-xl">
            <h2 className="text-base font-bold text-slate-900">System Administration Preferences</h2>
            <div className="space-y-4 text-xs">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600" />
                <span>Require corporate work email for recruiter registration</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600" />
                <span>Automatically run Resume AI parser on candidate file submission</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-emerald-600" />
                <span>Enable detailed system audit logging</span>
              </label>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Minimum ATS Match Score Threshold for Shortlisting</label>
                <input type="number" defaultValue={75} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
              </div>

              <div className="pt-2">
                <button onClick={() => alert("Settings saved!")} className="px-5 py-2 bg-emerald-600 text-white font-semibold rounded text-xs">
                  Save Admin Settings
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

