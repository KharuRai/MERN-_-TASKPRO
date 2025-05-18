import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { User } from '../models/User';
import mongoose from 'mongoose';

export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, statuses } = req.body;
    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
      statuses: statuses || ['To Do', 'In Progress', 'Done']
    });

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json(project);
  } catch (error) {
    console.error('Error in createProject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error in getProject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { title, description, statuses } = req.body;
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.title = title || project.title;
    project.description = description || project.description;
    project.statuses = statuses || project.statuses;
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(200).json(project);
  } catch (error) {
    console.error('Error in updateProject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await Project.deleteOne({ _id: project._id });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const inviteMember = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = new mongoose.Types.ObjectId(user._id as string);
    if (project.members.some(memberId => memberId.equals(userId))) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userId);
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(200).json(project);
  } catch (error) {
    console.error('Error in inviteMember:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 