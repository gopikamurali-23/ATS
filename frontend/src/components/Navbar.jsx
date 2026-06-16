import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Briefcase, User as UserIcon, Bell } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/api/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifications();

    const token = localStorage.getItem('token');
    const sseUrl = `http://localhost:8081/api/notifications/stream?token=${token}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        
        // Add to state
        setNotifications(prev => [newNotif, ...prev]);
        
        // Show Toast
        setToast(newNotif.text);
        const timer = setTimeout(() => {
          setToast(null);
        }, 5000);

        // Dispatch custom event for ChatSystem, CandidateDashboard, etc.
        const customEvent = new CustomEvent('realtime-notification', { detail: newNotif });
        window.dispatchEvent(customEvent);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error, reconnecting...', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    if (user && user.role === 'COMPANY') {
      navigate('/company/login');
    } else {
      navigate('/applicant/login');
    }
  };

  const getHomeLink = () => {
    if (!user) return '/';
    if (user.role === 'APPLICANT') return '/applicant/dashboard';
    if (user.role === 'COMPANY') return '/company/dashboard';
    if (user.role === 'ROLE_ADMIN') return '/admin';
    return '/';
  };

  const guestLinks = [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-md">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-600 dark:bg-brand-500 p-2 rounded-xl text-white shadow-md shadow-brand-500/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <Link to={getHomeLink()} className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-indigo-400">
            TalentPulse
          </Link>
        </div>

        {!user && (
          <div className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200/50 dark:border-slate-800/50">
            {guestLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 transform hover:scale-[1.03] active:scale-95 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                      : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50/50 dark:text-slate-350 dark:hover:text-brand-400 dark:hover:bg-slate-850/40'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Real-time Notifications Bell */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300 transition-colors relative cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 max-h-[350px] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800/40 pb-2">
                    <span className="text-xs font-bold text-slate-905 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-350 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-850 max-h-[250px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 font-medium">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && markAsRead(n.id)}
                          className={`py-3 flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/20 px-1.5 rounded-lg transition-colors ${
                            !n.is_read ? 'bg-brand-50/10 dark:bg-brand-950/5' : ''
                          }`}
                        >
                          <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-brand-500' : 'bg-transparent'}`}></div>
                          <div className="flex-1 space-y-1">
                            <p className={`text-xs leading-relaxed text-slate-700 dark:text-slate-350 ${!n.is_read ? 'font-bold' : 'font-medium'}`}>
                              {n.text}
                            </p>
                            <span className="text-[9px] text-slate-400 block font-semibold">
                              {new Date(n.created_at || n.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/60 py-1.5 px-3.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                <UserIcon className="h-4 w-4 text-brand-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {user.username} ({user.role === 'APPLICANT' ? 'Applicant' : user.role === 'COMPANY' ? 'Recruiter' : 'Admin'})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold">
              <Link to="/applicant/login" className="text-slate-600 hover:text-brand-600 dark:text-slate-350 dark:hover:text-brand-400 transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:bg-brand-50/50 dark:hover:bg-slate-850/40 px-3 py-1.5 rounded-xl">
                Applicant Login
              </Link>
              <Link to="/company/login" className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-all shadow-sm duration-200 transform hover:scale-[1.03] active:scale-95">
                Recruiter Portal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm glass bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-800/40 p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-slide-in">
          <div className="p-1.5 bg-brand-600 rounded-xl"><Bell className="h-5 w-5 text-white animate-pulse" /></div>
          <div className="space-y-1 flex-1">
            <span className="text-xs font-extrabold tracking-wide text-brand-400 block uppercase">New Notification</span>
            <p className="text-xs font-semibold text-slate-200 leading-normal">{toast}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white font-bold text-xs">✕</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
