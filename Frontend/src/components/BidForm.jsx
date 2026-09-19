// Form to place a bid on an auction — display only in MVP, no real submission.
// Calls: src/api/bidsApi.js (no-op in this phase).
// Used by: src/pages/AuctionDetailPage.jsx

import { useState } from 'react';
import socket from '../api/socket';
import styles from './BidForm.module.css';

export default function BidForm({ auction, onBidPlaced }) {
  const { currentBid, startingPrice, minBidIncrement } = auction;
  const minNext = (currentBid > 0 ? currentBid : startingPrice) + minBidIncrement;

  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function submitBid(value) {
    const bidAmount = Number(value);
    setError('');
    if (!socket.connected) {
      setError('Auction connection is unavailable. Please wait and try again.');
      return;
    }

    socket.emit('placeBid', { auctionId: auction.id, amount: bidAmount }, (result) => {
      if (!result?.success) {
        setError(result?.message || 'Unable to place bid.');
        return;
      }

      setSubmitted(true);
      setAmount('');
      onBidPlaced?.(result);
      window.setTimeout(() => setSubmitted(false), 3000);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitBid(amount);
  }

  function submitMinimumBid() {
    submitBid(minNext);
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
          Bid accepted. You are now the highest bidder.
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
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${minNext} or more`}
              aria-label={`Your bid amount, minimum $${minNext}`}
              className={styles.input}
            />
          </div>
          <p className={styles.hint}>
            Enter ${minNext.toLocaleString()} or more to outbid the current leader.
          </p>
          <button type="button" className={styles.quickBid} onClick={submitMinimumBid}>
            Bid ${minNext.toLocaleString()} now
          </button>
          <button type="submit" className={`btn-cta ${styles.submitBtn}`}>
            🔨 Place Bid
          </button>
          <button type="button" className={`btn-outline ${styles.watchBtn}`}>
            ♡ Watch this auction
          </button>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
