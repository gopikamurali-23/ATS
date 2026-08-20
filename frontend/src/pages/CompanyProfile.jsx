import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Building, Globe, Briefcase, MapPin, Save, Loader, CheckCircle, Trash2 } from 'lucide-react';

const CompanyProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/applications/profile/company');
        setProfile(response.data);
      } catch (err) {
        setError('Failed to fetch company profile.');
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
      name: profile.name,
      industry: profile.industry,
      location: profile.location,
      website: profile.website,
      description: profile.description
    };

    try {
      await api.put('/api/applications/profile/company', payload);
      setMessage('Company profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError('Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-10 w-10 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Company Profile Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage your company listing page, website, description, and workspace metadata.</p>
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

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 space-y-6">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-500" /> Company details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Company Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Industry</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Briefcase className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  value={profile.industry || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                  className="block w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Location</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><MapPin className="h-4 w-4" /></span>
                <input
                  type="text"
                  required
                  value={profile.location || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="block w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Website URL</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Globe className="h-4 w-4" /></span>
                <input
                  type="url"
                  required
                  value={profile.website || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                  className="block w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                  placeholder="https://acme.com"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</label>
              <textarea
                value={profile.description || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                rows="4"
                className="block w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your company and culture..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-755 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
            <span>Save Company Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
