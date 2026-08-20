import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, DollarSign, Briefcase, ChevronRight, AlertCircle, Loader } from 'lucide-react';

const JobBrowse = () => {
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = async (query = '') => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (query.trim()) {
        response = await api.get(`/api/jobs/search?query=${encodeURIComponent(query)}`);
      } else {
        response = await api.get('/api/jobs');
      }
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch job vacancies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(searchQuery);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-500 bg-clip-text text-transparent dark:from-brand-400 dark:via-indigo-400 dark:to-violet-400">
          Discover Your Next Opportunity
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-lg">
          Browse through open roles analyzed and ranked with TalentPulse AI scoring.
        </p>

        <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by job title, description, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-semibold transition-all shadow-md cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200/50">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader className="animate-spin h-10 w-10 text-brand-500" />
          <p className="mt-4 text-slate-500 text-sm">Searching open roles...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/40">
          <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Jobs Found</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
            We couldn't find any vacancies matching your criteria. Try searching other keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300 shadow-sm hover-lift flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2.5 flex-1">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 border border-brand-100 dark:border-brand-900/40 mb-1">
                    {job.companyName}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {job.location || 'Remote'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> {job.salaryRange || 'Not specified'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" /> {job.experienceRequiredYears} yrs min.
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skillsRequired && job.skillsRequired.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skillsRequired && job.skillsRequired.length > 5 && (
                    <span className="px-2.5 py-1 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                      +{job.skillsRequired.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  to={`/applicant/jobs/${job.id}`}
                  className="flex items-center gap-1 py-2.5 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm shadow-brand-500/10 transition-colors"
                >
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobBrowse;
