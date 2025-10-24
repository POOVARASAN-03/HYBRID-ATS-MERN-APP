import { validationResult } from 'express-validator';
import Application from '../models/Application.js';
import JobPosting from '../models/JobPosting.js';

// Create new application
const createApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { jobId } = req.body;

    // Check if job exists
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check if job is active
    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply to inactive job posting'
      });
    }

    // Check if user already applied to this job
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Determine role type based on job
    const roleType = job.isTechnical ? 'technical' : 'non-technical';

    // Create application
    const application = new Application({
      jobId,
      jobTitle: job.title,
      applicantId: req.user._id,
      roleType,
      comments: [{
        text: 'Application submitted',
        by: req.user.name,
        role: req.user.role
      }],
      history: [{
        prevStatus: 'N/A',
        newStatus: 'Applied',
        updatedBy: req.user.name,
        source: 'manual',
        note: 'Application submitted by applicant',
        timestamp: new Date()
      }]
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating application'
    });
  }
};

// Get applications (role-based filtering)
const getApplications = async (req, res) => {
  try {
    const { status, roleType } = req.query;
    let filter = {};

    // Role-based filtering
    if (req.user.role === 'applicant') {
      filter.applicantId = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all applications, optionally filter by roleType
      if (roleType) {
        filter.roleType = roleType;
      }
    } else if (req.user.role === 'bot') {
      // Bot can only see technical applications
      filter.roleType = 'technical';
    }

    // Status filtering
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title isTechnical status')
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('jobId', 'title description isTechnical status')
      .populate('applicantId', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'applicant' && application.applicantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own applications.'
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application'
    });
  }
};

// Update application status (Admin or Bot)
const updateApplicationStatus = async (req, res) => {
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
    const { status, comment } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    if (req.user.role === 'admin' && application.roleType === 'technical') {
      return res.status(403).json({
        success: false,
        message: 'Admin cannot manually update technical applications. Use bot automation.'
      });
    }

    if (req.user.role === 'bot' && application.roleType !== 'technical') {
      return res.status(403).json({
        success: false,
        message: 'Bot can only update technical applications'
      });
    }

    const prevStatus = application.status;
    application.status = status;

    // Add to history
    application.history.push({
      prevStatus,
      newStatus: status,
      updatedBy: req.user.name,
      source: req.user.role === 'bot' ? 'bot-manual' : 'manual',
      note: comment || `Status changed from ${prevStatus} to ${status}`,
      timestamp: new Date()
    });

    // Add comment if provided
    if (comment) {
      application.comments.push({
        text: comment,
        by: req.user.name,
        role: req.user.role,
        date: new Date()
      });
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application status'
    });
  }
};

// Add comment to application
const addComment = async (req, res) => {
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
    const { text } = req.body;

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'applicant' && application.applicantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only comment on your own applications.'
      });
    }

    // Add comment
    application.comments.push({
      text,
      by: req.user.name,
      role: req.user.role,
      date: new Date()
    });

    await application.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

export {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  addComment
};
