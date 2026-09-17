const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDb } = require('./db');
const seedData = require('./seed');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const categoriesRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api', commentsRoutes);
app.use('/api', categoriesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend build files in production if available
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('API endpoint running. Frontend dev server active on client port.');
    }
  });
});

// Start server and initialize seed
const startServer = async () => {
  try {
    await initDb();
    // Auto-seed if database empty
    await seedData();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Blogging Platform REST API Server listening on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
