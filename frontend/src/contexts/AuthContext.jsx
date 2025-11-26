// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import { Logger } from '../utils/helpers';

/**
 * Authentication Context for managing user state and auth operations
 */
const AuthContext = createContext();

/**
 * Authentication Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    Logger.info(`Logout: ${user?.email || 'Unknown user'}`);
    setUser(null);
    setToken(null);
    setError('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, [user?.email]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => setError(''), []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          Logger.info('User session restored from storage');
        }
      } catch (error) {
        Logger.error('Failed to initialize auth:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  /**
   * Login user with email and password
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      Logger.info(`Login attempt for: ${email}`);

      const response = await authService.login(email, password);
      
      if (response.success) {
        const { user: userData, token: authToken } = response.data;
        
        setUser(userData);
        setToken(authToken);
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        Logger.info(`Login successful: ${userData.email} (${userData.role})`);
        return { success: true };
      } else {
        setError(response.message || 'Login failed');
        Logger.warn(`Login failed: ${response.message}`);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'An error occurred during login';
      setError(errorMsg);
      Logger.error('Login error:', error);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new customer
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError('');
      Logger.info(`Registration attempt for: ${userData.email}`);

      const response = await authService.register(userData);
      
      if (response.success) {
        Logger.info(`Registration successful: ${userData.email}`);
        return { success: true };
      } else {
        setError(response.message || 'Registration failed');
        Logger.warn(`Registration failed: ${response.message}`);
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'An error occurred during registration';
      setError(errorMsg);
      Logger.error('Registration error:', error);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isSales: user?.role === 'sales',
    isCustomer: user?.role === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;