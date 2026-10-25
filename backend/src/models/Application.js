import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: false
    },
    job: {
      id: { type: String },
      title: { type: String },
      companyName: { type: String },
      location: { type: String },
      employmentType: { type: String },
      requiredSkills: { type: String },
      salaryRange: { type: String }
    },
    candidate: {
      id: { type: String },
      username: { type: String },
      fullName: { type: String },
      email: { type: String },
      role: { type: String, default: 'ROLE_CANDIDATE' }
    },
    status: {
      type: String,
      enum: ['APPLIED', 'UNDER_REVIEW', 'INTERVIEWING', 'OFFERED', 'REJECTED'],
      default: 'APPLIED'
    },
    matchScore: {
      type: Number,
      default: 85
    },
    estimatedExperienceYears: {
      type: Number,
      default: 3
    },
    extractedEducation: {
      type: String,
      default: 'Bachelor of Science'
    },
    extractedSkills: {
      type: String,
      default: ''
    },
    missingSkills: {
      type: String,
      default: ''
    },
    resumeFileName: {
      type: String,
      default: 'Resume.pdf'
    },
    resumeText: {
      type: String,
      default: ''
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        return ret;
      }
    }
  }
);

export const Application = mongoose.model('Application', applicationSchema);
