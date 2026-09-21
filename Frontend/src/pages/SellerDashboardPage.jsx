import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SellerWorkspace from '../components/SellerWorkspace';
import { getMyProducts } from '../api/productsApi';
import { getMyAuctions } from '../api/auctionsApi';
import { useToast } from '../components/toastContext';
import styles from './SellerPages.module.css';

export default function SellerDashboardPage() {
  const showToast = useToast();
  const [summary, setSummary] = useState({ ready: 0, active: 0, scheduled: 0, completed: 0 });
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([getMyProducts(), getMyAuctions({ status: 'ACTIVE', sort: 'ending_soon', page: 1, limit: 4 })])
      .then(([products, auctions]) => {
        if (!isCurrent) return;
        setSummary({
          ready: products.filter((product) => product.registration_status === 'READY').length,
          active: auctions.summary?.active || 0,
          scheduled: auctions.summary?.scheduled || 0,
          completed: (auctions.summary?.ended || 0) + (auctions.summary?.unsold || 0),
        });
        setRecentAuctions(auctions.auctions || []);
      })
      .catch((error) => isCurrent && showToast(error.message || 'Unable to load your seller overview.'))
      .finally(() => isCurrent && setIsLoading(false));
    return () => { isCurrent = false; };
  }, [showToast]);

  return <SellerWorkspace title="Your selling desk" action={<Link className="btn-primary" to="/seller/products/new">Add product</Link>}>
    {isLoading ? <div className={styles.loader}><i />Loading your workspace...</div> : <>
      <section className={styles.metrics}>{[
        ['Ready to list', summary.ready, 'Products without an auction'],
        ['Live now', summary.active, 'Auctions taking bids'],
        ['Scheduled', summary.scheduled, 'Lots opening soon'],
        ['Completed', summary.completed, 'Results on record'],
      ].map(([label, value, detail]) => <article key={label}><span>{label}</span><strong>{value}</strong><p>{detail}</p></article>)}</section>
      <section className={styles.section}>
        <div className={styles.heading}><div><p>LIVE ACTIVITY</p><h2>Auctions happening now</h2></div><Link to="/seller/auctions">View all auctions</Link></div>
        {recentAuctions.length ? <div className={styles.quickList}>{recentAuctions.map((auction) => <Link to={`/seller/auctions/${auction.id}`} key={auction.id}><img src={auction.product.image_url} alt="" /><span><strong>{auction.product.title}</strong><small>{auction.bid_count} bids · ends {new Intl.DateTimeFormat('en', { timeStyle: 'short' }).format(new Date(auction.end_time))}</small></span><b>${Number(auction.highest_bid?.amount || 0).toFixed(2)}</b></Link>)}</div> : <div className={styles.empty}>No live auctions right now. Products ready to list can be scheduled from the products page.</div>}
      </section>
      <section className={styles.actions}><Link to="/seller/products" className="btn-outline">Manage products</Link><Link to="/seller/auctions/new" className="btn-cta">Schedule auction</Link></section>
    </>}
  </SellerWorkspace>;
}
