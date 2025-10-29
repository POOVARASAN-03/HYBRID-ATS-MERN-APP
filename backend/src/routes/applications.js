import express from 'express';
import { body, query } from 'express-validator';
import { 
  createApplication, 
  getApplications, 
  getApplicationById, 
  updateApplicationStatus, 
  addComment,
  uploadMiddleware
} from '../controllers/applicationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Validation rules
// Validation for application creation.
// Note: when using multipart/form-data, fields like `skills` may arrive as JSON strings.
// We accept either an actual array or a JSON-encoded array string and normalize it.
const applicationValidation = [
  body('jobId')
    .isMongoId()
    .withMessage('Valid job ID is required'),
  body('skills')
    .optional()
    .custom((value, { req }) => {
      // If multer parsed it as an array, accept it
      if (Array.isArray(value)) return true;

      // If it's a string, attempt JSON parse first, then fallback to CSV
      if (typeof value === 'string') {
        // Try JSON array string
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            req.body.skills = parsed;
            return true;
          }
        } catch (err) {
          // Not JSON, try CSV fallback below
        }

        // CSV fallback: split by comma and trim
        const csvArr = value.replace(/[\[\]"]+/g, '').split(',').map(s => s.trim()).filter(Boolean);
        if (csvArr.length > 0) {
          req.body.skills = csvArr;
          return true;
        }

        throw new Error('Skills must be an array or a comma-separated string');
      }

      throw new Error('Skills must be an array');
    })
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
router.post('/', authMiddleware, roleMiddleware(['applicant']), uploadMiddleware, applicationValidation, createApplication);
router.get('/', authMiddleware, queryValidation, getApplications);
router.get('/:id', authMiddleware, getApplicationById);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin', 'bot']), statusUpdateValidation, updateApplicationStatus);
router.post('/:id/comments', authMiddleware, commentValidation, addComment);

export default router;
