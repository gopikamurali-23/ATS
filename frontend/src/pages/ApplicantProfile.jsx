import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { User, Phone, Briefcase, Plus, Trash2, Save, Loader, CheckCircle } from 'lucide-react';

const ApplicantProfile = () => {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    title: '',
    candidate_skills: [],
    candidate_education: [],
    candidate_experience: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add list item inputs
  const [newSkill, setNewSkill] = useState('');
  const [newEdu, setNewEdu] = useState('');
  const [newExp, setNewExp] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/applications/profile/candidate');
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch candidate profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const payload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      title: profile.title,
      skills: profile.candidate_skills.map(s => s.skill),
      education: profile.candidate_education.map(e => e.education_entry),
      experience: profile.candidate_experience.map(e => e.experience_entry)
    };

    try {
      await api.put('/api/applications/profile/candidate', payload);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError('Failed to save profile details.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (profile.candidate_skills.some(s => s.skill.toLowerCase() === newSkill.trim().toLowerCase())) return;
    setProfile(prev => ({
      ...prev,
      candidate_skills: [...prev.candidate_skills, { skill: newSkill.trim() }]
    }));
    setNewSkill('');
  };

  const removeSkill = (skillName) => {
    setProfile(prev => ({
      ...prev,
      candidate_skills: prev.candidate_skills.filter(s => s.skill !== skillName)
    }));
  };

  const addEdu = () => {
    if (!newEdu.trim()) return;
    if (profile.candidate_education.some(e => e.education_entry.toLowerCase() === newEdu.trim().toLowerCase())) return;
    setProfile(prev => ({
      ...prev,
      candidate_education: [...prev.candidate_education, { education_entry: newEdu.trim() }]
    }));
    setNewEdu('');
  };

  const removeEdu = (eduEntry) => {
    setProfile(prev => ({
      ...prev,
      candidate_education: prev.candidate_education.filter(e => e.education_entry !== eduEntry)
    }));
  };

  const addExp = () => {
    if (!newExp.trim()) return;
    if (profile.candidate_experience.some(e => e.experience_entry.toLowerCase() === newExp.trim().toLowerCase())) return;
    setProfile(prev => ({
      ...prev,
      candidate_experience: [...prev.candidate_experience, { experience_entry: newExp.trim() }]
    }));
    setNewExp('');
  };

  const removeExp = (expEntry) => {
    setProfile(prev => ({
      ...prev,
      candidate_experience: prev.candidate_experience.filter(e => e.experience_entry !== expEntry)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-10 w-10 text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage your professional bio, skills, and history for ATS matching.</p>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50 text-sm">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/50 text-sm">
          <Trash2 className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <User className="h-5 w-5 text-brand-500" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">First Name</label>
              <input
                type="text"
                required
                value={profile.first_name}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Last Name</label>
              <input
                type="text"
                required
                value={profile.last_name}
                onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Phone className="h-4 w-4" /></span>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="block w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Professional Title</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Briefcase className="h-4 w-4" /></span>
                <input
                  type="text"
                  value={profile.title || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                  className="block w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  placeholder="e.g. Full Stack Developer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Management */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            Skillsets
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add skill (e.g. React)"
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={addSkill}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.candidate_skills.map((s) => (
              <span
                key={s.skill}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 border border-brand-200/30"
              >
                {s.skill}
                <button
                  type="button"
                  onClick={() => removeSkill(s.skill)}
                  className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Education History */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Education History</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEdu}
              onChange={(e) => setNewEdu(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEdu())}
              placeholder="e.g. B.S. Computer Science - Stanford University"
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={addEdu}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2 pt-2">
            {profile.candidate_education.map((e) => (
              <div
                key={e.education_entry}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 rounded-xl text-sm"
              >
                <span>{e.education_entry}</span>
                <button
                  type="button"
                  onClick={() => removeEdu(e.education_entry)}
                  className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Experience History */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">Experience History</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newExp}
              onChange={(e) => setNewExp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addExp())}
              placeholder="e.g. Senior developer - Google Inc (3 Years)"
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
            />
            <button
              type="button"
              onClick={addExp}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl cursor-pointer"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2 pt-2">
            {profile.candidate_experience.map((e) => (
              <div
                key={e.experience_entry}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 rounded-xl text-sm"
              >
                <span>{e.experience_entry}</span>
                <button
                  type="button"
                  onClick={() => removeExp(e.experience_entry)}
                  className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>Save Bio Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicantProfile;
