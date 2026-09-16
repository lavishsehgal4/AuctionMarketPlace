import styles from './ErrorState.module.css';

export default function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className={styles.wrap} role="alert">
      <span className={styles.icon} aria-hidden="true">!</span>
      <h2>Unable to load this page</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}