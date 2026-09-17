const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'antigravity_blog_secret_key_2026';

// Required auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// Optional auth middleware (extracts user if token present, but doesn't block if absent)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
    } catch (err) {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  JWT_SECRET
};
