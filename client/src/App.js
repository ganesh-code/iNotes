import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { PageProvider } from './context/PageContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import SearchModal from './components/common/SearchModal';
import './index.css';

// Lazy-loaded pages
const WorkspacePage = lazy(() => import('./components/pages/WorkspacePage'));
const PageView = lazy(() => import('./components/pages/PageView'));
const TrashPage = lazy(() => import('./components/pages/TrashPage'));
const SettingsPage = lazy(() => import('./components/pages/SettingsPage'));
const Login = lazy(() => import('./components/auth/Login'));
const Signup = lazy(() => import('./components/auth/Signup'));

function AppLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', gap: '12px' }}>
      <div style={{ fontSize: '28px' }}>✨</div>
      <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Loading iNotes…</span>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  return user ? <Navigate to="/" replace /> : children;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();

  // Apply and listen for theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const savedTheme = user?.preferences?.theme; // 'light', 'dark', or 'system'

      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // 'system' or loading (undefined) — follow OS
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    applyTheme();

    // Listen for OS theme changes
    const handler = () => applyTheme();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [user?.preferences?.theme]);


  // Cmd+K / Ctrl+K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <WorkspaceProvider>
      <PageProvider>
        <div className="app-layout">
          <Sidebar
            collapsed={!sidebarOpen}
            onToggle={() => setSidebarOpen(false)}
            onSearchOpen={() => setSearchOpen(true)}
          />

          {/* Sidebar open button when collapsed */}
          {!sidebarOpen && (
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              →
            </button>
          )}

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: 0 }}>
            <Topbar
              onToggleSidebar={() => setSidebarOpen(prev => !prev)}
              onSearchOpen={() => setSearchOpen(true)}
            />

            <Suspense fallback={<AppLoader />}>
              <Routes>
                <Route path="/" element={<WorkspacePage />} />
                <Route path="/page/:pageId" element={<PageView />} />
                <Route path="/trash" element={<TrashPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </div>

          {searchOpen && (
            <SearchModal onClose={() => setSearchOpen(false)} />
          )}
        </div>
      </PageProvider>
    </WorkspaceProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              borderRadius: '8px',
            },
          }}
        />
        <Suspense fallback={<AppLoader />}>
          <Routes>
            {/* Auth routes (no sidebar) */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

            {/* App routes (with sidebar) */}
            <Route path="/*" element={<PrivateRoute><AppLayout /></PrivateRoute>} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
