import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getPublicAuction } from '../api/auctionsApi';
import { createSellerReview } from '../api/sellerProfilesApi';
import socket from '../api/socket';
import AuctionRoomStatus from '../components/AuctionRoomStatus';
import useAuctionRoom from '../hooks/useAuctionRoom';
import { formatDateTime, formatTimeLeft } from '../utils/time';
import styles from './SellerAuctionDetailPage.module.css';

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export default function AuctionDetailPage({ currentUser }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [auction, setAuction] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(0);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const roomStatus = useAuctionRoom(id, currentUser);

  useEffect(() => {
    let isCurrent = true;
    getPublicAuction(id)
      .then((loadedAuction) => {
        if (!isCurrent) return;
        setAuction(loadedAuction);
        setSelectedImage(loadedAuction.product.primary_image);
      })
      .catch((requestError) => isCurrent && setError(requestError.message))
      .finally(() => isCurrent && setIsLoading(false));
    return () => { isCurrent = false; };
  }, [id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleBidPlaced = (result) => {
      if (result.auction_id !== id) return;
      setAuction((previous) => previous ? {
        ...previous,
        highest_bid: result.highest_bid,
        bid_count: result.bid_count,
        bids: [result.bid, ...(previous.bids || [])].slice(0, 20),
      } : previous);
    };
    socket.on('bidPlaced', handleBidPlaced);
    return () => socket.off('bidPlaced', handleBidPlaced);
  }, [id]);

  if (isLoading) return <main className={styles.loading}>Loading auction...</main>;
  if (!auction) return <main className={styles.loading}>{error || 'Auction not found.'}</main>;

  const isActive = auction.status === 'ACTIVE';
  const highestBidAmount = Number(auction.highest_bid?.amount ?? 0);
  const minimumBid = (highestBidAmount || Number(auction.starting_price)) + Number(auction.min_bid_increment);
  const images = [auction.product.primary_image, ...(auction.product.additional_images || [])].filter(Boolean);
  const countdown = now === 0 ? 'Updating...' : formatTimeLeft(auction.end_time);
  const canReview = currentUser?.account_type === 'BIDDER' && currentUser.id === auction.winner?.id && auction.status === 'ENDED';
  const isReviewOpen = canReview && searchParams.get('review') === '1';

  function submitBid(amount) {
    setBidError('');
    setBidSuccess('');
    if (!socket.connected) {
      setBidError('Auction connection is unavailable. Please wait and try again.');
      return;
    }

    setIsSubmitting(true);
    socket.emit('placeBid', { auctionId: id, amount: Number(amount) }, (result) => {
      setIsSubmitting(false);
      if (!result?.success) {
        setBidError(result?.message || 'Unable to place bid.');
        return;
      }
      setBidAmount('');
      setBidSuccess('Bid accepted. You are now the highest bidder.');
    });
  }

  async function submitReview(event) {
    event.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setIsSubmittingReview(true);
    try {
      await createSellerReview(auction.seller.id, { auction_id: auction.id, rating: Number(reviewRating), comment: reviewComment.trim() || undefined });
      setReviewSuccess('Your review has been submitted.');
      setReviewComment('');
    } catch (requestError) {
      setReviewError(requestError.message || 'Unable to submit your review.');
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link to="/auctions">All Auctions</Link><span>/</span><span>{auction.product.title}</span></nav>
        <AuctionRoomStatus roomStatus={roomStatus} />
        <section className={styles.hero}>
          <div><p className={styles.eyebrow}>LIVE AUCTION</p><h1>{auction.product.title}</h1><p>{auction.product.category.name} · {auction.product.condition}</p></div>
          <div className={`${styles.statusPanel} ${styles[auction.status.toLowerCase()]}`}><span>{auction.status}</span><strong>{isActive ? 'Ends in' : 'Auction result'}</strong><b>{isActive ? countdown : formatDateTime(auction.end_time)}</b></div>
        </section>

        <section className={styles.content}>
          <div className={styles.gallery}><div className={styles.mainImage}><img src={selectedImage} alt={auction.product.title} /></div><div className={styles.thumbnails}>{images.map((image) => <button className={selectedImage === image ? styles.thumbnailActive : ''} type="button" key={image} onClick={() => setSelectedImage(image)} aria-label="Show product image"><img src={image} alt="" /></button>)}</div></div>
          <aside className={styles.auctionPanel}>
            <div className={styles.bidSummary}><p className={styles.panelLabel}><span aria-hidden="true">●</span> LIVE · CURRENT HIGHEST BID</p><strong className={styles.price}>{formatPrice(highestBidAmount)}</strong><p>{auction.bid_count || 0} bids placed{auction.bids?.[0] ? ` · leading bidder: ${auction.bids[0].bidder.display_name}` : ''}</p></div>
            <div className={styles.bidFeed}><div><strong>Recent bid activity</strong></div>{auction.bids?.length ? <ul>{auction.bids.map((bid, index) => <li key={bid.id}><span className={styles.bidder}><i className={styles[`bidderTone${index % 5}`]} aria-hidden="true">{initials(bid.bidder.display_name)}</i><b>{bid.bidder.display_name}</b></span><strong>{formatPrice(bid.amount)}</strong><small>{formatDateTime(bid.placed_at)}</small></li>)}</ul> : <p>No bids have been placed yet.</p>}</div>
            {isActive && currentUser?.account_type === 'BIDDER' ? <div className={styles.bidEntry}><label>Your bid<input type="number" min={minimumBid} step="0.01" value={bidAmount} onChange={(event) => setBidAmount(event.target.value)} placeholder={formatPrice(minimumBid)} /></label><small>Minimum next bid: {formatPrice(minimumBid)} (increment {formatPrice(auction.min_bid_increment)})</small><button className={styles.quickBid} type="button" disabled={isSubmitting} onClick={() => submitBid(minimumBid)}>Bid {formatPrice(minimumBid)} now</button><button className="btn-cta" type="button" disabled={isSubmitting || !bidAmount} onClick={() => submitBid(bidAmount)}>{isSubmitting ? 'Placing bid...' : 'Place bid'}</button>{bidError ? <small className={styles.bidError}>{bidError}</small> : null}{bidSuccess ? <small className={styles.bidSuccess}>{bidSuccess}</small> : null}</div> : <div className={styles.bidEntry}><small>{isActive ? 'Sign in with a bidder account to place a bid.' : 'Bidding is unavailable for this auction.'}</small></div>}
            <dl><div><dt>Minimum increment</dt><dd>{formatPrice(auction.min_bid_increment)}</dd></div><div><dt>Starts</dt><dd>{formatDateTime(auction.start_time)}</dd></div><div><dt>Ends</dt><dd>{formatDateTime(auction.end_time)}</dd></div></dl>
          </aside>
        </section>

        <section className={styles.details}><div><p className={styles.eyebrow}>PRODUCT RECORD</p><h2>About this product</h2><p>{auction.product.description || 'No description has been added.'}</p></div><div><p className={styles.eyebrow}>SPECIFICATIONS</p><h2>Detailed specifications</h2>{auction.product.detailed_specs && Object.keys(auction.product.detailed_specs).length ? <dl className={styles.specifications}>{Object.entries(auction.product.detailed_specs).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl> : <p>No detailed specifications have been added.</p>}</div></section>
        {isReviewOpen ? <section className={styles.reviewPanel}><p className={styles.eyebrow}>WINNING BIDDER FEEDBACK</p><h2>Review {auction.seller.display_name}</h2><p>Your feedback is published on this auctioneer's public profile.</p><form onSubmit={submitReview}><label>Rating<select value={reviewRating} onChange={(event) => setReviewRating(event.target.value)}><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Fair</option><option value="2">2 - Poor</option><option value="1">1 - Very poor</option></select></label><label>Review<textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} maxLength="2000" rows="4" placeholder="Share your experience with this auctioneer." /></label><button className="btn-cta" type="submit" disabled={isSubmittingReview}>{isSubmittingReview ? 'Submitting review...' : 'Submit review'}</button>{reviewError ? <small className={styles.reviewError}>{reviewError}</small> : null}{reviewSuccess ? <small className={styles.reviewSuccess}>{reviewSuccess}</small> : null}</form></section> : null}
      </div>
    </main>
  );
}