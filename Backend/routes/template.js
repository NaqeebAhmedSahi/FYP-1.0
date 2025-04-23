import express from 'express';
import Website from '../models/Template.js';
import multer from 'multer';
import path from 'path';
const router = express.Router();

// Create a new website with an initial template (HTML/CSS)
// POST route to add a new website

// Define the PUT route to update a template
router.put('/:websiteId', async (req, res) => {
  const { websiteId } = req.params;
  console.log('Received PUT request for websiteId:', websiteId); 
  const { pageName, htmlContent, cssContent, htmlFileName, cssFileName } = req.body;

  try {
    const website = await Website.findById(websiteId);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    // Since 'page' is already provided directly, no need for website.content[pageName]
    const page = req.body;  // Assuming the page data is passed directly in the request body

    console.log("Page", page, pageName);

    // Update the page content
    page.htmlContent = htmlContent || page.htmlContent;
    page.cssContent = cssContent || page.cssContent;
    page.htmlFileName = htmlFileName || page.htmlFileName;
    page.cssFileName = cssFileName || page.cssFileName;

    // You can also update the website content directly if needed
    website.content[pageName] = page;  // If you still want to save the page within website.content

    await website.save();
    res.status(200).json({ message: 'Page updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating page', error: err.message });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });



router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { name, type } = req.body; // Get both name and type from request body

  if (!name || !type) {
    return res.status(400).json({ message: 'Website name and type are required' });
  }

  try {
    // Create a new website with name and type
    const newWebsite = new Website({
      name: name,
      type: type,
      imageUrl: req.files['image'] ? '/uploads/' + req.files['image'][0].filename : null,
      videoUrl: req.files['video'] ? '/uploads/' + req.files['video'][0].filename : null,
      content: {}, // Initialize the content as an empty object
    });

    const savedWebsite = await newWebsite.save();
    res.status(201).json(savedWebsite);
  } catch (error) {
    console.error('Error adding website:', error);
    res.status(500).json({ message: 'Error adding website' });
  }
});


// Get all websites (templates) filtered by type
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    // Create filter object
    const filter = {};
    if (type) {
      filter.type = type;
    }

    // Fetch websites with optional type filter
    const websites = await Website.find(filter);
    
    if (!websites || websites.length === 0) {
      return res.status(404).json({ 
        message: type 
          ? `No websites found for type: ${type}`
          : 'No websites found'
      });
    }

    res.status(200).json(websites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ message: 'Error fetching websites' });
  }
});

// Route to update the website page content
// router.put('/api/templates/:websiteId', async (req, res) => {
//   const { websiteId } = req.params;
//   const { pageName, htmlContent, cssContent, htmlFileName, cssFileName } = req.body;

//   try {
//     // Find the website by ID
//     const website = await Website.findById(websiteId);
//     if (!website) {
//       return res.status(404).json({ message: 'Website not found' });
//     }

//     // Check if the page exists within the website content
//     const page = website.content[pageName];
//     if (!page) {
//       return res.status(404).json({ message: 'Page not found' });
//     }

//     // Update the page's HTML and CSS content
//     if (htmlContent) page.htmlContent = htmlContent;
//     if (cssContent) page.cssContent = cssContent;
//     if (htmlFileName) page.htmlFileName = htmlFileName;
//     if (cssFileName) page.cssFileName = cssFileName;

//     // Save the updated website object
//     await website.save();

//     res.status(200).json({ message: 'Page updated successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


// Get details of a specific website template
router.get('/:id', async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }
    res.json(website);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a website template
router.delete('/:id', async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    await website.remove();
    res.json({ message: 'Website template deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a website template
// router.delete('/:id', async (req, res) => {
//     try {
//       const website = await Website.findById(req.params.id);
//       if (!website) {
//         return res.status(404).json({ message: 'Website not found' });
//       }
  
//       await website.remove(); // Remove the website from the database
//       res.json({ message: 'Website template deleted' });
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });

  router.get('/:websiteId', (req, res) => {
    const { websiteId } = req.params;
    // Fetch the website object from the database using websiteId
    const website = getWebsiteById(websiteId); // Assume this function is implemented
    res.json(website);
  });
  
  

// // Define the PUT route to update a template
// router.put('/:websiteId', async (req, res) => {
//   const { websiteId } = req.params;
//   const { pageName, htmlContent, cssContent, htmlFileName, cssFileName } = req.body;
  
//   // Logic to handle updating the page
//   try {
//     const website = await Website.findById(websiteId);  // Replace with your model
//     if (!website) {
//       return res.status(404).json({ message: 'Website not found' });
//     }
    
//     // Assuming website has a 'content' object with pages
//     const page = website.content[pageName];
//     if (!page) {
//       return res.status(404).json({ message: 'Page not found' });
//     }
    
//     // Update the page content
//     page.htmlContent = htmlContent || page.htmlContent;
//     page.cssContent = cssContent || page.cssContent;
//     page.htmlFileName = htmlFileName || page.htmlFileName;
//     page.cssFileName = cssFileName || page.cssFileName;
    
//     await website.save();
    
//     res.status(200).json({ message: 'Page updated successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating page', error: err.message });
//   }
// });
  




export default router;
