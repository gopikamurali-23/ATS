import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      default: 'Remote'
    },
    employmentType: {
      type: String,
      default: 'Full-Time'
    },
    requiredExperienceYears: {
      type: Number,
      default: 0
    },
    requiredSkills: {
      type: String,
      required: true
    },
    salaryRange: {
      type: String,
      default: 'Competitive'
    },
    active: {
      type: Boolean,
      default: true
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

export const Job = mongoose.model('Job', jobSchema);
