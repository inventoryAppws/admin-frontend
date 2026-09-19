import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Plus, CheckCircle, Clock, Percent, DollarSign, Calendar, Ticket, Edit3, Trash2, Search } from 'lucide-react';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import EmptyState from '../components/EmptyState';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/adminService';
import { toast } from '../components/Toast';

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount (₹)' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const FILTER_TYPE_OPTIONS = [
  { value: 'all', label: 'All Discount Types' },
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount (₹)' }
];

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active Only' },
  { value: 'inactive', label: 'Inactive Only' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'code_asc', label: 'Code (A - Z)' },
  { value: 'value_desc', label: 'Highest Discount' },
  { value: 'value_asc', label: 'Lowest Discount' },
  { value: 'expiry_asc', label: 'Expiring Soonest' }
];

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Edit drawer state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState('active');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(Array.isArray(data) ? data : (data?.items || []));
    } catch (err) {
      toast.error('Failed to load coupons: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderAmount('');
    setMaxDiscount('');
    setExpiryDate('');
    setStatus('active');
    setDrawerOpen(true);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      toast.error('Code and discount value are required');
      return;
    }
    setSubmitting(true);
    try {
      await createCoupon({
        code: code.toUpperCase().trim(),
        title: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscount ? Number(maxDiscount) : 0,
        expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: status === 'active'
      });
      toast.success(`Coupon ${code.toUpperCase()} created successfully!`);
      setDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to create coupon: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setCode(c.code || '');
    setDiscountType(c.discountType || 'percentage');
    setDiscountValue(c.discountValue != null ? String(c.discountValue) : '');
    setMinOrderAmount(c.minOrderAmount != null ? String(c.minOrderAmount) : '');
    setMaxDiscount(c.maxDiscountAmount || c.maxDiscount ? String(c.maxDiscountAmount || c.maxDiscount) : '');
    if (c.expiryDate) {
      const d = new Date(c.expiryDate);
      setExpiryDate(d.toISOString().split('T')[0]);
    } else {
      setExpiryDate('');
    }
    setStatus(c.isActive !== false ? 'active' : 'inactive');
    setEditDrawerOpen(true);
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;
    if (!code || !discountValue) {
      toast.error('Code and discount value are required');
      return;
    }
    setSubmitting(true);
    try {
      await updateCoupon(editingCoupon._id, {
        code: code.toUpperCase().trim(),
        title: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscount ? Number(maxDiscount) : 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: status === 'active'
      });
      toast.success(`Coupon ${code.toUpperCase()} updated successfully!`);
      setEditDrawerOpen(false);
      setEditingCoupon(null);
      loadData();
    } catch (err) {
      toast.error('Failed to update coupon: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (c) => {
    if (!window.confirm(`Are you sure you want to remove coupon "${c.code}"?`)) {
      return;
    }
    try {
      await deleteCoupon(c._id);
      toast.success(`Coupon "${c.code}" removed successfully`);
      loadData();
    } catch (err) {
      toast.error('Failed to remove coupon: ' + (err.response?.data?.msg || err.message));
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons
      .filter((c) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesCode = (c.code || '').toLowerCase().includes(q);
          const matchesTitle = (c.title || '').toLowerCase().includes(q);
          if (!matchesCode && !matchesTitle) return false;
        }
        if (typeFilter !== 'all' && c.discountType !== typeFilter) {
          return false;
        }
        if (statusFilter === 'active' && c.isActive === false) {
          return false;
        }
        if (statusFilter === 'inactive' && c.isActive !== false) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'code_asc') {
          return (a.code || '').localeCompare(b.code || '');
        }
        if (sortBy === 'value_desc') {
          return Number(b.discountValue || 0) - Number(a.discountValue || 0);
        }
        if (sortBy === 'value_asc') {
          return Number(a.discountValue || 0) - Number(b.discountValue || 0);
        }
        if (sortBy === 'expiry_asc') {
          const expA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          const expB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          return expA - expB;
        }
        // default: newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [coupons, search, typeFilter, statusFilter, sortBy]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Coupons & Promo Codes</h1>
          <p className="admin-page-subtitle">Create and manage customer discount vouchers, promo thresholds, and validity</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleOpenCreate}
        >
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Toolbar: Search, Filters, and Sorting in cohesive layout */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <div className="admin-search-wrap" style={{ flex: '1 1 240px', minWidth: '200px' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by coupon code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '180px' }}>
          <CustomSelect
            options={FILTER_TYPE_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Discount Type"
          />
        </div>

        <div style={{ width: '150px' }}>
          <CustomSelect
            options={FILTER_STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status"
          />
        </div>

        <div style={{ width: '180px' }}>
          <CustomSelect
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ gridColumn: '1/-1' }}>
            <EmptyState
              icon={Ticket}
              title={search || typeFilter !== 'all' || statusFilter !== 'all' ? "No Coupons Match Filters" : "No Coupons Active"}
              message={search || typeFilter !== 'all' || statusFilter !== 'all' ? "Try adjusting your search criteria or resetting filters." : "Create promotional discount vouchers and coupon codes to boost customer checkout conversions."}
              actionText={search || typeFilter !== 'all' || statusFilter !== 'all' ? "Clear Filters" : "Create Coupon"}
              onAction={search || typeFilter !== 'all' || statusFilter !== 'all' ? () => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); } : handleOpenCreate}
            />
          </div>
        ) : (
          filteredCoupons.map((c) => (
            <div
              key={c._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: 'var(--card-shadow)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    padding: '6px 14px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px dashed var(--primary-color)',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    letterSpacing: '1px',
                    color: 'var(--primary-color)'
                  }}>
                    {c.code}
                  </div>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    background: c.isActive !== false ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.14)',
                    color: c.isActive !== false ? 'var(--admin-primary)' : '#64748b',
                    border: c.isActive !== false ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(148, 163, 184, 0.25)'
                  }}>
                    {c.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {c.minOrderAmount ? <div>Min Order: ₹{Number(c.minOrderAmount).toLocaleString('en-IN')}</div> : null}
                  {(c.maxDiscountAmount || c.maxDiscount) ? (
                    <div>Max Cap: ₹{Number(c.maxDiscountAmount || c.maxDiscount).toLocaleString('en-IN')}</div>
                  ) : null}
                  {c.expiryDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                      <Calendar size={13} />
                      Valid until {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Edit and Remove Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '12px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => handleOpenEdit(c)}
                  title="Edit Coupon"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  onClick={() => handleDeleteCoupon(c)}
                  title="Remove Coupon"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Coupon Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create New Coupon"
        subtitle="Set up a promotional code for customer checkout"
      >
        <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Coupon Code</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. FESTIVE20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Discount Type</label>
            <CustomSelect
              options={DISCOUNT_TYPES}
              value={discountType}
              onChange={(val) => setDiscountType(val)}
            />
          </div>

          <div>
            <label className="admin-form-label">
              {discountType === 'percentage' ? 'Percentage Discount (%)' : 'Fixed Discount Amount (₹)'}
            </label>
            <input
              type="number"
              min="1"
              max={discountType === 'percentage' ? '100' : undefined}
              className="admin-form-input"
              placeholder={discountType === 'percentage' ? '20' : '200'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Minimum Order Value (₹)</label>
            <input
              type="number"
              min="0"
              className="admin-form-input"
              placeholder="Optional, e.g. 500"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
            />
          </div>

          {discountType === 'percentage' && (
            <div>
              <label className="admin-form-label">Maximum Discount Cap (₹)</label>
              <input
                type="number"
                min="0"
                className="admin-form-input"
                placeholder="Optional, e.g. 1000"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="admin-form-label">Expiry Date</label>
            <input
              type="date"
              className="admin-form-input"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div>
            <label className="admin-form-label">Status</label>
            <CustomSelect
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => setStatus(val)}
            />
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
              {submitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>

      {/* Edit Coupon Drawer */}
      <SidepanelDrawer
        isOpen={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); setEditingCoupon(null); }}
        title={`Edit Coupon: ${editingCoupon?.code || ''}`}
        subtitle="Modify coupon discount, thresholds, expiry, or status"
      >
        <form onSubmit={handleUpdateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Coupon Code</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. FESTIVE20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Discount Type</label>
            <CustomSelect
              options={DISCOUNT_TYPES}
              value={discountType}
              onChange={(val) => setDiscountType(val)}
            />
          </div>

          <div>
            <label className="admin-form-label">
              {discountType === 'percentage' ? 'Percentage Discount (%)' : 'Fixed Discount Amount (₹)'}
            </label>
            <input
              type="number"
              min="1"
              max={discountType === 'percentage' ? '100' : undefined}
              className="admin-form-input"
              placeholder={discountType === 'percentage' ? '20' : '200'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Minimum Order Value (₹)</label>
            <input
              type="number"
              min="0"
              className="admin-form-input"
              placeholder="Optional, e.g. 500"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
            />
          </div>

          {discountType === 'percentage' && (
            <div>
              <label className="admin-form-label">Maximum Discount Cap (₹)</label>
              <input
                type="number"
                min="0"
                className="admin-form-input"
                placeholder="Optional, e.g. 1000"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="admin-form-label">Expiry Date</label>
            <input
              type="date"
              className="admin-form-input"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div>
            <label className="admin-form-label">Status</label>
            <CustomSelect
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => setStatus(val)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => { setEditDrawerOpen(false); setEditingCoupon(null); }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>
    </div>
  );
}

