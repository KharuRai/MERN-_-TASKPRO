import express, { RequestHandler } from 'express';
import {
  createInvitation,
  acceptInvitation,
  rejectInvitation
} from '../controllers/projectInvitationController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.use(auth);

router.post('/projects/:projectId/invite', createInvitation as RequestHandler);
router.post('/invitations/:invitationId/accept', acceptInvitation as RequestHandler);
router.post('/invitations/:invitationId/reject', rejectInvitation as RequestHandler);

export default router; 