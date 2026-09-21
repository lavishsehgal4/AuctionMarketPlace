import { Link, NavLink } from 'react-router-dom';
import Footer from './Footer';
import styles from './SellerWorkspace.module.css';

const links = [
  { to: '/seller', label: 'Overview', end: true },
  { to: '/seller/products', label: 'Products' },
  { to: '/seller/auctions', label: 'Auctions' },
  { to: '/seller/profile', label: 'Public profile' },
];

export default function SellerWorkspace({ title, eyebrow, action, children }) {
  return <main className={styles.page}>
    <header className={styles.header}><div><p>{eyebrow || 'SELLER WORKSPACE'}</p><h1>{title}</h1></div>{action}</header>
    <div className={styles.workspace}><aside className={styles.sidebar}><nav aria-label="Seller workspace">{links.map((link) => <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>)}</nav><Link className={styles.publicLink} to="/auctioneers">View auctioneers</Link></aside><div className={styles.content}>{children}</div></div>
    <Footer />
  </main>;
}