// Full-page view: shows all active auctions as a responsive grid of AuctionCard components.
// Fetches data from: src/api/auctionsApi.js
// Uses components: src/components/AuctionCard.jsx

import { useState, useEffect } from 'react';
import { getAuctions } from '../api/auctionsApi';
import AuctionCard from '../components/AuctionCard';
import ErrorState from '../components/ErrorState';
import styles from './AuctionListPage.module.css';

const CATEGORIES = ['All', 'Photography', 'Furniture', 'Books', 'Music', 'Watches', 'Art'];

export default function AuctionListPage() {
  const [auctions, setAuctions] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getAuctions()
      .then((data) => {
        if (active) setAuctions(data);
      })
      .catch(() => {
        if (active) setError('We could not load the auctions.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = activeCategory === 'All'
    ? auctions
    : auctions.filter((a) => a.category === activeCategory);

  if (loading) {
    return <div className={styles.empty} aria-live="polite">Loading auctions…</div>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <main>
      {/* Hero banner */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroHeading}>
            Bid on things worth winning.
          </h1>
          <p className={styles.heroSub}>
            Live auctions across art, collectibles, furniture, and more.
          </p>
        </div>
        <div className={styles.heroIllustration} aria-hidden="true">🎯</div>
      </div>

      <div className="page-content">
        {/* Category pills */}
        <div className={styles.categories} role="tablist" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className={styles.resultCount}>
          {filtered.length} active auction{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        </p>

        {/* Cards grid */}
        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span aria-hidden="true">🔍</span>
            <p>No active auctions in this category right now.</p>
          </div>
        )}
      </div>
    </main>
  );
}
