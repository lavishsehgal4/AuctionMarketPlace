import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuctioneers } from '../api/sellerProfilesApi';
import styles from './AuctioneersPage.module.css';

const sortOptions = [
  { value: 'top_rated', label: 'Highest rated' },
  { value: 'most_reviewed', label: 'Most reviewed' },
  { value: 'newest', label: 'Newest profiles' },
];

const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export default function AuctioneersPage() {
  const [sellers, setSellers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [sort, setSort] = useState('top_rated');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    getAuctioneers({ page, limit: 12, sort })
      .then((result) => {
        if (!isCurrent) return;
        setSellers(result.sellers || []);
        setPagination(result.pagination || null);
      })
      .catch((requestError) => isCurrent && setError(requestError.message || 'Auctioneers are unavailable right now.'))
      .finally(() => isCurrent && setIsLoading(false));
    return () => { isCurrent = false; };
  }, [page, sort]);

  const changeSort = (event) => {
    setIsLoading(true);
    setError('');
    setSort(event.target.value);
    setPage(1);
  };

  const changePage = (nextPage) => {
    setIsLoading(true);
    setError('');
    setPage(nextPage);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div><p>THE AUCTIONEER DIRECTORY</p><h1>People with a record worth following.</h1><span>Browse public seller profiles, their reputation, and the reviews left by winning bidders.</span></div>
        <label>Order by<select value={sort} onChange={changeSort}>{sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      </section>
      <section className={styles.content} aria-label="Auctioneer directory">
        {isLoading ? <p className={styles.message}>Loading auctioneers...</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}
        {!isLoading && !error && sellers.length === 0 ? <p className={styles.message}>No public auctioneer profiles are available yet.</p> : null}
        <div className={styles.grid}>{sellers.map((seller) => {
          const image = seller.seller_profile?.banner_url || seller.avatar_url;
          return <Link className={styles.card} to={`/auctioneers/${seller.id}`} key={seller.id}>
            <div className={styles.media}>{image ? <img src={image} alt="" /> : <span>{initials(seller.display_name)}</span>}<strong>{seller.rating.average.toFixed(1)} / 5</strong></div>
            <div className={styles.cardBody}><p>AUCTIONEER</p><h2>{seller.display_name}</h2>{seller.seller_profile?.short_bio ? <strong className={styles.shortBio}>{seller.seller_profile.short_bio}</strong> : null}<span>{seller.rating.count} {seller.rating.count === 1 ? 'review' : 'reviews'}</span>{seller.seller_profile?.bio ? <small>{seller.seller_profile.bio}</small> : null}</div>
          </Link>;
        })}</div>
        {pagination?.total_pages > 1 ? <nav className={styles.pagination} aria-label="Auctioneer pages"><button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.total_pages}</span><button type="button" disabled={page === pagination.total_pages} onClick={() => changePage(page + 1)}>Next</button></nav> : null}
      </section>
    </main>
  );
}