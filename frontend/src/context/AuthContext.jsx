import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const mapRole = (backendRole) => {
    if (backendRole === 'ROLE_CANDIDATE') return 'APPLICANT';
    if (backendRole === 'ROLE_COMPANY') return 'COMPANY';
    return backendRole;
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTheme = localStorage.getItem('theme');

    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      parsedUser.role = mapRole(parsedUser.role);
      setToken(savedToken);
      setUser(parsedUser);
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
    
    const userPayload = { username, id, email, role: mapRole(role), profileId };
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userPayload));
    
    setToken(jwt);
    setUser(userPayload);
    return { ...response.data, role: mapRole(role) };
  };

  const register = async (registerData) => {
    const payload = { ...registerData };
    if (payload.role === 'APPLICANT') payload.role = 'ROLE_CANDIDATE';
    else if (payload.role === 'COMPANY') payload.role = 'ROLE_COMPANY';

    const response = await api.post('/api/auth/register', payload);
    const { token: jwt, id, username, email, role, profileId } = response.data;

    const userPayload = { username, id, email, role: mapRole(role), profileId };
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userPayload));

    setToken(jwt);
    setUser(userPayload);
    return { ...response.data, role: mapRole(role) };
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
