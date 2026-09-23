import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { applyJobSchema } from '../schemas/validationSchemas';

export const useApplications = (isCompany = false) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = isCompany 
        ? await api.getCompanyApplications() 
        : await api.getMyApplications();
      setApplications(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [isCompany]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Apply to a job with validation
  const applyToJob = async (formData) => {
    const rawData = {
      jobId: formData.get('jobId'),
      resumeText: formData.get('resumeText')
    };
    applyJobSchema.parse(rawData);

    const newApp = await api.applyToJob(formData);
    setApplications(prev => [newApp, ...prev]);
    return newApp;
  };

  // Optimistic Status Update: updates UI immediately and rolls back if API call fails
  const updateStatus = async (appId, newStatus) => {
    const previous = [...applications];
    // 1. Optimistic Update
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));

    try {
      // 2. Perform API call
      await api.updateApplicationStatus(appId, newStatus);
    } catch (err) {
      // 3. Rollback on failure
      setApplications(previous);
      throw err;
    }
  };

  return {
    applications,
    loading,
    error,
    refetchApplications: fetchApplications,
    applyToJob,
    updateStatus
  };
};
