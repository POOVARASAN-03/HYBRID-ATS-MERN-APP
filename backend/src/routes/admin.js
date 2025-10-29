import express from 'express';
import { body, query } from 'express-validator';
import { 
  getDashboardStats, 
  getNonTechnicalApplications,
  getTechnicalApplications,
  updateNonTechnicalApplication,
  getUsers,
  updateUserRole,
  createApplicationForApplicant
} from '../controllers/adminController.js';
import { uploadMiddleware } from '../controllers/applicationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Validation rules
const nonTechnicalUpdateValidation = [
  body('status')
    .isIn(['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected', 'Shortlisted'])
    .withMessage('Invalid status value'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

const userRoleValidation = [
  body('role')
    .isIn(['applicant', 'admin', 'bot'])
    .withMessage('Role must be applicant, admin, or bot')
];

const createApplicationValidation = [
  body('jobId')
    .isMongoId()
    .withMessage('Valid job ID is required'),
  body('applicantId')
    .isMongoId()
    .withMessage('Valid applicant ID is required'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
];

const queryValidation = [
  query('status')
    .optional()
    .isIn(['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected', 'Shortlisted'])
    .withMessage('Invalid status value'),
  query('role')
    .optional()
    .isIn(['applicant', 'admin', 'bot'])
    .withMessage('Invalid role value')
];

// Routes
router.get('/dashboard', authMiddleware, roleMiddleware('admin'), getDashboardStats);
router.get('/applications/non-technical', authMiddleware, roleMiddleware('admin'), queryValidation, getNonTechnicalApplications);
router.get('/applications/technical', authMiddleware, roleMiddleware('admin'), queryValidation, getTechnicalApplications);
router.put('/applications/:id', authMiddleware, roleMiddleware('admin'), nonTechnicalUpdateValidation, updateNonTechnicalApplication);
router.post('/applications', authMiddleware, roleMiddleware('admin'), uploadMiddleware, createApplicationValidation, createApplicationForApplicant);
router.get('/users', authMiddleware, roleMiddleware('admin'), queryValidation, getUsers);
router.put('/users/:id/role', authMiddleware, roleMiddleware('admin'), userRoleValidation, updateUserRole);

export default router;
