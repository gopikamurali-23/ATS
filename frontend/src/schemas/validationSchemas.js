import { z } from 'zod';

// Password requirement regexes
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// Phone requirement regex: 10 digits
const phoneRegex = /^\d{10}$/;

export const candidateRegisterSchema = z.object({
  fullName: z.string().trim().min(2, 'Full Name must be at least 2 characters'),
  age: z.coerce.number().min(18, 'Age must be at least 18 years').max(75, 'Age cannot exceed 75 years'),
  phone: z.string().trim().regex(phoneRegex, 'Phone must be exactly 10 digits (e.g. 5550192831)'),
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().regex(
    passwordRegex,
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  ),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const recruiterRegisterSchema = z.object({
  fullName: z.string().trim().min(2, 'Full Name must be at least 2 characters'),
  companyName: z.string().trim().min(2, 'Company Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid work email address format'),
  phone: z.string().trim().regex(phoneRegex, 'Phone must be exactly 10 digits (e.g. 5550192831)'),
  password: z.string().regex(
    passwordRegex,
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  ),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  loginIdentifier: z.string().trim().min(1, 'Email address or username is required'),
  loginPassword: z.string().min(1, 'Password is required'),
  captcha: z.string().trim().min(1, 'Security CAPTCHA verification is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid registered email address')
});

export const resetPasswordSchema = z.object({
  otp: z.string().trim().length(6, 'OTP must be exactly 6 digits'),
  newPassword: z.string().regex(
    passwordRegex,
    'New password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  ),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword']
});

export const jobPostSchema = z.object({
  title: z.string().trim().min(3, 'Job Title must be at least 3 characters'),
  location: z.string().trim().min(2, 'Location is required'),
  employmentType: z.string().min(1, 'Employment Type is required'),
  requiredExperienceYears: z.coerce.number().min(0, 'Experience years must be 0 or higher'),
  requiredSkills: z.string().trim().min(2, 'Required technical skills are required'),
  salaryRange: z.string().trim().min(2, 'Salary range is required'),
  description: z.string().trim().min(10, 'Job description must be at least 10 characters')
});

export const applyJobSchema = z.object({
  jobId: z.coerce.number().min(1, 'Valid job selection is required'),
  resumeText: z.string().trim().min(10, 'Resume text or overview must be at least 10 characters')
});

export const interviewScheduleSchema = z.object({
  candidateName: z.string().trim().min(2, 'Candidate name is required'),
  jobTitle: z.string().trim().min(2, 'Job title is required'),
  date: z.string().min(1, 'Interview date is required'),
  time: z.string().trim().min(1, 'Interview time is required'),
  type: z.string().min(1, 'Interview round format is required'),
  meetingUrl: z.string().trim().min(5, 'Meeting link (Google Meet / Teams / Zoom) is required'),
  notes: z.string().trim().min(5, 'Notes for candidate & interviewers are required')
});

// Helper function to extract field error messages from ZodError
export const formatZodErrors = (error) => {
  if (!error || !error.issues) return { form: error?.message || 'Validation failed' };
  const fieldErrors = {};
  error.issues.forEach(issue => {
    const fieldName = issue.path[0] || 'form';
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  });
  return fieldErrors;
};
