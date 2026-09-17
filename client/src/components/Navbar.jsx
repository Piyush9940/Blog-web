import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sparkles, 
  Search, 
  PenSquare, 
  LayoutDashboard, 
  LogOut, 
  Sun, 
  Moon, 
  User,
  LogIn,
  BookOpen
} from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, searchQuery, setSearchQuery, onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.8rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('feed')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={20} />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-main)'
          }}>
            Pulse<span className="gradient-text">Blog</span>
          </span>
        </div>

        {/* Global Search Bar */}
        <div style={{
          flex: '1',
          maxWidth: '400px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)'
          }} />
          <input 
            type="text"
            placeholder="Search articles, tags, authors..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentTab !== 'feed') setCurrentTab('feed');
            }}
            className="input-field"
            style={{
              paddingLeft: '38px',
              paddingRight: searchQuery ? '32px' : '12px',
              height: '40px',
              fontSize: '0.9rem'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Navigation & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => setCurrentTab('feed')}
            className={currentTab === 'feed' ? 'btn-primary' : 'btn-secondary'}
            style={{ height: '40px', fontSize: '0.88rem' }}
          >
            <BookOpen size={16} />
            <span className="hide-mobile">Feed</span>
          </button>

          {user && (
            <>
              <button 
                onClick={() => setCurrentTab('editor')}
                className={currentTab === 'editor' ? 'btn-primary' : 'btn-secondary'}
                style={{ height: '40px', fontSize: '0.88rem' }}
              >
                <PenSquare size={16} />
                <span className="hide-mobile">Write</span>
              </button>

              <button 
                onClick={() => setCurrentTab('dashboard')}
                className={currentTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}
                style={{ height: '40px', fontSize: '0.88rem' }}
              >
                <LayoutDashboard size={16} />
                <span className="hide-mobile">Dashboard</span>
              </button>
            </>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="btn-icon"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile / Auth Action */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)'
                }}
              >
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
                  }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </span>
              </div>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  width: '200px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.5rem',
                  zIndex: 100
                }}>
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>

                  <button 
                    onClick={() => {
                      setCurrentTab('dashboard');
                      setDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-main)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.88rem'
                    }}
                  >
                    <LayoutDashboard size={15} /> My Dashboard
                  </button>

                  <button 
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      setCurrentTab('feed');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.88rem',
                      marginTop: '0.2rem'
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onOpenAuthModal}
              className="btn-primary"
              style={{ height: '40px', fontSize: '0.88rem' }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
