import React, { useState, useEffect } from 'react';
import { PostCard } from '../components/PostCard';
import { Sparkles, TrendingUp, Flame, Clock, Filter, Layers, RefreshCw } from 'lucide-react';

export const HomeFeed = ({ searchQuery, onSelectPost, onOpenAuthModal, user }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('latest'); // 'latest' | 'popular' | 'likes'
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Fetch posts when search, category, or sort changes
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.append('search', searchQuery);
        if (selectedCategory && selectedCategory !== 'All') queryParams.append('category', selectedCategory);
        if (sortOption) queryParams.append('sort', sortOption);

        const res = await fetch(`/api/posts?${queryParams.toString()}`);
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Error fetching posts feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, selectedCategory, sortOption]);

  const featuredPost = posts.length > 0 ? posts[0] : null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Hero Section */}
      {!searchQuery && selectedCategory === 'All' && featuredPost && (
        <section className="glass-panel" style={{
          marginBottom: '3rem',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center'
          }}>
            <div style={{ padding: '2.5rem 2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }} className="badge">
                <Sparkles size={14} /> Featured Article
              </div>
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                marginBottom: '1rem',
                lineHeight: 1.25,
                fontFamily: 'var(--font-heading)'
              }}>
                {featuredPost.title}
              </h1>
              <p style={{
                fontSize: '1rem',
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                lineHeight: 1.6
              }}>
                {featuredPost.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => onSelectPost(featuredPost.slug || featuredPost.id)}
                  className="btn-primary"
                >
                  Read Full Story
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <img 
                    src={featuredPost.author_avatar} 
                    alt={featuredPost.author_name} 
                    style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                  />
                  <span>By <strong>{featuredPost.author_name}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ height: '340px', width: '100%', overflow: 'hidden' }}>
              <img 
                src={featuredPost.cover_image} 
                alt={featuredPost.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Filter Pills & Sorting Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setSelectedCategory('All')}
            className={selectedCategory === 'All' ? 'btn-primary' : 'btn-secondary'}
            style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            All Topics
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={selectedCategory === cat.name ? 'btn-primary' : 'btn-secondary'}
              style={{ borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={() => setSortOption('latest')}
            style={{
              background: sortOption === 'latest' ? 'var(--bg-secondary)' : 'transparent',
              border: sortOption === 'latest' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              color: sortOption === 'latest' ? 'var(--accent-primary)' : 'var(--text-muted)',
              padding: '0.4rem 0.8rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Clock size={14} /> Latest
          </button>
          <button 
            onClick={() => setSortOption('popular')}
            style={{
              background: sortOption === 'popular' ? 'var(--bg-secondary)' : 'transparent',
              border: sortOption === 'popular' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              color: sortOption === 'popular' ? 'var(--accent-primary)' : 'var(--text-muted)',
              padding: '0.4rem 0.8rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <TrendingUp size={14} /> Popular
          </button>
          <button 
            onClick={() => setSortOption('likes')}
            style={{
              background: sortOption === 'likes' ? 'var(--bg-secondary)' : 'transparent',
              border: sortOption === 'likes' ? '1px solid var(--accent-primary)' : '1px solid transparent',
              color: sortOption === 'likes' ? 'var(--accent-primary)' : 'var(--text-muted)',
              padding: '0.4rem 0.8rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Flame size={14} /> Most Liked
          </button>
        </div>
      </div>

      {/* Search Header Info */}
      {searchQuery && (
        <div style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Search results for "<strong style={{ color: 'var(--text-main)' }}>{searchQuery}</strong>":
        </div>
      )}

      {/* Main Post Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ marginBottom: '0.8rem' }} />
          <div>Loading articles...</div>
        </div>
      ) : posts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.8rem'
        }}>
          {posts.map(post => (
            <PostCard key={post.id} post={post} onSelectPost={onSelectPost} />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: '24px' }}>
          <Layers size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No articles found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchQuery ? 'Try clearing your search query or switching categories.' : 'Be the first author to publish an article in this topic!'}
          </p>
          {user ? (
            <button onClick={() => onSelectPost('create')} className="btn-primary">
              Write New Post
            </button>
          ) : (
            <button onClick={onOpenAuthModal} className="btn-primary">
              Sign In to Write
            </button>
          )}
        </div>
      )}
    </div>
  );
};
