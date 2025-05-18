import express, { RequestHandler } from 'express';
import {
  createAutomation,
  getAutomations,
  updateAutomation,
  deleteAutomation
} from '../controllers/automationController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.use(auth);

router.post('/projects/:projectId/automations', createAutomation as RequestHandler);
router.get('/projects/:projectId/automations', getAutomations as RequestHandler);
router.put('/automations/:automationId', updateAutomation as RequestHandler);
router.delete('/automations/:automationId', deleteAutomation as RequestHandler);

export default router; 