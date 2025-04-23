import React, { useEffect, useState } from 'react';
import { 
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  useTheme
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import AdminHeader from './AdminHeader';
import axios from 'axios';

const Users = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    username: ''
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/users');
        if (Array.isArray(response.data)) {
          setUsers(response.data);
          // console.log
        } else {
          setError('Unexpected response format');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle delete confirmation dialog
  const handleDeleteClick = (userId, username) => {
    setDeleteDialog({
      open: true,
      userId,
      username
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${deleteDialog.userId}`);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== deleteDialog.userId));
      toast.success(`User ${deleteDialog.username} deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleteDialog({ open: false, userId: null, username: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, userId: null, username: '' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AdminHeader />
      
      <Container maxWidth="xl" sx={{ my: 4, flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            color: theme.palette.primary.main
          }}>
            User Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage all registered users in the system
          </Typography>
        </Paper>

        {loading ? (
          <LinearProgress />
        ) : error ? (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Password</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                            <PersonIcon />
                          </Avatar>
                          <Typography>{user.username}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon color="action" />
                          <Typography>{user.email}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LockIcon color="action" />
                          <Chip 
                            label={user.password.length > 10 ? '••••••••••' : user.password}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(user._id, user.username)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{deleteDialog.username}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box component="footer" sx={{ 
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="body2" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} GrapeJs: NLP Web Craft | All Rights Reserved
        </Typography>
      </Box>

      <ToastContainer position="bottom-right" />
    </Box>
  );
};

export default Users;