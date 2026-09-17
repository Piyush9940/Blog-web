import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from '../components/CommentSection';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Edit3, 
  Trash2, 
  Tag, 
  Check,
  UserCheck
} from 'lucide-react';

export const PostDetail = ({ identifier, onBack, onEditPost, onOpenAuthModal }) => {
  const { user, authHeader } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Fetch post details & comments
  useEffect(() => {
    const fetchPostAndComments = async () => {
      setLoading(true);
      try {
        const headers = user ? authHeader : {};
        const postRes = await fetch(`/api/posts/${identifier}`, { headers });
        if (!postRes.ok) throw new Error('Post not found');
        const postData = await postRes.json();
        
        setPost(postData.post);
        setLiked(Boolean(postData.post.user_liked));
        setLikeCount(postData.post.like_count || 0);

        // Fetch comments
        const commentsRes = await fetch(`/api/posts/${postData.post.id}/comments`);
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      } catch (err) {
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [identifier, user]);

  // Toggle Like
  const handleToggleLike = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }

    const prevLiked = liked;
    const prevCount = likeCount;

    // Optimistic UI update
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const method = prevLiked ? 'DELETE' : 'POST';
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method,
        headers: authHeader
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.like_count);
    } catch (err) {
      // Rollback on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  // Add Comment or Reply
  const handleAddComment = async (parentId, content) => {
    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify({ parent_id: parentId, content })
    });

    if (!res.ok) throw new Error('Failed to post comment');
    
    // Refresh comments tree
    const commentsRes = await fetch(`/api/posts/${post.id}/comments`);
    const commentsData = await commentsRes.json();
    setComments(commentsData.comments || []);
  };

  // Edit Comment
  const handleEditComment = async (commentId, content) => {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify({ content })
    });

    if (!res.ok) throw new Error('Failed to edit comment');

    const commentsRes = await fetch(`/api/posts/${post.id}/comments`);
    const commentsData = await commentsRes.json();
    setComments(commentsData.comments || []);
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: authHeader
    });

    if (!res.ok) throw new Error('Failed to delete comment');

    const commentsRes = await fetch(`/api/posts/${post.id}/comments`);
    const commentsData = await commentsRes.json();
    setComments(commentsData.comments || []);
  };

  // Delete Post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: authHeader
      });
      if (res.ok) {
        onBack();
      }
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  // Copy share URL
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render simple markdown into formatted HTML
  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      // Headings
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Paragraph breaks
      .replace(/\n\n/g, '</p><p>');

    return `<p>${html}</p>`;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading article details...
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Article Not Found</h2>
        <button onClick={onBack} className="btn-primary" style={{ marginTop: '1rem' }}>
          Back to Feed
        </button>
      </div>
    );
  }

  const isAuthor = user && (user.id === post.author_id || user.role === 'admin');

  return (
    <article style={{ maxWidth: '840px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Back button */}
      <button 
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={18} /> Back to Articles
      </button>

      {/* Header Info */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <span className="badge">{post.category}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Published on {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-heading)'
        }}>
          {post.title}
        </h1>

        {/* Author Bar & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img 
              src={post.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author_name}`} 
              alt={post.author_name} 
              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{post.author_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Eye size={13} /> {post.views} views</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Like Button */}
            <button 
              onClick={handleToggleLike}
              className={liked ? 'btn-primary' : 'btn-secondary'}
              style={{
                borderRadius: '20px',
                padding: '0.5rem 1.1rem',
                fontSize: '0.88rem',
                background: liked ? 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)' : undefined,
                boxShadow: liked ? '0 4px 14px rgba(239, 68, 68, 0.4)' : undefined
              }}
            >
              <Heart size={16} fill={liked ? '#fff' : 'none'} className={liked ? 'animate-pulse-heart' : ''} /> 
              <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            {/* Share Button */}
            <button onClick={handleShare} className="btn-icon" title="Share link">
              {copied ? <Check size={18} style={{ color: '#10b981' }} /> : <Share2 size={18} />}
            </button>

            {/* Edit/Delete if Author */}
            {isAuthor && (
              <>
                <button onClick={() => onEditPost(post)} className="btn-icon" title="Edit Article">
                  <Edit3 size={18} />
                </button>
                <button onClick={handleDeletePost} className="btn-icon" title="Delete Article" style={{ color: '#ef4444' }}>
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image Banner */}
      {post.cover_image && (
        <div style={{
          width: '100%',
          maxHeight: '420px',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <img 
            src={post.cover_image} 
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Article Body Content */}
      <div 
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        style={{ marginBottom: '2.5rem' }}
      />

      {/* Tags list */}
      {post.tags && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <Tag size={16} style={{ color: 'var(--text-muted)' }} />
          {post.tags.split(',').map((tag, idx) => (
            <span key={idx} className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Author Bio Box */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '1.2rem',
        marginBottom: '3rem',
        background: 'var(--bg-secondary)'
      }}>
        <img 
          src={post.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author_name}`} 
          alt={post.author_name} 
          style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Written by {post.author_name}
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {post.author_bio || 'Passionate contributor sharing insights on software, design, and digital innovation.'}
          </p>
        </div>
      </div>

      {/* Comment Section */}
      <CommentSection 
        postId={post.id}
        comments={comments}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onOpenAuthModal={onOpenAuthModal}
      />
    </article>
  );
};
