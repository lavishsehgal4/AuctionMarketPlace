// Displays a single auction item as a card (image, title, current bid, time left).
// Receives one auction object as props — does NOT fetch anything itself.
// Used by: src/pages/AuctionListPage.jsx

import { Link } from 'react-router-dom';
import { formatDateTime, formatTimeLeft } from '../utils/time';
import styles from './AuctionCard.module.css';

export default function AuctionCard({ auction, currentUser }) {
  const {
    id,
    status,
    starting_price: startingPrice,
    highest_bid: highestBid,
    bid_count: bidCount,
    start_time: startTime,
    end_time: endTime,
    product,
  } = auction;
  const isLive = status === 'ACTIVE';
  const price = isLive ? (highestBid?.amount ?? 0) : startingPrice;
  const timeLabel = isLive ? formatTimeLeft(endTime) : `Opens ${formatDateTime(startTime)}`;
  const actionLabel = isLive ? (currentUser ? 'View Auction' : 'Sign in to bid') : 'View Auction';

  return (
    <Link to={`/auction/${id}`} className={styles.card} aria-label={`View auction: ${product.title}`}>
      <div className={styles.imageWrap}>
        <img
          src={product.image_url || ''}
          alt={product.title}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.category}>{product.category_name}</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>

        <div className={styles.meta}>
          <div className={styles.bidBlock}>
            <span className={styles.bidLabel}>{isLive ? 'Current bid' : 'Starting price'}</span>
            <span className={styles.bidAmount}>${Number(price).toLocaleString()}</span>
          </div>
          <div className={styles.stats}>
            <span className={styles.statItem}>
              {bidCount} bid{bidCount !== 1 ? 's' : ''}
            </span>
            <span className={`${styles.statItem} ${styles.timer}`}>
              {timeLabel}
            </span>
          </div>
        </div>

        <div className={styles.cta}>
          <span className="btn-cta" style={{ fontSize: '14px', padding: '8px 18px' }}>
            {actionLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
