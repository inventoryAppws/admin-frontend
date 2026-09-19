import React, { useState, useEffect } from 'react';
import { Percent, Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import SidepanelDrawer from '../components/SidepanelDrawer';
import { getPromotions, createPromotion, deletePromotion } from '../services/adminService';
import { toast } from '../components/Toast';

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [targetCategory, setTargetCategory] = useState('All');
  const [badgeText, setBadgeText] = useState('MEGA SALE');
  const [bannerImage, setBannerImage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPromotions();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load campaigns: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !discountPercent) {
      toast.error('Campaign title and discount are required');
      return;
    }
    setSubmitting(true);
    try {
      await createPromotion({
        title,
        description,
        tagline: description,
        discountPercent: Number(discountPercent),
        targetCategory: targetCategory || 'All',
        badgeText: badgeText || 'SPECIAL OFFER',
        bannerImage: bannerImage || '',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      toast.success(`Promotional campaign "${title}" launched!`);
      setDrawerOpen(false);
      setTitle('');
      setDescription('');
      setDiscountPercent('');
      setTargetCategory('All');
      setBadgeText('MEGA SALE');
      setBannerImage('');
      setStartDate('');
      setEndDate('');
      loadData();
    } catch (err) {
      toast.error('Failed to create campaign: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this campaign?')) return;
    try {
      await deletePromotion(id);
      toast.success('Campaign deactivated successfully');
      loadData();
    } catch (err) {
      toast.error('Failed to deactivate campaign: ' + err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Marketing Campaigns & Flash Sales</h1>
          <p className="admin-page-subtitle">Schedule site-wide seasonal sales, category discounts, and promotional banners</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setDrawerOpen(true)}
        >
          <Plus size={16} /> Launch Campaign
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading campaigns...</div>
        ) : promotions.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No marketing campaigns active. Click "Launch Campaign" to create one.
          </div>
        ) : (
          promotions.map((p) => (
            <div
              key={p._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="var(--primary-color)" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{p.title}</h3>
                  </div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    onClick={() => handleDelete(p._id)}
                    title="Deactivate"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  {p.description || 'Special seasonal sale across selected categories.'}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '12px' }}>
                  {p.badgeText && (
                    <span style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em'
                    }}>
                      {p.badgeText}
                    </span>
                  )}
                  {p.targetCategory && (
                    <span style={{
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--primary-color)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px'
                    }}>
                      {p.targetCategory}
                    </span>
                  )}
                  <span style={{
                    background: 'rgba(34, 197, 94, 0.12)',
                    color: '#16a34a',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    padding: '3px 10px',
                    borderRadius: '6px'
                  }}>
                    Up to {p.discountPercent}% OFF
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} />
                Valid: {p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : 'Now'} — {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : 'Ongoing'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Launch New Campaign"
        subtitle="Create a customer-facing discount offer"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Campaign Title</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Mega Monsoon Clearance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Discount Percentage (%)</label>
            <input
              type="number"
              min="1"
              max="90"
              className="admin-form-input"
              placeholder="e.g. 40"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Description / Subtitle</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              placeholder="Highlight terms or eligible product categories..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="admin-form-label">Target Category</label>
              <select
                className="admin-form-input"
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Audio">Audio & Sound</option>
                <option value="Mobiles">Smartphones & Tablets</option>
                <option value="Gaming">Gaming & Consoles</option>
                <option value="Fashion">Fashion & Apparel</option>
                <option value="Appliances">Home Appliances</option>
                <option value="Sports">Sports & Fitness</option>
                <option value="Beauty">Beauty & Personal Care</option>
              </select>
            </div>
            <div>
              <label className="admin-form-label">Badge Label</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="e.g. MEGA SALE"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="admin-form-label">Banner Image URL (Optional)</label>
            <input
              type="url"
              className="admin-form-input"
              placeholder="https://images.unsplash.com/... or /banners/..."
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="admin-form-label">Start Date</label>
              <input
                type="date"
                className="admin-form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-form-label">End Date</label>
              <input
                type="date"
                className="admin-form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              {submitting ? 'Launching...' : 'Publish Campaign'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>
    </div>
  );
}

