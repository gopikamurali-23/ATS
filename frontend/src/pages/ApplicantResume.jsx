import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Sparkles, Eye } from 'lucide-react';
import { openResumeUrl } from '../utils/documentHelper';

const ApplicantResume = () => {
  const [candidate, setCandidate] = useState(null);
  const [file, setFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/applications/profile/candidate');
      setCandidate(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/applications/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMsg(response.data.message);
      setFile(null);
      fetchProfile(); // reload candidate details
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading resume. Check file format.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async (e) => {
    e.preventDefault();
    if (!resumeUrl) return;

    setUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.post('/api/applications/resume-url', { url: resumeUrl });
      setSuccessMsg(response.data.message);
      setResumeUrl('');
      fetchProfile(); // reload candidate details
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing resume from URL. Ensure it points directly to a PDF, DOC, or DOCX file.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-10 w-10 text-brand-500" />
      </div>
    );
  }

  const resumeFilename = candidate?.resume_url ? candidate.resume_url.split(/[\\/]/).pop() : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Resume</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Upload and manage your active resume. Changing your resume updates your analyzed skillsets and professional title instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Active Resume Status */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Active Document</h3>
            
            {candidate?.resume_url ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-950/40 border border-slate-200/30 rounded-2xl flex flex-col items-center text-center">
                  <FileText className="h-12 w-12 text-brand-500 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 break-all max-w-full">
                    {resumeFilename}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    {candidate.title || 'Job Seeker'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const action = openResumeUrl(candidate.resume_url);
                    if (action.type === 'download') {
                      setSuccessMsg('Active resume downloaded successfully! Word files (.doc/.docx) download directly in local environments.');
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors cursor-pointer shadow-sm"
                >
                  View Active Resume
                </button>

                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors cursor-pointer shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5 text-brand-500" /> Preview Extracted Profile
                </button>
              </div>
            ) : (
              <div className="p-6 bg-slate-100 dark:bg-slate-950/40 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center py-10">
                <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No active resume has been uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Widget */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Add Resume Document</h3>
              
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    uploadMode === 'file'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    uploadMode === 'url'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Import URL
                </button>
              </div>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50 text-sm">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/50 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {uploadMode === 'file' ? (
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-8 text-center hover:border-brand-500 dark:hover:border-brand-400 transition-colors relative">
                  <input
                    type="file"
                    id="resume-file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                    {file ? file.name : 'Choose PDF, DOC, or DOCX file'}
                  </span>
                  <span className="block text-xs text-slate-400 mt-1">Max file size 10MB</span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader className="animate-spin h-4 w-4" />
                        <span>Parsing & Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Upload & Scan Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUrlUpload} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="resume-url" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Document Web URL
                  </label>
                  <input
                    type="url"
                    id="resume-url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://example.com/my-resume.docx"
                    className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                    required
                  />
                  <span className="block text-[10px] text-slate-400">
                    Enter the direct URL link to a PDF, DOC, or DOCX resume document.
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!resumeUrl || uploading}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader className="animate-spin h-4 w-4" />
                        <span>Downloading & Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Load & Scan Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Extracted Profile Preview Modal */}
      {showPreviewModal && candidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 overflow-hidden flex flex-col justify-between max-h-[85vh] shadow-2xl animate-fade-in">
            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Extracted Profile Data</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Parsed from active resume document</p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/30">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assessed Role Title</span>
                  <strong className="text-slate-800 dark:text-slate-200 text-base font-bold mt-1 block">{candidate.title || 'Professional'}</strong>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Identified Skills ({candidate.candidate_skills?.length || 0})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.candidate_skills && candidate.candidate_skills.length > 0 ? (
                      candidate.candidate_skills.map((s, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 dark:text-brand-400 px-2.5 py-1 rounded-full border border-brand-100/30">
                          {s.skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No skills extracted.</span>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Education & Academic History</span>
                  <div className="space-y-2">
                    {candidate.candidate_education && candidate.candidate_education.length > 0 ? (
                      candidate.candidate_education.map((e, idx) => (
                        <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/20 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                          {e.education_entry}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No education items extracted.</span>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Experience & Work History</span>
                  <div className="space-y-2">
                    {candidate.candidate_experience && candidate.candidate_experience.length > 0 ? (
                      candidate.candidate_experience.map((exp, idx) => (
                        <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/20 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                          {exp.experience_entry}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No experience items extracted.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/30 mt-4 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantResume;
