import express, { RequestHandler } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteMember
} from '../controllers/projectController';
import { auth } from '../middleware/auth';

const router = express.Router();

// router.use(auth);

router.post('/', createProject as RequestHandler);
router.get('/', getProjects as RequestHandler);
router.get('/:projectId', getProject as RequestHandler);
router.put('/:projectId', updateProject as RequestHandler);
router.delete('/:projectId', deleteProject as RequestHandler);
router.post('/:projectId/invite', inviteMember as RequestHandler);

export default router; 