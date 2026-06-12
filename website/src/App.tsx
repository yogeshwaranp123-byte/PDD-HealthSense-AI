import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Predict } from './pages/Predict';
import { Result } from './pages/Result';
import { History } from './pages/History';
import { Chat } from './pages/Chat';
import { Hospitals } from './pages/Hospitals';
import { Profile } from './pages/Profile';
import { useAuthStore } from './store/authStore';

// Layout wrapper to conditionally show headers and footers based on current path
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  const showHeader = !['/login', '/register'].includes(path);
  const showFooter = !['/login', '/register', '/chat'].includes(path);

  // Auto-scroll to top on navigation change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="page-container">
      {showHeader && <Header />}
      <main className="content-wrap">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Initial authentication session verification
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/predict"
            element={
              <ProtectedRoute>
                <Predict />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:id"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute>
                <Hospitals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
