// Root component — sets up routing and holds the fake-auth state.
// Renders Navbar on every route; routes by role after fake login.

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import AuctionListPage from './pages/AuctionListPage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CreateAuctionPage from './pages/CreateAuctionPage';

function RequireAuth({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ currentUser, role, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'seller' ? '/seller' : '/auctions'} replace />;
  }
  return children;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  function handleLogin(user) {
    setCurrentUser(user);
  }

  function handleLogout() {
    setCurrentUser(null);
  }

  return (
    <BrowserRouter>
      <Navbar currentUser={currentUser} onLogout={handleLogout} />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Bidder routes */}
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

        {/* Seller routes */}
        <Route
          path="/seller"
          element={
            <RequireRole currentUser={currentUser} role="seller">
              <CreateAuctionPage currentUser={currentUser} />
            </RequireRole>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            currentUser
              ? <Navigate to={currentUser.role === 'seller' ? '/seller' : '/auctions'} replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
