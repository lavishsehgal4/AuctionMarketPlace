import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { getBidderHistory } from '../api/bidderHistoryApi';
import { useToast } from '../components/toastContext';
import styles from './BidderHistoryPage.module.css';

const today = () => new Date().toISOString().slice(0, 10);
const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function BidderHistoryPage() {
  const showToast = useToast();
  const [filters, setFilters] = useState({ date: today(), search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ date: today(), search: '' });
  const [auctions, setAuctions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    getBidderHistory({ ...appliedFilters, page, limit: 20 })
      .then((result) => {
        if (!isCurrent) return;
        setAuctions(result.auctions || []);
        setPagination(result.pagination || null);
      })
      .catch((error) => isCurrent && showToast(error.message || 'Unable to load bid history.'))
      .finally(() => isCurrent && setIsLoading(false));
    return () => { isCurrent = false; };
  }, [appliedFilters, page, showToast]);

  const submitSearch = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setPage(1);
    setAppliedFilters({ date: filters.date, search: filters.search.trim() });
  };

  const changePage = (nextPage) => {
    setIsLoading(true);
    setPage(nextPage);
  };

  return <main className={styles.page}>
    <section className={styles.hero}><p>YOUR ACTIVITY</p><h1>Bid history</h1><span>Auctions you participated in on a selected day.</span></section>
    <section className={styles.content}>
      <form className={styles.filters} onSubmit={submitSearch}><label>Bid date<input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} required /></label><label>Search auctions<input type="search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Product title" /></label><button className="btn-primary" type="submit">Search</button></form>
      {isLoading ? <div className={styles.loader}><i />Loading bid history...</div> : auctions.length ? <div className={styles.rows}>{auctions.map((auction) => <article key={auction.id}><img src={auction.product.primary_image} alt="" /><div><p>{auction.product.category.name} · {auction.product.condition}</p><h2>{auction.product.title}</h2><span>Sold by {auction.seller.display_name}</span><small>You bid on {formatDate(auction.bid_placed_at)}</small></div><strong className={styles[auction.status.toLowerCase()]}>{auction.status}</strong></article>)}</div> : <div className={styles.empty}>No auctions matched this date and search.</div>}
      {pagination?.total_pages > 1 ? <nav className={styles.pagination} aria-label="Bid history pages"><button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.total_pages}</span><button type="button" disabled={page === pagination.total_pages} onClick={() => changePage(page + 1)}>Next</button></nav> : null}
    </section>
    <Footer />
  </main>;
}