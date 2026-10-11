import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, signupApi, getMeApi } from '../api/auth.api';
import { getStoredToken, storeToken, clearStoredToken } from '../api/token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  // Initialize auth from stored token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const userData = await getMeApi();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          clearStoredToken();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, remember = true) => {
    const res = await loginApi(email, password);
    storeToken(res.token, remember);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const signup = async (data, remember = true) => {
    const res = await signupApi(data);
    storeToken(res.token, remember);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = async () => {
    try {
      const updated = await getMeApi();
      setUser(updated);
      return updated;
    } catch (err) {
      console.warn('Failed to refresh user:', err);
      return null;
    }
  };

  const getDefaultRouteForRole = (role) => {
    switch (role) {
      case 'Student':
        return '/student/recommendations';
      case 'IndustryPartner':
        return '/partner/postings';
      case 'OJTCoordinator':
        return '/coordinator/dashboard';
      case 'SchoolAdministrator':
        return '/admin/users';
      default:
        return '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
        getDefaultRouteForRole
      }}
    >
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
