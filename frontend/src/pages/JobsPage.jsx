import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../hooks/useJobs';
import { useApplications } from '../hooks/useApplications';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import { JobCardSkeleton } from '../components/common/Skeleton';
import { applyJobSchema } from '../schemas/validationSchemas';
import { 
  Search, MapPin, DollarSign, Clock, Briefcase, Sparkles, 
  CheckCircle2, X, Send, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, Lock
} from 'lucide-react';

export const JobsPage = ({ onOpenAuthModal }) => {
  const { user } = useAuth();
  const { jobs, loading: jobsLoading } = useJobs();
  const { applyToJob } = useApplications(false);
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Debounced search query
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedLocation = useDebounce(locationFilter, 300);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  // Apply Modal state
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [applyResumeText, setApplyResumeText] = useState('');
  const [applyError, setApplyError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !debouncedSearch || 
      job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      job.companyName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      job.requiredSkills.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesLocation = !debouncedLocation ||
      job.location.toLowerCase().includes(debouncedLocation.toLowerCase());

    const matchesType = !typeFilter || job.employmentType === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const handleApplyClick = (job) => {
    if (!user) {
      toastWarning("Please log in or sign up as a candidate to apply for positions.");
      onOpenAuthModal('login');
      return;
    }
    if (user.role !== 'ROLE_CANDIDATE') {
      toastWarning("Only candidate accounts can submit job applications. Please sign in with a candidate account.");
      return;
    }
    setSelectedJobForApply(job);
    setApplyResumeText('');
    setApplyError('');
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    const result = applyJobSchema.safeParse({ resumeText: applyResumeText });
    if (!result.success) {
      setApplyError(result.error.errors[0]?.message || 'Please enter valid resume text.');
      return;
    }

    setIsApplying(true);
    setApplyError('');
    try {
      await applyToJob({
        jobId: selectedJobForApply.id,
        resumeText: applyResumeText,
        resumeFileName: `${user.username || 'Candidate'}_Application_Resume.txt`
      });
      toastSuccess(`Application submitted successfully to ${selectedJobForApply.companyName}!`);
      setSelectedJobForApply(null);
      setApplyResumeText('');
    } catch (err) {
      setApplyError(err.message || 'Application submission failed.');
      toastError(err.message || 'Application submission failed.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 transition-colors">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 edge-glow-hover">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Verified Requisitions Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Talent Pool &amp; Open Positions
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Browse verified openings from top enterprise employers. Filter by skills, locations, and salary.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{filteredJobs.length} Active Positions</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by title, skill, or company..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
              placeholder="Filter by city, state, or Remote..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="">All Employment Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {jobsLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ) : paginatedJobs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Matching Openings Found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Try adjusting your search query, location filter, or employment type.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setLocationFilter(''); setTypeFilter(''); }}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-full shadow-sm hover:bg-blue-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {paginatedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 edge-glow-hover"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {job.companyName}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {job.title}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[11px]">
                    {job.employmentType}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Metadata Pills */}
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{job.salaryRange}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{job.requiredExperienceYears}+ Years Experience</span>
                  </div>
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.split(',').slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                  {job.requiredSkills.split(',').length > 4 && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] font-bold">
                      +{job.requiredSkills.split(',').length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleApplyClick(job)}
                  className="pill-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-40 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 px-3">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 disabled:opacity-40 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1-Click Application Submission Modal */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                  Applying to {selectedJobForApply.companyName}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedJobForApply.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJobForApply(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Resume Summary / Raw Text Submission <span className="text-rose-500 font-bold ml-1">*</span>
                </label>
                <textarea
                  rows={6}
                  value={applyResumeText}
                  onChange={(e) => setApplyResumeText(e.target.value)}
                  placeholder="Paste your professional resume, core technical skills, and experience details here..."
                  className={`w-full p-3 text-xs border rounded-2xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 font-mono ${
                    applyError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
                {applyError && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{applyError}</p>}
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                  Our client ATS engine parses skills and matches against requisition criteria instantly.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedJobForApply(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isApplying ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
