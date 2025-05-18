import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Layout from '../components/Layout';
import api from '../services/api';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  assignee?: {
    _id: string;
    name: string;
  };
  dueDate?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  owner: {
    _id: string;
    name: string;
  };
  members: {
    _id: string;
    name: string;
  }[];
  statuses: string[];
}

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: '',
    assignee: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectResponse, tasksResponse] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`)
      ]);
      setProject(projectResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    try {
      await api.put(`/tasks/${draggableId}`, {
        status: destination.droppableId
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === draggableId
            ? { ...task, status: destination.droppableId }
            : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, newTask);
      setTasks((prevTasks) => [...prevTasks, response.data]);
      setOpenTaskDialog(false);
      setNewTask({
        title: '',
        description: '',
        status: '',
        assignee: '',
        dueDate: ''
      });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <Typography variant="h5" color="error">
          Project not found
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">{project.title}</Typography>
          <Box>
            <Tooltip title="Project Settings">
              <IconButton onClick={() => navigate(`/projects/${projectId}/settings`)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Invite Members">
              <IconButton onClick={() => navigate(`/projects/${projectId}/invite`)}>
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTaskDialog(true)}
              sx={{ ml: 2 }}
            >
              New Task
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {project.description}
        </Typography>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 2 }}>
          {project.statuses.map((status) => (
            <Box
              key={status}
              sx={{
                minWidth: 300,
                backgroundColor: 'background.paper',
                borderRadius: 1,
                p: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                {status}
              </Typography>
              <Droppable droppableId={status}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ minHeight: 500 }}
                  >
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 2,
                                mb: 2,
                                backgroundColor: 'background.default',
                                borderRadius: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                  boxShadow: 1
                                }
                              }}
                            >
                              <Typography variant="subtitle1">
                                {task.title}
                              </Typography>
                              {task.assignee && (
                                <Typography variant="caption" color="text.secondary">
                                  Assigned to: {task.assignee.name}
                                </Typography>
                              )}
                              {task.dueDate && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>
          ))}
        </Box>
      </DragDropContext>

      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Status"
            fullWidth
            select
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          >
            {project.statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Due Date"
            fullWidth
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ProjectDetails; 