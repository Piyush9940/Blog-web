import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('blog_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Invalid or expired token
          logout();
        }
      } catch (err) {
        console.error('Error verifying token:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('blog_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password, bio, avatar_url) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, bio, avatar_url })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    localStorage.setItem('blog_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('blog_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (bio, avatar_url) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ bio, avatar_url })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    setUser(data.user);
    return data.user;
  };

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
