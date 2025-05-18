import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';

const defaultStatuses = ['To Do', 'In Progress', 'Done'];

const NewProject: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statuses, setStatuses] = useState<string[]>(defaultStatuses);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddStatus = () => {
    if (newStatus && !statuses.includes(newStatus)) {
      setStatuses([...statuses, newStatus]);
      setNewStatus('');
    }
  };

  const handleDeleteStatus = (status: string) => {
    setStatuses(statuses.filter((s) => s !== status));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/projects', {
        title,
        description,
        statuses
      });
      navigate(`/projects/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper elevation={3} sx={{ p: 4, minWidth: 400 }}>
          <Typography variant="h5" gutterBottom>
            Create New Project
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Statuses
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {statuses.map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onDelete={statuses.length > 1 ? () => handleDeleteStatus(status) : undefined}
                  color="primary"
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Add Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                size="small"
              />
              <Button onClick={handleAddStatus} disabled={!newStatus} variant="outlined">
                Add
              </Button>
            </Stack>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default NewProject; 