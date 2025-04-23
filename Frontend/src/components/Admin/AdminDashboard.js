import React from 'react';
import { 
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Divider,
  Avatar,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  Dashboard as TemplatesIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AdminHeader from './AdminHeader';

const AdminDashboard = () => {
  const theme = useTheme();

  const dashboardCards = [
    {
      title: "Total Users",
      value: 12,
      description: "Number of registered users on the platform",
      icon: <PeopleIcon fontSize="large" />,
      color: theme.palette.primary.main,
      path: "/users"
    },
    {
      title: "Total Templates",
      value: 10,
      description: "Templates available for e-commerce, blogs, and portfolios",
      icon: <TemplatesIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      path: "/templates"
    },
    {
      title: "Notifications",
      value: 2,
      description: "New notifications from users and system alerts",
      icon: <NotificationsIcon fontSize="large" />,
      color: theme.palette.error.main,
      path: "/notifications"
    },
    {
      title: "Prompt History",
      value: 30,
      description: "Historical prompts generated for website creation",
      icon: <HistoryIcon fontSize="large" />,
      color: theme.palette.success.main,
      path: "/view_prompts"
    }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header Section with Navigation */}
      <AdminHeader />
      
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper elevation={0} sx={{ 
          p: 4, 
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 100%)`
        }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            color: theme.palette.primary.dark
          }}>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Overview of platform statistics and quick actions
          </Typography>
        </Paper>

        {/* Dashboard Cards */}
        <Grid container spacing={4}>
          {dashboardCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Avatar sx={{ 
                      bgcolor: card.color + '20', 
                      color: card.color,
                      mr: 2,
                      width: 56,
                      height: 56
                    }}>
                      {card.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="text.secondary">
                        {card.title}
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {card.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {card.description}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    component={Link}
                    to={card.path}
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: card.color,
                      '&:hover': {
                        bgcolor: card.color,
                        opacity: 0.9
                      }
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Footer Section */}
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
    </Box>
  );
};

export default AdminDashboard;