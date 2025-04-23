import Pages from './page.modal';
import Website from '../models/Template';
import cheerio from 'cheerio';

export const storePages = async (req, res) => {
  try {
    const { websiteId, userId } = req.body;

    if (!websiteId || !userId) {
      return res.status(400).json({ message: 'websiteId and userId are required' });
    }

    console.log('Request Body: ', req.body);

    // Fetch the website document
    const website = await Website.findById(websiteId).lean(); // Use lean() to get a plain JavaScript object

    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const content = website.content;

    // Ensure content is a valid object
    if (!content || typeof content !== 'object') {
      return res.status(400).json({ message: 'Invalid or empty content in the website' });
    }

    // Extract valid keys (filter out any invalid Mongoose keys)
    const contentKeys = Object.keys(content).filter((key) => !key.startsWith('$'));
    console.log('Valid Keys are: ', contentKeys);

    // Prepare pages for insertion
    const pages = contentKeys.map((key) => {
      const pageContent = content[key];

      if (!pageContent || !pageContent.htmlFileName || !pageContent.htmlContent) {
        throw new Error(`Page with key "${key}" is missing required fields.`);
      }

      return {
        name: key,
        slug: key.toLowerCase().replace(/\s+/g, '-'),
        userId,
        websiteId,
        status: 'existing',
      };
    });

    // Check if the pages already exist in the database and only insert non-existing ones
    const existingPages = await Pages.find({
      websiteId,
      name: { $in: pages.map((page) => page.name) },
    }).lean();

    const existingPageNames = existingPages.map((page) => page.name);

    // Filter out pages that already exist in the database
    const pagesToInsert = pages.filter((page) => !existingPageNames.includes(page.name));

    if (pagesToInsert.length > 0) {
      // Insert the pages that don't already exist
      const savedPages = await Pages.insertMany(pagesToInsert);
      return res.status(200).json({
        message: `${savedPages.length} pages stored successfully`,
        savedPages,
      });
    } else {
      return res.status(200).json({ message: 'No new pages to store' });
    }
  } catch (err) {
    console.error('Error storing pages:', err.message || err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};




export const createPage = async (pageBody) => {
  console.log("pageBody received:", pageBody);

  // Validate required fields
  if (typeof pageBody.name !== 'string') {
    throw new Error('Name must be a string');
  }

  // Generate the slug from the name
  const slug = pageBody.name.toLowerCase().split(' ').join('-');
  
  // Create a new page object
  const page = new Pages({
    name: pageBody.name,
    slug: slug,
    userId: pageBody.userId,
    websiteId: pageBody.websiteId,
    customPrompt: pageBody.customPrompt || null,
    status: "new",
    content: null
  });

  try {
    const pageResponse = await page.save();
    
    // Fetch all pages with the same userId, websiteId, and customPrompt
    const filter = {
      userId: pageBody.userId,
      websiteId: pageBody.websiteId
    };
    
    if (pageBody.customPrompt) {
      filter.customPrompt = pageBody.customPrompt;
    } else {
      filter.customPrompt = { $exists: false };
    }
    
    const matchingPages = await Pages.find(filter).select('content name slug');
    console.log(`Found ${matchingPages.length} pages with userId: ${pageBody.userId}, websiteId: ${pageBody.websiteId}, and customPrompt: ${pageBody.customPrompt || 'null'}`);
    
    // Generate navbar links based on all pages
    const navLinks = matchingPages.map(page => ({
      text: page.name,
      href: `./${page.slug}.html`
    }));

    console.log('\nGenerated Navbar Links:');
    console.log(navLinks);

    // Update all pages with the new navbar
    const updatePromises = matchingPages.map(async (page) => {
      try {
        let content = page.content || {};
        let htmlContent = content['mycustom-html'] || '';
        
        const $ = cheerio.load(htmlContent);
        const navbarDiv = $('#navbarNav');
        
        if (navbarDiv.length > 0) {
          // Find or create the ul element with proper classes
          let ulElement = navbarDiv.find('ul.navbar-nav');
          
          if (ulElement.length === 0) {
            // Create new ul if it doesn't exist
            ulElement = $('<ul>').addClass('navbar-nav ms-auto');
            navbarDiv.append(ulElement);
          } else {
            // Ensure existing ul has the correct classes
            ulElement.addClass('navbar-nav ms-auto');
          }

          // Clear existing navbar links
          ulElement.empty();
          
          // Add new links as list items
          navLinks.forEach(link => {
            ulElement.append(
              `<li class="nav-item">
                <a href="${link.href}" class="nav-link">${link.text}</a>
              </li>`
            );
          });

          // Update the HTML content
          content['mycustom-html'] = $.html();
          
          // Update the page in MongoDB
          return Pages.findByIdAndUpdate(
            page._id,
            { $set: { content: content } },
            { new: true }
          );
        }
      } catch (error) {
        console.error(`Error updating page ${page.name}:`, error.message);
        return null;
      }
    });

    // Wait for all updates to complete
    const updatedPages = await Promise.all(updatePromises);
    console.log(`\nUpdated ${updatedPages.filter(p => p !== null).length} pages with new navbar`);
    
    return {
      createdPage: pageResponse,
      updatedPages: updatedPages.filter(p => p !== null)
    };
  } catch (error) {
    console.error("Error creating page:", error.message);
    throw new Error('Error creating page: ' + error.message);
  }
};



// Backend - Update the listPages function
export const listPages = async (userId, websiteId, prompt) => {
  // Create query object with mandatory fields
  const query = { userId, websiteId };
  
  // Add prompt to query if provided
  if (prompt) {
    query.customPrompt = prompt;
  }

  const pages = await Pages.find(query);
  return pages;
};

export const deletePage = async (pageId) => {};
export const updatePage = async (pageId, pageBody) => {};
export const pageDetails = async (pageId) => {
  const pages = await Pages.findOne({ _id: pageId });
  return pages;
};
export const savePageContent = async (pageId, content) => {
  const pageUpdated = await Pages.findOneAndUpdate({ _id: pageId }, { content });
  return pageUpdated;
};
export const findPageById = async (pageId) => {
  const page = await Pages.findById(pageId);
  return page;
};
