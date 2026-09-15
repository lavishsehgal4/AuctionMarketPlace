// Full-page view: shows one auction's full details, bid history, and the bid form.
// Fetches data from: src/api/auctionsApi.js, src/api/bidsApi.js
// Uses components: src/components/BidForm.jsx, src/components/BidHistory.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuctionById } from '../api/auctionsApi';
import { getBidsByAuctionId } from '../api/bidsApi';
import BidForm from '../components/BidForm';
import BidHistory from '../components/BidHistory';
import { formatTimeLeft, formatDateTime } from '../utils/time';
import styles from './AuctionDetailPage.module.css';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAuctionById(id), getBidsByAuctionId(id)]).then(
      ([auctionData, bidsData]) => {
        setAuction(auctionData);
        setBids(bidsData);
        setLoading(false);
      }
    );
  }, [id]);

  if (loading) {
    return <div className={styles.loading} aria-live="polite">Loading auction…</div>;
  }

  if (!auction) {
    return (
      <div className={styles.notFound}>
        <span aria-hidden="true">🔍</span>
        <h2>Auction not found</h2>
        <Link to="/auctions" className="btn-primary">Back to listings</Link>
      </div>
    );
  }

  const timeLeft = formatTimeLeft(auction.endTime);

  return (
    <main className="page-content">
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link to="/auctions">All Auctions</Link>
        <span aria-hidden="true"> / </span>
        <span>{auction.title}</span>
      </nav>

      <div className={styles.layout}>
        {/* Left — image + description */}
        <div className={styles.left}>
          <div className={styles.imageWrap}>
            <img
              src={auction.images[0]}
              alt={auction.title}
              className={styles.image}
            />
            <span className={styles.categoryBadge}>{auction.category}</span>
          </div>

          <div className={styles.descCard}>
            <h2 className={styles.descHeading}>About this item</h2>
            <p className={styles.description}>{auction.description}</p>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Starting price</span>
                <span className={styles.metaValue}>${auction.startingPrice.toLocaleString()}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Min. increment</span>
                <span className={styles.metaValue}>${auction.minBidIncrement.toLocaleString()}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Started</span>
                <span className={styles.metaValue}>{formatDateTime(auction.startTime)}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Ends</span>
                <span className={styles.metaValue}>{formatDateTime(auction.endTime)}</span>
              </div>
            </div>
          </div>

          {/* Bid history below image on desktop */}
          <div className={styles.historyDesktop}>
            <BidHistory bids={bids} />
          </div>
        </div>

        {/* Right — bid panel + stats */}
        <div className={styles.right}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{auction.title}</h1>
            <div className={styles.statusRow}>
              <span className={styles.statusBadge}>● Live</span>
              <span className={styles.timer}>⏱ {timeLeft}</span>
            </div>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total bids</span>
              <span className={styles.statValue}>{auction.bidCount}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Status</span>
              <span className={styles.statValue} style={{ textTransform: 'capitalize' }}>{auction.status}</span>
            </div>
          </div>

          <BidForm auction={auction} />

          {/* Bid history on mobile below the form */}
          <div className={styles.historyMobile}>
            <BidHistory bids={bids} />
          </div>
        </div>
      </div>
    </main>
  );
}
