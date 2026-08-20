import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  BarChart2,
  User,
  LogOut,
  Settings,
  Sparkles,
  Calendar,
  BookOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    if (user.role === 'COMPANY') {
      navigate('/company/login');
    } else {
      navigate('/applicant/login');
    }
  };

  const getNavItems = () => {
    if (user.role === 'APPLICANT') {
      return [
        { name: 'Dashboard', path: '/applicant/dashboard', icon: LayoutDashboard },
        { name: 'Search Jobs', path: '/applicant/jobs', icon: Search },
        { name: 'My Resume', path: '/applicant/resume', icon: FileText },
        { name: 'Build Resume with AI', path: '/applicant/resume-builder', icon: Sparkles },
        { name: 'Scheduled Interviews', path: '/applicant/interviews', icon: Calendar },
        { name: 'AI Interview Prep', path: '/applicant/interview-prep', icon: BookOpen },
        { name: 'Applications', path: '/applicant/applications', icon: Briefcase },
        { name: 'Profile Settings', path: '/applicant/profile', icon: User },
      ];
    } else if (user.role === 'COMPANY') {
      return [
        { name: 'Dashboard', path: '/company/dashboard', icon: LayoutDashboard },
        { name: 'Job Posts', path: '/company/jobs', icon: Briefcase },
        { name: 'Candidates', path: '/company/candidates', icon: FileText },
        { name: 'Analytics', path: '/company/analytics', icon: BarChart2 },
        { name: 'Company Profile', path: '/company/profile', icon: User },
      ];
    } else if (user.role === 'ROLE_ADMIN') {
      return [
        { name: 'Control Panel', path: '/admin', icon: Settings },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-col justify-between h-[calc(100vh-73px)] sticky top-[73px]">
      <div className="p-4 space-y-2">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
