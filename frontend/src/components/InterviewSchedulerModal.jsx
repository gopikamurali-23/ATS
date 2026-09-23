import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { Calendar, Clock, Video, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { interviewScheduleSchema, formatZodErrors } from '../schemas/validationSchemas';

export const InterviewSchedulerModal = ({ isOpen, onClose, candidate, jobTitle, onScheduled }) => {
  const [interviewDate, setInterviewDate] = useState('2026-09-20');
  const [interviewTime, setInterviewTime] = useState('11:00 AM');
  const [interviewType, setInterviewType] = useState('Technical Screening');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.google.com/tp-interview-room');
  const [notes, setNotes] = useState('First round technical evaluation covering Java Spring Boot, React, and system design.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const candidateName = candidate?.candidate?.fullName || candidate?.fullName || 'Candidate';
    const currentJobTitle = jobTitle || candidate?.job?.title || 'Engineer';

    const result = interviewScheduleSchema.safeParse({
      candidateName,
      jobTitle: currentJobTitle,
      date: interviewDate,
      time: interviewTime,
      type: interviewType,
      meetingUrl,
      notes
    });

    if (!result.success) {
      setErrors(formatZodErrors(result.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        if (onScheduled) {
          onScheduled({
            candidateName,
            candidateEmail: candidate?.candidate?.email || candidate?.email,
            jobTitle: currentJobTitle,
            date: interviewDate,
            time: interviewTime,
            type: interviewType,
            meetingUrl,
            notes
          });
        }
        setSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Candidate Interview"
      subtitle={`Set up an interview with ${candidate?.candidate?.fullName || candidate?.fullName || 'Candidate'}`}
      maxWidth="max-w-md"
    >
      {success ? (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">Interview Scheduled!</h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            An email notification with the meeting details has been dispatched to {candidate?.candidate?.email || candidate?.email}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {errors.form && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700/60 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">{candidate?.candidate?.fullName || candidate?.fullName || 'Candidate'}</div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Position: {jobTitle || candidate?.job?.title || 'Technical Position'}</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">ATS Match Score: {candidate?.matchScore || 92}%</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Interview Date <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className={`w-full px-3.5 py-2 border rounded-xl dark:bg-zinc-800 dark:text-white ${
                  errors.date ? 'border-rose-500' : 'border-slate-300 dark:border-zinc-700'
                }`}
              />
              {errors.date && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Interview Time <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                placeholder="e.g. 11:00 AM PST"
                className={`w-full px-3.5 py-2 border rounded-xl dark:bg-zinc-800 dark:text-white ${
                  errors.time ? 'border-rose-500' : 'border-slate-300 dark:border-zinc-700'
                }`}
              />
              {errors.time && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.time}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Interview Round / Format <span className="text-rose-500 font-bold ml-1">*</span>
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-xl"
            >
              <option value="Technical Screening">Technical Screening</option>
              <option value="System Design Round">System Design Round</option>
              <option value="HM Culture & Fit">HM Culture &amp; Fit</option>
              <option value="Final Executive Round">Final Executive Round</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Meeting Link (Google Meet / Teams) <span className="text-rose-500 font-bold ml-1">*</span>
            </label>
            <input
              type="text"
              required
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl dark:bg-zinc-800 dark:text-white ${
                errors.meetingUrl ? 'border-rose-500' : 'border-slate-300 dark:border-zinc-700'
              }`}
            />
            {errors.meetingUrl && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.meetingUrl}</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Notes for Candidate &amp; Interviewers <span className="text-rose-500 font-bold ml-1">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl dark:bg-zinc-800 dark:text-white ${
                errors.notes ? 'border-rose-500' : 'border-slate-300 dark:border-zinc-700'
              }`}
            />
            {errors.notes && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.notes}</p>}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="pill-btn px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-full font-semibold text-slate-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="pill-btn px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md"
            >
              {isSubmitting ? 'Scheduling...' : 'Send Interview Invite'}
            </button>
          </div>

        </form>
      )}
    </Modal>
  );
};
