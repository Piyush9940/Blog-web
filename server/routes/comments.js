const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun, getRawData } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Helper function to build nested comment tree
const buildCommentTree = (comments, parentId = null) => {
  return comments
    .filter(c => c.parent_id === parentId)
    .map(c => ({
      ...c,
      replies: buildCommentTree(comments, c.id)
    }));
};

// GET /api/posts/:postId/comments - Get all comments for a post
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await dbAll('SELECT * FROM comments WHERE post_id = ?', [postId]);
    const commentTree = buildCommentTree(comments, null);
    res.json({ comments: commentTree, total: comments.length });
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// POST /api/posts/:postId/comments - Post root comment or reply (Protected)
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parent_id } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    // Verify post exists
    const post = await dbGet('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Verify parent comment if specified
    if (parent_id) {
      const parentComment = await dbGet('SELECT * FROM comments WHERE id = ?', [parent_id]);
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found.' });
      }
    }

    const result = await dbRun(
      'INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)',
      [postId, req.user.id, parent_id || null, content.trim()]
    );

    const dbData = getRawData();
    const newComment = dbData.comments.find(c => c.id === result.lastID);
    const author = dbData.users.find(u => u.id === req.user.id) || {};

    const enrichedComment = {
      ...newComment,
      author_name: author.username || req.user.username,
      author_avatar: author.avatar_url || '',
      replies: []
    };

    res.status(201).json({ comment: enrichedComment });
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).json({ error: 'Failed to post comment.' });
  }
});

// PUT /api/comments/:id - Edit comment (Protected - Author only)
router.put('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const existing = await dbGet('SELECT * FROM comments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this comment.' });
    }

    await dbRun('UPDATE comments SET content = ?, updated_at = ? WHERE id = ?', [content.trim(), new Date().toISOString(), id]);

    const updated = await dbGet('SELECT * FROM comments WHERE id = ?', [id]);
    res.json({ comment: updated });
  } catch (err) {
    console.error('Error editing comment:', err);
    res.status(500).json({ error: 'Failed to edit comment.' });
  }
});

// DELETE /api/comments/:id - Delete comment (Protected - Author or Admin)
router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT * FROM comments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment.' });
    }

    await dbRun('DELETE FROM comments WHERE id = ?', [id]);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

module.exports = router;
