import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Building2, Mail, Phone, MapPin, Send, ShieldCheck, 
  Sparkles, CheckCircle2, Clock, Globe, MessageSquare 
} from 'lucide-react';

export const ContactPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [inquiryType, setInquiryType] = useState('Enterprise Placement');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!workEmail.trim() || !workEmail.includes('@')) newErrors.workEmail = 'Valid Work Email is required.';
    if (!organization.trim()) newErrors.organization = 'Institution or Company name is required.';
    if (!message.trim()) newErrors.message = 'Please enter your message or inquiry details.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toastSuccess('Thank you! Your institutional inquiry has been received. Our team will contact you within 24 hours.');
      setFullName('');
      setWorkEmail('');
      setOrganization('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="space-y-10 pb-12 transition-colors">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 edge-glow-hover">
        <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Institutional Support &amp; Sales
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Enterprise HQ &amp; Global Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-2xl">
          Connect with TalentPulse enterprise solutions specialists. Inquire about corporate recruitment licenses, academic placement cell onboarding, or technical assistance.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Interactive Contact Form */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Send an Institutional Inquiry
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Complete the form below. All marked fields with <span className="text-rose-500 font-bold">*</span> are required.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Inquiry dispatched successfully! Our enterprise director will follow up via email.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Full Name <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/70 border rounded-2xl dark:text-white focus:outline-none focus:ring-2 ${
                    errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
                {errors.fullName && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Work Email Address <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <input
                  type="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="jane.smith@institution.edu"
                  className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/70 border rounded-2xl dark:text-white focus:outline-none focus:ring-2 ${
                    errors.workEmail ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
                {errors.workEmail && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.workEmail}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Organization / Institution Name <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Stanford University / Google Inc."
                  className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/70 border rounded-2xl dark:text-white focus:outline-none focus:ring-2 ${
                    errors.organization ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
                {errors.organization && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.organization}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Inquiry Topic <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Enterprise Placement">Academic Placement Cell Integration</option>
                  <option value="Recruiter Software License">Enterprise Recruiter Suite License</option>
                  <option value="Candidate Career Partnership">Candidate Career Partnership</option>
                  <option value="Technical Support">Technical &amp; Architecture Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Inquiry Details &amp; Message <span className="text-rose-500 font-bold ml-1">*</span>
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your organization's hiring volume, timeline, and requirements..."
                className={`w-full p-3 text-xs bg-slate-50 dark:bg-zinc-800/70 border rounded-2xl dark:text-white focus:outline-none focus:ring-2 ${
                  errors.message ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {errors.message && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="pill-btn px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Inquiry...' : 'Submit Institutional Message'}</span>
            </button>
          </form>
        </div>

        {/* Right Col: HQ Information & Security Compliance */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Enterprise Recruitment Towers
            </h3>
            
            <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">San Francisco HQ</div>
                  <div>450 Mission Street, Suite 2400, San Francisco, CA 94105</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Email Inquiries</div>
                  <div className="font-mono text-blue-600 dark:text-blue-400">support@talentpulse.io</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Enterprise Toll-Free</div>
                  <div>+1 (800) 555-PULSE (9am – 6pm PST)</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security &amp; Compliance Standards
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              All candidate resumes, personal identifiable information (PII), and recruitment communications are safeguarded according to enterprise data governance policies.
            </p>
            <div className="pt-2 space-y-1.5 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                ✓ SOC2 Type II Certified
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                ✓ ISO 27001 Information Security
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                ✓ GDPR &amp; CCPA Candidate Privacy Compliant
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
