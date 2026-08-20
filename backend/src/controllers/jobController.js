import prisma from '../config/db.js';

export const convertToJobDto = (job) => {
  if (!job) return null;
  return {
    id: job.id,
    companyId: job.companies ? job.companies.id : job.company_id,
    companyName: job.companies ? job.companies.name : '',
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    salaryRange: job.salary_range,
    status: job.status,
    experienceRequiredYears: job.experience_required_years,
    educationRequired: job.education_required,
    skillsRequired: job.job_skills ? job.job_skills.map(s => s.skill) : [],
    keywords: job.job_keywords ? job.job_keywords.map(k => k.keyword) : [],
    createdAt: job.created_at
  };
};

export const getActiveJobs = async (req, res, next) => {
  try {
    const jobs = await prisma.jobs.findMany({
      where: { status: 'ACTIVE' },
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });
    return res.status(200).json(jobs.map(convertToJobDto));
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
    return res.status(200).json(jobs.map(convertToJobDto));
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await prisma.jobs.findUnique({
      where: { id: BigInt(id) },
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job vacancy not found' });
    }

    return res.status(200).json(convertToJobDto(job));
  } catch (error) {
    next(error);
  }
};

export const getJobsByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const jobs = await prisma.jobs.findMany({
      where: { company_id: BigInt(companyId) },
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });
    return res.status(200).json(jobs.map(convertToJobDto));
  } catch (error) {
    next(error);
  }
};

export const searchJobs = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json([]);
    }

    const jobs = await prisma.jobs.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });
    return res.status(200).json(jobs.map(convertToJobDto));
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const username = req.user.username;
    
    const company = await prisma.companies.findUnique({
      where: { user_id: req.user.id }
    });

    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const jobDto = req.body;

    const savedJob = await prisma.jobs.create({
      data: {
        company_id: company.id,
        title: jobDto.title || '',
        description: jobDto.description || '',
        requirements: jobDto.requirements || '',
        location: jobDto.location || '',
        salary_range: jobDto.salaryRange || '',
        experience_required_years: parseInt(jobDto.experienceRequiredYears || 0, 10),
        education_required: jobDto.educationRequired || '',
        status: 'ACTIVE',
        created_at: new Date(),
        job_skills: {
          create: (jobDto.skillsRequired || []).map(skill => ({ skill }))
        },
        job_keywords: {
          create: (jobDto.keywords || []).map(keyword => ({ keyword }))
        }
      },
      include: {
        companies: true,
        job_skills: true,
        job_keywords: true
      }
    });

    return res.status(200).json(convertToJobDto(savedJob));
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobDto = req.body;

    const existingJob = await prisma.jobs.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updatedJob = await prisma.$transaction(async (tx) => {
      // Delete existing skills & keywords
      await tx.job_skills.deleteMany({
        where: { job_id: BigInt(id) }
      });
      await tx.job_keywords.deleteMany({
        where: { job_id: BigInt(id) }
      });

      // Update basic fields and recreate skills/keywords
      return await tx.jobs.update({
        where: { id: BigInt(id) },
        data: {
          title: jobDto.title,
          description: jobDto.description,
          requirements: jobDto.requirements,
          location: jobDto.location,
          salary_range: jobDto.salaryRange,
          experience_required_years: parseInt(jobDto.experienceRequiredYears || 0, 10),
          education_required: jobDto.educationRequired,
          status: jobDto.status || undefined,
          job_skills: {
            create: (jobDto.skillsRequired || []).map(skill => ({ skill }))
          },
          job_keywords: {
            create: (jobDto.keywords || []).map(keyword => ({ keyword }))
          }
        },
        include: {
          companies: true,
          job_skills: true,
          job_keywords: true
        }
      });
    });

    return res.status(200).json(convertToJobDto(updatedJob));
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingJob = await prisma.jobs.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Cascade is handled in relation mapping or manually if not supported.
    // In our schema.prisma, we marked: onDelete: Cascade. So delete jobs will delete job_skills & job_keywords too!
    await prisma.jobs.delete({
      where: { id: BigInt(id) }
    });

    return res.status(204).end();
  } catch (error) {
    next(error);
  }
};
