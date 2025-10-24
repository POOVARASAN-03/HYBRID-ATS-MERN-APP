import express from 'express';
import { body, query } from 'express-validator';
import { 
  createApplication, 
  getApplications, 
  getApplicationById, 
  updateApplicationStatus, 
  addComment 
} from '../controllers/applicationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Validation rules
const applicationValidation = [
  body('jobId')
    .isMongoId()
    .withMessage('Valid job ID is required')
];

const statusUpdateValidation = [
  body('status')
    .isIn(['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected', 'Shortlisted'])
    .withMessage('Invalid status value'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

const commentValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

const queryValidation = [
  query('status')
    .optional()
    .isIn(['Applied', 'Reviewed', 'Interview', 'Offer', 'Rejected', 'Shortlisted'])
    .withMessage('Invalid status value'),
  query('roleType')
    .optional()
    .isIn(['technical', 'non-technical'])
    .withMessage('Invalid role type value')
];

// Routes
router.post('/', authMiddleware, roleMiddleware(['applicant']), applicationValidation, createApplication);
router.get('/', authMiddleware, queryValidation, getApplications);
router.get('/:id', authMiddleware, getApplicationById);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin', 'bot']), statusUpdateValidation, updateApplicationStatus);
router.post('/:id/comments', authMiddleware, commentValidation, addComment);

export default router;
