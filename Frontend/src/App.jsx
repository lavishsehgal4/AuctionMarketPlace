// Root component — sets up routing and manages authentication state.
// Handles login/logout with backend API and token management.

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BidderHomePage from './pages/BidderHomePage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import SellerAuctionDetailPage from './pages/SellerAuctionDetailPage';
import { logoutUser } from './api/authApi';
import socket from './api/socket';

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
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

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

  useEffect(() => {
    if (!currentUser) {
      socket.disconnect();
      return undefined;
    }

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

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

        <Route
          path="/auctions"
          element={<BidderHomePage currentUser={currentUser} />}
        />
        <Route
          path="/auction/:id"
          element={<AuctionDetailPage currentUser={currentUser} />}
        />

        <Route
          path="/seller"
          element={
            <RequireAuth currentUser={currentUser}>
              <SellerDashboardPage currentUser={currentUser} />
            </RequireAuth>
          }
        />
        <Route
          path="/seller/auctions/:id"
          element={
            <RequireAuth currentUser={currentUser}>
              <SellerAuctionDetailPage />
            </RequireAuth>
          }
        />

        <Route
          path="/"
          element={
            currentUser?.account_type === 'BIDDER' ? (
              <BidderHomePage currentUser={currentUser} />
            ) : currentUser?.account_type === 'SELLER' ? (
              <Navigate to="/seller" replace />
            ) : (
              <BidderHomePage currentUser={currentUser} />
            )
          }
        />

        {/* 404 and catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
