import React, { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const TOKEN_KEY = 'openrewards_token';
const USER_KEY = 'openrewards_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (token, nextUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const register = useCallback(async (email, password) => {
    const response = await authAPI.register(email, password);
    persist(response.data.data.token, response.data.data.user);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login(email, password);
    persist(response.data.data.token, response.data.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = { user, isAuthenticated: !!user, register, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
