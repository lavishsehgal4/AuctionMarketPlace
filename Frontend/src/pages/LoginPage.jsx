// Login page — fake credential login using fakeUsers.json.
// No real auth; matches email+password against dummy data and routes by role.
// Used by: src/App.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFakeUsers, findUserByCredentials } from '../api/usersApi';
import styles from './LoginPage.module.css';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fakeUsers, setFakeUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getFakeUsers().then(setFakeUsers);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const user = await findUserByCredentials(email, password);
    if (!user) {
      setError('Invalid email or password. Try one of the demo accounts below.');
      return;
    }
    onLogin(user);
    navigate(user.role === 'seller' ? '/seller' : '/auctions');
  }

  function fillAccount(user) {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon} aria-hidden="true">🏷️</span>
          <h1 className={styles.title}>Sign in to BidVault</h1>
          <p className={styles.subtitle}>Use a demo account below to explore the app.</p>
        </div>

        {/* Demo accounts hint */}
        <div className={styles.demoBox} aria-label="Available demo accounts">
          <p className={styles.demoLabel}>Demo accounts — click to fill:</p>
          <div className={styles.demoList}>
            {fakeUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`${styles.demoChip} ${styles[u.role]}`}
                onClick={() => fillAccount(u)}
                aria-label={`Fill credentials for ${u.name} (${u.role})`}
              >
                <span className={styles.chipRole}>{u.role}</span>
                <span className={styles.chipName}>{u.name}</span>
                <span className={styles.chipEmail}>{u.email}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice@demo.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. seller123"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
