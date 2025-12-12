import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Role hierarchy levels
  const ROLE_LEVELS = {
    user: 1,
    operator: 2,
    administrator: 3
  };

  // Check if user has a specific role or higher (hierarchical)
  const hasRole = (requiredRole) => {
    if (!user || !user.role) return false;
    const userLevel = ROLE_LEVELS[user.role] || 0;
    const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
    return userLevel >= requiredLevel;
  };

  // Check if user is administrator
  const isAdmin = () => {
    return user?.role === 'administrator';
  };

  // Check if user is operator or higher
  const isOperator = () => {
    return hasRole('operator');
  };

  // Check if user is authenticated (any role)
  const isUser = () => {
    return !!user;
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    hasRole,
    isAdmin,
    isOperator,
    isUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
