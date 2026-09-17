const express = require('express');
const router = express.Router();
const { dbAll, getRawData } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories');
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// GET /api/stats - Dashboard analytics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const dbData = getRawData();

    const userPosts = dbData.posts.filter(p => p.author_id === userId);
    const publishedPosts = userPosts.filter(p => p.status === 'published');
    const draftPosts = userPosts.filter(p => p.status === 'draft');

    const totalViews = userPosts.reduce((acc, p) => acc + (p.views || 0), 0);
    const postIds = userPosts.map(p => p.id);
    
    const totalLikes = dbData.likes.filter(l => postIds.includes(l.post_id)).length;
    const totalComments = dbData.comments.filter(c => postIds.includes(c.post_id)).length;

    res.json({
      stats: {
        totalPosts: userPosts.length,
        publishedCount: publishedPosts.length,
        draftCount: draftPosts.length,
        totalViews,
        totalLikes,
        totalComments
      }
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

module.exports = router;
