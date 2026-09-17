import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Reply, Edit2, Trash2, Send, CornerDownRight, User } from 'lucide-react';

const CommentItem = ({ comment, postId, onAddReply, onEditComment, onDeleteComment }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const isAuthor = user && user.id === comment.author_id;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await onAddReply(comment.id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    await onEditComment(comment.id, editText);
    setIsEditing(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      marginTop: '1.2rem',
      paddingLeft: comment.parent_id ? '1.5rem' : '0',
      borderLeft: comment.parent_id ? '2px solid var(--border-color)' : 'none'
    }}>
      <div className="glass-panel" style={{
        padding: '1.1rem',
        borderRadius: '14px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Comment Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img 
              src={comment.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author_name}`} 
              alt={comment.author_name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {comment.author_name}
                {isAuthor && <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>You</span>}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {formatDate(comment.created_at)}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {user && (
              <button 
                onClick={() => setIsReplying(!isReplying)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px'
                }}
              >
                <Reply size={14} /> Reply
              </button>
            )}

            {isAuthor && (
              <>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.2rem 0.4rem'
                  }}
                  title="Edit Comment"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => onDeleteComment(comment.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '0.2rem 0.4rem'
                  }}
                  title="Delete Comment"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comment Body or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit} style={{ marginTop: '0.6rem' }}>
            <textarea 
              rows="2"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="input-field"
              style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                Save Edit
              </button>
            </div>
          </form>
        ) : (
          <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {comment.content}
          </p>
        )}

        {/* Reply Form */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <CornerDownRight size={14} /> Replying to {comment.author_name}
            </div>
            <textarea 
              rows="2"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="input-field"
              style={{ marginBottom: '0.5rem', fontSize: '0.88rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsReplying(false)} className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                <Send size={12} /> Post Reply
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recursive Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: '0.4rem' }}>
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              onAddReply={onAddReply}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSection = ({ postId, comments, onAddComment, onEditComment, onDeleteComment, onOpenAuthModal }) => {
  const { user } = useAuth();
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRootSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(null, newCommentText);
      setNewCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <MessageSquare size={22} className="gradient-text" /> 
          Comments ({comments ? comments.length : 0})
        </h3>
      </div>

      {/* Post New Comment Box */}
      {user ? (
        <form onSubmit={handleRootSubmit} className="glass-panel" style={{ padding: '1.2rem', borderRadius: '16px', marginBottom: '2rem', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <img 
              src={user.avatar_url} 
              alt={user.username}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Leave a response as {user.username}</span>
          </div>
          <textarea 
            rows="3"
            placeholder="Share your thoughts on this article..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="input-field"
            style={{ marginBottom: '0.8rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={submitting || !newCommentText.trim()} className="btn-primary">
              <Send size={16} /> {submitting ? 'Posting...' : 'Publish Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderRadius: '16px', marginBottom: '2rem', background: 'var(--bg-tertiary)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
            Want to join the conversation? Sign in to post a comment or reply.
          </p>
          <button onClick={onOpenAuthModal} className="btn-primary">
            Sign In to Comment
          </button>
        </div>
      )}

      {/* Comment List */}
      {comments && comments.length > 0 ? (
        <div>
          {comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={postId}
              onAddReply={onAddComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          💬 No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </section>
  );
};
