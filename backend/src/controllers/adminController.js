import prisma from '../config/db.js';

export const getSystemAnalytics = async (req, res, next) => {
  try {
    const totalJobs = await prisma.jobs.count();
    const totalApplications = await prisma.applications.count();
    const totalCandidates = await prisma.candidates.count();
    const totalCompanies = await prisma.companies.count();

    const results = await prisma.ats_results.findMany({
      select: { final_ats_score: true }
    });

    let averageAtsScore = 0.0;
    if (results.length > 0) {
      const sum = results.reduce((acc, curr) => acc + curr.final_ats_score, 0);
      averageAtsScore = sum / results.length;
    }
    averageAtsScore = Math.round(averageAtsScore * 100.0) / 100.0;

    const apps = await prisma.applications.findMany({
      select: { status: true }
    });

    const statusDistribution = {
      APPLIED: 0,
      UNDER_REVIEW: 0,
      SHORTLISTED: 0,
      REJECTED: 0
    };

    apps.forEach(app => {
      const status = app.status ? app.status.toUpperCase() : 'APPLIED';
      if (statusDistribution[status] !== undefined) {
        statusDistribution[status]++;
      } else {
        statusDistribution[status] = 1;
      }
    });

    const actionNeeded = statusDistribution.APPLIED || 0;

    return res.status(200).json({
      totalJobs,
      totalApplications,
      totalCandidates,
      totalCompanies,
      averageAtsScore,
      actionNeeded,
      statusDistribution
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        candidates: true,
        companies: true
      }
    });
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: { id: BigInt(id) }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.users.delete({
      where: { id: BigInt(id) }
    });

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await prisma.companies.findMany({
      include: { users: true }
    });
    return res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await prisma.jobs.findMany({
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });
    return res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await prisma.applications.findMany({
      include: {
        candidates: { include: { users: true } },
        jobs: { include: { companies: true } }
      }
    });
    return res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};
