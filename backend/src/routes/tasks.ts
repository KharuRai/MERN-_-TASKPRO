import express, { RequestHandler } from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.use(auth);

router.post('/projects/:projectId/tasks', createTask as RequestHandler);
router.get('/projects/:projectId/tasks', getTasks as RequestHandler);
router.put('/tasks/:taskId', updateTask as RequestHandler);
router.delete('/tasks/:taskId', deleteTask as RequestHandler);

export default router; 