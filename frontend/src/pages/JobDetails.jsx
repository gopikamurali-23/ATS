import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, DollarSign, Briefcase, FileText, Upload, AlertCircle, CheckCircle, ArrowLeft, Award, Sparkles, BrainCircuit } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Application variables
  const [file, setFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [applyMode, setApplyMode] = useState('file'); // 'file', 'url', or 'existing'
  const [uploading, setUploading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleApplyUrl = async (e) => {
    e.preventDefault();
    if (!resumeUrl) return;

    setUploading(true);
    setError('');

    try {
      const response = await api.post(`/api/applications/apply-url/${id}`, { url: resumeUrl });
      setAtsResult(response.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing resume from URL. Make sure it points directly to a PDF, DOC, or DOCX file.');
    } finally {
      setUploading(false);
    }
  };

  const handleApplyExisting = async (e) => {
    e.preventDefault();
    if (!candidate || !candidate.resume_url) return;

    setUploading(true);
    setError('');

    try {
      const response = await api.post(`/api/applications/apply-existing/${id}`);
      setAtsResult(response.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error applying with active resume. Make sure it is a valid format.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data);

        // Fetch candidate details to check if they have an active resume
        if (user && user.role === 'APPLICANT') {
          const profileResponse = await api.get('/api/applications/profile/candidate');
          setCandidate(profileResponse.data);
          // Default to existing if they have an active resume
          if (profileResponse.data?.resume_url) {
            setApplyMode('existing');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/api/applications/apply/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAtsResult(response.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading resume. Check file format.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-700 dark:text-slate-300">{error}</p>
        <Link to="/applicant/jobs" className="mt-4 inline-flex items-center gap-1 text-brand-600 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/applicant/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to job browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Job Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40">
            <span className="text-sm font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 px-3 py-1 rounded-full border border-brand-100 dark:border-brand-900/40">
              {job.companyName}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{job.title}</h1>
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {job.salaryRange}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.experienceRequiredYears} yrs experience required</span>
            </div>

            <div className="mt-6 border-t border-slate-200/50 dark:border-slate-800/30 pt-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">Role Description</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              {job.requirements && (
                <div>
                  <h3 className="font-bold text-slate-950 dark:text-white">Qualifications & Requirements</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Apply Area / ATS Result */}
        <div className="space-y-6">
          {!success ? (
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Apply for this Role</h2>
              <p className="text-sm text-slate-500 mt-1 mb-4">Provide your PDF or Word resume to match against criteria.</p>

              {user?.role === 'APPLICANT' ? (
                <div className="space-y-4">
                  {/* Select Mode Tabs */}
                  <div className="flex bg-slate-105 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-850">
                    {candidate?.resume_url && (
                      <button
                        type="button"
                        onClick={() => setApplyMode('existing')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          applyMode === 'existing'
                            ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        Active Profile
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setApplyMode('file')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        applyMode === 'file'
                          ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyMode('url')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        applyMode === 'url'
                          ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Import URL
                    </button>
                  </div>

                  {applyMode === 'existing' && candidate?.resume_url ? (
                    <form onSubmit={handleApplyExisting} className="space-y-4">
                      <div className="p-4 bg-slate-105/50 dark:bg-slate-950/40 border border-slate-200/30 rounded-2xl flex flex-col items-center text-center">
                        <FileText className="h-10 w-10 text-brand-500 mb-2" />
                        <span className="text-xs font-bold text-slate-705 dark:text-slate-300 break-all">
                          {candidate.resume_url.split(/[\\/]/).pop()}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 block uppercase tracking-wider font-semibold">
                          Active resume profile: {candidate.title || 'Job Seeker'}
                        </span>
                      </div>

                      {error && (
                        <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={uploading}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex justify-center items-center cursor-pointer"
                      >
                        {uploading ? 'Analyzing Active Resume...' : 'Apply with Active Resume'}
                      </button>
                    </form>
                  ) : applyMode === 'file' ? (
                    <form onSubmit={handleApply} className="space-y-4">
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-brand-500 dark:hover:border-brand-400 transition-colors relative">
                        <input
                          type="file"
                          id="resume-file"
                          accept=".pdf,.docx,.doc"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block truncate">
                          {file ? file.name : 'Choose PDF, DOC, or DOCX file'}
                        </span>
                        <span className="block text-xs text-slate-400 mt-1">Max file size 10MB</span>
                      </div>

                      {error && (
                        <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex justify-center items-center cursor-pointer"
                      >
                        {uploading ? 'Analyzing Resume...' : 'Apply & Run ATS Scan'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleApplyUrl} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="resume-url-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Resume Document URL
                        </label>
                        <input
                          type="url"
                          id="resume-url-input"
                          value={resumeUrl}
                          onChange={(e) => setResumeUrl(e.target.value)}
                          placeholder="https://example.com/my-resume.pdf"
                          className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
                          required
                        />
                        <span className="block text-[10px] text-slate-400">
                          Supports direct link to PDF, DOC, or DOCX.
                        </span>
                      </div>

                      {error && (
                        <div className="text-xs text-red-600 dark:text-red-405 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={!resumeUrl || uploading}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex justify-center items-center cursor-pointer"
                      >
                        {uploading ? 'Downloading & Scanning...' : 'Apply & Run ATS Scan'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400">
                  {user ? (
                    'Only registered candidates can submit applications.'
                  ) : (
                    <span>
                      Please <Link to="/applicant/login" className="text-brand-600 font-semibold">Log In</Link> as a candidate to apply.
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="glass p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-950/10 space-y-6 glow-effect">
              <div className="flex flex-col items-center text-center space-y-3.5">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full">
                  <CheckCircle className="h-10 w-10 shrink-0" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">Application Submitted!</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                  Thank you for applying. Your application was successfully submitted. We will review your profile and reach out if your background matches our requirements.
                </p>
              </div>

              <button
                onClick={() => navigate('/applicant/applications')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors mt-2 font-bold cursor-pointer"
              >
                Track Status inside Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
