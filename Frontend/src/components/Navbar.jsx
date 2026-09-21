import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getNotifications } from '../api/notificationsApi';
import './Navbar.css';

// ============================================
// Navbar Component
// ============================================
// Shows login/register buttons if not authenticated
// Shows welcome message + logout button if authenticated
// ============================================

function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }
    let isCurrent = true;
    const loadUnreadCount = () => getNotifications({ page: 1, limit: 1, unread_only: true })
      .then((result) => isCurrent && setUnreadCount(result.unread_count || 0))
      .catch(() => isCurrent && setUnreadCount(0));
    loadUnreadCount();
    const interval = window.setInterval(loadUnreadCount, 45000);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
    };
  }, [currentUser]);

  const handleLogout = async () => {
    await onLogout();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    navigate('/');
  };

  const initials = currentUser?.display_name?.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const sellerLinks = [
    { to: '/seller', label: 'Overview' },
    { to: '/seller/products', label: 'Products' },
    { to: '/seller/auctions', label: 'Auctions' },
    { to: '/seller/profile', label: 'Public profile' },
  ];
  const links = currentUser?.account_type === 'SELLER' ? sellerLinks : [{ to: '/auctions', label: 'Browse auctions' }, { to: '/auctioneers', label: 'Auctioneers' }, { to: '/bid-history', label: 'My bids' }];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          AuctionMarketPlace
        </Link>

        <div className="navbar-links">
          {currentUser ? (
            <div className="navbar-authenticated">
              <div className="desktop-nav">{links.map((link) => <NavLink key={link.to} to={link.to} className="nav-link">{link.label}</NavLink>)}</div>
              <NavLink to="/notifications" className="notification-button" aria-label="Open notifications">Notifications{unreadCount > 0 ? <span>{unreadCount > 99 ? '99+' : unreadCount}</span> : null}</NavLink>
              <div className="profile-menu"><button className="avatar-button" type="button" onClick={() => setIsProfileOpen((open) => !open)} aria-expanded={isProfileOpen} aria-label="Open account menu">{currentUser.avatar_url ? <img src={currentUser.avatar_url} alt="" /> : initials}</button>{isProfileOpen ? <div className="profile-dropdown"><strong>{currentUser.display_name}</strong><small>{currentUser.account_type === 'SELLER' ? 'Seller account' : 'Bidder account'}</small>{currentUser.account_type === 'SELLER' ? <NavLink to="/seller/profile" onClick={() => setIsProfileOpen(false)}>Public profile</NavLink> : null}<button type="button" onClick={handleLogout}>Logout</button></div> : null}</div>
              <button className="menu-button" type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-expanded={isMenuOpen} aria-label="Open navigation"><i /><i /><i /></button>
            </div>
          ) : (
            <div className="navbar-unauthenticated">
              <Link to="/login" className="guest-login-link">
                Login
              </Link>
              <Link to="/register" className="guest-register-link">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      {currentUser && isMenuOpen ? <div className="mobile-drawer"><div>{links.map((link) => <NavLink key={link.to} to={link.to} className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>{link.label}</NavLink>)}<NavLink to="/notifications" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>Notifications{unreadCount > 0 ? <span>{unreadCount}</span> : null}</NavLink></div><button type="button" onClick={handleLogout}>Logout</button></div> : null}
    </nav>
  );
}

export default Navbar;
