import express from 'express';
import { body, query } from 'express-validator';
import { createJob, getJobs, getJobById, updateJob, deleteJob } from '../controllers/jobController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Validation rules
const jobValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('isTechnical')
    .optional()
    .isBoolean()
    .withMessage('isTechnical must be a boolean value')
];

const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('isTechnical')
    .optional()
    .isBoolean()
    .withMessage('isTechnical must be a boolean value'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'closed'])
    .withMessage('Status must be active, inactive, or closed')
];

const queryValidation = [
  query('isTechnical')
    .optional()
    .isBoolean()
    .withMessage('isTechnical must be a boolean value'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'closed'])
    .withMessage('Status must be active, inactive, or closed')
];

// Routes
router.post('/', authMiddleware, roleMiddleware('admin'), jobValidation, createJob);
router.get('/', queryValidation, getJobs);
router.get('/:id', getJobById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateJobValidation, updateJob);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteJob);

export default router;
