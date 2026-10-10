import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
