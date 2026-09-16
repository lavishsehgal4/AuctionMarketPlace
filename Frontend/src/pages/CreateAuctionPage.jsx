// Full-page view: seller form to create a new auction listing.
// Submits data via: src/api/auctionsApi.js (no-op in MVP).
// No sub-components — form lives directly in this file.

import { useState } from 'react';
import { createAuction } from '../api/auctionsApi';
import styles from './CreateAuctionPage.module.css';

const CATEGORIES = ['Photography', 'Furniture', 'Books', 'Music', 'Watches', 'Art', 'Other'];

const EMPTY_FORM = {
  title: '',
  description: '',
  category: '',
  startingPrice: '',
  minBidIncrement: '',
  startTime: '',
  endTime: '',
};

export default function CreateAuctionPage({ currentUser }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await createAuction({ ...form, sellerId: currentUser?.id });
      setSubmitted(true);
    } catch {
      setError('We could not create your auction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <main className="page-content">
        <div className={styles.successState}>
          <span className={styles.successIcon} aria-hidden="true">🎉</span>
          <h2>Auction listed!</h2>
          <p>
            In a real version this would go live immediately. For now, it's just a demo.
          </p>
          <button className="btn-primary" onClick={handleReset}>
            List another auction
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>Start an Auction</h1>
        <p className={styles.subheading}>
          Fill in the details below and list your item for bidding.
        </p>
      </div>

      <div className={styles.layout}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Item details */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Item details</h2>

            <div className={styles.field}>
              <label htmlFor="title">Item name</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Vintage Leica M3 Camera"
                required
                maxLength={120}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the item — condition, history, what's included…"
                rows={5}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Pricing */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Pricing</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="startingPrice">Starting price ($)</label>
                <input
                  id="startingPrice"
                  name="startingPrice"
                  type="number"
                  min="1"
                  step="1"
                  value={form.startingPrice}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="minBidIncrement">Min. bid increment ($)</label>
                <input
                  id="minBidIncrement"
                  name="minBidIncrement"
                  type="number"
                  min="1"
                  step="1"
                  value={form.minBidIncrement}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  required
                />
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Schedule</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="startTime">Start time</label>
                <input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="endTime">End time</label>
                <input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          <div className={styles.actions}>
            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={submitting}>
              {submitting ? 'Listing…' : '🏷️ List Auction'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setForm(EMPTY_FORM)}
            >
              Clear form
            </button>
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </form>

        {/* Side preview */}
        <aside className={styles.preview} aria-label="Listing preview">
          <h3 className={styles.previewTitle}>Preview</h3>
          <div className={styles.previewCard}>
            <div className={styles.previewImagePlaceholder} aria-hidden="true">📷</div>
            <div className={styles.previewBody}>
              <p className={styles.previewName}>
                {form.title || <span className={styles.placeholder}>Item name</span>}
              </p>
              <p className={styles.previewCategory}>
                {form.category || <span className={styles.placeholder}>Category</span>}
              </p>
              <p className={styles.previewPrice}>
                {form.startingPrice
                  ? `$${Number(form.startingPrice).toLocaleString()}`
                  : <span className={styles.placeholder}>$0</span>}
              </p>
              <p className={styles.previewHint}>Starting price</p>
            </div>
          </div>
          <p className={styles.previewNote}>
            This is how your listing will appear to bidders.
          </p>
        </aside>
      </div>
    </main>
  );
}
