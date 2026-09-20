import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSellerProfile, getSellerReviews } from '../api/sellerProfilesApi';
import styles from './SellerProfilePage.module.css';

const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const formatDate = (value) => new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value));

export default function SellerProfilePage() {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [reviewPage, setReviewPage] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([getSellerProfile(sellerId), getSellerReviews(sellerId, { page: reviewPage, limit: 8 })])
      .then(([profile, reviewResult]) => {
        if (!isCurrent) return;
        setSeller(profile);
        setReviews(reviewResult.reviews || []);
        setPagination(reviewResult.pagination || null);
      })
      .catch((requestError) => isCurrent && setError(requestError.message || 'Auctioneer profile is unavailable.'))
      .finally(() => isCurrent && setIsLoading(false));
    return () => { isCurrent = false; };
  }, [sellerId, reviewPage]);

  if (isLoading) return <main className={styles.message}>Loading auctioneer profile...</main>;
  if (!seller) return <main className={styles.message}>{error || 'Auctioneer profile not found.'}</main>;
  const profile = seller.seller_profile || {};
  const image = profile.banner_url || seller.avatar_url;
  const changeReviewPage = (nextPage) => {
    setIsLoading(true);
    setReviewPage(nextPage);
  };

  return <main className={styles.page}>
    <section className={styles.hero}>{image ? <img src={image} alt="" /> : <div className={styles.fallback}>{initials(seller.display_name)}</div>}<div className={styles.heroContent}><Link to="/auctioneers">All auctioneers</Link><p>PUBLIC AUCTIONEER PROFILE</p><h1>{seller.display_name}</h1>{profile.short_bio ? <strong className={styles.shortBio}>{profile.short_bio}</strong> : null}<div className={styles.rating}><strong>{seller.rating.average.toFixed(1)}</strong><span>out of 5 from {seller.rating.count} {seller.rating.count === 1 ? 'review' : 'reviews'}</span></div>{profile.website_url ? <a href={profile.website_url} target="_blank" rel="noreferrer">Visit website</a> : null}</div></section>
    <div className={styles.content}><section className={styles.about}><p>ABOUT THE AUCTIONEER</p><h2>A public record, lot by lot.</h2><span>{profile.bio || 'This auctioneer has not added a public introduction yet.'}</span></section><section className={styles.reviews}><div className={styles.reviewHeading}><div><p>WINNING BIDDER FEEDBACK</p><h2>Reviews</h2></div><strong>{seller.rating.average.toFixed(1)} / 5</strong></div>{reviews.length ? <div className={styles.reviewList}>{reviews.map((review) => <article key={review.id}><div className={styles.reviewer}>{review.reviewer.avatar_url ? <img src={review.reviewer.avatar_url} alt="" /> : <i>{initials(review.reviewer.display_name)}</i>}<span><b>{review.reviewer.display_name}</b><small>Won {review.auction.product.title}</small></span></div><div className={styles.reviewRating}><strong>{review.rating} / 5</strong><small>{formatDate(review.created_at)}</small></div>{review.comment ? <p>{review.comment}</p> : null}</article>)}</div> : <p className={styles.noReviews}>No reviews have been submitted yet.</p>}{pagination?.total_pages > 1 ? <nav className={styles.pagination} aria-label="Review pages"><button type="button" disabled={reviewPage === 1} onClick={() => changeReviewPage(reviewPage - 1)}>Previous</button><span>Page {pagination.page} of {pagination.total_pages}</span><button type="button" disabled={reviewPage === pagination.total_pages} onClick={() => changeReviewPage(reviewPage + 1)}>Next</button></nav> : null}</section></div>
  </main>;
}