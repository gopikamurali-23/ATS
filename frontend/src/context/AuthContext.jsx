import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTheme = localStorage.getItem('theme');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    setLoading(false);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    const { token: jwt, id, email, role, profileId } = response.data;
    
    const userPayload = { username, id, email, role, profileId };
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userPayload));
    
    setToken(jwt);
    setUser(userPayload);
    return response.data;
  };

  const register = async (registerData) => {
    const response = await api.post('/api/auth/register', registerData);
    const { token: jwt, id, username, email, role, profileId } = response.data;

    const userPayload = { username, id, email, role, profileId };
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userPayload));

    setToken(jwt);
    setUser(userPayload);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, darkMode, toggleDarkMode }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
