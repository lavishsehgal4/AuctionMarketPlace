import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { getCategories } from '../api/categoriesApi';
import { createProduct, getMyProducts } from '../api/productsApi';
import { getMyAuctionDetail, getMyAuctions, registerAuction } from '../api/auctionsApi';
import styles from './SellerDashboardPage.module.css';

const emptyProduct = { title: '', category_id: '', condition: 'USED', description: '', image_url: '' };
const auctionTabs = [
  { status: 'ACTIVE', label: 'Live' },
  { status: 'SCHEDULED', label: 'Scheduled' },
  { status: 'ENDED', label: 'Ended' },
  { status: 'UNSOLD', label: 'Unsold' },
  { status: 'CANCELLED', label: 'Cancelled' },
];

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function SellerDashboardPage({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [auctionForm, setAuctionForm] = useState({ startingPrice: '', increment: '', startTime: '', endTime: '' });
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productError, setProductError] = useState('');
  const [auctionError, setAuctionError] = useState('');
  const [auctionMessage, setAuctionMessage] = useState('');
  const [isRegisteringAuction, setIsRegisteringAuction] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [sellerAuctions, setSellerAuctions] = useState([]);
  const [auctionSummary, setAuctionSummary] = useState({});
  const [auctionPagination, setAuctionPagination] = useState(null);
  const [auctionStatus, setAuctionStatus] = useState('ACTIVE');
  const [auctionSort, setAuctionSort] = useState('ending_soon');
  const [auctionPage, setAuctionPage] = useState(1);
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);
  const [auctionListError, setAuctionListError] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isLoadingAuctionDetail, setIsLoadingAuctionDetail] = useState(false);

  useEffect(() => {
    Promise.all([getMyProducts(), getCategories()])
      .then(([loadedProducts, loadedCategories]) => {
        setProducts(loadedProducts);
        setCategories(loadedCategories);
        setProductForm((previous) => ({ ...previous, category_id: loadedCategories[0]?.id || '' }));
      })
      .catch((error) => setProductError(error.message))
      .finally(() => setIsLoadingProducts(false));
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getMyAuctions({ status: auctionStatus, sort: auctionSort, page: auctionPage, limit: 10 })
      .then((result) => {
        if (!isCurrent) return;
        setSellerAuctions(Array.isArray(result?.auctions) ? result.auctions : []);
        setAuctionSummary(result?.summary || {});
        setAuctionPagination(result?.pagination || null);
      })
      .catch((error) => isCurrent && setAuctionListError(error.message))
      .finally(() => isCurrent && setIsLoadingAuctions(false));

    return () => { isCurrent = false; };
  }, [auctionStatus, auctionSort, auctionPage]);

  const readyProducts = products.filter((product) => !product.auction);
  const selectedProduct = readyProducts.find((product) => product.id === selectedProductId);

  function openProductPicker() {
    setAuctionError('');
    setIsProductModalOpen(true);
  }

  function selectProduct(productId) {
    setSelectedProductId(productId);
    setIsProductModalOpen(false);
  }

  function goToCreateProduct() {
    setIsProductModalOpen(false);
    document.getElementById('create-product')?.scrollIntoView({ behavior: 'smooth' });
  }

  function changeAuctionStatus(status) {
    setIsLoadingAuctions(true);
    setAuctionListError('');
    setAuctionStatus(status);
    setAuctionPage(1);
  }

  function changeAuctionSort(sort) {
    setIsLoadingAuctions(true);
    setAuctionListError('');
    setAuctionSort(sort);
    setAuctionPage(1);
  }

  function changeAuctionPage(page) {
    setIsLoadingAuctions(true);
    setAuctionListError('');
    setAuctionPage(page);
  }

  async function openAuctionDetail(auctionId) {
    setIsLoadingAuctionDetail(true);
    setAuctionListError('');
    try {
      setSelectedAuction(await getMyAuctionDetail(auctionId));
    } catch (error) {
      setAuctionListError(error.message);
    } finally {
      setIsLoadingAuctionDetail(false);
    }
  }

  async function createProductHandler(event) {
    event.preventDefault();
    setProductError('');
    setIsCreatingProduct(true);

    try {
      const product = await createProduct({
        title: productForm.title,
        description: productForm.description || undefined,
        category_id: productForm.category_id,
        condition: productForm.condition,
        images: [productForm.image_url],
      });
      setProducts((previous) => [product, ...previous]);
      setSelectedProductId(product.id);
      setProductForm({ ...emptyProduct, category_id: categories[0]?.id || '' });
    } catch (error) {
      setProductError(error.message);
    } finally {
      setIsCreatingProduct(false);
    }
  }

  async function registerAuctionHandler(event) {
    event.preventDefault();
    setAuctionError('');
    setAuctionMessage('');

    const startDate = new Date(auctionForm.startTime);
    const endDate = new Date(auctionForm.endTime);
    if (!selectedProductId || Number(auctionForm.startingPrice) <= 0 || Number(auctionForm.increment) <= 0) {
      setAuctionError('Choose a product, and enter a starting price and minimum increment greater than zero.');
      return;
    }
    if (startDate <= new Date() || endDate <= startDate) {
      setAuctionError('Start time must be in the future, and end time must be after start time.');
      return;
    }

    setIsRegisteringAuction(true);
    try {
      const auction = await registerAuction({
        product_id: selectedProductId,
        starting_price: Number(auctionForm.startingPrice),
        min_bid_increment: Number(auctionForm.increment),
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      });
      setProducts((previous) => previous.map((product) => (
        product.id === selectedProductId ? { ...product, auction } : product
      )));
      setSelectedProductId('');
      setAuctionForm({ startingPrice: '', increment: '', startTime: '', endTime: '' });
      setAuctionMessage('Auction registered successfully.');
    } catch (error) {
      setAuctionError(error.message);
    } finally {
      setIsRegisteringAuction(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} id="dashboard">
        <div>
          <p className={styles.eyebrow}>SELLER DESK</p>
          <h1>Turn your collection into its next chapter.</h1>
          <p>Manage products, schedules, and every auction result from one calm workspace.</p>
        </div>
        <div className={styles.heroIdentity}>
          <span>SELLER ACCOUNT</span>
          <strong>{currentUser.display_name}</strong>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.overview} aria-label="Seller overview">
          <article><span>READY TO LIST</span><strong>{readyProducts.length}</strong><p>Products without an auction</p></article>
          <article><span>LIVE NOW</span><strong>{auctionSummary.active || 0}</strong><p>Auctions taking bids</p></article>
          <article><span>SCHEDULED</span><strong>{auctionSummary.scheduled || 0}</strong><p>Lots opening soon</p></article>
          <article><span>COMPLETED</span><strong>{(auctionSummary.ended || 0) + (auctionSummary.unsold || 0)}</strong><p>Results on record</p></article>
        </section>

        <section className={styles.section} id="products">
          <div className={styles.heading}><div><p className={styles.eyebrow}>INVENTORY</p><h2>My Products</h2><p>Prepare an item once, then register it for a single auction.</p></div></div>
          {isLoadingProducts ? <p className={styles.note}>Loading your products...</p> : null}
          {productError && !isLoadingProducts ? <p className={styles.error}>{productError}</p> : null}
          {!isLoadingProducts && !productError && products.length === 0 ? <p className={styles.note}>No products yet. Add your first item below.</p> : null}
          <div className={styles.productGrid}>
            {products.map((product) => (
              <article className={styles.product} key={product.id}>
                <img src={product.images[0]} alt="" />
                <div><span className={`${styles.status} ${styles[product.auction ? product.auction.status.toLowerCase() : 'ready']}`}>{product.auction?.status || 'READY'}</span><h3>{product.title}</h3><p>{product.category.name} · {product.condition}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="create-product">
          <div className={styles.heading}><div><p className={styles.eyebrow}>NEW INVENTORY</p><h2>Create Product</h2><p>Add item details before setting the auction price and schedule.</p></div></div>
          <form className={styles.form} onSubmit={createProductHandler}>
            <label>Product title<input value={productForm.title} onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} placeholder="e.g. Hand-thrown ceramic vase" required /></label>
            <label>Category<select value={productForm.category_id} onChange={(event) => setProductForm({ ...productForm, category_id: event.target.value })} required disabled={!categories.length}><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Condition<select value={productForm.condition} onChange={(event) => setProductForm({ ...productForm, condition: event.target.value })}><option>NEW</option><option>USED</option><option>REFURBISHED</option></select></label>
            <label>Image URL<input type="url" value={productForm.image_url} onChange={(event) => setProductForm({ ...productForm, image_url: event.target.value })} placeholder="https://example.com/item.jpg" required /></label>
            <label className={styles.full}>Description<textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="Condition, provenance, and included details" rows="3" /></label>
            <button className="btn-primary" type="submit" disabled={isCreatingProduct || !categories.length}>{isCreatingProduct ? 'Adding product...' : 'Add product'}</button>
          </form>
        </section>

        <section className={styles.section} id="register-auction">
          <div className={styles.heading}><div><p className={styles.eyebrow}>LISTING SETUP</p><h2>Register Auction</h2><p>Choose a ready product, set its opening bid, and schedule the room.</p></div></div>
          {auctionError ? <p className={styles.error}>{auctionError}</p> : null}
          {auctionMessage ? <p className={styles.note}>{auctionMessage}</p> : null}
          <form className={styles.form} onSubmit={registerAuctionHandler}>
            <div className={`${styles.full} ${styles.selectedProduct}`}>
              {selectedProduct ? <><img src={selectedProduct.images[0]} alt="" /><span><strong>{selectedProduct.title}</strong><small>{selectedProduct.category.name} · {selectedProduct.condition}</small></span></> : <span>No product selected</span>}
              <button className="btn-outline" type="button" onClick={openProductPicker}>{selectedProduct ? 'Change product' : 'Select product'}</button>
            </div>
            <label>Starting price<input type="number" min="0.01" step="0.01" value={auctionForm.startingPrice} onChange={(event) => setAuctionForm({ ...auctionForm, startingPrice: event.target.value })} placeholder="$0" required /></label>
            <label>Minimum increment<input type="number" min="0.01" step="0.01" value={auctionForm.increment} onChange={(event) => setAuctionForm({ ...auctionForm, increment: event.target.value })} placeholder="$0" required /></label>
            <label>Start time<input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={auctionForm.startTime} onChange={(event) => setAuctionForm({ ...auctionForm, startTime: event.target.value })} required /></label>
            <label>End time<input type="datetime-local" value={auctionForm.endTime} onChange={(event) => setAuctionForm({ ...auctionForm, endTime: event.target.value })} required /></label>
            <button className="btn-cta" type="submit" disabled={!readyProducts.length || isRegisteringAuction}>{isRegisteringAuction ? 'Registering...' : 'Register auction'}</button>
          </form>
        </section>

        <section className={styles.section} id="auctions">
          <div className={styles.heading}><div><p className={styles.eyebrow}>SELLING HISTORY</p><h2>My Auctions</h2><p>Track what is live now and review the outcome of every lot.</p></div></div>
          <div className={styles.auctionsPanel}>
            <div className={styles.statusTabs} role="tablist" aria-label="Auction status">
              {auctionTabs.map((tab) => <button key={tab.status} className={`${styles.statusTab} ${auctionStatus === tab.status ? styles.statusTabActive : ''}`} type="button" role="tab" aria-selected={auctionStatus === tab.status} onClick={() => changeAuctionStatus(tab.status)}><i className={`${styles.dot} ${styles[tab.status.toLowerCase()]}`} />{tab.label}<span>{auctionSummary[tab.status.toLowerCase()] || 0}</span></button>)}
            </div>
            <div className={styles.auctionControls}><label>Sort<select value={auctionSort} onChange={(event) => changeAuctionSort(event.target.value)}><option value="ending_soon">Ending soon</option><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="highest_bid">Highest bid</option><option value="starting_price">Starting price</option></select></label></div>
            {auctionListError ? <p className={styles.error}>{auctionListError}</p> : null}
            {isLoadingAuctions ? <p className={styles.note}>Loading your auctions...</p> : null}
            {!isLoadingAuctions && !auctionListError && sellerAuctions.length === 0 ? <p className={styles.note}>No {auctionTabs.find((tab) => tab.status === auctionStatus)?.label.toLowerCase()} auctions yet.</p> : null}
            <div className={styles.auctionTable}>{sellerAuctions.map((auction) => <article key={auction.id}><img src={auction.product?.image_url || ''} alt="" /><div><span className={`${styles.status} ${styles[auction.status?.toLowerCase()]}`}>{auction.status}</span><h3>{auction.product?.title || 'Untitled product'}</h3><p>{auction.product?.category_name || 'Uncategorized'} · {auction.product?.condition || 'Unknown condition'}</p></div><strong>{formatPrice(auction.current_bid)}</strong><span>{auction.bid_count || 0} bids</span><span>{formatDate(auction.end_time)}</span><button className="btn-outline" type="button" onClick={() => openAuctionDetail(auction.id)}>View</button></article>)}</div>
            {auctionPagination?.total_pages > 1 ? <div className={styles.pagination}><button className="btn-outline" type="button" disabled={auctionPage === 1} onClick={() => changeAuctionPage(auctionPage - 1)}>Previous</button><span>Page {auctionPagination.page} of {auctionPagination.total_pages}</span><button className="btn-outline" type="button" disabled={auctionPage === auctionPagination.total_pages} onClick={() => changeAuctionPage(auctionPage + 1)}>Next</button></div> : null}
          </div>
        </section>

        <section className={styles.profile} id="profile">
          <p className={styles.eyebrow}>ACCOUNT</p><h2>{currentUser.display_name}</h2><p>Seller profile and KYC details will connect to `/api/v1/auth/me` when profile integration begins.</p>
        </section>
      </div>
      {isProductModalOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsProductModalOpen(false)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="product-picker-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}><div><p className={styles.eyebrow}>READY TO LIST</p><h2 id="product-picker-title">Select a product</h2></div><button className={styles.closeModal} type="button" onClick={() => setIsProductModalOpen(false)} aria-label="Close product selection">Close</button></div>
            <div className={styles.productPicker} role="radiogroup" aria-label="Select a product for auction">
              {readyProducts.map((product) => (
                <button key={product.id} type="button" className={`${styles.productChoice} ${selectedProductId === product.id ? styles.productChoiceSelected : ''}`} onClick={() => selectProduct(product.id)} role="radio" aria-checked={selectedProductId === product.id}>
                  <img src={product.images[0]} alt="" />
                  <span>{product.title}</span>
                  <span className={styles.productDetails}>{product.category.name} · {product.condition}<br />{product.description || 'No description added'}</span>
                </button>
              ))}
              {!readyProducts.length ? <p className={styles.note}>No products are ready to register.</p> : null}
            </div>
            <div className={styles.modalFooter}><button className="btn-primary" type="button" onClick={goToCreateProduct}>Add product</button></div>
          </section>
        </div>
      ) : null}
      {selectedAuction || isLoadingAuctionDetail ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => !isLoadingAuctionDetail && setSelectedAuction(null)}>
          <section className={styles.auctionDetailModal} role="dialog" aria-modal="true" aria-labelledby="auction-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}><div><p className={styles.eyebrow}>AUCTION DETAILS</p><h2 id="auction-detail-title">{selectedAuction?.product.title || 'Loading auction...'}</h2></div><button className={styles.closeModal} type="button" onClick={() => setSelectedAuction(null)} disabled={isLoadingAuctionDetail}>Close</button></div>
            {selectedAuction ? <div className={styles.auctionDetail}><img src={selectedAuction.product.images[0]} alt="" /><div><span className={`${styles.status} ${styles[selectedAuction.status.toLowerCase()]}`}>{selectedAuction.status}</span><p>{selectedAuction.product.category.name} · {selectedAuction.product.condition}</p><p>{selectedAuction.product.description || 'No description added.'}</p><dl><div><dt>Starting price</dt><dd>{formatPrice(selectedAuction.starting_price)}</dd></div><div><dt>Current bid</dt><dd>{formatPrice(selectedAuction.current_bid)}</dd></div><div><dt>Minimum increment</dt><dd>{formatPrice(selectedAuction.min_bid_increment)}</dd></div><div><dt>Starts</dt><dd>{formatDate(selectedAuction.start_time)}</dd></div><div><dt>Ends</dt><dd>{formatDate(selectedAuction.end_time)}</dd></div></dl></div></div> : <p className={styles.note}>Loading auction details...</p>}
          </section>
        </div>
      ) : null}
      <Footer />
    </main>
  );
}