import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { getCategories } from '../api/categoriesApi';
import { createProduct, getMyProducts } from '../api/productsApi';
import { getMyAuctions, registerAuction } from '../api/auctionsApi';
import styles from './SellerDashboardPage.module.css';

const emptyProduct = { title: '', category_id: '', condition: 'USED', description: '', primary_image: '', additional_images: [''] };
const auctionTabs = [
  { status: 'ACTIVE', label: 'Live' },
  { status: 'SCHEDULED', label: 'Scheduled' },
  { status: 'ENDED', label: 'Ended' },
  { status: 'UNSOLD', label: 'Unsold' },
  { status: 'CANCELLED', label: 'Cancelled' },
];
const productTabs = [
  { status: 'READY', label: 'Ready to go for auction' },
  { status: 'SCHEDULED', label: 'Scheduled products' },
  { status: 'ACTIVE', label: 'Active products' },
];

const formatPrice = (value) => `$${Number(value).toFixed(2)}`;
const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function SellerDashboardPage({ currentUser }) {
  const navigate = useNavigate();
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
  const [productStatus, setProductStatus] = useState('READY');
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [selectedProductImage, setSelectedProductImage] = useState('');
  const [detailedSpecs, setDetailedSpecs] = useState([]);

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

  const readyProducts = products.filter((product) => product.registration_status === 'READY');
  const visibleProducts = products.filter((product) => product.registration_status === productStatus);
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

  function openProductDetail(product) {
    setSelectedProductDetail(product);
    setSelectedProductImage(product.primary_image);
  }

  function updateAdditionalImage(index, value) {
    setProductForm((previous) => ({
      ...previous,
      additional_images: previous.additional_images.map((image, imageIndex) => imageIndex === index ? value : image),
    }));
  }

  function addAdditionalImage() {
    setProductForm((previous) => ({ ...previous, additional_images: [...previous.additional_images, ''] }));
  }

  function updateDetailedSpec(index, field, value) {
    setDetailedSpecs((previous) => previous.map((spec, specIndex) => (
      specIndex === index ? { ...spec, [field]: value } : spec
    )));
  }

  function addDetailedSpec() {
    setDetailedSpecs((previous) => [...previous, { key: '', value: '' }]);
  }

  function removeDetailedSpec(index) {
    setDetailedSpecs((previous) => previous.filter((_, specIndex) => specIndex !== index));
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

  async function createProductHandler(event) {
    event.preventDefault();
    setProductError('');
    setIsCreatingProduct(true);

    const hasIncompleteSpec = detailedSpecs.some((spec) => !spec.key.trim() || !spec.value.trim());
    if (hasIncompleteSpec) {
      setProductError('Complete or remove each detailed specification before adding the product.');
      setIsCreatingProduct(false);
      return;
    }

    try {
      const product = await createProduct({
        title: productForm.title,
        description: productForm.description || undefined,
        category_id: productForm.category_id,
        condition: productForm.condition,
        primary_image: productForm.primary_image,
        additional_images: productForm.additional_images.map((image) => image.trim()).filter(Boolean),
        detailed_specs: detailedSpecs.length ? Object.fromEntries(detailedSpecs.map((spec) => [spec.key.trim(), spec.value.trim()])) : undefined,
      });
      setProducts((previous) => [product, ...previous]);
      setSelectedProductId(product.id);
      setProductForm({ ...emptyProduct, category_id: categories[0]?.id || '' });
      setDetailedSpecs([]);
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
        product.id === selectedProductId ? { ...product, registration_status: auction.status, active_auction: auction } : product
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
          <div className={styles.productTabs} role="tablist" aria-label="Filter products by auction availability">
            {productTabs.map((tab) => <button key={tab.status} className={productStatus === tab.status ? styles.productTabActive : ''} type="button" role="tab" aria-selected={productStatus === tab.status} onClick={() => setProductStatus(tab.status)}>{tab.label}<span>{products.filter((product) => product.registration_status === tab.status).length}</span></button>)}
          </div>
          <div className={styles.productGrid}>
            {visibleProducts.map((product) => (
              <button className={styles.product} type="button" key={product.id} onClick={() => openProductDetail(product)}>
                <img src={product.primary_image} alt="" />
                <div><h3>{product.title}</h3><p>{product.category.name} · {product.condition}</p></div>
              </button>
            ))}
          </div>
          {!isLoadingProducts && !productError && products.length > 0 && visibleProducts.length === 0 ? <p className={styles.note}>No {productTabs.find((tab) => tab.status === productStatus)?.label.toLowerCase()}.</p> : null}
        </section>

        <section className={styles.section} id="create-product">
          <div className={styles.heading}><div><p className={styles.eyebrow}>NEW INVENTORY</p><h2>Create Product</h2><p>Add item details before setting the auction price and schedule.</p></div></div>
          <form className={styles.form} onSubmit={createProductHandler}>
            <label>Product title<input value={productForm.title} onChange={(event) => setProductForm({ ...productForm, title: event.target.value })} placeholder="e.g. Hand-thrown ceramic vase" required /></label>
            <label>Category<select value={productForm.category_id} onChange={(event) => setProductForm({ ...productForm, category_id: event.target.value })} required disabled={!categories.length}><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label>Condition<select value={productForm.condition} onChange={(event) => setProductForm({ ...productForm, condition: event.target.value })}><option>NEW</option><option>USED</option><option>REFURBISHED</option></select></label>
            <label>Primary image URL<input type="url" value={productForm.primary_image} onChange={(event) => setProductForm({ ...productForm, primary_image: event.target.value })} placeholder="https://example.com/item.jpg" required /></label>
            <div className={`${styles.full} ${styles.additionalImages}`}><span>Additional image URLs</span>{productForm.additional_images.map((image, index) => <input key={index} type="url" value={image} onChange={(event) => updateAdditionalImage(index, event.target.value)} placeholder="https://example.com/item-detail.jpg" />)}<button className="btn-outline" type="button" onClick={addAdditionalImage}>Add image</button></div>
            <label className={styles.full}>Description<textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} placeholder="Condition, provenance, and included details" rows="3" /></label>
            <div className={`${styles.full} ${styles.specifications}`}><span>Detailed specifications</span>{detailedSpecs.map((spec, index) => <div className={styles.specificationRow} key={index}><input value={spec.key} onChange={(event) => updateDetailedSpec(index, 'key', event.target.value)} placeholder="e.g. Storage" required /><input value={spec.value} onChange={(event) => updateDetailedSpec(index, 'value', event.target.value)} placeholder="e.g. 256 GB" required /><button className={styles.removeSpec} type="button" onClick={() => removeDetailedSpec(index)} aria-label={`Remove ${spec.key || 'specification'}`}>Remove</button></div>)}<button className="btn-outline" type="button" onClick={addDetailedSpec}>Add specification</button></div>
            <button className="btn-primary" type="submit" disabled={isCreatingProduct || !categories.length}>{isCreatingProduct ? 'Adding product...' : 'Add product'}</button>
          </form>
        </section>

        <section className={styles.section} id="register-auction">
          <div className={styles.heading}><div><p className={styles.eyebrow}>LISTING SETUP</p><h2>Register Auction</h2><p>Choose a ready product, set its opening bid, and schedule the room.</p></div></div>
          {auctionError ? <p className={styles.error}>{auctionError}</p> : null}
          {auctionMessage ? <p className={styles.note}>{auctionMessage}</p> : null}
          <form className={styles.form} onSubmit={registerAuctionHandler}>
            <div className={`${styles.full} ${styles.selectedProduct}`}>
              {selectedProduct ? <><img src={selectedProduct.primary_image} alt="" /><span><strong>{selectedProduct.title}</strong><small>{selectedProduct.category.name} · {selectedProduct.condition}</small></span></> : <span>No product selected</span>}
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
            <div className={styles.auctionTable}>{sellerAuctions.map((auction) => <article key={auction.id}><img src={auction.product?.image_url || ''} alt="" /><div><span className={`${styles.status} ${styles[auction.status?.toLowerCase()]}`}>{auction.status}</span><h3>{auction.product?.title || 'Untitled product'}</h3><p>{auction.product?.category_name || 'Uncategorized'} · {auction.product?.condition || 'Unknown condition'}</p></div><strong>{formatPrice(auction.current_bid)}</strong><span>{auction.bid_count || 0} bids</span><span>{formatDate(auction.end_time)}</span><button className="btn-outline" type="button" onClick={() => navigate(`/seller/auctions/${auction.id}`)}>View</button></article>)}</div>
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
                  <img src={product.primary_image} alt="" />
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
      {selectedProductDetail ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setSelectedProductDetail(null)}>
          <section className={styles.productDetailModal} role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}><div><p className={styles.eyebrow}>PRODUCT DETAILS</p><h2 id="product-detail-title">{selectedProductDetail.title}</h2></div><button className={styles.closeModal} type="button" onClick={() => setSelectedProductDetail(null)}>Close</button></div>
            <div className={styles.productDetailContent}>
              <div className={styles.productGallery}><div className={styles.productMainImage}><img src={selectedProductImage} alt={selectedProductDetail.title} /></div><div className={styles.productThumbnails}>{[selectedProductDetail.primary_image, ...(selectedProductDetail.additional_images || [])].filter(Boolean).map((image) => <button className={selectedProductImage === image ? styles.thumbnailActive : ''} type="button" key={image} onClick={() => setSelectedProductImage(image)} aria-label="Show product image"><img src={image} alt="" /></button>)}</div></div>
              <div className={styles.productDetailInfo}><p className={styles.productMeta}>{selectedProductDetail.category.name} · {selectedProductDetail.condition}</p><h3>About this product</h3><p>{selectedProductDetail.description || 'No description has been added.'}</p><h3>Detailed specifications</h3>{selectedProductDetail.detailed_specs && Object.keys(selectedProductDetail.detailed_specs).length ? <dl className={styles.specificationList}>{Object.entries(selectedProductDetail.detailed_specs).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl> : <p>No detailed specifications have been added.</p>}</div>
            </div>
          </section>
        </div>
      ) : null}
      <Footer />
    </main>
  );
}