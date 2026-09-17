const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, 'data');
const dbFilePath = path.resolve(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbData = {
  users: [],
  categories: [],
  posts: [],
  comments: [],
  likes: [],
  nextId: {
    users: 1,
    categories: 1,
    posts: 1,
    comments: 1,
    likes: 1
  }
};

const loadDb = () => {
  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      dbData = JSON.parse(content);
    } catch (e) {
      console.error('Error reading db file, using default structure', e);
    }
  }
};

const saveDb = () => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving db file:', e);
  }
};

// Initial load
loadDb();

const initDb = async () => {
  loadDb();
  console.log('JSON Database loaded successfully.');
};

// Helper query runner matching SQL signatures for simple integration
const dbGet = async (sql, params = []) => {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim();

  // User queries
  if (normalizedSql.includes('FROM users WHERE email = ? OR username = ?')) {
    const [email, username] = params;
    return dbData.users.find(u => u.email === email || u.username === username);
  }
  if (normalizedSql.includes('FROM users WHERE email = ?')) {
    const [email] = params;
    return dbData.users.find(u => u.email === email);
  }
  if (normalizedSql.includes('FROM users WHERE username = ?')) {
    const [username] = params;
    return dbData.users.find(u => u.username === username);
  }
  if (normalizedSql.includes('FROM users WHERE id = ?')) {
    const [id] = params;
    const u = dbData.users.find(u => u.id === Number(id));
    if (!u) return null;
    const { password_hash, ...userWithoutPassword } = u;
    return userWithoutPassword;
  }

  // Category queries
  if (normalizedSql.includes('FROM categories WHERE slug = ?')) {
    const [slug] = params;
    return dbData.categories.find(c => c.slug === slug);
  }

  // Post queries
  if (normalizedSql.includes('FROM posts WHERE slug = ?')) {
    const [slug] = params;
    const p = dbData.posts.find(post => post.slug === slug);
    if (!p) return null;
    const author = dbData.users.find(u => u.id === p.author_id) || {};
    const like_count = dbData.likes.filter(l => l.post_id === p.id).length;
    const comment_count = dbData.comments.filter(c => c.post_id === p.id).length;
    return {
      ...p,
      author_name: author.username || 'Anonymous',
      author_avatar: author.avatar_url || '',
      author_bio: author.bio || '',
      like_count,
      comment_count
    };
  }

  if (normalizedSql.includes('FROM posts WHERE id = ?')) {
    const [id] = params;
    const p = dbData.posts.find(post => post.id === Number(id));
    if (!p) return null;
    const author = dbData.users.find(u => u.id === p.author_id) || {};
    const like_count = dbData.likes.filter(l => l.post_id === p.id).length;
    const comment_count = dbData.comments.filter(c => c.post_id === p.id).length;
    return {
      ...p,
      author_name: author.username || 'Anonymous',
      author_avatar: author.avatar_url || '',
      author_bio: author.bio || '',
      like_count,
      comment_count
    };
  }

  // Like check
  if (normalizedSql.includes('FROM likes WHERE post_id = ? AND user_id = ?')) {
    const [post_id, user_id] = params;
    return dbData.likes.find(l => l.post_id === Number(post_id) && l.user_id === Number(user_id));
  }

  // Comment check
  if (normalizedSql.includes('FROM comments WHERE id = ?')) {
    const [id] = params;
    return dbData.comments.find(c => c.id === Number(id));
  }

  return null;
};

const dbAll = async (sql, params = []) => {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim();

  if (normalizedSql.includes('FROM categories')) {
    return dbData.categories;
  }

  if (normalizedSql.includes('FROM comments')) {
    // Expected params: [postId]
    const postId = Number(params[0]);
    const postComments = dbData.comments.filter(c => c.post_id === postId);
    return postComments.map(c => {
      const author = dbData.users.find(u => u.id === c.author_id) || {};
      return {
        ...c,
        author_name: author.username || 'Anonymous',
        author_avatar: author.avatar_url || ''
      };
    });
  }

  return [];
};

