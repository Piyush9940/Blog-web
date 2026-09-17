import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData.username, formData.email, formData.password, formData.bio);
      } else {
        await login(formData.email, formData.password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email) => {
    setError('');
    setLoading(true);
    try {
      await login(email, 'password123');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2rem',
        position: 'relative',
        background: 'var(--bg-secondary)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'var(--bg-tertiary)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--accent-gradient)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
          }}>
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isRegister ? 'Join PulseBlog' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isRegister ? 'Create an account to start publishing and engaging' : 'Sign in to access your dashboard and write stories'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Quick Demo Login Buttons */}
        {!isRegister && (
          <div style={{ marginBottom: '1.2rem', background: 'var(--bg-tertiary)', padding: '0.8rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              ⚡ One-Click Demo Accounts:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
              <button 
                type="button"
                onClick={() => handleDemoLogin('alex@example.com')}
                style={{
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer'
                }}
              >
                Alex (Tech)
              </button>
              <button 
                type="button"
                onClick={() => handleDemoLogin('maya@example.com')}
                style={{
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--accent-secondary)',
                  cursor: 'pointer'
                }}
              >
                Maya (UX)
              </button>
              <button 
                type="button"
                onClick={() => handleDemoLogin('chris@example.com')}
                style={{
                  padding: '0.4rem 0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: '#10b981',
                  cursor: 'pointer'
                }}
              >
                Chris (Dev)
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  required
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Short Bio (Optional)
              </label>
              <textarea 
                rows="2"
                placeholder="Software engineer and tech enthusiast..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field"
                style={{ resize: 'none' }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', height: '44px' }}
          >
            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isRegister ? 'Sign In' : 'Register now'}
          </button>
        </div>
      </div>
    </div>
  );
};
