import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
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
  TextField,
  Box,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Code as CodeIcon,
  Css as CssIcon,
  ExpandMore as ExpandMoreIcon,
  FileUpload as FileUploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManagePages = () => {
  const { websiteId } = useParams();
  const [pages, setPages] = useState([]);
  const [pageName, setPageName] = useState('');
  const [htmlFileName, setHtmlFileName] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [cssFileName, setCssFileName] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/page/${websiteId}`);
        setPages(response.data || []);
      } catch (error) {
        console.error('Error fetching pages:', error);
        toast.error('Error fetching pages');
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [websiteId]);

  const handleHtmlFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHtmlFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => setHtmlContent(reader.result);
      reader.readAsText(file);
    }
  };

  const handleCssFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCssFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => setCssContent(reader.result);
      reader.readAsText(file);
    }
  };

  const removeCssFile = () => {
    setCssFileName('');
    setCssContent('');
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  const addPage = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`http://localhost:8080/api/page/${websiteId}`, {
        pageName,
        htmlFileName,
        htmlContent,
        cssFileName,
        cssContent
      });
      setPages([...pages, response.data]);
      toast.success('Page added successfully!');
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error('Error adding page');
    }
  };

  const deletePage = async (pageName) => {
    if (window.confirm(`Are you sure you want to delete "${pageName}"?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/page/${websiteId}/${pageName}`);
        setPages(pages.filter(page => page.pageName !== pageName));
        toast.success('Page deleted successfully');
      } catch (error) {
        console.error('Error deleting page:', error);
        toast.error('Error deleting page');
      }
    }
  };

  const resetForm = () => {
    setPageName('');
    setHtmlFileName('');
    setHtmlContent('');
    setCssFileName('');
    setCssContent('');
    setExpandedAccordion(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Manage Website Pages
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Add, edit, or delete pages for your website
        </Typography>
      </Paper>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Add New Page
      </Button>

      {/* Add Page Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '80vh',
            maxHeight: 'none'
          }
        }}
      >
        <DialogTitle>Add New Page</DialogTitle>
        <DialogContent dividers sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box component="form" onSubmit={addPage} sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={3} sx={{ flex: 1, overflow: 'hidden' }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Page Name"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileUploadIcon />}
                  fullWidth
                >
                  Upload HTML File
                  <input
                    type="file"
                    hidden
                    accept=".html"
                    onChange={handleHtmlFileChange}
                    required
                  />
                </Button>
                {htmlFileName && (
                  <Chip 
                    label={htmlFileName}
                    icon={<CodeIcon />}
                    onDelete={() => setHtmlFileName('')}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<FileUploadIcon />}
                  fullWidth
                >
                  Upload CSS File
                  <input
                    type="file"
                    hidden
                    accept=".css"
                    onChange={handleCssFileChange}
                  />
                </Button>
                {cssFileName && (
                  <Chip
                    label={cssFileName}
                    icon={<CssIcon />}
                    onDelete={removeCssFile}
                    sx={{ mt: 1 }}
                  />
                )}
              </Grid>

              <Grid item xs={12} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Accordion 
                  expanded={expandedAccordion === 'html'}
                  onChange={handleAccordionChange('html')}
                  sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>HTML Content Preview</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ flex: 1, overflow: 'auto' }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={15}
                      maxRows={20}
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '100%',
                          alignItems: 'flex-start'
                        },
                        height: '100%'
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {cssFileName && (
                <Grid item xs={12} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Accordion 
                    expanded={expandedAccordion === 'css'}
                    onChange={handleAccordionChange('css')}
                    sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>CSS Content Preview</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ flex: 1, overflow: 'auto' }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={15}
                        maxRows={20}
                        value={cssContent}
                        onChange={(e) => setCssContent(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CssIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiInputBase-root': {
                            height: '100%',
                            alignItems: 'flex-start'
                          },
                          height: '100%'
                        }}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={addPage}
            startIcon={<AddIcon />}
          >
            Add Page
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pages Table */}
      <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Existing Pages</Typography>
        
        {loading ? (
          <LinearProgress />
        ) : pages.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ p: 3 }}>
            No pages found. Add your first page to get started.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Page Name</TableCell>
                  <TableCell>HTML File</TableCell>
                  <TableCell>CSS File</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pages.map((page, index) => (
                  <TableRow key={page.pageName}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Chip label={page.pageName} color="primary" />
                    </TableCell>
                    <TableCell>{page.htmlFileName || 'N/A'}</TableCell>
                    <TableCell>
                      {page.cssFileName ? (
                        <Chip label={page.cssFileName} icon={<CssIcon />} size="small" />
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={1} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton 
                            color="primary"
                            onClick={() => navigate(`/updatePage/${websiteId}/${page.pageName}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            color="error"
                            onClick={() => deletePage(page.pageName)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      <ToastContainer position="bottom-right" />
    </Container>
  );
};

export default ManagePages;