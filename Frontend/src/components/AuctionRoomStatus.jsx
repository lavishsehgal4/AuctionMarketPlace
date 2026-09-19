import styles from './AuctionRoomStatus.module.css';

export default function AuctionRoomStatus({ roomStatus }) {
  return (
    <div className={`${styles.status} ${roomStatus.joined ? styles.connected : styles.disconnected}`} role="status">
      <span className={styles.dot} aria-hidden="true" />
      <span>{roomStatus.message}</span>
    </div>
  );
}