import { Request, Response } from 'express';
import { Automation } from '../models/Automation';
import { Project } from '../models/Project';

export const createAutomation = async (req: Request, res: Response) => {
  try {
    const { name, trigger, actions } = req.body;
    const projectId = req.params.projectId;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const automation = await Automation.create({
      project: projectId,
      name,
      trigger,
      actions,
      isActive: true
    });

    res.status(201).json(automation);
  } catch (error) {
    console.error('Error in createAutomation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAutomations = async (req: Request, res: Response) => {
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

    const automations = await Automation.find({ project: projectId })
      .sort({ createdAt: -1 });

    res.status(200).json(automations);
  } catch (error) {
    console.error('Error in getAutomations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAutomation = async (req: Request, res: Response) => {
  try {
    const { name, trigger, actions, isActive } = req.body;
    const automationId = req.params.automationId;

    const automation = await Automation.findById(automationId);
    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const project = await Project.findOne({
      _id: automation.project,
      owner: req.user._id
    });

    if (!project) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    automation.name = name || automation.name;
    automation.trigger = trigger || automation.trigger;
    automation.actions = actions || automation.actions;
    automation.isActive = isActive !== undefined ? isActive : automation.isActive;

    await automation.save();
    res.status(200).json(automation);
  } catch (error) {
    console.error('Error in updateAutomation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAutomation = async (req: Request, res: Response) => {
  try {
    const automationId = req.params.automationId;
    const automation = await Automation.findById(automationId);

    if (!automation) {
      return res.status(404).json({ message: 'Automation not found' });
    }

    const project = await Project.findOne({
      _id: automation.project,
      owner: req.user._id
    });

    if (!project) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Automation.deleteOne({ _id: automation._id });
    res.status(200).json({ message: 'Automation deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAutomation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 