import { validationResult } from 'express-validator';
import Application from '../models/Application.js';
import JobPosting from '../models/JobPosting.js';
import User from '../models/User.js';

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get application counts by status
    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get applications by role type
    const roleTypeStats = await Application.aggregate([
      {
        $group: {
          _id: '$roleType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent applications
    const recentApplications = await Application.find()
      .populate('jobId', 'title isTechnical')
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get job posting counts
    const jobStats = await JobPosting.aggregate([
      {
        $group: {
          _id: '$isTechnical',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        applicationStats,
        roleTypeStats,
        jobStats,
        recentApplications
      }
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
};

// Get non-technical applications for admin management
const getNonTechnicalApplications = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { roleType: 'non-technical' };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title description isTechnical')
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    console.error('Get non-technical applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching non-technical applications'
    });
  }
};

// Get technical applications for admin view (read-only)
const getTechnicalApplications = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { roleType: 'technical' };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title description isTechnical')
      .populate('applicantId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    console.error('Get technical applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching technical applications'
    });
  }
};

// Update non-technical application status
const updateNonTechnicalApplication = async (req, res) => {
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

    if (application.roleType !== 'non-technical') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only for non-technical applications'
      });
    }

    const prevStatus = application.status;
    application.status = status;

    // Add to history
    application.history.push({
      prevStatus,
      newStatus: status,
      updatedBy: req.user.name,
      source: 'manual',
      note: comment || `Admin updated status from ${prevStatus} to ${status}`,
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
      message: 'Application updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update non-technical application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application'
    });
  }
};

// Get all users (Admin only)
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let filter = {};

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
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
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
};

export {
  getDashboardStats,
  getNonTechnicalApplications,
  getTechnicalApplications,
  updateNonTechnicalApplication,
  getUsers,
  updateUserRole
};
