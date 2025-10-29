import { validationResult } from 'express-validator';
import JobPosting from '../models/JobPosting.js';

// Create new job posting (Admin only)
const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, isTechnical, requiredKeywords, keyRequirements, requiredSkills } = req.body;

    const job = new JobPosting({
      title,
      description,
      isTechnical: isTechnical || false,
      // Store both new fields; keep old for backward compatibility
      requiredKeywords: requiredKeywords || [],
      keyRequirements: keyRequirements || [],
      requiredSkills: (requiredSkills && requiredSkills.length > 0)
        ? requiredSkills
        : (requiredKeywords || []),
      createdBy: req.user._id
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job posting'
    });
  }
};

// Get all job postings
const getJobs = async (req, res) => {
  try {
    const { isTechnical, status = 'active' } = req.query;
    
    let filter = { status };
    if (isTechnical !== undefined) {
      filter.isTechnical = isTechnical === 'true';
    }

    const jobs = await JobPosting.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { jobs }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobPosting.findById(id)
      .populate('createdBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job'
    });
  }
};

// Update job posting (Admin only)
const updateJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, description, isTechnical, status, requiredKeywords, keyRequirements, requiredSkills } = req.body;

    const job = await JobPosting.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (isTechnical !== undefined) job.isTechnical = isTechnical;
    if (status) job.status = status;
    if (requiredKeywords !== undefined) job.requiredKeywords = requiredKeywords;
    if (keyRequirements !== undefined) job.keyRequirements = keyRequirements;
    if (requiredSkills !== undefined) job.requiredSkills = requiredSkills;

    await job.save();

    res.json({
      success: true,
      message: 'Job posting updated successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating job posting'
    });
  }
};

// Delete job posting (Admin only)
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobPosting.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    await JobPosting.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job posting'
    });
  }
};

export {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
};
