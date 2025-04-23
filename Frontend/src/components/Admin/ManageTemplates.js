import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminHeader from './AdminHeader';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Grid,
  Avatar,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Videocam as VideocamIcon
} from '@mui/icons-material';

const ManageTemplates = () => {
  const [websiteName, setWebsiteName] = useState('');
  const [websiteType, setWebsiteType] = useState('ecommerce');
  const [websites, setWebsites] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const navigate = useNavigate();

  // Fetch the list of websites on component mount
  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = () => {
    axios.get('http://localhost:8080/api/templates')
      .then((response) => setWebsites(response.data))
      .catch((error) => {
        console.error('Error fetching websites:', error);
        toast.error('Failed to fetch websites. Please try again.');
      });
  };

  // Image dropzone
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    accept: 'image/*',
    maxFiles: 1,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      setUploadedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  });

  // Video dropzone
  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    accept: 'video/*',
    maxFiles: 1,
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0];
      setUploadedVideo(file);
      setPreviewVideo(URL.createObjectURL(file));
    }
  });

  // Add a new website with image and video
  const addWebsite = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('name', websiteName);
    formData.append('type', websiteType);
    if (uploadedImage) formData.append('image', uploadedImage);
    if (uploadedVideo) formData.append('video', uploadedVideo);

    try {
      const response = await axios.post('http://localhost:8080/api/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success(`Website "${websiteName}" added successfully!`);
      setWebsiteName('');
      setUploadedImage(null);
      setUploadedVideo(null);
      setPreviewImage(null);
      setPreviewVideo(null);
      fetchWebsites();
    } catch (error) {
      console.error('Error adding website:', error);
      toast.error('Failed to add website. Please try again.');
    }
  };

  // Delete a website
  const deleteWebsite = (websiteId) => {
    axios.delete(`http://localhost:8080/api/templates/${websiteId}`)
      .then(() => {
        setWebsites(websites.filter((website) => website._id !== websiteId));
        toast.success('Website deleted successfully.');
      })
      .catch((error) => {
        console.error('Error deleting website:', error);
        toast.error('Failed to delete website. Please try again.');
      });
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <AdminHeader />
      <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h4" component="h2" gutterBottom align="center" color="primary">
              Manage Website Templates
            </Typography>

            <Box component="form" onSubmit={addWebsite} sx={{ mt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Website Name"
                    variant="outlined"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    label="Website Type"
                    value={websiteType}
                    onChange={(e) => setWebsiteType(e.target.value)}
                    variant="outlined"
                    required
                  >
                    <MenuItem value="ecommerce">E-commerce</MenuItem>
                    <MenuItem value="blog">Blog</MenuItem>
                    <MenuItem value="portfolio">Portfolio</MenuItem>
                  </Select>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card {...getImageRootProps()} sx={{ p: 2, border: '2px dashed #ccc', cursor: 'pointer' }}>
                    <input {...getImageInputProps()} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CloudUploadIcon fontSize="large" />
                      <Typography>Drag & drop website preview image, or click to select</Typography>
                      {previewImage && (
                        <Avatar
                          src={previewImage}
                          variant="rounded"
                          sx={{ width: 100, height: 100, mt: 2 }}
                        />
                      )}
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card {...getVideoRootProps()} sx={{ p: 2, border: '2px dashed #ccc', cursor: 'pointer' }}>
                    <input {...getVideoInputProps()} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CloudUploadIcon fontSize="large" />
                      <Typography>Drag & drop website preview video, or click to select</Typography>
                      {previewVideo && (
                        <Box sx={{ mt: 2 }}>
                          <video width="100%" controls>
                            <source src={previewVideo} type={uploadedVideo?.type} />
                          </video>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                  >
                    Add Website Template
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5" component="h3" gutterBottom color="textSecondary">
              Existing Website Templates
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Preview</TableCell>
                    <TableCell>Website Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {websites.map((website) => (
                    <TableRow key={website._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {website.imageUrl && (
                            <Avatar src={`http://localhost:8080${website.imageUrl}`} variant="rounded">
                              <ImageIcon />
                            </Avatar>
                          )}
                          {website.videoUrl && (
                            <Avatar variant="rounded">
                              <VideocamIcon />
                            </Avatar>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{website.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={website.type} 
                          color={
                            website.type === 'ecommerce' ? 'primary' : 
                            website.type === 'blog' ? 'secondary' : 'default'
                          } 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => deleteWebsite(website._id)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton 
                          color="primary" 
                          onClick={() => navigate(`/manage-pages/${website._id}`)}
                          aria-label="manage"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
      
      <Box component="footer" sx={{ py: 3, textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" color="textSecondary">
          &copy; 2024 GrapeJs: NLP Web Craft | All Rights Reserved
        </Typography>
      </Box>
      
      <ToastContainer position="top-right" autoClose={5000} />
    </Box>
  );
};

export default ManageTemplates;