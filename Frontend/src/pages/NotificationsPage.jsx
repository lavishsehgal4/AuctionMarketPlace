import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../api/notificationsApi';
import styles from './NotificationsPage.module.css';

const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const sellerNotificationTypes = new Set(['AUCTION_ENDED', 'AUCTION_UNSOLD']);

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    const loadNotifications = () => getNotifications({ page, limit: 20 })
      .then((result) => {
        if (!isCurrent) return;
        setNotifications(result.notifications || []);
        setPagination(result.pagination || null);
        setError('');
      })
      .catch((requestError) => isCurrent && setError(requestError.message || 'Notifications are unavailable right now.'))
      .finally(() => isCurrent && setIsLoading(false));

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 45000);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
    };
  }, [page]);

  const markRead = (notificationId) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.read_at) return;
    setNotifications((previous) => previous.map((item) => item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item));
    markNotificationRead(notificationId).catch(() => setError('Unable to mark notification as read.'));
  };

  const changePage = (nextPage) => {
    setIsLoading(true);
    setPage(nextPage);
  };

  return <main className={styles.page}>
    <section className={styles.hero}><p>ACCOUNT ACTIVITY</p><h1>Notifications</h1><span>Updates from auctions you joined or created.</span></section>
    <section className={styles.content}>
      {isLoading ? <p className={styles.message}>Loading notifications...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      {!isLoading && !error && notifications.length === 0 ? <p className={styles.message}>You do not have any notifications yet.</p> : null}
      <div className={styles.list}>{notifications.map((notification) => {
        const auctionPath = sellerNotificationTypes.has(notification.type) ? `/seller/auctions/${notification.auction_id}` : `/auction/${notification.auction_id}`;
        return <article className={`${styles.notification} ${notification.read_at ? '' : styles.unread}`} key={notification.id}>
          <div><p>{notification.type.replaceAll('_', ' ')}</p><h2>{notification.title}</h2><span>{notification.message}</span><small>{formatDate(notification.created_at)}</small></div>
          {notification.auction_id ? <div className={styles.actions}><Link to={auctionPath} onClick={() => markRead(notification.id)}>Check auction</Link>{notification.type === 'AUCTION_WON' ? <Link className={styles.reviewAction} to={`/auction/${notification.auction_id}?review=1`} onClick={() => markRead(notification.id)}>Review auction</Link> : null}</div> : null}
        </article>;
      })}</div>
      {pagination?.total_pages > 1 ? <nav className={styles.pagination} aria-label="Notification pages"><button type="button" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {pagination.page} of {pagination.total_pages}</span><button type="button" disabled={page === pagination.total_pages} onClick={() => changePage(page + 1)}>Next</button></nav> : null}
    </section>
  </main>;
}