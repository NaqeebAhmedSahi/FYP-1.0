import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpdatePage = () => {
  const { websiteId, pageName } = useParams(); // Get websiteId and pageName from URL params
  const [htmlContent, setHtmlContent] = useState('');
  const [cssContent, setCssContent] = useState('');
  const [htmlFileName, setHtmlFileName] = useState('');
  const [cssFileName, setCssFileName] = useState('');
  const [updateOption, setUpdateOption] = useState('code');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the website data using websiteId
    axios
      .get(`http://localhost:8080/api/templates/${websiteId}`)
      .then((response) => {
        const website = response.data;

        // Fetch page data from website content
        const page = website.content && website.content[pageName];

        if (page) {
          setHtmlContent(page.htmlContent || '');
          setCssContent(page.cssContent || '');
          setHtmlFileName(page.htmlFileName || '');
          setCssFileName(page.cssFileName || '');
        } else {
          console.error('Page not found');
          alert('Page not found');
        }
      })
      .catch((error) => {
        console.error('Error fetching website data:', error);
        alert('Error fetching website data. Please try again.');
      });
  }, [websiteId, pageName]); // Refetch when websiteId or pageName changes

  // Handle file input changes for HTML and CSS
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

  // Handle form submission to update the page
  const handleUpdate = (event) => {
    event.preventDefault();

    // Prepare data for the request
    const updatedData = {
      pageName, // Send the pageName directly
      htmlContent: updateOption === 'code' ? htmlContent : '', // Send content if option is 'code'
      cssContent: updateOption === 'code' ? cssContent : '', // Send CSS content if option is 'code'
      htmlFileName: updateOption === 'file' ? htmlFileName : '', // Send file name if option is 'file'
      cssFileName: updateOption === 'file' ? cssFileName : '', // Send file name if option is 'file'
    };

    // Send the PUT request to the backend with the updated data
    axios
      .put(`http://localhost:8080/api/templates/${websiteId}`, updatedData)
      .then(() => {
        alert('Page updated successfully!');
        navigate(`/manage-pages/${websiteId}`); // Navigate back to the manage pages view
      })
      .catch((error) => {
        console.error('Error updating page:', error);
        alert('Error updating page. Please try again.');
      });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Update Page: {pageName}</h2>
      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="radio"
          name="updateOption"
          id="updateOptionCode"
          value="code"
          checked={updateOption === 'code'}
          onChange={() => setUpdateOption('code')}
        />
        <label className="form-check-label" htmlFor="updateOptionCode">
          Edit HTML/CSS Code
        </label>
      </div>
      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="radio"
          name="updateOption"
          id="updateOptionFile"
          value="file"
          checked={updateOption === 'file'}
          onChange={() => setUpdateOption('file')}
        />
        <label className="form-check-label" htmlFor="updateOptionFile">
          Upload New Files (HTML/CSS)
        </label>
      </div>
      {updateOption === 'code' && (
        <>
          <div className="form-group">
            <label htmlFor="htmlContent">HTML Content:</label>
            <textarea
              className="form-control"
              id="htmlContent"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              required
              style={{ height: '200px' }} // Adjusted height for larger input field
            />
          </div>
          <div className="form-group">
            <label htmlFor="cssContent">CSS Content:</label>
            <textarea
              className="form-control"
              id="cssContent"
              value={cssContent}
              onChange={(e) => setCssContent(e.target.value)}
              style={{ height: '200px' }} // Adjusted height for larger input field
            />
          </div>
        </>
      )}
      {updateOption === 'file' && (
        <>
          <div className="form-group">
            <label htmlFor="htmlFileName">Upload HTML File:</label>
            <input
              type="file"
              className="form-control"
              id="htmlFileName"
              accept=".html"
              onChange={handleHtmlFileChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="cssFileName">Upload CSS File:</label>
            <input
              type="file"
              className="form-control"
              id="cssFileName"
              accept=".css"
              onChange={handleCssFileChange}
            />
          </div>
        </>
      )}
      <button type="submit" className="btn btn-primary mt-3" onClick={handleUpdate}>
        Update Page
      </button>
    </div>
  );
};

export default UpdatePage;
