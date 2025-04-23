import React, { useState, useEffect } from 'react';
import { 
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Button, 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryCard from './HistoryCard';
import axios from 'axios';
import Header from './Header';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get current user ID (from auth context or localStorage)
  const userId = localStorage.getItem('userId');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`http://localhost:8080/api/history/user/${userId}`);
      setHistory(response.data.history || []); // Ensure we always have an array
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
      setHistory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const filteredHistory = history.filter(item => {
    // Safely handle possible null/undefined values
    const websiteName = item.website?.name?.toLowerCase() || '';
    const promptText = item.prompt?.toLowerCase() || '';
    
    // Check if search term matches website name or prompt
    const matchesWebsite = websiteName.includes(searchTerm.toLowerCase());
    const matchesPrompt = promptText.includes(searchTerm.toLowerCase());
    
    // Check if search term matches any page name
    const matchesPages = item.pages?.some(page => 
      page.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || false;

    return matchesWebsite || matchesPrompt || matchesPages;
  });

  return (
    <>
      <Header />
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 4,
        marginTop: 8

      }}>
        <Typography variant="h4" component="h1">
          Your Generation History
        </Typography>
        
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search websites or prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            width: { xs: '100%', sm: 300 },
            backgroundColor: 'background.paper'
          }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredHistory.length > 0 ? (
        <Grid container spacing={3}>
          {filteredHistory.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={`${item.website?.id || index}_${index}`}>
              <HistoryCard history={item} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {searchTerm ? 'No results found' : 'No generation history'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm 
              ? `No matches found for "${searchTerm}"`
              : 'Start creating websites to see them appear here'}
          </Typography>
          {searchTerm && (
            <Button 
              variant="outlined" 
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </Button>
          )}
        </Paper>
      )}
    </Container>
    </>
  );
};

export default HistoryPage;