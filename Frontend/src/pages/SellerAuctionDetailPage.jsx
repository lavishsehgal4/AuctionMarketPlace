import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cancelAuction, getMyAuctionDetail } from '../api/auctionsApi';
import AuctionRoomStatus from '../components/AuctionRoomStatus';
import useAuctionRoom from '../hooks/useAuctionRoom';
import { formatDateTime, formatTimeLeft } from '../utils/time';
import styles from './SellerAuctionDetailPage.module.css';

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;

export default function SellerAuctionDetailPage({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [now, setNow] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const roomStatus = useAuctionRoom(id, currentUser);

  useEffect(() => {
    getMyAuctionDetail(id)
      .then((loadedAuction) => {
        setAuction(loadedAuction);
        setSelectedImage(loadedAuction.product.primary_image);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    const refreshAuction = window.setInterval(() => {
      getMyAuctionDetail(id).then(setAuction).catch(() => {});
    }, 10000);
    return () => window.clearInterval(refreshAuction);
  }, [id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function cancelAuctionHandler() {
    setError('');
    setIsCancelling(true);

    try {
      const cancelledAuction = await cancelAuction(id);
      setAuction(cancelledAuction);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) return <main className={styles.loading}>Loading auction...</main>;
  if (!auction) return <main className={styles.loading}>{error || 'Auction not found.'}</main>;

  const isScheduled = auction.status === 'SCHEDULED';
  const isActive = auction.status === 'ACTIVE';
  const targetTime = isScheduled ? auction.start_time : auction.end_time;
  const countdown = now === 0 ? 'Updating...' : new Date(targetTime) > now ? formatTimeLeft(targetTime) : isScheduled ? 'Opening now' : 'Auction ended';
  const images = [auction.product.primary_image, ...(auction.product.additional_images || [])].filter(Boolean);
  const highestBidAmount = Number(auction.highest_bid?.amount ?? 0);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link to="/seller#auctions">My Auctions</Link><span>/</span><span>{auction.product.title}</span></nav>
        <AuctionRoomStatus roomStatus={roomStatus} />
        {error ? <p className={styles.error}>{error}</p> : null}
        <section className={styles.hero}>
          <div><p className={styles.eyebrow}>AUCTION MANAGEMENT</p><h1>{auction.product.title}</h1><p>{auction.product.category.name} · {auction.product.condition}</p></div>
          <div className={`${styles.statusPanel} ${styles[auction.status.toLowerCase()]}`}><span>{auction.status}</span><strong>{isScheduled ? 'Opens in' : isActive ? 'Ends in' : 'Auction result'}</strong><b>{isScheduled || isActive ? countdown : formatDateTime(auction.end_time)}</b></div>
        </section>

        <section className={styles.content}>
          <div className={styles.gallery}><div className={styles.mainImage}><img src={selectedImage} alt={auction.product.title} /></div><div className={styles.thumbnails}>{images.map((image) => <button className={selectedImage === image ? styles.thumbnailActive : ''} type="button" key={image} onClick={() => setSelectedImage(image)} aria-label="Show product image"><img src={image} alt="" /></button>)}</div></div>
          <aside className={styles.auctionPanel}>
            <div className={styles.bidSummary}>
              <p className={styles.panelLabel}><span aria-hidden="true">●</span> LIVE · CURRENT HIGHEST BID</p>
              <strong className={styles.price}>{formatPrice(highestBidAmount)}</strong>
              <p>{auction.bid_count || 0} bids placed{auction.bids?.[0] ? ` · leading bidder: ${auction.bids[0].bidder.display_name}` : ''}</p>
            </div>
            <div className={styles.bidFeed}>
              <div><strong>Recent bid activity</strong></div>
              {auction.bids?.length ? (
                <ul>
                  {auction.bids.map((bid) => (
                    <li key={bid.id}>
                      <span className={styles.bidder}>
                        <i aria-hidden="true">{bid.bidder.display_name.slice(0, 2).toUpperCase()}</i>
                        <b>{bid.bidder.display_name}</b>
                      </span>
                      <strong>{formatPrice(bid.amount)}</strong>
                      <small>{formatDateTime(bid.placed_at)}</small>
                    </li>
                  ))}
                </ul>
              ) : <p>No bids have been placed yet.</p>}
            </div>
            <div className={styles.bidEntry}>
              <label>Your bid<input type="number" min="0" step="0.01" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} placeholder={formatPrice(highestBidAmount + Number(auction.min_bid_increment))} disabled={!isActive} /></label>
              <small>Minimum next bid: {formatPrice(highestBidAmount + Number(auction.min_bid_increment))} (increment {formatPrice(auction.min_bid_increment)})</small>
              <button className="btn-cta" type="button" disabled>Place bid</button>
              {isScheduled ? <small>Bidding unlocks when this auction opens.</small> : <small>Seller accounts cannot place bids on their own auctions.</small>}
            </div>
            <dl><div><dt>Minimum increment</dt><dd>{formatPrice(auction.min_bid_increment)}</dd></div><div><dt>Starts</dt><dd>{formatDateTime(auction.start_time)}</dd></div><div><dt>Ends</dt><dd>{formatDateTime(auction.end_time)}</dd></div></dl>
            {isScheduled ? <button className="btn-outline" type="button" disabled={isCancelling} onClick={cancelAuctionHandler}>{isCancelling ? 'Cancelling...' : 'Cancel auction'}</button> : null}
          </aside>
        </section>

        <section className={styles.details}><div><p className={styles.eyebrow}>PRODUCT RECORD</p><h2>About this product</h2><p>{auction.product.description || 'No description has been added.'}</p></div><div><p className={styles.eyebrow}>SPECIFICATIONS</p><h2>Detailed specifications</h2>{auction.product.detailed_specs && Object.keys(auction.product.detailed_specs).length ? <dl className={styles.specifications}>{Object.entries(auction.product.detailed_specs).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl> : <p>No detailed specifications have been added.</p>}</div></section>
        <button className={styles.back} type="button" onClick={() => navigate('/seller#auctions')}>Back to My Auctions</button>
      </div>
    </main>
  );
}