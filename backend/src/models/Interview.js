import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: true,
      trim: true
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      default: 'TalentPulse Hiring Partner'
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'Technical Screening'
    },
    meetingUrl: {
      type: String,
      default: 'https://meet.google.com/tp-interview-room'
    },
    interviewer: {
      type: String,
      default: 'Sarah Jenkins (Senior Technical Recruiter)'
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED'
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

export const Interview = mongoose.model('Interview', interviewSchema);
