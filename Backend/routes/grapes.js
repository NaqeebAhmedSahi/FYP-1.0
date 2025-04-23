import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import Pages from '../page/page.modal';
import Websites from '../models/Template';
import multer from 'multer';
import cheerio from 'cheerio';
import axios from 'axios';

const router = express.Router();
const upload = multer();
const promptFilePath = path.join(__dirname, '..', 'prompt.json');
const logFilePath = path.join(__dirname, '..', 'grape-debug.log');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
  console.log(message);
}

// Pixabay API Key
const PIXABAY_API_KEY = '46232949-0980a6dc171b3fd59c5a70cda';

router.post('/api/chat', upload.none(), async (req, res) => {
  try {
    const { prompt, template_file, pageId, websiteId, projectType } = req.body;
    console.log("Website Id",websiteId);

    if (!prompt || !template_file) {
      return res.status(400).json({ error: 'Prompt and template file are required' });
    }

    const page = await Pages.findOne({ _id: pageId });
    if (!page) {
      logToFile(`ERROR: Page not found with ID: ${pageId}`);
      return res.status(404).json({ message: 'Page not found' });
    }

    const website = await Websites.findOne({ _id: websiteId });
    if (!website) {
      console.log('Website not found with ID:', websiteId);
      return res.status(404).json({ message: 'Website not found' });
    }

    if (page.status === 'new') {
      console.log("Html ", page.content ? page.content['mycustom-html'] : 'content is null');
      return res.json({ 
        status: 'new',
        content: {
          'mycustom-html': (page.content && page.content['mycustom-html']) || (page.content && page.content['navbar']) || " ",
          'mycustom-css': (page.content && page.content['mycustom-css']) || " ",
          // Include other default content fields if needed
        }
      });
    } else if (page.status === 'existing') {
  
      console.log(`Updated page ${pageId} status from 'existing' to 'new'`);
      const content = website.content;
    
      let pageName = page.name.toLowerCase();
      if(pageName=="aboutus")
      {
        pageName="aboutUs";
      }
      else if(pageName=="single post"){
        pageName="singlepost";
      }
      const pageContent = content.get(pageName);
      console.log("Page Name",pageName)
      console.log("Page Content",pageContent)

      console.log("Content.html",pageContent.htmlContent);
      let pythonScriptPath = '';

      let templateDir = '';

      // Configure paths based on project type
      if (projectType == 'ecommerce') {
        pythonScriptPath = path.join(__dirname, '..', 'middlewares', 'chatbot.py');
        templateDir = path.join(__dirname, '..', 'middlewares', 'Templates');
      } else if (projectType == 'blog') {
        pythonScriptPath = path.join(__dirname, '..', 'middlewares', 'blogChatbot.py');
        templateDir = path.join(__dirname, '..', 'middlewares', 'BlogTemplates');
      } else if (projectType == 'portfolio') {
        pythonScriptPath = path.join(__dirname, '..', 'middlewares', 'portfolioChatbot.py');
        templateDir = path.join(__dirname, '..', 'middlewares', 'PortfolioTemplate');
      }


      const outputDir = path.join(__dirname, '..', 'rendered_templates');
      const outputFilePath = path.join(outputDir, `rendered_${pageName}.html`);

      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const templateFilePath = path.join(templateDir, `${pageName}.html`);
      fs.writeFileSync(templateFilePath, pageContent.htmlContent);
      // Execute Python script
      const pythonProcess = spawn('python', [pythonScriptPath, prompt, `${pageName}.html`, pageName]);

      let pythonOutput = '';
      let pythonError = '';

      pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        try {
          // Parse the Python script output
          let result;
          try {
            result = JSON.parse(pythonOutput);
          } catch (parseError) {
            console.error('Failed to parse Python output:', pythonOutput);
            throw new Error(`Python output parse error: ${parseError.message}`);
          }

          // Handle errors
          if (code !== 0 || pythonError || result.error) {
            const errorDetails = {
              exitCode: code,
              stderr: pythonError,
              pythonOutput: result.error || pythonOutput
            };
            console.error('Python script failed:', errorDetails);
            return res.status(500).json({
              error: 'Python script execution failed',
              details: errorDetails
            });
          }

          // Verify output file
          if (!fs.existsSync(outputFilePath)) {
            console.error('Expected file not found:', outputFilePath);
            return res.status(500).json({
              error: 'Generated HTML file not found',
              details: `Python script did not create ${outputFilePath}`
            });
          }

          let renderedHtml = fs.readFileSync(outputFilePath, 'utf-8');
          let imageData = null;

          // page.status = 'new';
          await page.save();

          // Process images for all project types
          const processed = await replaceAllImages(renderedHtml, projectType);
          renderedHtml = processed.html;
          imageData = processed.imageData;

          pageContent.htmlContent = renderedHtml;

          const responseObj = {
            status: 'success',
            name: pageName,
            content: pageContent,
            pythonOutput: result
          };

          // Add image data if available
          if (imageData) {
            responseObj.imageData = imageData;
          }

          return res.json(responseObj);

        } catch (error) {
          console.error('Post-processing error:', error);
          res.status(500).json({
            error: 'Failed to process Python script output',
            details: error.message,
            pythonError: pythonError,
            pythonOutput: pythonOutput
          });
        }
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

async function replaceAllImages(html, projectType) {
  const $ = cheerio.load(html);
  const imageData = {
    keyword: '',
    replacedImages: []
  };

  try {
    // Get the keyword based on project type
    switch(projectType) {
      case 'ecommerce':
        imageData.keyword = $('.navbar-brand').first().text().trim().split(' ')[0].toLowerCase();
        break;
      case 'blog':
        // Get first word from title tag for blog
        imageData.keyword = $('title').first().text().trim().split(' ')[0].toLowerCase();
        break;
      case 'portfolio':
        // Get first word from h1 tag for portfolio (or title if h1 not found)
        imageData.keyword = $('title').first().text().trim().split(' ')[0].toLowerCase();
        break;
      default:
        imageData.keyword = 'default';
    }

    console.log(`Using keyword for ${projectType}:`, imageData.keyword);

    // Get all image tags
    const allImages = $('img');
    const totalImages = allImages.length;
    
    if (totalImages === 0) {
      console.log("No images found in the HTML");
      return {
        html: $.html(),
        imageData
      };
    }

    // Fetch enough images for all placeholders
    const fetchedImages = await fetchPixabayImages(imageData.keyword, totalImages);
    console.log(`Fetched ${fetchedImages.length} images from Pixabay`);

    // Replace all images in order
    allImages.each((index, element) => {
      const recycledIndex = index % fetchedImages.length;
      const newSrc = fetchedImages[recycledIndex];
      const oldSrc = $(element).attr('src') || '';
      
      // Replace the image source
      $(element).attr('src', newSrc);
      
      // Store replacement info
      imageData.replacedImages.push({
        index,
        oldSrc,
        newSrc,
        alt: $(element).attr('alt') || ''
      });
    });
    
    return {
      html: $.html(),
      imageData
    };
    
  } catch (error) {
    console.error('Error replacing images:', error);
    return {
      html,
      imageData
    };
  }
}

async function fetchPixabayImages(query, count = 1) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_API_KEY,
        q: query,
        image_type: 'photo',
        per_page: count,
        safesearch: true,
        orientation: 'horizontal',
        editors_choice: true // Get higher quality images
      }
    });

    if (response.data.hits.length === 0) {
      console.warn('No images found for query:', query);
      return getFallbackImages(count);
    }

    return response.data.hits.map(hit => hit.webformatURL);
  } catch (error) {
    console.error('Pixabay API error:', error);
    return getFallbackImages(count);
  }
}

function getFallbackImages(count) {
  // Generic fallback images that work for all project types
  const fallbacks = [
    'https://cdn.pixabay.com/photo/2015/01/21/14/14/apparel-606142_640.jpg',
    'https://cdn.pixabay.com/photo/2017/01/13/04/56/t-shirt-1976334_640.jpg',
    'https://cdn.pixabay.com/photo/2016/11/22/19/18/apparel-1850804_640.jpg',
    'https://cdn.pixabay.com/photo/2015/07/17/22/43/student-849825_640.jpg',
    'https://cdn.pixabay.com/photo/2015/05/31/13/45/blog-791637_640.jpg',
    'https://cdn.pixabay.com/photo/2016/02/19/11/19/computer-1209641_640.jpg',
    'https://cdn.pixabay.com/photo/2015/01/09/11/08/startup-594090_640.jpg',
    'https://cdn.pixabay.com/photo/2015/01/08/18/29/entrepreneur-593358_640.jpg'
  ];
  
  return Array(count).fill().map((_, i) => fallbacks[i % fallbacks.length]);
}

export default router;