import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  Heart, 
  MessageSquare, 
  BookOpen, 
  PenSquare, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Clock, 
  BarChart3,
  FileText
} from 'lucide-react';

export const Dashboard = ({ onSelectPost, onEditPost, onCreatePost }) => {
  const { user, authHeader } = useAuth();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'drafts'
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch author stats
      const statsRes = await fetch('/api/stats', { headers: authHeader });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch user's posts
      const postsRes = await fetch(`/api/posts?author_id=${user.id}&status=all`, { headers: authHeader });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: authHeader
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(p => activeTab === 'published' ? p.status === 'published' : p.status === 'draft');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src={user.avatar_url} 
            alt={user.username}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {user.username}'s Author Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Manage your published stories, draft ideas, and audience engagement metrics.
            </p>
          </div>
        </div>

        <button onClick={onCreatePost} className="btn-primary">
          <PenSquare size={18} /> Create New Story
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '18px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Views</span>
            <Eye size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats ? stats.totalViews : 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '18px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ef4444', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Likes</span>
            <Heart size={20} fill="#ef4444" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats ? stats.totalLikes : 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '18px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#8b5cf6', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Comments</span>
            <MessageSquare size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats ? stats.totalComments : 0}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '18px', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Articles</span>
            <BookOpen size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats ? stats.totalPosts : 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        <button 
          onClick={() => setActiveTab('published')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'published' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'published' ? 'var(--accent-primary)' : 'var(--text-muted)',
            padding: '0.5rem 0.8rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <CheckCircle size={16} /> Published ({stats ? stats.publishedCount : 0})
        </button>
        <button 
          onClick={() => setActiveTab('drafts')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'drafts' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            color: activeTab === 'drafts' ? 'var(--accent-primary)' : 'var(--text-muted)',
            padding: '0.5rem 0.8rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Clock size={16} /> Drafts ({stats ? stats.draftCount : 0})
        </button>
      </div>

      {/* Articles List Table / Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading dashboard content...
        </div>
      ) : filteredPosts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredPosts.map(post => (
            <div 
              key={post.id}
              className="glass-panel"
              style={{
                padding: '1.2rem 1.5rem',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background: 'var(--bg-secondary)'
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                  <span className="badge">{post.category}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 
                  onClick={() => onSelectPost(post.slug || post.id)}
                  style={{ fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-main)' }}
                >
                  {post.title}
                </h3>
              </div>

              {/* Stats & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Eye size={14} /> {post.views}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Heart size={14} /> {post.like_count}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MessageSquare size={14} /> {post.comment_count}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={() => onSelectPost(post.slug || post.id)}
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    View
                  </button>
                  <button 
                    onClick={() => onEditPost(post)}
                    className="btn-icon"
                    title="Edit Story"
                    style={{ width: '34px', height: '34px' }}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="btn-icon"
                    title="Delete Story"
                    style={{ width: '34px', height: '34px', color: '#ef4444' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', borderRadius: '18px' }}>
          <FileText size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }} />
          <h3>No {activeTab} articles</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            {activeTab === 'published' ? 'Start sharing your knowledge by writing a new article.' : 'Drafts saved during writing will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
};
