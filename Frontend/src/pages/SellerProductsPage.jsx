import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SellerWorkspace from '../components/SellerWorkspace';
import { getMyProducts } from '../api/productsApi';
import { useToast } from '../components/toastContext';
import styles from './SellerPages.module.css';

const tabs = ['READY', 'SCHEDULED', 'ACTIVE'];

export default function SellerProductsPage() {
  const showToast = useToast();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('READY');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { let isCurrent = true; getMyProducts().then((result) => isCurrent && setProducts(result)).catch((error) => isCurrent && showToast(error.message || 'Unable to load products.')).finally(() => isCurrent && setIsLoading(false)); return () => { isCurrent = false; }; }, [showToast]);
  const visibleProducts = products.filter((product) => product.registration_status === status);
  return <SellerWorkspace title="Products" eyebrow="INVENTORY" action={<Link className="btn-primary" to="/seller/products/new">Add product</Link>}><div className={styles.tabs}>{tabs.map((tab) => <button className={status === tab ? styles.activeTab : ''} type="button" key={tab} onClick={() => setStatus(tab)}>{tab.toLowerCase()}<span>{products.filter((product) => product.registration_status === tab).length}</span></button>)}</div>{isLoading ? <div className={styles.loader}><i />Loading products...</div> : visibleProducts.length ? <div className={styles.productGrid}>{visibleProducts.map((product) => <article key={product.id}><img src={product.primary_image} alt="" /><div><span>{product.category.name} · {product.condition}</span><h2>{product.title}</h2><p>{product.description || 'No description added.'}</p>{product.registration_status === 'READY' ? <Link to={`/seller/auctions/new?product=${product.id}`}>Schedule auction</Link> : <Link to="/seller/auctions">View auction</Link>}</div></article>)}</div> : <div className={styles.empty}>No {status.toLowerCase()} products yet.</div>}</SellerWorkspace>;
}