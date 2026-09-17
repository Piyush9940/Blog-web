const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatar_url, bio } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check existing
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email address is already registered.' });
      }
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const defaultAvatar = avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const result = await dbRun(
      'INSERT INTO users (username, email, password_hash, avatar_url, bio) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, defaultAvatar, bio || 'Passionate writer and reader.']
    );

    const user = {
      id: result.lastID,
      username,
      email,
      avatar_url: defaultAvatar,
      bio: bio || 'Passionate writer and reader.',
      role: 'user'
    };

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register user.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const userPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
      role: user.role
    };

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: userPayload, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, username, email, avatar_url, bio, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { bio, avatar_url } = req.body;
    await dbRun('UPDATE users SET bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url) WHERE id = ?', [bio, avatar_url, req.user.id]);
    const updated = await dbGet('SELECT id, username, email, avatar_url, bio, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
