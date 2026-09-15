// Displays a single auction item as a card (image, title, current bid, time left).
// Receives one auction object as props — does NOT fetch anything itself.
// Used by: src/pages/AuctionListPage.jsx

import { Link } from 'react-router-dom';
import { formatTimeLeft } from '../utils/time';
import styles from './AuctionCard.module.css';

export default function AuctionCard({ auction }) {
  const {
    id,
    title,
    images,
    currentBid,
    bidCount,
    endTime,
    category,
  } = auction;

  const timeLeft = formatTimeLeft(endTime);

  return (
    <Link to={`/auction/${id}`} className={styles.card} aria-label={`View auction: ${title}`}>
      <div className={styles.imageWrap}>
        <img
          src={images[0]}
          alt={title}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.category}>{category}</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.meta}>
          <div className={styles.bidBlock}>
            <span className={styles.bidLabel}>Current bid</span>
            <span className={styles.bidAmount}>${currentBid.toLocaleString()}</span>
          </div>
          <div className={styles.stats}>
            <span className={styles.statItem}>
              <span aria-hidden="true">🔨</span> {bidCount} bid{bidCount !== 1 ? 's' : ''}
            </span>
            <span className={`${styles.statItem} ${styles.timer}`}>
              <span aria-hidden="true">⏱</span> {timeLeft}
            </span>
          </div>
        </div>

        <div className={styles.cta}>
          <span className="btn-cta" style={{ fontSize: '14px', padding: '8px 18px' }}>
            Place Bid
          </span>
        </div>
      </div>
    </Link>
  );
}
