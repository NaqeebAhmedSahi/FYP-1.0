import React from 'react';
import { 
  Card,
  CardHeader,
  Avatar,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  Grid,
  Link,
  Divider,
  useTheme
} from '@mui/material';
import { formatDate } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
const HistoryCard = ({ history }) => {
  const theme = useTheme();
  const navigate = useNavigate(); 

  const handleViewAllPages = () => {
    // 1. Get the existing userProject from localStorage
    const userProject = JSON.parse(localStorage.getItem('userProject')) || {};
    
    // 2. Update the customPrompt and projectType properties
    const updatedUserProject = {
      ...userProject,
      customPrompt: history.prompt,
      projectType: history.website.type // Add website type
    };
    
    // 3. Store the updated object back to localStorage
    localStorage.setItem('userProject', JSON.stringify(updatedUserProject));
    
    // Also store the website ID
    localStorage.setItem('selectedWebsiteId', history.website.id);
    
    // Navigate to the home page
    navigate('/home');
  };
  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[6]
      }
    }}>
      <CardHeader
        avatar={
          <Avatar 
            src={history.website.thumbnail}
            alt={history.website.name}
            sx={{ width: 56, height: 56 }}
          >
            {history.website.name.charAt(0)}
          </Avatar>
        }
        title={
          <Typography variant="h6" component="div">
            {history.website.name}
          </Typography>
        }
        subheader={
          <>
            <Typography variant="body2" color="text.secondary" component="span">
              {formatDate(history.createdAt)}
            </Typography>
            <Chip
              label={history.prompt}
              size="small"
              sx={{ ml: 1, backgroundColor: theme.palette.primary.light, color: 'white' }}
            />
          </>
        }
      />
      
      <Divider />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Generated Pages ({history.pages.length})
        </Typography>
        <Grid container spacing={1}>
          {history.pages.map(page => (
            <Grid item xs={6} sm={4} key={page.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <Link 
                  href={`/page/${page.slug}`} 
                  underline="none"
                  color="inherit"
                >
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="body2" noWrap>
                      {page.name}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {page.status}
                    </Typography>
                  </CardContent>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'flex-end' }}>
      <Button 
          size="small" 
          onClick={handleViewAllPages} // Changed from href to onClick
          sx={{ color: theme.palette.primary.main }}
        >
          View All Pages
        </Button>
      </CardActions>
    </Card>
  );
};

export default HistoryCard;