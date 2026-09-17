import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

// ============================================
// Navbar Component
// ============================================
// Shows login/register buttons if not authenticated
// Shows welcome message + logout button if authenticated
// ============================================

function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-brand">
          🏆 AuctionMarketPlace
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          {currentUser ? (
            // Authenticated User
            <div className="navbar-authenticated">
              <span className="welcome-text">
                Welcome, <strong>{currentUser.display_name}</strong>!
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            // Not Authenticated
            <div className="navbar-unauthenticated">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link register-link">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
