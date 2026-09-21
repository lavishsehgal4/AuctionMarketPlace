import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuctionCard from '../components/AuctionCard';
import Footer from '../components/Footer';
import { getPublicAuctions } from '../api/auctionsApi';
import { getCategories } from '../api/categoriesApi';
import styles from './BidderHomePage.module.css';

export default function BidderHomePage({ currentUser }) {
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categoryError, setCategoryError] = useState('');
  const [auctionError, setAuctionError] = useState('');
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => setCategoryError(error.message));
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const filters = { category_id: activeCategory === 'all' ? undefined : activeCategory, page: 1, limit: 12 };

    Promise.all([
      getPublicAuctions({ ...filters, view: 'LIVE', sort: 'ending_soon' }),
      getPublicAuctions({ ...filters, view: 'UPCOMING', sort: 'starting_soon' }),
    ])
      .then(([liveResult, upcomingResult]) => {
        if (!isCurrent) return;
        setLiveAuctions(liveResult.auctions || []);
        setUpcomingAuctions(upcomingResult.auctions || []);
      })
      .catch((error) => isCurrent && setAuctionError(error.message))
      .finally(() => isCurrent && setIsLoadingAuctions(false));

    return () => { isCurrent = false; };
  }, [activeCategory]);

  const changeCategory = (categoryId) => {
    if (categoryId === activeCategory) return;
    setIsLoadingAuctions(true);
    setAuctionError('');
    setActiveCategory(categoryId);
  };

  const categoryTabs = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <main className={styles.page}>
      <section className={styles.banner} aria-labelledby="welcome-heading">
        <div className={styles.bannerContent}>
          <p className={styles.eyebrow}>BIDDER DESK</p>
          <h1 id="welcome-heading">Find the piece you will not see twice.</h1>
          <p>Fresh lots, clear bidding, and a front-row seat for every auction.</p>
        </div>
        <div className={styles.bannerNote}>
          <span>{currentUser ? 'WELCOME BACK' : 'OPEN FOR BROWSING'}</span>
          <strong>{currentUser?.display_name || 'Explore every lot'}</strong>
        </div>
      </section>

      <section className={styles.discovery} aria-label="Auction discovery">
        <div className={styles.modeTabs} role="tablist" aria-label="Browse content">
          <button className={styles.modeActive} role="tab" aria-selected="true">Auctions</button>
          <Link className={styles.modeLink} to="/auctioneers">Auctioneers</Link>
        </div>

        <div className={styles.categoryTabs} role="tablist" aria-label="Filter auctions by category">
          {categoryTabs.map((category) => (
            <button
              key={category.id}
              className={`${styles.category} ${activeCategory === category.id ? styles.categoryActive : ''}`}
              onClick={() => changeCategory(category.id)}
              role="tab"
              aria-selected={activeCategory === category.id}
            >
              {category.image_url ? <img src={category.image_url} alt="" /> : null}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        {categoryError ? <p className={styles.categoryError}>Categories are unavailable right now.</p> : null}
        {auctionError ? <p className={styles.categoryError}>{auctionError}</p> : null}

        <section className={styles.section} aria-labelledby="live-auctions-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>HAPPENING NOW</p>
              <h2 id="live-auctions-heading">Live Auctions</h2>
              <p>Make your next bid count. These lots are open for the taking.</p>
            </div>
            <span className={styles.count}>{liveAuctions.length} open</span>
          </div>

          {isLoadingAuctions ? <p className={styles.empty}>Loading live auctions...</p> : null}
          {!isLoadingAuctions && liveAuctions.length > 0 ? (
            <div className={styles.grid}>
              {liveAuctions.map((auction) => <AuctionCard key={auction.id} auction={auction} currentUser={currentUser} />)}
            </div>
          ) : !isLoadingAuctions ? (
            <p className={styles.empty}>No live auctions in this category right now.</p>
          ) : null}
        </section>

        <section className={styles.section} aria-labelledby="on-deck-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>NEXT IN LINE</p>
              <h2 id="on-deck-heading">On Deck</h2>
              <p>Lots preparing to open. Find a favorite before the room fills up.</p>
            </div>
          </div>

          {isLoadingAuctions ? <p className={styles.empty}>Loading upcoming auctions...</p> : null}
          {!isLoadingAuctions && upcomingAuctions.length > 0 ? (
            <div className={styles.grid}>
              {upcomingAuctions.map((auction) => <AuctionCard key={auction.id} auction={auction} currentUser={currentUser} />)}
            </div>
          ) : !isLoadingAuctions ? (
            <p className={styles.empty}>More upcoming lots are being prepared.</p>
          ) : null}
        </section>
      </section>
      <Footer />
    </main>
  );
}