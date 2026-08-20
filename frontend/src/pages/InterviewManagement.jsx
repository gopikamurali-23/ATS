import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Calendar, Clock, Video, MapPin, Check, X,
  RefreshCw, ExternalLink, Sparkles, Loader, AlertCircle,
  HelpCircle, ChevronRight, Award, MessageSquare
} from 'lucide-react';

const InterviewManagement = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reschedule modal states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/interviews/candidate');
      setInterviews(res.data || []);
    } catch (err) {
      setError('Failed to load interviews. Please check server connections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleUpdateStatus = async (id, status, reason = '') => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.put(`/api/interviews/${id}/action`, {
        status,
        rescheduleReason: reason
      });
      setSuccessMsg(`Successfully updated interview status to ${status.replace('_', ' ')}.`);
      setShowRescheduleModal(false);
      setRescheduleReason('');
      fetchInterviews(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update interview request.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-250/20';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-250/20';
      case 'RESCHEDULE_REQUESTED':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-250/20';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-250/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader className="animate-spin h-10 w-10 text-brand-500" />
        <p className="text-slate-500 text-sm font-semibold">Loading your interview schedule...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Toast Alert */}
      {(successMsg || error) && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl transition-all duration-300 ${successMsg
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 backdrop-blur-md'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 backdrop-blur-md'
          }`}>
          {successMsg ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-semibold">{successMsg || error}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Scheduled Interviews</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Review and respond to scheduled interview requests from recruiter dashboards. Launch custom AI mock evaluations for pending rounds instantly.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="glass p-12 text-center border border-dashed border-slate-350 dark:border-slate-800 rounded-3xl space-y-4 max-w-xl mx-auto">
          <Calendar className="h-12 w-12 text-slate-450 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No interviews scheduled yet</h3>
          <p className="text-xs text-slate-500">
            Recruiters will display interview schedules here once your application matches their target qualifications. Keep updates on active roles!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((item) => {
            const app = item.applications;
            const job = app?.jobs;
            const company = job?.companies;

            return (
              <div
                key={item.id.toString()}
                className="glass border border-slate-200/50 dark:border-slate-800/55 bg-white/40 dark:bg-slate-900/40 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all space-y-6"
              >
                {/* Header detail */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider bg-brand-50 dark:bg-brand-950/45 px-2.5 py-1 rounded-md">
                      {item.interview_round} Round
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mt-2">
                      {job?.title || 'Engineering Role'}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-450">
                      {company?.name || 'Recruiting Partner'}
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Meet specifics */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-200/25">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Calendar className="h-4 w-4 text-brand-500 shrink-0" />
                    <span>{new Date(item.interview_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Clock className="h-4 w-4 text-brand-500 shrink-0" />
                    <span>{item.interview_time}</span>
                  </div>

                  {item.interview_mode === 'ONLINE' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Video className="h-4 w-4 text-brand-500 shrink-0" />
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Virtual / Online Meeting</span>
                      </div>
                      {item.meeting_link && item.status === 'ACCEPTED' && (
                        <a
                          href={item.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-brand-500 hover:underline font-bold"
                        >
                          Join Meeting Link <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <MapPin className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">In-Person / Office Address</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">{item.office_address || 'Address provided post confirmation'}</span>
                      </div>
                    </div>
                  )}

                  {item.reschedule_reason && (
                    <div className="pt-2.5 border-t border-slate-200/20 text-[10px] text-slate-450 italic">
                      Reschedule request: "{item.reschedule_reason}"
                    </div>
                  )}
                </div>

                {/* Candidate Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200/10">
                  {item.status === 'SCHEDULED' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'ACCEPTED')}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5" /> Accept Slot
                      </button>

                      <button
                        onClick={() => {
                          setSelectedInterviewId(item.id);
                          setShowRescheduleModal(true);
                        }}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                        disabled={actionLoading}
                        className="py-2.5 px-3 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500/5 transition-all cursor-pointer"
                        title="Decline round"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}

                  {item.status === 'ACCEPTED' && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <button
                        onClick={() => navigate('/applicant/interview-prep', {
                          state: {
                            jobTitle: job?.title,
                            skills: job?.job_skills?.map(s => s.skill).join(', '),
                            companyName: company?.name
                          }
                        })}
                        className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-700 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-brand-500/10"
                      >
                        <Sparkles className="h-4 w-4" /> Prep Portal
                      </button>
                      <button
                        onClick={() => navigate('/applicant/messages', {
                          state: {
                            companyUserId: company?.user_id ? Number(company.user_id) : null,
                            recipientName: company?.name
                          }
                        })}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <MessageSquare className="h-4 w-4" /> Message
                      </button>
                    </div>
                  )}

                  {(item.status === 'REJECTED' || item.status === 'RESCHEDULE_REQUESTED') && (
                    <span className="text-xs text-slate-400 italic text-center w-full py-1">
                      Awaiting recruiter update or slot revision.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Request Rescheduling</h3>
              <p className="text-xs text-slate-500 mt-1">Please provide details regarding your preferred slots or why you are requesting a change.</p>
            </div>

            <textarea
              rows={3}
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              placeholder="e.g. I am unavailable on June 12th afternoon. Would prefer any weekday slot between 10 AM and 1 PM..."
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleReason('');
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedInterviewId, 'RESCHEDULE_REQUESTED', rescheduleReason)}
                disabled={!rescheduleReason.trim() || actionLoading}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InterviewManagement;
