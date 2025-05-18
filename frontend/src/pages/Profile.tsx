import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Paper elevation={3} sx={{ p: 4, minWidth: 320, textAlign: 'center' }}>
          <Avatar
            sx={{ width: 64, height: 64, mx: 'auto', mb: 2 }}
            src={user?.photoURL || undefined}
          >
            {user?.email?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h5" gutterBottom>
            {user?.email}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            User Profile
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Profile; 