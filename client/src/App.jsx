import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HomeFeed } from './pages/HomeFeed';
import { PostDetail } from './pages/PostDetail';
import { PostEditor } from './pages/PostEditor';
import { Dashboard } from './pages/Dashboard';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('feed'); // 'feed' | 'detail' | 'editor' | 'dashboard'
  const [selectedPostIdentifier, setSelectedPostIdentifier] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Navigate to post detail
  const handleSelectPost = (identifier) => {
    if (identifier === 'create') {
      if (!user) {
        setAuthModalOpen(true);
        return;
      }
      setEditingPost(null);
      setCurrentTab('editor');
    } else {
      setSelectedPostIdentifier(identifier);
      setCurrentTab('detail');
    }
  };

  // Navigate to editor for existing post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setCurrentTab('editor');
  };

  // On successful publish/edit
  const handleEditorSuccess = (post) => {
    setSelectedPostIdentifier(post.slug || post.id);
    setCurrentTab('detail');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if ((tab === 'editor' || tab === 'dashboard') && !user) {
            setAuthModalOpen(true);
            return;
          }
          if (tab === 'editor') setEditingPost(null);
          setCurrentTab(tab);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        {currentTab === 'feed' && (
          <HomeFeed 
            searchQuery={searchQuery}
            onSelectPost={handleSelectPost}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            user={user}
          />
        )}

        {currentTab === 'detail' && selectedPostIdentifier && (
          <PostDetail 
            identifier={selectedPostIdentifier}
            onBack={() => setCurrentTab('feed')}
            onEditPost={handleEditPost}
            onOpenAuthModal={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'editor' && (
          <PostEditor 
            initialPost={editingPost}
            onCancel={() => setCurrentTab(editingPost ? 'detail' : 'feed')}
            onSuccess={handleEditorSuccess}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard 
            onSelectPost={handleSelectPost}
            onEditPost={handleEditPost}
            onCreatePost={() => {
              setEditingPost(null);
              setCurrentTab('editor');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.88rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            © {new Date().getFullYear()} <strong>PulseBlog</strong>. Full-Stack Blogging Platform.
          </div>
          <div style={{ display: 'flex', gap: '1.2rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('feed')}>Feed</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setAuthModalOpen(true)}>Sign In</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
