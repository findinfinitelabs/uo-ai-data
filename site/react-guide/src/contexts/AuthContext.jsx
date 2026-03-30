import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

// Course access code - change this each term
const VALID_ACCESS_CODES = [
  'UO-HEALTH-AI-2026',
  'LUNDQUIST-BA453-W26',
];

const AUTH_STORAGE_KEY = 'uo-course-auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        // Check if auth is still valid (within 90 days)
        const expiresAt = new Date(authData.expiresAt);
        if (expiresAt > new Date()) {
          setUser(authData);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signInWithCode = async (accessCode, studentName) => {
    setError(null);

    // Validate the access code (case-insensitive)
    const isValidCode = VALID_ACCESS_CODES.some(
      (code) => code.toLowerCase() === accessCode.trim().toLowerCase(),
    );

    if (!isValidCode) {
      setError('Invalid access code. Please check with your instructor.');
      return { error: { message: 'Invalid access code' } };
    }

    if (!studentName || studentName.trim().length < 2) {
      setError('Please enter your name.');
      return { error: { message: 'Name required' } };
    }

    // Create session (expires in 90 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const authData = {
      name: studentName.trim(),
      accessCode: accessCode.trim().toUpperCase(),
      authenticatedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Store in localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setUser(authData);

    return { data: authData };
  };

  const signOut = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signInWithCode,
    signOut,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
