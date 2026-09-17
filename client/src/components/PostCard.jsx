import React from 'react';
import { Eye, Heart, MessageSquare, Clock, ArrowRight } from 'lucide-react';

export const PostCard = ({ post, onSelectPost }) => {
  // Estimate reading time based on word count (~200 words/min)
  const calculateReadingTime = (text) => {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div 
      onClick={() => onSelectPost(post.slug || post.id)}
      className="glass-panel glass-panel-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Cover Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        overflow: 'hidden',
        background: 'var(--bg-tertiary)'
      }}>
        <img 
          src={post.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80'} 
          alt={post.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        
        {/* Category Badge overlay */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 2
        }}>
          <span className="badge" style={{ backdropFilter: 'blur(8px)' }}>
            {post.category}
          </span>
        </div>

        {/* Draft Tag if draft */}
        {post.status === 'draft' && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '8px'
          }}>
            DRAFT
          </div>
        )}
      </div>

      {/* Content Body */}
      <div style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}>
        {/* Date and Reading Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginBottom: '0.6rem'
        }}>
          <span>{formatDate(post.created_at)}</span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={12} /> {calculateReadingTime(post.content)}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          marginBottom: '0.6rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.35
        }}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          marginBottom: '1.2rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {post.excerpt}
        </p>

        {/* Footer: Author Info & Metrics */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'auto'
        }}>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img 
              src={post.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author_name}`} 
              alt={post.author_name}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>
              {post.author_name}
            </span>
          </div>

          {/* Social Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Views">
              <Eye size={14} /> {post.views || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: post.user_liked ? '#ef4444' : 'inherit' }} title="Likes">
              <Heart size={14} fill={post.user_liked ? '#ef4444' : 'none'} /> {post.like_count || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Comments">
              <MessageSquare size={14} /> {post.comment_count || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
