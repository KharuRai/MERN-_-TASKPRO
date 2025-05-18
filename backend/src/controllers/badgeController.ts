import { Request, Response } from 'express';
import { Badge } from '../models/Badge';
import { UserBadge } from '../models/UserBadge';
import { Project } from '../models/Project';

export const createBadge = async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const badge = await Badge.create({
      name,
      description,
      imageUrl,
      project: projectId
    });

    res.status(201).json(badge);
  } catch (error) {
    console.error('Error in createBadge:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjectBadges = async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const badges = await Badge.find({ project: projectId });
    res.status(200).json(badges);
  } catch (error) {
    console.error('Error in getProjectBadges:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const awardBadge = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const badgeId = req.params.badgeId;

    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({ message: 'Badge not found' });
    }

    const project = await Project.findOne({
      _id: badge.project,
      owner: req.user._id
    });

    if (!project) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const existingBadge = await UserBadge.findOne({
      user: userId,
      badge: badgeId
    });

    if (existingBadge) {
      return res.status(400).json({ message: 'User already has this badge' });
    }

    const userBadge = await UserBadge.create({
      user: userId,
      badge: badgeId,
      awardedBy: req.user._id
    });

    await userBadge.populate('user', 'name email');
    await userBadge.populate('badge');

    res.status(201).json(userBadge);
  } catch (error) {
    console.error('Error in awardBadge:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const projectId = req.params.projectId;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userBadges = await UserBadge.find({
      user: userId,
      badge: { $in: await Badge.find({ project: projectId }).select('_id') }
    })
    .populate('badge')
    .populate('awardedBy', 'name email');

    res.status(200).json(userBadges);
  } catch (error) {
    console.error('Error in getUserBadges:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 