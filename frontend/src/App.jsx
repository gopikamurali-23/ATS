import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useRouter } from './context/RouterContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { AtsAnalyzerPage } from './pages/AtsAnalyzerPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ContactPage } from './pages/ContactPage';
import { CandidatePortal } from './components/CandidatePortal';
import { CompanyPortal } from './components/CompanyPortal';
import { AdminPortal } from './components/AdminPortal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AppContent = () => {
  const { user } = useAuth();
  const { currentPage, navigate } = useRouter();
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState('login');

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const renderMainContent = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onOpenAuthModal={handleOpenAuthModal} />;
      
      case 'jobs':
        return <JobsPage onOpenAuthModal={handleOpenAuthModal} />;
      
      case 'analyzer':
        return <AtsAnalyzerPage onOpenAuthModal={handleOpenAuthModal} />;
      
      case 'builder':
        return <ResumeBuilderPage onOpenAuthModal={handleOpenAuthModal} />;
      
      case 'features':
        return <FeaturesPage onOpenAuthModal={handleOpenAuthModal} />;
      
      case 'analytics':
        return <AnalyticsPage onOpenAuthModal={handleOpenAuthModal} />;
      
      case 'contact':
        return <ContactPage onOpenAuthModal={handleOpenAuthModal} />;
      
      case 'portal':
        // Protected Portal View
        if (!user) {
          return (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 my-12 shadow-sm edge-glow-hover">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Authentication Required</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Please sign in to access your role-specific dashboard portal.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => handleOpenAuthModal('login')}
                  className="pill-btn px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleOpenAuthModal('signup')}
                  className="pill-btn px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          );
        }

        // Role-Based Router Separation
        if (user.role === 'ROLE_ADMIN') {
          return (
            <ErrorBoundary title="Admin Portal Error">
              <AdminPortal onBackToHome={() => navigate('/')} />
            </ErrorBoundary>
          );
        } else if (user.role === 'ROLE_COMPANY') {
          return (
            <ErrorBoundary title="Recruiter Suite Error">
              <CompanyPortal onBackToHome={() => navigate('/')} />
            </ErrorBoundary>
          );
        } else if (user.role === 'ROLE_CANDIDATE') {
          return (
            <ErrorBoundary title="Candidate Career Center Error">
              <CandidatePortal onBackToHome={() => navigate('/')} />
            </ErrorBoundary>
          );
        }

        // Fallback Access Control Rejection
        return (
          <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4 my-12 shadow-sm edge-glow-hover">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unauthorized Role Access</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Your account does not have permission to view this portal area.
            </p>
            <button
              onClick={() => navigate('/')}
              className="pill-btn px-5 py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </button>
          </div>
        );

      default:
        return <HomePage onOpenAuthModal={handleOpenAuthModal} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 flex flex-col antialiased transition-colors duration-200">
      
      {/* Top Header */}
      <Navbar
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderMainContent()}
      </main>

      {/* Footer Component */}
      <Footer
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Global Auth & Verification Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onRoleSelected={() => navigate('/portal')}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
