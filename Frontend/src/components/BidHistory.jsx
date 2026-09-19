// Shows the list of past bids on a single auction (bidder name, amount, time).
// Receives bids array as props — does NOT fetch anything itself.
// Used by: src/pages/AuctionDetailPage.jsx

import styles from './BidHistory.module.css';

export default function BidHistory({ bids }) {
  if (!bids || bids.length === 0) {
    return (
      <div className={styles.empty}>
        <span aria-hidden="true">💬</span>
        <p>No bids yet. Be the first!</p>
      </div>
    );
  }

  // Show most recent first
  const sorted = [...bids].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt));

  return (
    <div className={styles.wrap}>
      <h3 className={styles.heading}>Bid history</h3>
      <ul className={styles.list} aria-label="Bid history">
        {sorted.map((bid, i) => {
          const initials = bid.bidderName.split(/\s+/).filter(Boolean).slice(0, 2).map((name) => name[0]).join('').toUpperCase();
          return (
          <li key={bid.id} className={`${styles.item} ${i === 0 ? styles.topBid : ''}`}>
            <div className={styles.left}>
              <span className={`${styles.avatar} ${styles[`avatarTone${i % 5}`]}`} aria-hidden="true">
                {initials}
              </span>
              <div>
                <span className={styles.name}>{bid.bidderName}</span>
                <span className={styles.time}>
                  {new Date(bid.placedAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
            <span className={styles.amount}>${bid.amount.toLocaleString()}</span>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
