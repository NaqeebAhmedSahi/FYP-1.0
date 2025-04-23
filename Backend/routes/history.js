import express from 'express';
import mongoose from 'mongoose';
import Page from '../page/page.modal.js';
import Website from '../models/Template.js';

const router = express.Router();

// Enhanced helper to ignore internal Mongo fields
const isInternalField = (key) => {
    return key.startsWith('$') || ['__v', '_id', '__proto__'].includes(key);
};

// Create or update pages based on website content
router.post('/pages', async (req, res) => {
    try {
        const { websiteId, userId, prompt } = req.body;

        // Validate input
        if (!websiteId || !mongoose.Types.ObjectId.isValid(websiteId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid website ID'
            });
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // Fetch website with lean() for better performance
        const website = await Website.findById(websiteId).lean();
        if (!website) {
            return res.status(404).json({
                success: false,
                message: 'Website not found'
            });
        }

        if (!website.content || typeof website.content !== 'object' || Array.isArray(website.content)) {
            return res.status(400).json({
                success: false,
                message: 'Website has invalid or no pages content'
            });
        }

        // Process pages
        const pageEntries = Object.entries(website.content)
            .filter(([key, value]) =>
                !isInternalField(key) &&
                typeof value === 'object' &&
                value !== null
            );

        if (pageEntries.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid pages found in website content'
            });
        }

        const savedPages = await Promise.all(
            pageEntries.map(async ([pageKey, pageData]) => {
                try {
                    // Replace optional chaining with traditional checks
                    const htmlFileName = pageData && pageData.htmlFileName
                        ? pageData.htmlFileName.trim()
                        : null;

                    if (!htmlFileName || typeof htmlFileName !== 'string') {
                        console.warn(`Skipping page with invalid htmlFileName for key: ${pageKey}`);
                        return null;
                    }

                    // Create slug and name safely
                    const baseSlug = htmlFileName.replace(/\.html$/i, '') || `page-${Date.now()}`;
                    const slug = baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

                    const pageName = slug
                        .replace(/[-_]+/g, ' ')
                        .split(' ')
                        .filter(Boolean)
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                        .substring(0, 25);

                    const newPage = new Page({
                        name: pageName,
                        slug,
                        userId,
                        websiteId,
                        status: 'existing',
                        customPrompt: prompt && typeof prompt === 'string' ? prompt.trim() : undefined
                    });

                    return await newPage.save();
                } catch (error) {
                    console.error(`Error processing page ${pageKey}:`, error);
                    return null;
                }
            })
        );

        // Filter out null results from failed saves
        const successfulPages = savedPages.filter(page => page !== null);

        if (successfulPages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No pages could be saved successfully'
            });
        }

        res.status(201).json({
            success: true,
            message: `${successfulPages.length} pages saved successfully`,
            pages: successfulPages.map(page => ({
                id: page._id,
                name: page.name,
                slug: page.slug
            }))
        });

    } catch (error) {
        console.error('Error in /pages endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user history grouped by website and prompt
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        // Fetch all pages for the user
        const pages = await Page.find({ userId })
            .sort({ createdAt: -1 });

        if (!pages || pages.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No pages found for this user'
            });
        }

        // Group pages by websiteId and prompt
        const groupedHistory = pages.reduce((acc, page) => {
            const key = `${page.websiteId}_${page.customPrompt}`;

            if (!acc[key]) {
                acc[key] = {
                    websiteId: page.websiteId,
                    prompt: page.customPrompt,
                    createdAt: page.createdAt,
                    pages: []
                };
            }

            acc[key].pages.push({
                id: page._id,
                name: page.name,
                slug: page.slug,
                status: page.status,
                createdAt: page.createdAt
            });

            // Keep the earliest creation date for the group
            if (page.createdAt < acc[key].createdAt) {
                acc[key].createdAt = page.createdAt;
            }

            return acc;
        }, {});

        // Convert to array and sort by creation date
        const historyArray = Object.values(groupedHistory)
            .sort((a, b) => b.createdAt - a.createdAt);

        // Fetch website details for all unique websiteIds
        // Fetch website details for all unique websiteIds
        const websiteIds = [...new Set(historyArray.map(item => item.websiteId))];
        const websites = await Website.find({
            _id: { $in: websiteIds }
        }).select('name thumbnailUrl type'); // Add 'type' to the select

        const websiteMap = websites.reduce((map, website) => {
            map[website._id] = website;
            return map;
        }, {});

        // Format the final response (without optional chaining)
        const formattedHistory = historyArray.map(group => {
            const website = websiteMap[group.websiteId] || {};
            return {
                prompt: group.prompt,
                createdAt: group.createdAt,
                website: {
                    id: group.websiteId,
                    name: website.name || 'Unknown Website',
                    thumbnail: website.thumbnailUrl || '/default-website.jpg',
                    type: website.type || 'standard' // Add default type if not specified
                },
                pages: group.pages.sort((a, b) => a.name.localeCompare(b.name))
            };
        });

        res.status(200).json({
            success: true,
            count: formattedHistory.length,
            history: formattedHistory
        });

    } catch (error) {
        console.error('Error fetching user history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user history',
            error: error.message
        });
    }
});

export default router;