import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('talentpulse_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (identifier, password, expectedRole) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(identifier, password, expectedRole);
      localStorage.setItem('talentpulse_token', res.token);
      localStorage.setItem('talentpulse_user', JSON.stringify(res));
      setUser(res);
      return res;
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(userData);
      localStorage.setItem('talentpulse_token', res.token);
      localStorage.setItem('talentpulse_user', JSON.stringify(res));
      setUser(res);
      return res;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = async (roleType) => {
    if (roleType === 'candidate') {
      return login('john.doe@example.com', 'john123', 'ROLE_CANDIDATE');
    } else if (roleType === 'company' || roleType === 'recruiter') {
      return login('careers@google.com', 'google123', 'ROLE_COMPANY');
    } else if (roleType === 'admin') {
      return login('admin@talentpulse.io', 'admin123', 'ROLE_ADMIN');
    }
  };

  const logout = () => {
    localStorage.removeItem('talentpulse_token');
    localStorage.removeItem('talentpulse_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginAsDemo, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
