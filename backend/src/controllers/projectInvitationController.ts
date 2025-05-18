import { Request, Response } from 'express';
import { ProjectInvitation } from '../models/ProjectInvitation';
import { Project } from '../models/Project';
import { User } from '../models/User';
// import { sendEmail } from '../utils/email';

export const createInvitation = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && project.members.includes(existingUser._id as any)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    const existingInvitation = await ProjectInvitation.findOne({
      email,
      project: projectId,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already exists' });
    }

    const invitation = await ProjectInvitation.create({
      email,
      project: projectId,
      invitedBy: req.user._id
    });

    // Send invitation email
    // await sendEmail({
    //   to: email,
    //   subject: `Invitation to join project: ${project.title}`,
    //   text: `You have been invited to join the project "${project.title}". Click here to accept: ${process.env.FRONTEND_URL}/invitations/${invitation._id}`
    // });

    res.status(201).json(invitation);
  } catch (error) {
    console.error('Error in createInvitation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const invitation = await ProjectInvitation.findOne({
      _id: req.params.invitationId,
      email: req.user.email,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.members.push(req.user._id);
    await project.save();

    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Error in acceptInvitation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const rejectInvitation = async (req: Request, res: Response) => {
  try {
    const invitation = await ProjectInvitation.findOne({
      _id: req.params.invitationId,
      email: req.user.email,
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.status(200).json({ message: 'Invitation rejected successfully' });
  } catch (error) {
    console.error('Error in rejectInvitation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 