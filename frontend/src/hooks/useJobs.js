import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { jobPostSchema } from '../schemas/validationSchemas';

export const useJobs = (companyFilter = null) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJobs();
      if (companyFilter) {
        setJobs(data.filter(j => !j.companyName || j.companyName.toLowerCase() === companyFilter.toLowerCase()));
      } else {
        setJobs(data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [companyFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const postJob = async (jobData) => {
    // Defensive runtime validation with Zod
    const validated = jobPostSchema.parse(jobData);
    const created = await api.createJob(validated);
    setJobs(prev => [created, ...prev]);
    return created;
  };

  return {
    jobs,
    loading,
    error,
    refetchJobs: fetchJobs,
    postJob
  };
};
