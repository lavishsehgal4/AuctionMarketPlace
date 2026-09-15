// Top navigation bar — logo/brand on the left, login/user info on the right.
// Receives currentUser and onLogout as props; no internal state.
// Used by: src/App.jsx

import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar({ currentUser, onLogout }) {
  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="BidVault home">
          <span className={styles.brandIcon} aria-hidden="true">🏷️</span>
          <span className={styles.brandName}>BidVault</span>
        </Link>

        <div className={styles.actions}>
          {currentUser ? (
            <>
              <span className={styles.greeting}>
                Hi, <strong>{currentUser.name.split(' ')[0]}</strong>
                <span className={`${styles.roleBadge} ${styles[currentUser.role]}`}>
                  {currentUser.role}
                </span>
              </span>
              <button className="btn-outline" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
