import {
  createPage,
  deletePage,
  listPages,
  pageDetails,
  savePageContent,
  updatePage,
  storePages,
} from './page.services';

// Assuming the use of async/await with Express
export const storePagesController = async (req, res) => {
  try {
    // Call the service function
    await storePages(req, res);
  } catch (err) {
    // Handle any unexpected errors
    res.status(500).json({ message: 'Error in page controller' });
  }
};


export const create = async (req, res) => {
  console.log("Incoming request body:", req.body);

  try {
    // Destructure the request body including customPrompt
    const { name: nameObj, userId: incomingUserId, websiteId: incomingWebsiteId, customPrompt } = req.body;

    // Access the actual name and userId from the nested object
    const pageName = nameObj.name;
    const nestedUserId = nameObj.userId;
    const userId = nestedUserId || incomingUserId;

    // Validate required fields
    if (typeof pageName !== 'string' || !pageName) {
      return res.status(400).json({ message: 'Name is required and must be a string.' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }
    if (!incomingWebsiteId) {
      return res.status(400).json({ message: 'Website ID is required.' });
    }

    // Create the page body with all fields including customPrompt
    const pageBody = {
      name: pageName,
      slug: pageName.toLowerCase().split(' ').join('-'),
      userId: userId,
      websiteId: incomingWebsiteId,
      customPrompt: customPrompt
    };

    // console.log("Page body to create:", pageBody);

    // Create the new page
    const page = await createPage(pageBody);
    
    // Fetch all pages for this user and website
    const allPages = await getAllPagesForWebsite(userId, incomingWebsiteId);
    const pageCount = allPages.length;
    
    // Generate navbar HTML dynamically from all pages
    let navbarItems = '';
    allPages.forEach(p => {
      navbarItems += `<li class="nav-item"><a href="./${p.slug}.html" class="nav-link">${p.name}</a></li>`;
    });
    
    const navbarHTML = `
      <div id="navbarNav" class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          ${navbarItems}
        </ul>
      </div>
    `;
    
    // console.log(`Generated Navbar for ${pageCount} pages:`);
    // console.log(navbarHTML);
    // console.log(`Total pages: ${pageCount}`);
    
    // Response with page data, navbar HTML, and count
    const response = {
      page: page,
      navbarHTML: navbarHTML,
      pageCount: pageCount,
      message: `Successfully created page and generated navbar with ${pageCount} items`
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating page:", error);
    res.status(500).json({ message: 'An error occurred while creating the page.', error: error.message });
  }
};

// Helper function to get all pages for a website
async function getAllPagesForWebsite(userId, websiteId) {
  // Replace this with your actual database query
  // Example: return Page.find({ userId, websiteId });
  // For demonstration, we'll return a mock response
  return [
    { name: "Home", slug: "index", userId, websiteId },
    { name: "Shop", slug: "shop", userId, websiteId },
    { name: "About Us", slug: "aboutUs", userId, websiteId },
    { name: "Contact", slug: "contact", userId, websiteId }
  ];
}





export const list = async (req, res) => {
  const { userId, websiteId, prompt } = req.query;
  try {
    const pages = await listPages(userId, websiteId, prompt);
    res.json(pages);
  } catch (error) {
    console.error("Error listing pages:", error);
    res.status(500).json({ message: 'Error retrieving pages', error: error.message });
  }
};

export const details = async (req, res) => {
  const { pageId } = req.params;
  const details = await pageDetails(pageId);
  res.json(details);
};
export const deletePageRecord = async (req, res) => {
  const { pageId } = req.params;
  const data = await deletePage(pageId);
  res.json(data);
};
export const update = async (req, res) => {
  const { pageId } = req.params;
  const pageBody = req.body;
  const page = await updatePage(pageId, pageBody);
  res.json(page);
};
export const changeContent = async (req, res) => {
  const { pageId } = req.params;
  const pageContent = await savePageContent(pageId, req.body);
  res.json(pageContent);
};
export const loadContent = async (req, res) => {
  const { pageId } = req.params;
  res.header('Content-Type', 'application/json');
  const pageData = await pageDetails(pageId);
  res.json(pageData.content);
};
