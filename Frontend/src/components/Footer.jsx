import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <strong>AuctionMarketPlace</strong>
        <span>Every lot has a story.</span>
      </div>
    </footer>
  );
}