const dbRun = async (sql, params = []) => {
  const normalizedSql = sql.replace(/\s+/g, ' ').trim();

  // Users insert
  if (normalizedSql.startsWith('INSERT INTO users')) {
    const [username, email, password_hash, avatar_url, bio] = params;
    const id = dbData.nextId.users++;
    const newUser = {
      id,
      username,
      email,
      password_hash,
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      bio: bio || 'Passionate writer and reader.',
      role: 'user',
      created_at: new Date().toISOString()
    };
    dbData.users.push(newUser);
    saveDb();
    return { lastID: id, changes: 1 };
  }

  // User profile update
  if (normalizedSql.startsWith('UPDATE users SET bio')) {
    const [bio, avatar_url, id] = params;
    const user = dbData.users.find(u => u.id === Number(id));
    if (user) {
      if (bio !== undefined && bio !== null) user.bio = bio;
      if (avatar_url !== undefined && avatar_url !== null) user.avatar_url = avatar_url;
      saveDb();
    }
    return { changes: 1 };
  }

  // Category insert
  if (normalizedSql.startsWith('INSERT INTO categories')) {
    const [name, slug, description, color] = params;
    const id = dbData.nextId.categories++;
    const cat = { id, name, slug, description, color };
    dbData.categories.push(cat);
    saveDb();
    return { lastID: id, changes: 1 };
  }

  // Post insert
  if (normalizedSql.startsWith('INSERT INTO posts')) {
    const [title, slug, content, excerpt, cover_image, category, tags, author_id, status] = params;
    const id = dbData.nextId.posts++;
    const newPost = {
      id,
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      cover_image: cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
      category: category || 'Technology',
      tags: tags || '',
      author_id: Number(author_id),
      status: status || 'published',
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbData.posts.push(newPost);
    saveDb();
    return { lastID: id, changes: 1 };
  }

  // Post update
  if (normalizedSql.startsWith('UPDATE posts SET title')) {
    const [title, slug, content, excerpt, cover_image, category, tags, status, id] = params;
    const post = dbData.posts.find(p => p.id === Number(id));
    if (post) {
      post.title = title;
      post.slug = slug;
      post.content = content;
      post.excerpt = excerpt || content.substring(0, 150) + '...';
      post.cover_image = cover_image;
      post.category = category;
      post.tags = tags;
      post.status = status;
      post.updated_at = new Date().toISOString();
      saveDb();
    }
    return { changes: 1 };
  }

  // Post views increment
  if (normalizedSql.includes('UPDATE posts SET views = views + 1')) {
    const [id] = params;
    const post = dbData.posts.find(p => p.id === Number(id));
    if (post) {
      post.views = (post.views || 0) + 1;
      saveDb();
    }
    return { changes: 1 };
  }

  // Post delete
  if (normalizedSql.startsWith('DELETE FROM posts')) {
    const [id] = params;
    const numId = Number(id);
    dbData.posts = dbData.posts.filter(p => p.id !== numId);
    dbData.comments = dbData.comments.filter(c => c.post_id !== numId);
    dbData.likes = dbData.likes.filter(l => l.post_id !== numId);
    saveDb();
    return { changes: 1 };
  }

  // Like insert
  if (normalizedSql.startsWith('INSERT INTO likes')) {
    const [post_id, user_id] = params;
    const id = dbData.nextId.likes++;
    const newLike = {
      id,
      post_id: Number(post_id),
      user_id: Number(user_id),
      created_at: new Date().toISOString()
    };
    dbData.likes.push(newLike);
    saveDb();
    return { lastID: id, changes: 1 };
  }

  // Like delete
  if (normalizedSql.startsWith('DELETE FROM likes')) {
    const [post_id, user_id] = params;
    dbData.likes = dbData.likes.filter(l => !(l.post_id === Number(post_id) && l.user_id === Number(user_id)));
    saveDb();
    return { changes: 1 };
  }

  // Comment insert
  if (normalizedSql.startsWith('INSERT INTO comments')) {
    const [post_id, author_id, parent_id, content] = params;
    const id = dbData.nextId.comments++;
    const newComment = {
      id,
      post_id: Number(post_id),
      author_id: Number(author_id),
      parent_id: parent_id ? Number(parent_id) : null,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dbData.comments.push(newComment);
    saveDb();
    return { lastID: id, changes: 1 };
  }

  // Comment update
  if (normalizedSql.startsWith('UPDATE comments SET content')) {
    const [content, id] = params;
    const comment = dbData.comments.find(c => c.id === Number(id));
    if (comment) {
      comment.content = content;
      comment.updated_at = new Date().toISOString();
      saveDb();
    }
    return { changes: 1 };
  }

  // Comment delete
  if (normalizedSql.startsWith('DELETE FROM comments')) {
    const [id] = params;
    const numId = Number(id);
    // Recursively remove replies too
    const removeCommentAndChildren = (targetId) => {
      const children = dbData.comments.filter(c => c.parent_id === targetId);
      children.forEach(ch => removeCommentAndChildren(ch.id));
      dbData.comments = dbData.comments.filter(c => c.id !== targetId);
    };
    removeCommentAndChildren(numId);
    saveDb();
    return { changes: 1 };
  }

  return { changes: 0 };
};

// Export raw db data accessor for custom filtering (e.g. search, pagination)
const getRawData = () => dbData;

module.exports = {
  dbGet,
  dbAll,
  dbRun,
  initDb,
  getRawData
};
