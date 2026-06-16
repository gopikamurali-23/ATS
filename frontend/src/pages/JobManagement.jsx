import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Loader, AlertCircle, Trash2, Edit3, Plus, CheckCircle } from 'lucide-react';

const JobManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [experienceRequiredYears, setExperienceRequiredYears] = useState(0);
  const [educationRequired, setEducationRequired] = useState("Bachelor's");
  const [skillsRequired, setSkillsRequired] = useState('');
  const [keywords, setKeywords] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const fetchJobs = async () => {
    try {
      const response = await api.get(`/api/jobs/company/${user.profileId}`);
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch job vacancies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user.profileId]);

  const handleOpenCreate = () => {
    setEditingJob(null);
    setTitle('');
    setDescription('');
    setRequirements('');
    setLocation('');
    setSalaryRange('');
    setExperienceRequiredYears(0);
    setEducationRequired("Bachelor's");
    setSkillsRequired('');
    setKeywords('');
    setStatus('ACTIVE');
    setFormOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRequirements(job.requirements || '');
    setLocation(job.location || '');
    setSalaryRange(job.salaryRange || '');
    setExperienceRequiredYears(job.experienceRequiredYears);
    setEducationRequired(job.educationRequired || "Bachelor's");
    setSkillsRequired(job.skillsRequired ? job.skillsRequired.join(', ') : '');
    setKeywords(job.keywords ? job.keywords.join(', ') : '');
    setStatus(job.status);
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const formattedSkills = skillsRequired.split(',').map(s => s.trim()).filter(s => s !== '');
    const formattedKeywords = keywords.split(',').map(k => k.trim()).filter(k => k !== '');

    const payload = {
      title,
      description,
      requirements,
      location,
      salaryRange,
      experienceRequiredYears: parseInt(experienceRequiredYears),
      educationRequired,
      skillsRequired: formattedSkills,
      keywords: formattedKeywords,
      status,
    };

    try {
      if (editingJob) {
        await api.put(`/api/jobs/${editingJob.id}`, payload);
      } else {
        await api.post('/api/jobs', payload);
      }
      setFormOpen(false);
      fetchJobs();
    } catch (err) {
      setError('Failed to save job details. Please review fields.');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this vacancy posting?')) return;
    try {
      await api.delete(`/api/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      setError('Failed to delete job posting.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Manage Vacancies</h1>
          <p className="text-slate-500 text-sm mt-1">Create, update, or remove active job listings.</p>
        </div>
        {!formOpen && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create New Post
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {formOpen ? (
        <form onSubmit={handleSave} className="glass p-8 rounded-3xl border border-slate-200/50 bg-white/40 dark:bg-slate-900/40 space-y-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingJob ? 'Edit Vacancy Listing' : 'Post New Job Vacancy'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                placeholder="Senior Java Engineer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                placeholder="San Francisco, CA or Remote"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Salary Range</label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                placeholder="$120k - $150k"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Min. Experience (Years)</label>
              <input
                type="number"
                required
                value={experienceRequiredYears}
                onChange={(e) => setExperienceRequiredYears(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Required Education Level</label>
              <select
                value={educationRequired}
                onChange={(e) => setEducationRequired(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
              >
                <option value="Associate">Associate Degree</option>
                <option value="Bachelor's">Bachelor's Degree</option>
                <option value="Master's">Master's Degree</option>
                <option value="PhD">Ph.D. / Doctorate</option>
                <option value="Any">Any Level</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Skills Required (Comma separated)</label>
              <input
                type="text"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                placeholder="Java, Spring Boot, PostgreSQL, Docker"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">ATS Keywords to Rank (Comma separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                placeholder="REST API, Agile, Microservices, CI/CD"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Role Description</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                placeholder="Detail the responsibilities and scope of this job role..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Required Qualifications</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows="3"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                placeholder="Mention specific soft skills, licenses, or certification requirements..."
              />
            </div>

            {editingJob && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Listing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed / Filled</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200/50">
            <button
              type="submit"
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              {editingJob ? 'Save Modifications' : 'Publish Vacancy'}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : loading ? (
        <div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8 text-brand-500" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl p-8 border border-slate-200/50">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No Jobs Posted</h3>
          <p className="text-sm text-slate-500 mt-1">Publish your first job vacancy listing to start receiving candidate resumes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="glass p-6 rounded-3xl border border-slate-200/50 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{job.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    job.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20' : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                  }`}>{job.status}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{job.description}</p>
                <div className="flex gap-4 text-xs text-slate-400">
                  <span>Location: <strong>{job.location || 'Remote'}</strong></span>
                  <span>Required Exp: <strong>{job.experienceRequiredYears} yrs</strong></span>
                </div>
                {/* Applicant Count */}
                <div className="pt-2 flex items-center gap-1.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {job.applicantCount === 1 
                      ? "1 applicant for this job" 
                      : `${job.applicantCount || 0} applicants for this job`}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200/30">
                <button
                  onClick={() => handleOpenEdit(job)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-705 dark:bg-slate-800 dark:text-slate-300 transition-colors flex justify-center items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                
                {job.applicantCount > 0 && (
                  <button
                    onClick={() => navigate('/company/candidates', { state: { jobId: job.id } })}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-400 border border-brand-100/30 transition-all cursor-pointer flex justify-center items-center gap-1"
                  >
                    View Candidates
                  </button>
                )}

                <button
                  onClick={() => handleDelete(job.id)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobManagement;
