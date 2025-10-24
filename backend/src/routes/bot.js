import express from 'express';
import { runBot, getBotDashboard, getBotStats } from '../controllers/botController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { roleMiddleware, botTokenMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Routes
// Manual bot run (requires bot role or internal token)
router.post('/run', (req, res, next) => {
  // Check if it's an internal call with bot token
  if (req.header('X-Bot-Token')) {
    return botTokenMiddleware(req, res, next);
  }
  // Otherwise check for bot role authentication
  return authMiddleware(req, res, () => {
    return roleMiddleware('bot')(req, res, next);
  });
}, runBot);

// Bot dashboard (requires bot role)
router.get('/dashboard', authMiddleware, roleMiddleware('bot'), getBotDashboard);
router.get('/stats', authMiddleware, roleMiddleware('bot'), getBotStats);

export default router;
