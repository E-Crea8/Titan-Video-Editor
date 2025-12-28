import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { isDemoMode } from '@/lib/supabase';

// Pages
import LandingPage from '@/pages/LandingPage';
import EditorPage from '@/pages/EditorPage';
import AuthPage from '@/pages/AuthPage';
import AuthCallback from '@/pages/AuthCallback';
import AdminPage from '@/pages/AdminPage';

// Components
import LoadingScreen from '@/components/ui/LoadingScreen';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  const { initialize, isLoading: authLoading } = useAuthStore();
  const { setIsMobile } = useUIStore();

  // Initialize auth on mount
  useEffect(() => {
    if (!isDemoMode()) {
      initialize();
    }
  }, [initialize]);

  // Handle responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // Show loading screen while initializing auth (only if not demo mode)
  if (!isDemoMode() && authLoading) {
    return <LoadingScreen message="Initializing Titan Video Editor..." />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected Routes - Editor requires auth in production, works in demo mode */}
      <Route
        path="/editor"
        element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Route */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

