// pages.js (backend route file)
// const express = require('express');
import express from "express";
const router = express.Router();
// const Page = require('../models/Page');
import JSZip from "jszip";
import Page from "../page/page.modal.js"
// const { verifyToken } = require('../middleware/authMiddleware');

// @desc    Delete a page
// @route   DELETE /api/pages/:id
// @access  Private
router.delete('/deletePage/:id',  async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Get userId from query params
    console.log('Deleting:', { id, userId });

    // Find the page by ID
    const page = await Page.findOne({ _id: id, userId });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found or you are not authorized to delete it'
      });
    }

    // Delete the page
    await Page.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Page deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting page',
      error: error.message
    });
  }
});


router.get('/download', async (req, res) => {
    try {
      const { userId, websiteId, prompt } = req.query;
      
      // Build query object
      const query = { userId, websiteId };
      
      // Add prompt filter if provided
      if (prompt && prompt.trim() !== '') {
        query['customPrompt'] = { $regex: prompt, $options: 'i' }; // Changed to match your DB field
      }
      
      
      // Find pages with optional prompt filter
      const pages = await Page.find(query);
      console.log(pages.length);
      if (!pages || pages.length === 0) {
        return res.status(404).json({ 
          message: prompt 
            ? `No pages found matching the prompt: "${prompt}"`
            : 'No pages found for this website'
        });
      }
      
      const zip = new JSZip();
      const websiteFolder = zip.folder('website');
      
      // Process each page
      for (const page of pages) {
        if (page.content && page.content['mycustom-html']) {
          let htmlContent = page.content['mycustom-html'];
          
          // Add CSS link if exists
          if (page.content && page.content['mycustom-css']) {
            const cssLink = `<link rel="stylesheet" href="${page.slug}.css">`;
            
            // Enhanced HTML structure handling
            if (!htmlContent.includes('<html>')) {
              htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.slug}</title>
  ${cssLink}
</head>
<body>
  ${htmlContent}
</body>
</html>`;
            } else {
              if (htmlContent.includes('<head>')) {
                htmlContent = htmlContent.includes('</head>')
                  ? htmlContent.replace('</head>', `${cssLink}</head>`)
                  : htmlContent.replace('<head>', `<head>${cssLink}`);
              } else {
                htmlContent = htmlContent.replace('<html>', `<html><head>${cssLink}</head>`);
              }
            }
          }
          
          websiteFolder.file(`${page.slug}.html`, htmlContent);
          
          // Add CSS file if exists
          if (page.content && page.content['mycustom-css']) {
            websiteFolder.file(`${page.slug}.css`, page.content['mycustom-css']);
          }
        }
      }
      
      // Generate zip file
      const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
      
      // Set download headers
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=website_files.zip',
        'X-Filtered-By-Prompt': prompt || 'none' // Optional header for tracking
      });
      
      res.send(zipContent);
      
    } catch (error) {
      console.error('Error generating zip:', error);
      res.status(500).json({ 
        message: 'Error generating download',
        error: error.message 
      });
    }
});

// PUT endpoint to update page content
router.put('/pages/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { htmlContent, cssContent, components, styles, assets } = req.body;
  
      // Validate required fields
      if (!htmlContent || !cssContent) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const updatedPage = await Page.findByIdAndUpdate(
        id,
        {
          htmlContent,
          cssContent,
          components,
          styles,
          assets,
          updatedAt: Date.now()
        },
        { new: true }
      );
  
      if (!updatedPage) {
        return res.status(404).json({ message: 'Page not found' });
      }
  
      res.json({
        success: true,
        message: 'Page updated successfully',
        page: updatedPage
      });
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  router.put('/save/:pageId', async (req, res) => {
    try {
      const { pageId } = req.params;
      console.log("PageId",pageId)
      const { content } = req.body;
      console.log(content);
  
      // Validate the content structure
      if (!content || 
          !content['mycustom-html'] || 
          !content['mycustom-components'] || 
          !content['mycustom-css'] || 
          !content['mycustom-styles']) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid content structure' 
        });
      }
  
      // Update the page with content and set status to 'existing'
      const updatedPage = await Page.findByIdAndUpdate(
        pageId,
        { 
          $set: { 
            content,
            status: 'new',
            updatedAt: new Date() 
          } 
        },
        { new: true }
      );
  
      if (!updatedPage) {
        return res.status(404).json({ 
          success: false,
          message: 'Page not found' 
        });
      }
  
      // Return success response with the saved content
      res.status(200).json({
        success: true,
        message: 'Page content saved successfully',
        data: {
          pageId: updatedPage._id,
          content: updatedPage.content
        }
      });
  
    } catch (error) {
      console.error('Error saving page content:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message 
      });
    }
  });

module.exports = router;