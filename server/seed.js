const bcrypt = require('bcryptjs');
const { initDb, dbRun, getRawData } = require('./db');

const seedData = async () => {
  console.log('Starting seed process...');
  await initDb();
  const dbData = getRawData();

  // Clear existing data for fresh seed if needed
  dbData.users = [];
  dbData.categories = [];
  dbData.posts = [];
  dbData.comments = [];
  dbData.likes = [];
  dbData.nextId = { users: 1, categories: 1, posts: 1, comments: 1, likes: 1 };

  // Hash common password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Seed Users
  await dbRun('INSERT INTO users (username, email, password_hash, avatar_url, bio) VALUES (?, ?, ?, ?, ?)', [
    'alex_chen',
    'alex@example.com',
    passwordHash,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'Senior AI Systems Architect & Tech Writer. Exploring neural networks, LLM tool calling, and full-stack software design.'
  ]);

  await dbRun('INSERT INTO users (username, email, password_hash, avatar_url, bio) VALUES (?, ?, ?, ?, ?)', [
    'maya_design',
    'maya@example.com',
    passwordHash,
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'Principal Product Designer focusing on glassmorphism, micro-interactions, and accessible web experiences.'
  ]);

  await dbRun('INSERT INTO users (username, email, password_hash, avatar_url, bio) VALUES (?, ?, ?, ?, ?)', [
    'chris_dev',
    'chris@example.com',
    passwordHash,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'Full-stack engineer passionate about React, Node.js performance, and modern developer tooling.'
  ]);

  // 2. Seed Categories
  const categories = [
    { name: 'Technology', slug: 'technology', description: 'Latest tech breakthroughs, hardware, and digital trends.', color: '#6366f1' },
    { name: 'Development', slug: 'development', description: 'Full-stack engineering, clean code, APIs, and frameworks.', color: '#10b981' },
    { name: 'Design', slug: 'design', description: 'UI/UX design systems, typography, and visual aesthetics.', color: '#ec4899' },
    { name: 'AI & Data', slug: 'ai-data', description: 'Artificial Intelligence, machine learning models, and data science.', color: '#8b5cf6' },
    { name: 'Career', slug: 'career', description: 'Tech careers, productivity, and remote engineering tips.', color: '#f59e0b' }
  ];

  for (const cat of categories) {
    await dbRun('INSERT INTO categories (name, slug, description, color) VALUES (?, ?, ?, ?)', [
      cat.name,
      cat.slug,
      cat.description,
      cat.color
    ]);
  }

  // 3. Seed Posts
  const post1Content = `
# The Architecture of Modern Autonomous AI Agents

Artificial Intelligence has shifted from passive statistical classification to **autonomous agentic workflows**. In 2026, building software requires understanding how LLMs can reason, execute tool calls, inspect runtimes, and self-correct when errors arise.

## Core Pillars of Autonomous Agents

1. **Reasoning & Planning**: Breaking down complex prompt goals into executable sub-tasks using structured plan artifacts.
2. **Tool Execution**: Empowering models with real-time tools for file inspection, database queries, and terminal command execution.
3. **Iterative Feedback Loops**: Observing command outputs and stack trace evidence before declaring success.

\`\`\`javascript
async function executeAgentWorkflow(goal) {
  const plan = await generatePlan(goal);
  for (const step of plan.steps) {
    const result = await executeTool(step.action);
    if (result.status === 'ERROR') {
      await handleSelfCorrection(step, result.error);
    }
  }
}
\`\`\`

> *"The future of software development belongs to human-AI pair programming teams operating with total context and high execution velocity."*

### Conclusion

By combining deterministic tools with non-deterministic reasoning, modern agents deliver rapid, high-quality full-stack applications.
`;

  const post2Content = `
# Designing Premium UIs: Beyond Generic Components

Creating web applications that leave a lasting first impression requires going beyond basic framework defaults. In this article, we break down key aesthetic principles used in high-end SaaS products.

## 1. Harmonious Color Palettes & Dark Mode

Instead of using raw primary colors like pure blue (#0000FF), modern interfaces employ curated **HSL color spaces** and semi-transparent dark gradients:

- **Glassmorphism**: \`backdrop-filter: blur(16px)\` layered over dynamic background glows.
- **Accented Glows**: Subtle radial gradients around active interactive elements.
- **Typography Scale**: Pairing clean sans-serif fonts like *Inter* or *Outfit* with structured line heights.

\`\`\`css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
\`\`\`

## 2. Micro-Animations

Subtle transitions on hover states, tab shifts, and like counter increments make the UI feel reactive and alive.
`;

  const post3Content = `
# Master Node.js REST API Performance with SQLite & Caching

When building full-stack applications, database integration and response latency can make or break user experience. SQLite offers unmatched simplicity, speed, and zero-latency local disk access.

## Why SQLite for High-Performance REST APIs?

- **Zero Network Overhead**: Embedded directly within the application process.
- **ACID Compliant**: Reliable transaction boundaries for content management systems.
- **Single File Portability**: Effortless deployments and instant local testing.

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/api/posts', async (req, res) => {
  const posts = await dbAll('SELECT * FROM posts WHERE status = ?', ['published']);
  res.json({ posts });
});
\`\`\`

Keep your schemas clean, index foreign key columns, and optimize query payload sizes for fast page loads!
`;

  await dbRun(
    'INSERT INTO posts (title, slug, content, excerpt, cover_image, category, tags, author_id, status, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'The Architecture of Modern Autonomous AI Agents',
      'architecture-of-modern-autonomous-ai-agents',
      post1Content,
      'Explore how modern LLM agents perform iterative planning, tool calls, and self-correction in real-time software development.',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      'AI & Data',
      'AI, Agents, Software Architecture, JavaScript',
      1,
      'published',
      1284
    ]
  );

  await dbRun(
    'INSERT INTO posts (title, slug, content, excerpt, cover_image, category, tags, author_id, status, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'Designing Premium UIs: Beyond Generic Components',
      'designing-premium-uis-beyond-generic-components',
      post2Content,
      'A practical guide to glassmorphism, harmonious color systems, dark mode palettes, and micro-animations for web applications.',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
      'Design',
      'UI/UX, Glassmorphism, CSS, Design Systems',
      2,
      'published',
      942
    ]
  );

  await dbRun(
    'INSERT INTO posts (title, slug, content, excerpt, cover_image, category, tags, author_id, status, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'Master Node.js REST API Performance with SQLite & Caching',
      'master-nodejs-rest-api-performance-with-sqlite',
      post3Content,
      'Learn how to leverage zero-latency SQLite embedded storage and Express middleware to serve high-throughput APIs.',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
      'Development',
      'Node.js, Express, SQLite, Backend',
      3,
      'published',
      615
    ]
  );

  // Draft post for Alex
  await dbRun(
    'INSERT INTO posts (title, slug, content, excerpt, cover_image, category, tags, author_id, status, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'Draft: Exploring Next-Gen Web Assembly & Rust Modules',
      'draft-exploring-next-gen-web-assembly-rust',
      '# Next-Gen WebAssembly\n\nWork in progress draft on compiling Rust to WASM for high performance browser canvas processing...',
      'Work in progress draft on compiling Rust to WASM...',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
      'Technology',
      'Rust, WASM, Performance',
      1,
      'draft',
      0
    ]
  );

  // 4. Seed Likes
  await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [1, 2]);
  await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [1, 3]);
  await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [2, 1]);
  await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [2, 3]);
  await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [3, 1]);

  // 5. Seed Comments & Nested Replies
  await dbRun('INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)', [
    1,
    2,
    null,
    'Fascinating breakdown, Alex! The section on self-correcting error handling loops resonates deeply with our experience.'
  ]);

  await dbRun('INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)', [
    1,
    1,
    1, // reply to comment 1
    'Thanks Maya! Giving models deterministic feedback from terminal logs is key to making autonomous agents reliable.'
  ]);

  await dbRun('INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)', [
    1,
    3,
    null,
    'Great code sample! Are you using JSON schema verification for tool calls or standard regex parsing?'
  ]);

  await dbRun('INSERT INTO comments (post_id, author_id, parent_id, content) VALUES (?, ?, ?, ?)', [
    2,
    1,
    null,
    'The CSS glassmorphism snippet is super clean. Adding a subtle border stroke really elevates the visual depth!'
  ]);

  console.log('Database seeded successfully with users, categories, posts, likes, and comments!');
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = seedData;
