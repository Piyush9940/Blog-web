const express = require('express');
const router = express.Router();
const { dbGet, dbRun, getRawData } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Helper to generate slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .substring(0, 80);
};

// GET /api/posts - Fetch post list with filters & sorting
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, category, tag, author_id, status, sort = 'latest', page = 1, limit = 10 } = req.query;
    const dbData = getRawData();

    let posts = [...dbData.posts];

    // Filter by status (default published unless author looking at their own)
    if (status) {
      posts = posts.filter(p => p.status === status);
    } else {
      posts = posts.filter(p => p.status === 'published' || (req.user && p.author_id === req.user.id));
    }

    // Filter by author_id
    if (author_id) {
      posts = posts.filter(p => p.author_id === Number(author_id));
    }

    // Filter by category
    if (category && category !== 'All') {
      posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by tag
    if (tag) {
      posts = posts.filter(p => p.tags && p.tags.toLowerCase().includes(tag.toLowerCase()));
    }

    // Filter by search query
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) || 
        (p.tags && p.tags.toLowerCase().includes(q))
      );
    }

    // Map author info, like count, comment count & user like status
    const currentUserId = req.user ? req.user.id : null;
    let enrichedPosts = posts.map(p => {
      const author = dbData.users.find(u => u.id === p.author_id) || {};
      const like_count = dbData.likes.filter(l => l.post_id === p.id).length;
      const comment_count = dbData.comments.filter(c => c.post_id === p.id).length;
      const user_liked = currentUserId ? dbData.likes.some(l => l.post_id === p.id && l.user_id === currentUserId) : false;

      return {
        ...p,
        author_name: author.username || 'Anonymous',
        author_avatar: author.avatar_url || '',
        author_bio: author.bio || '',
        like_count,
        comment_count,
        user_liked
      };
    });

    // Sorting
    if (sort === 'popular') {
      enrichedPosts.sort((a, b) => b.views - a.views);
    } else if (sort === 'likes') {
      enrichedPosts.sort((a, b) => b.like_count - a.like_count);
    } else {
      // Default latest
      enrichedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const total = enrichedPosts.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedPosts = enrichedPosts.slice(startIndex, startIndex + limitNum);

    res.json({
      posts: paginatedPosts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
});

// GET /api/posts/:identifier - Get single post by ID or slug
router.get('/:identifier', optionalAuth, async (req, res) => {
  try {
    const { identifier } = req.params;
    const isId = /^\d+$/.test(identifier);
    const dbData = getRawData();

    let post = null;
    if (isId) {
      post = await dbGet('SELECT * FROM posts WHERE id = ?', [identifier]);
    } else {
      post = await dbGet('SELECT * FROM posts WHERE slug = ?', [identifier]);
    }

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Increment views
    await dbRun('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);
    post.views = (post.views || 0) + 1;

    // Check user liked status
    const currentUserId = req.user ? req.user.id : null;
    const user_liked = currentUserId ? Boolean(await dbGet('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [post.id, currentUserId])) : false;

    res.json({
      post: {
        ...post,
        user_liked
      }
    });
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ error: 'Failed to retrieve post details.' });
  }
});

// POST /api/posts - Create post (Protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, excerpt, cover_image, category, tags, status = 'published' } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required.' });
    }

    // Base slug
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = 'post-' + Date.now();
    let slug = baseSlug;
    let counter = 1;

    const dbData = getRawData();
    while (dbData.posts.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const defaultCover = cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80';

    const result = await dbRun(
      'INSERT INTO posts (title, slug, content, excerpt, cover_image, category, tags, author_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, content, excerpt, defaultCover, category, tags, req.user.id, status]
    );

    const newPost = await dbGet('SELECT * FROM posts WHERE id = ?', [result.lastID]);

    res.status(201).json({ post: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// PUT /api/posts/:id - Edit post (Protected - Author only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, cover_image, category, tags, status } = req.body;

    const existing = await dbGet('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to edit this post.' });
    }

    let slug = existing.slug;
    if (title && title !== existing.title) {
      let baseSlug = slugify(title);
      slug = baseSlug;
      let counter = 1;
      const dbData = getRawData();
      while (dbData.posts.some(p => p.slug === slug && p.id !== Number(id))) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    await dbRun(
      'UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image = ?, category = ?, tags = ?, status = ?, updated_at = ? WHERE id = ?',
      [
        title || existing.title,
        slug,
        content || existing.content,
        excerpt !== undefined ? excerpt : existing.excerpt,
        cover_image || existing.cover_image,
        category || existing.category,
        tags !== undefined ? tags : existing.tags,
        status || existing.status,
        id
      ]
    );

    const updated = await dbGet('SELECT * FROM posts WHERE id = ?', [id]);
    res.json({ post: updated });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Failed to update post.' });
  }
});

// DELETE /api/posts/:id - Delete post (Protected - Author or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this post.' });
    }

    await dbRun('DELETE FROM posts WHERE id = ?', [id]);
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// POST /api/posts/:id/like - Like post (Protected)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbGet('SELECT * FROM likes WHERE post_id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [id, req.user.id]);
    }
    const dbData = getRawData();
    const like_count = dbData.likes.filter(l => l.post_id === Number(id)).length;
    res.json({ liked: true, like_count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to like post.' });
  }
});

// DELETE /api/posts/:id/like - Unlike post (Protected)
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [id, req.user.id]);
    const dbData = getRawData();
    const like_count = dbData.likes.filter(l => l.post_id === Number(id)).length;
    res.json({ liked: false, like_count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unlike post.' });
  }
});

module.exports = router;
