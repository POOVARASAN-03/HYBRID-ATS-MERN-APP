import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Types.ObjectId,
    ref: 'JobPosting',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  applicantId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roleType: {
    type: String,
    enum: ['technical', 'non-technical'],
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected', 'Shortlisted'],
    default: 'Applied'
  },
  comments: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    by: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['applicant', 'admin', 'bot'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    prevStatus: {
      type: String,
      required: true
    },
    newStatus: {
      type: String,
      required: true
    },
    updatedBy: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: ['manual', 'bot-cron', 'bot-manual'],
      required: true
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot be more than 200 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
ApplicationSchema.index({ applicantId: 1, status: 1 });
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ roleType: 1, status: 1 });
ApplicationSchema.index({ status: 1 });

// Ensure one application per job per applicant
ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export default mongoose.model('Application', ApplicationSchema);
