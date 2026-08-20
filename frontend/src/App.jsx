import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import ApplicantLogin from './pages/ApplicantLogin';
import CompanyLogin from './pages/CompanyLogin';
import ApplicantRegister from './pages/ApplicantRegister';
import CompanyRegister from './pages/CompanyRegister';

import JobBrowse from './pages/JobBrowse';
import JobDetails from './pages/JobDetails';

import CandidateDashboard from './pages/CandidateDashboard';
import ApplicantResume from './pages/ApplicantResume';
import ApplicantApplications from './pages/ApplicantApplications';
import ApplicantProfile from './pages/ApplicantProfile';

import CompanyDashboard from './pages/CompanyDashboard';
import CompanyCandidates from './pages/CompanyCandidates';
import CompanyAnalytics from './pages/CompanyAnalytics';
import CompanyProfile from './pages/CompanyProfile';
import JobManagement from './pages/JobManagement';

import AdminDashboard from './pages/AdminDashboard';
import AiResumeBuilder from './pages/AiResumeBuilder';
import InterviewManagement from './pages/InterviewManagement';
import AiInterviewPrep from './pages/AiInterviewPrep';
import ChatSystem from './pages/ChatSystem';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  // Redirect logic for users navigating to home or login pages
  const getRootRedirect = () => {
    if (!user) return <LandingPage />;
    if (user.role === 'APPLICANT') return <Navigate to="/applicant/dashboard" replace />;
    if (user.role === 'COMPANY') return <Navigate to="/company/dashboard" replace />;
    if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" replace />;
    return <LandingPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex">
        {user && <Sidebar />}
        <main className="flex-1 overflow-x-hidden p-6 md:p-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={getRootRedirect()} />
            <Route path="/applicant/login" element={user ? getRootRedirect() : <ApplicantLogin />} />
            <Route path="/applicant/register" element={user ? getRootRedirect() : <ApplicantRegister />} />
            <Route path="/company/login" element={user ? getRootRedirect() : <CompanyLogin />} />
            <Route path="/company/register" element={user ? getRootRedirect() : <CompanyRegister />} />

            {/* Protected Applicant Routes */}
            <Route
              path="/applicant/dashboard"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/jobs"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <JobBrowse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/jobs/:id"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <JobDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/resume"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <ApplicantResume />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/applications"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <ApplicantApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/profile"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <ApplicantProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/resume-builder"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <AiResumeBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/interviews"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <InterviewManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/interview-prep"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <AiInterviewPrep />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applicant/messages"
              element={
                <ProtectedRoute allowedRoles={['APPLICANT']}>
                  <ChatSystem />
                </ProtectedRoute>
              }
            />

            {/* Protected Company Routes */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute allowedRoles={['COMPANY']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/jobs"
              element={
                <ProtectedRoute allowedRoles={['COMPANY']}>
                  <JobManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/candidates"
              element={
                <ProtectedRoute allowedRoles={['COMPANY']}>
                  <CompanyCandidates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/analytics"
              element={
                <ProtectedRoute allowedRoles={['COMPANY']}>
                  <CompanyAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/profile"
              element={
                <ProtectedRoute allowedRoles={['COMPANY']}>
                  <CompanyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/messages"
              element={
                <ProtectedRoute allowedRoles={['COMPANY']}>
                  <ChatSystem />
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

            {/* Legacy redirect logic & Fallback */}
            <Route path="/login" element={<Navigate to="/applicant/login" replace />} />
            <Route path="/register" element={<Navigate to="/applicant/register" replace />} />
            <Route path="/jobs" element={<Navigate to="/applicant/jobs" replace />} />
            <Route path="/jobs/:id" element={<Navigate to={`/applicant/jobs/${window.location.pathname.split('/').pop()}`} replace />} />
            <Route path="/candidate" element={<Navigate to="/applicant/dashboard" replace />} />

            {/* Fallback to Root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
