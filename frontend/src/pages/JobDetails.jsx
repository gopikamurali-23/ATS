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
  const [uploading, setUploading] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

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
        <Link to="/jobs" className="mt-4 inline-flex items-center gap-1 text-brand-600 font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-600 mb-6 transition-colors">
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
              <p className="text-sm text-slate-500 mt-1">Upload your PDF or Word resume to match against criteria.</p>

              {user?.role === 'ROLE_CANDIDATE' ? (
                <form onSubmit={handleApply} className="mt-6 space-y-4">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-brand-500 dark:hover:border-brand-400 transition-colors relative">
                    <input
                      type="file"
                      id="resume-file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {file ? file.name : 'Choose PDF or DOCX file'}
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
                <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400">
                  {user ? (
                    'Only registered candidates can submit applications.'
                  ) : (
                    <span>
                      Please <Link to="/login" className="text-brand-600 font-semibold">Log In</Link> as a candidate to apply.
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            // ATS instant feedback card
            <div className="glass p-6 rounded-3xl border border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-950/10 space-y-6 glow-effect">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white">Application Submitted!</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">ATS Real-time Feedback</p>
                </div>
              </div>

              {/* ATS Gauge Score */}
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/30 text-center relative overflow-hidden">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATS Match Score</span>
                <div className="text-5xl font-black text-brand-600 dark:text-brand-400 my-2">
                  {atsResult.finalAtsScore}%
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {atsResult.finalAtsScore >= 75 ? '🔥 Excellent Alignment!' : atsResult.finalAtsScore >= 50 ? '⚡ Strong Match Profile' : '⚠️ Moderate Match Profile'}
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-indigo-500" /> Score Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl">
                      <span className="text-slate-400 block">Skills</span>
                      <strong className="text-slate-700 dark:text-slate-300 text-sm">{atsResult.skillMatchScore}%</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl">
                      <span className="text-slate-400 block">Experience</span>
                      <strong className="text-slate-700 dark:text-slate-300 text-sm">{atsResult.experienceMatchScore}%</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl">
                      <span className="text-slate-400 block">Education</span>
                      <strong className="text-slate-700 dark:text-slate-300 text-sm">{atsResult.educationMatchScore}%</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl">
                      <span className="text-slate-400 block">Keywords</span>
                      <strong className="text-slate-700 dark:text-slate-300 text-sm">{atsResult.keywordMatchScore}%</strong>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="h-4 w-4 text-brand-500" /> AI Candidate Summary
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/40 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-200/20">
                    {atsResult.candidateSummary}
                  </p>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800/30 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                    <BrainCircuit className="h-4 w-4 text-emerald-500" /> Interview Recommendation
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold italic p-3 rounded-xl bg-indigo-50/10 border border-indigo-500/20">
                    {atsResult.interviewRecommendation}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/candidate')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors mt-2"
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
