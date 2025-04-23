import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from "./Header";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Container,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Box,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayCircleOutline as PlayIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  },
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: 350, // Set a fixed maximum width
  margin: '0 auto' // Center the card
}));

const MediaWrapper = styled('div')({
  position: 'relative',
  paddingTop: '56.25%', // 16:9 aspect ratio
  overflow: 'hidden',
  backgroundColor: '#f5f5f5'
});

const StyledMedia = styled(CardMedia)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover'
});

const WebsiteList = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [expandedWebsite, setExpandedWebsite] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [videoDialog, setVideoDialog] = useState({ open: false, url: '' });

  const userId = localStorage.getItem('userId');
  const projectType = JSON.parse(localStorage.getItem('userProject'))?.projectType;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/templates?type=${projectType}`);
        setWebsites(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching websites: ' + err.message);
        setLoading(false);
      }
    };

    if (projectType) {
      fetchWebsites();
    } else {
      setError('No project type selected');
      setLoading(false);
    }
  }, [projectType]);

  const handleChoose = async (websiteId) => {
    try {
      localStorage.setItem('selectedWebsiteId', websiteId);
      const userProject = JSON.parse(localStorage.getItem('userProject'));
      const prompt = userProject?.customPrompt || '';
      // const PromptType= userProject?.projectType || '';

      console.log(prompt);
      const response = await axios.post('http://localhost:8080/api/history/pages', {
        websiteId,
        userId,
        prompt
      });

      setMessage(response.data.message);
      setError(null);
      navigate('/home');
    } catch (err) {
      setError('Failed to store pages: ' + err.message);
      setMessage(null);
    }
  };

  const toggleWebsitePages = (websiteId) => {
    setExpandedWebsite(expandedWebsite === websiteId ? null : websiteId);
  };

  const togglePageContent = (pageId) => {
    setSelectedPage(selectedPage === pageId ? null : pageId);
  };

  const openVideoDialog = (url) => {
    setVideoDialog({ open: true, url });
  };

  const closeVideoDialog = () => {
    setVideoDialog({ open: false, url: '' });
  };

  const totalPages = websites.reduce((acc, website) => {
    return acc + (website.content ? Object.keys(website.content).length : 0);
  }, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ 
          fontWeight: 'bold',
          mb: 4,
          color: 'primary.main',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          Choose Your Website Template
        </Typography>

        <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: 'background.paper' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" color="text.secondary">
              <strong>{websites.length}</strong> Templates Available • <strong>{totalPages}</strong> Total Pages
            </Typography>
            <Chip 
              label={projectType?.toUpperCase() || 'ALL'} 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Paper>

        {websites.length === 0 ? (
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            No templates found for your selected project type.
          </Alert>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {websites.map((website) => {
              const pageCount = website.content ? Object.keys(website.content).length : 0;

              return (
                <Grid item key={website._id}>
                  <StyledCard>
                    {/* Media Section */}
                    {website.imageUrl && (
                      <MediaWrapper>
                        <StyledMedia
                          component="img"
                          image={`http://localhost:8080${website.imageUrl}`}
                          alt={website.name}
                        />
                        {website.videoUrl && (
                          <IconButton
                            color="primary"
                            sx={{
                              position: 'absolute',
                              bottom: 16,
                              right: 16,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.7)'
                              }
                            }}
                            onClick={() => openVideoDialog(`http://localhost:8080${website.videoUrl}`)}
                          >
                            <PlayIcon sx={{ color: 'white', fontSize: 32 }} />
                          </IconButton>
                        )}
                      </MediaWrapper>
                    )}

                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography gutterBottom variant="h5" component="h2">
                          {website.name}
                        </Typography>
                        <Chip 
                          label={website.type} 
                          color={
                            website.type === 'ecommerce' ? 'primary' : 
                            website.type === 'blog' ? 'secondary' : 'default'
                          } 
                          size="small"
                        />
                      </Box>

                      <Box display="flex" alignItems="center" sx={{ mt: 1, mb: 2 }}>
                        <ImageIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} Included
                        </Typography>
                      </Box>

                      <Accordion 
                        expanded={expandedWebsite === website._id}
                        onChange={() => toggleWebsitePages(website._id)}
                        elevation={0}
                        sx={{
                          '&:before': { display: 'none' },
                          backgroundColor: 'transparent'
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ p: 0, minHeight: 'auto' }}
                        >
                          <Typography variant="button" color="primary">
                            {expandedWebsite === website._id ? 'Hide Pages' : 'View Pages'}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                          {website.content && (
                            <Box sx={{ mt: 2 }}>
                              {Object.keys(website.content).map((pageId) => {
                                const page = website.content[pageId];
                                return (
                                  <Accordion 
                                    key={pageId} 
                                    expanded={selectedPage === pageId}
                                    onChange={() => togglePageContent(pageId)}
                                    sx={{ mb: 1 }}
                                  >
                                    <AccordionSummary
                                      expandIcon={<ExpandMoreIcon />}
                                      sx={{ minHeight: '48px !important' }}
                                    >
                                      <Typography>{page.htmlFileName}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          HTML Content:
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                          <Typography variant="body2" component="pre" sx={{ 
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            m: 0,
                                            fontFamily: 'monospace'
                                          }}>
                                            {page.htmlContent}
                                          </Typography>
                                        </Paper>
                                      </Box>
                                      <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                          CSS Content:
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                          <Typography variant="body2" component="pre" sx={{ 
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            m: 0,
                                            fontFamily: 'monospace'
                                          }}>
                                            {page.cssContent}
                                          </Typography>
                                        </Paper>
                                      </Box>
                                    </AccordionDetails>
                                  </Accordion>
                                );
                              })}
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<CheckIcon />}
                        onClick={() => handleChoose(website._id)}
                        fullWidth
                        sx={{ mx: 2 }}
                      >
                        Select Template
                      </Button>
                    </CardActions>
                  </StyledCard>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Video Dialog */}
        <Dialog
          open={videoDialog.open}
          onClose={closeVideoDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Template Preview
              <IconButton onClick={closeVideoDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <video controls autoPlay style={{ width: '100%' }}>
              <source src={videoDialog.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeVideoDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Messages */}
        {message && (
          <Alert 
            severity="success" 
            sx={{ 
              position: 'fixed',
              bottom: 20,
              right: 20,
              minWidth: 300
            }}
          >
            {message}
          </Alert>
        )}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed',
              bottom: 20,
              right: 20,
              minWidth: 300
            }}
          >
            {error}
          </Alert>
        )}
      </Container>
    </>
  );
};

export default WebsiteList;