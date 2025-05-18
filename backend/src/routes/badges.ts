import express, { RequestHandler } from 'express';
import {
  createBadge,
  getProjectBadges,
  awardBadge,
  getUserBadges
} from '../controllers/badgeController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.use(auth);

router.post('/projects/:projectId/badges', createBadge as RequestHandler);
router.get('/projects/:projectId/badges', getProjectBadges as RequestHandler);
router.post('/badges/:badgeId/award', awardBadge as RequestHandler);
router.get('/projects/:projectId/users/:userId/badges', getUserBadges as RequestHandler);

export default router; 