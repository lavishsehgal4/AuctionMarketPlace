// Root component — sets up routing and manages authentication state.
// Handles login/logout with backend API and token management.

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuctionListPage from './pages/AuctionListPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import { logoutUser } from './api/authApi';

// ============================================
// Auth Guard Components
// ============================================

/**
 * RequireAuth - Redirect to login if not authenticated
 */
function RequireAuth({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

/**
 * RedirectIfAuth - Redirect to home if already authenticated
 */
function RedirectIfAuth({ currentUser, children }) {
  if (currentUser) return <Navigate to="/" replace />;
  return children;
}

/**
 * App - Root component
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is still logged in on app load
  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Handle login - store user data
   */
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  /**
   * Handle logout - clear user data and call backend
   */
  const handleLogout = async () => {
    try {
      // Call logout API to invalidate refresh token on backend
      await logoutUser();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      // Clear local state and storage regardless
      setCurrentUser(null);
      localStorage.removeItem('user');
      // Redirect handled by Navbar
    }
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Navbar currentUser={currentUser} onLogout={handleLogout} />
      <Routes>
        {/* Auth Routes - Only accessible if NOT logged in */}
        <Route
          path="/login"
          element={
            <RedirectIfAuth currentUser={currentUser}>
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth currentUser={currentUser}>
              <RegisterPage onLoginSuccess={handleLoginSuccess} />
            </RedirectIfAuth>
          }
        />

        {/* Bidder Routes - Require authentication */}
        <Route
          path="/auctions"
          element={
            <RequireAuth currentUser={currentUser}>
              <AuctionListPage currentUser={currentUser} />
            </RequireAuth>
          }
        />
        <Route
          path="/auction/:id"
          element={
            <RequireAuth currentUser={currentUser}>
              <AuctionDetailPage currentUser={currentUser} />
            </RequireAuth>
          }
        />

        {/* Seller Routes - Require authentication */}
        <Route
          path="/seller"
          element={
            <RequireAuth currentUser={currentUser}>
              <CreateAuctionPage currentUser={currentUser} />
            </RequireAuth>
          }
        />

        {/* Home Page */}
        <Route
          path="/"
          element={
            currentUser ? (
              <div style={{ padding: '2rem', textAlign: 'center', minHeight: '80vh' }}>
                <h1>Welcome to AuctionMarketPlace!</h1>
                <p>Logged in as: <strong>{currentUser.display_name}</strong></p>
                <div style={{ marginTop: '2rem' }}>
                  <p>You can now browse and bid on auctions or create your own listings.</p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', minHeight: '80vh' }}>
                <h1>Welcome to AuctionMarketPlace!</h1>
                <p>Please login or register to get started.</p>
              </div>
            )
          }
        />

        {/* 404 and catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
