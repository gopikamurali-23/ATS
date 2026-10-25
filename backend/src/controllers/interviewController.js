import { Interview } from '../models/Interview.js';
import { Application } from '../models/Application.js';

export const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    next(error);
  }
};

export const scheduleInterview = async (req, res, next) => {
  try {
    const {
      candidateName,
      jobTitle,
      companyName,
      date,
      time,
      type,
      meetingUrl,
      interviewer,
      notes,
      applicationId
    } = req.body;

    const interview = await Interview.create({
      candidateName: candidateName || 'Candidate',
      jobTitle: jobTitle || 'Software Engineer',
      companyName: companyName || req.user?.companyName || 'Google',
      date,
      time,
      type: type || 'Technical Screening',
      meetingUrl: meetingUrl || 'https://meet.google.com/tp-interview-room',
      interviewer: interviewer || 'Senior Technical Recruiter',
      notes: notes || '',
      status: 'SCHEDULED'
    });

    // If an applicationId was provided, automatically update application status to INTERVIEWING
    if (applicationId) {
      await Application.findByIdAndUpdate(applicationId, { status: 'INTERVIEWING' }).catch(() => {});
    }

    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    next(error);
  }
};
