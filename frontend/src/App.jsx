import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import JobBrowse from './pages/JobBrowse';
import JobDetails from './pages/JobDetails';
import CandidateDashboard from './pages/CandidateDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import JobManagement from './pages/JobManagement';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  // Redirect root path based on user role
  const getRootRedirect = () => {
    if (!user) return <Navigate to="/jobs" replace />;
    if (user.role === 'ROLE_CANDIDATE') return <Navigate to="/candidate" replace />;
    if (user.role === 'ROLE_COMPANY') return <Navigate to="/company" replace />;
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    return <Navigate to="/jobs" replace />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-250">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={getRootRedirect()} />
          <Route path="/login" element={user ? getRootRedirect() : <Login />} />
          <Route path="/register" element={user ? getRootRedirect() : <Register />} />
          <Route path="/jobs" element={<JobBrowse />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Candidate Dashboard */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRoles={['ROLE_CANDIDATE']}>
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          {/* Company Portal */}
          <Route
            path="/company"
            element={
              <ProtectedRoute allowedRoles={['ROLE_COMPANY']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute allowedRoles={['ROLE_COMPANY']}>
                <JobManagement />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
