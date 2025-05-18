import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Automation } from '../models/Automation';

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status, assignee, dueDate } = req.body;
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

    const task = await Task.create({
      title,
      description,
      project: projectId,
      status: status || project.statuses[0],
      assignee,
      dueDate
    });

    await task.populate('assignee', 'name email');

    // Check for automations
    const automations = await Automation.find({
      project: projectId,
      isActive: true,
      'trigger.type': 'status_change',
      'trigger.conditions': {
        $elemMatch: {
          field: 'status',
          operator: 'equals',
          value: task.status
        }
      }
    });

    for (const automation of automations) {
      for (const action of automation.actions) {
        switch (action.type) {
          case 'assign_user':
            task.assignee = action.params.userId;
            break;
          case 'add_badge':
            // Add badge logic here
            break;
          case 'send_notification':
            // Send notification logic here
            break;
        }
      }
    }

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTasks = async (req: Request, res: Response) => {
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

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { title, description, status, assignee, dueDate } = req.body;
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({
      _id: task.project,
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldStatus = task.status;
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.assignee = assignee || task.assignee;
    task.dueDate = dueDate || task.dueDate;

    // Check for automations if status changed
    if (status && status !== oldStatus) {
      const automations = await Automation.find({
        project: task.project,
        isActive: true,
        'trigger.type': 'status_change',
        'trigger.conditions': {
          $elemMatch: {
            field: 'status',
            operator: 'equals',
            value: status
          }
        }
      });

      for (const automation of automations) {
        for (const action of automation.actions) {
          switch (action.type) {
            case 'assign_user':
              task.assignee = action.params.userId;
              break;
            case 'add_badge':
              // Add badge logic here
              break;
            case 'send_notification':
              // Send notification logic here
              break;
          }
        }
      }
    }

    await task.save();
    await task.populate('assignee', 'name email');

    res.status(200).json(task);
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({
      _id: task.project,
      owner: req.user._id
    });

    if (!project) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.deleteOne({ _id: task._id });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 