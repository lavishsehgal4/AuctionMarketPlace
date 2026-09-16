// Form to place a bid on an auction — display only in MVP, no real submission.
// Calls: src/api/bidsApi.js (no-op in this phase).
// Used by: src/pages/AuctionDetailPage.jsx

import { useState } from 'react';
import styles from './BidForm.module.css';

export default function BidForm({ auction }) {
  const { currentBid, minBidIncrement } = auction;
  const minNext = currentBid + minBidIncrement;

  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!amount || !Number.isFinite(numericAmount) || numericAmount < minNext) {
      setError(`Enter a valid bid of at least $${minNext.toLocaleString()}.`);
      return;
    }

    setError('');
    // MVP: no real submission — just show confirmation state
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setAmount('');
  }

  return (
    <div className={styles.wrap}>
      <h3 className={styles.heading}>Place your bid</h3>

      <div className={styles.currentBidRow}>
        <div>
          <span className={styles.label}>Current bid</span>
          <span className={styles.currentBid}>${currentBid.toLocaleString()}</span>
        </div>
        <div>
          <span className={styles.label}>Min. increment</span>
          <span className={styles.increment}>+${minBidIncrement.toLocaleString()}</span>
        </div>
      </div>

      {submitted ? (
        <div className={styles.success} role="status">
          ✅ Bid submitted! (This is a demo — no real bid was placed.)
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputRow}>
            <span className={styles.currencyPrefix}>$</span>
            <input
              type="number"
              min={minNext}
              step={minBidIncrement}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder={`${minNext} or more`}
              aria-label={`Your bid amount, minimum $${minNext}`}
              className={styles.input}
            />
          </div>
          <p className={styles.hint}>
            Enter ${minNext.toLocaleString()} or more to outbid the current leader.
          </p>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={`btn-cta ${styles.submitBtn}`}>
            🔨 Place Bid
          </button>
          <button type="button" className={`btn-outline ${styles.watchBtn}`}>
            ♡ Watch this auction
          </button>
        </form>
      )}
    </div>
  );
}
