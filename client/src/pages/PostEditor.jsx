import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Image, 
  Save, 
  Send, 
  Eye, 
  Edit3, 
  Sparkles, 
  Check, 
  Tag, 
  Folder
} from 'lucide-react';

const COVER_PRESETS = [
  { label: 'Technology', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80' },
  { label: 'AI & Data', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Design', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Code', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80' },
  { label: 'Minimalist', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&auto=format&fit=crop&q=80' }
];

export const PostEditor = ({ initialPost, onCancel, onSuccess }) => {
  const { authHeader } = useAuth();
  const isEditing = Boolean(initialPost && initialPost.id);

  const [formData, setFormData] = useState({
    title: initialPost?.title || '',
    category: initialPost?.category || 'Technology',
    tags: initialPost?.tags || '',
    cover_image: initialPost?.cover_image || COVER_PRESETS[0].url,
    excerpt: initialPost?.excerpt || '',
    content: initialPost?.content || '',
    status: initialPost?.status || 'published'
  });

  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error(err));
  }, []);

  const handleSave = async (statusToSave) => {
    if (!formData.title.trim()) {
      setError('Article title is required.');
      return;
    }
    if (!formData.content.trim()) {
      setError('Article content cannot be empty.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload = {
        ...formData,
        status: statusToSave || formData.status,
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...'
      };

      const url = isEditing ? `/api/posts/${initialPost.id}` : '/api/posts';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article.');

      onSuccess(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Render simple markdown into formatted HTML
  const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>');

    return `<p>${html}</p>`;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Action Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <button 
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={18} /> Cancel
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="btn-secondary"
          >
            <Save size={16} /> Save as Draft
          </button>
          <button 
            onClick={() => handleSave('published')}
            disabled={saving}
            className="btn-primary"
          >
            <Send size={16} /> {saving ? 'Publishing...' : (isEditing ? 'Update Article' : 'Publish Story')}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          fontSize: '0.88rem',
          marginBottom: '1.5rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Studio Form */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', background: 'var(--bg-secondary)' }}>
        {/* Title */}
        <input 
          type="text"
          placeholder="Article Title..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={{
            width: '100%',
            fontSize: '2.2rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            background: 'none',
            border: 'none',
            borderBottom: '2px solid var(--border-color)',
            outline: 'none',
            color: 'var(--text-main)',
            paddingBottom: '0.6rem',
            marginBottom: '1.5rem'
          }}
        />

        {/* Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.2rem',
          marginBottom: '1.5rem'
        }}>
          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              <Folder size={14} style={{ display: 'inline', marginRight: '4px' }} /> Category
            </label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
            >
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} /> Tags (comma separated)
            </label>
            <input 
              type="text"
              placeholder="React, JavaScript, WebDev"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* Cover Image Selector */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <Image size={14} style={{ display: 'inline', marginRight: '4px' }} /> Cover Image URL
          </label>
          <input 
            type="text"
            placeholder="https://images.unsplash.com/..."
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            className="input-field"
            style={{ marginBottom: '0.6rem' }}
          />
          {/* Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
            {COVER_PRESETS.map((preset, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => setFormData({ ...formData, cover_image: preset.url })}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: formData.cover_image === preset.url ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: formData.cover_image === preset.url ? '#fff' : 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cover Preview */}
        {formData.cover_image && (
          <div style={{
            height: '180px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1.8rem',
            border: '1px solid var(--border-color)'
          }}>
            <img 
              src={formData.cover_image} 
              alt="Cover Preview" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}

        {/* Excerpt */}
        <div style={{ marginBottom: '1.8rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Short Summary / Excerpt
          </label>
          <textarea 
            rows="2"
            placeholder="A brief 1-2 sentence hook for the feed summary..."
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="input-field"
            style={{ resize: 'none' }}
          />
        </div>

        {/* Editor Tabs: Write vs Live Preview */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem'
        }}>
          <button 
            onClick={() => setActiveTab('write')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'write' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'write' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Edit3 size={14} /> Write Markdown
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'preview' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'preview' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Eye size={14} /> Live Formatted Preview
          </button>
        </div>

        {activeTab === 'write' ? (
          <div>
            <textarea 
              rows="14"
              placeholder="Write story content using Markdown syntax (# Headings, **bold**, `code`, > blockquotes)..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-field"
              style={{ fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.6 }}
            />
          </div>
        ) : (
          <div 
            className="markdown-body"
            style={{
              minHeight: '300px',
              padding: '1.2rem',
              borderRadius: '12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content || '_No content written yet._') }}
          />
        )}
      </div>
    </div>
  );
};
