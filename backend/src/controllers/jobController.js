import { Job } from '../models/Job.js';

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ active: true }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job requisition not found' });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      companyName,
      location,
      employmentType,
      requiredExperienceYears,
      requiredSkills,
      salaryRange
    } = req.body;

    const newJob = await Job.create({
      title,
      description,
      companyName: companyName || req.user?.companyName || 'Enterprise Partner',
      location: location || 'Remote',
      employmentType: employmentType || 'Full-Time',
      requiredExperienceYears: Number(requiredExperienceYears) || 0,
      requiredSkills,
      salaryRange: salaryRange || 'Competitive',
      active: true
    });

    res.status(201).json(newJob);
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job requisition removed successfully' });
  } catch (error) {
    next(error);
  }
};
