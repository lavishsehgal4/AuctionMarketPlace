import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SellerWorkspace from '../components/SellerWorkspace';
import { getMyAuctions } from '../api/auctionsApi';
import { useToast } from '../components/toastContext';
import styles from './SellerPages.module.css';

const statuses = ['ACTIVE', 'SCHEDULED', 'ENDED', 'UNSOLD', 'CANCELLED'];

export default function SellerAuctionsPage() {
  const showToast = useToast();
  const [status, setStatus] = useState('ACTIVE');
  const [auctions, setAuctions] = useState([]);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { let isCurrent = true; getMyAuctions({ status, sort: 'ending_soon', page, limit: 10 }).then((result) => { if (!isCurrent) return; setAuctions(result.auctions || []); setSummary(result.summary || {}); setPagination(result.pagination || null); }).catch((error) => isCurrent && showToast(error.message || 'Unable to load auctions.')).finally(() => isCurrent && setIsLoading(false)); return () => { isCurrent = false; }; }, [page, showToast, status]);
  const selectStatus = (nextStatus) => { setIsLoading(true); setStatus(nextStatus); setPage(1); };
  const changePage = (nextPage) => { setIsLoading(true); setPage(nextPage); };
  return <SellerWorkspace title="Auctions" eyebrow="AUCTION OPERATIONS" action={<Link className="btn-cta" to="/seller/auctions/new">Schedule auction</Link>}><div className={styles.tabs}>{statuses.map((item) => <button className={status === item ? styles.activeTab : ''} type="button" key={item} onClick={() => selectStatus(item)}>{item.toLowerCase()}<span>{summary[item.toLowerCase()] || 0}</span></button>)}</div>{isLoading ? <div className={styles.loader}><i />Loading auctions...</div> : auctions.length ? <div className={styles.auctionList}>{auctions.map((auction) => <article key={auction.id}><img src={auction.product.image_url} alt="" /><div><span className={styles.status}>{auction.status}</span><h2>{auction.product.title}</h2><p>{auction.bid_count} bids · ends {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(auction.end_time))}</p></div><strong>${Number(auction.highest_bid?.amount || 0).toFixed(2)}</strong><Link className="btn-outline" to={`/seller/auctions/${auction.id}`}>Open</Link></article>)}</div> : <div className={styles.empty}>No {status.toLowerCase()} auctions yet.</div>}{pagination?.total_pages > 1 ? <nav className={styles.pagination}><button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.total_pages}</span><button type="button" disabled={page === pagination.total_pages} onClick={() => changePage(page + 1)}>Next</button></nav> : null}</SellerWorkspace>;
}