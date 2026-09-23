import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext();

// Map route paths to normalized page keys
export const ROUTE_MAP = {
  '/': 'home',
  '/home': 'home',
  '/jobs': 'jobs',
  '/analyzer': 'analyzer',
  '/builder': 'builder',
  '/features': 'features',
  '/analytics': 'analytics',
  '/contact': 'contact',
  '/portal': 'portal'
};

export const RouterProvider = ({ children }) => {
  const getPath = () => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    return path;
  };

  const [currentPath, setCurrentPath] = useState(getPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized === '' ? '/' : normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = ROUTE_MAP[currentPath] || 'home';

  return (
    <RouterContext.Provider value={{ currentPath, currentPage, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
