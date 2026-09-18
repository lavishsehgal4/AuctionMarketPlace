import { Link, NavLink, useNavigate } from 'react-router-dom';
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
        <Link to="/" className="navbar-brand">
          AuctionMarketPlace
        </Link>

        <div className="navbar-links">
          {currentUser ? (
            <div className="navbar-authenticated">
              {currentUser.account_type === 'BIDDER' && (
                <NavLink to="/" className="nav-link">Browse auctions</NavLink>
              )}
              {currentUser.account_type === 'SELLER' && (
                <>
                  <a href="/seller#dashboard" className="nav-link">Dashboard</a>
                  <a href="/seller#products" className="nav-link">My Products</a>
                  <a href="/seller#create-product" className="nav-link">Create Product</a>
                  <a href="/seller#auctions" className="nav-link">My Auctions</a>
                  <a href="/seller#profile" className="nav-link">Profile</a>
                </>
              )}
              <span className="welcome-text">{currentUser.display_name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
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
