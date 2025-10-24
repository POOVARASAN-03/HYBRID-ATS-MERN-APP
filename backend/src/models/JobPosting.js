import mongoose from 'mongoose';

const JobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  isTechnical: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for better query performance
JobPostingSchema.index({ isTechnical: 1, status: 1 });
JobPostingSchema.index({ createdBy: 1 });

export default mongoose.model('JobPosting', JobPostingSchema);
