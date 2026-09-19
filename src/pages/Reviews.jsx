import React, { useState } from 'react';
import { Star, CheckCircle, XCircle, RefreshCw, Filter, ArrowUpDown, X } from 'lucide-react';
import InfiniteDataTable from '../components/InfiniteDataTable';
import CustomSelect from '../components/CustomSelect';
import { getReviews, moderateReview } from '../services/adminService';
import { toast } from '../components/Toast';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Moderation Statuses' },
  { value: 'approved', label: 'Approved Reviews' },
  { value: 'rejected', label: 'Rejected / Hidden Reviews' }
];

const RATING_FILTER_OPTIONS = [
  { value: 'all', label: 'All Star Ratings' },
  { value: '5', label: '⭐⭐⭐⭐⭐ 5 Stars' },
  { value: '4', label: '⭐⭐⭐⭐ 4 Stars' },
  { value: '3', label: '⭐⭐⭐ 3 Stars' },
  { value: '2', label: '⭐⭐ 2 Stars' },
  { value: '1', label: '⭐ 1 Star' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Reviews First' },
  { value: 'oldest', label: 'Oldest Reviews First' },
  { value: 'rating_desc', label: 'Rating: High to Low' },
  { value: 'rating_asc', label: 'Rating: Low to High' }
];

export default function Reviews() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [modifyingId, setModifyingId] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const handleModerate = async (id, status) => {
    setModifyingId(id);
    try {
      await moderateReview(id, { status });
      toast.success(`Review status updated to ${status.toUpperCase()}`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error('Failed to update review: ' + err.message);
    } finally {
      setModifyingId(null);
    }
  };

  const columns = [
    {
      header: 'Product',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {r.productId?.image ? (
            <img
              src={r.productId.image}
              alt=""
              style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '6px',
                background: 'var(--bg-card-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Star size={16} />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{r.productId?.name || 'Product'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.productId?.category || 'General'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Rating & Review',
      render: (r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', marginBottom: '2px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                fill={s <= (r.rating || 5) ? '#f59e0b' : 'none'}
                stroke={s <= (r.rating || 5) ? '#f59e0b' : '#cbd5e1'}
              />
            ))}
            <span style={{ fontWeight: 700, fontSize: '0.78rem', marginLeft: '4px', color: 'var(--text-primary)' }}>
              {r.rating || 5}/5
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            {r.comment || r.title || 'Great product!'}
          </div>
          {Array.isArray(r.images) && r.images.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {r.images.map((img, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomImage(img);
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc'
                  }}
                  title="Click to zoom customer photo"
                >
                  <img src={img} alt="Review attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Customer Details',
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>
            {r.customerId?.name || r.customerName || 'Verified Buyer'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.customerId?.email || ''}</div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (r) => {
        const isApproved = r.status === 'approved' || !r.status;
        const isRejected = r.status === 'rejected';
        return (
          <span
            style={{
              padding: '3px 9px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              background: isApproved
                ? 'rgba(16, 185, 129, 0.12)'
                : isRejected
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(245, 158, 11, 0.12)',
              color: isApproved ? '#10b981' : isRejected ? '#ef4444' : '#f59e0b',
              border: `1px solid ${isApproved ? '#10b98133' : isRejected ? '#ef444433' : '#f59e0b33'}`
            }}
          >
            {isRejected ? 'REJECTED' : 'APPROVED'}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      render: (r) => {
        const isModifying = modifyingId === r._id;
        const isRejected = r.status === 'rejected';

        return (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                color: '#10b981',
                borderColor: !isRejected ? 'rgba(16, 185, 129, 0.4)' : undefined,
                background: !isRejected ? 'rgba(16, 185, 129, 0.08)' : undefined
              }}
              onClick={() => handleModerate(r._id, 'approved')}
              disabled={isModifying}
              title="Approve Review"
            >
              <CheckCircle size={14} /> Approve
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                color: '#ef4444',
                borderColor: isRejected ? 'rgba(239, 68, 68, 0.4)' : undefined,
                background: isRejected ? 'rgba(239, 68, 68, 0.08)' : undefined
              }}
              onClick={() => handleModerate(r._id, 'rejected')}
              disabled={isModifying}
              title="Reject / Hide Review"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reviews &amp; Ratings Moderation</h1>
          <p className="admin-page-subtitle">
            Moderate customer product feedback, approve or reject ratings, filter by star score, and search feedback
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => setRefreshKey((k) => k + 1)}
            title="Refresh Ledger"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <InfiniteDataTable
        key={`${refreshKey}-${statusFilter}-${ratingFilter}-${sortBy}`}
        fetchData={getReviews}
        extraParams={{
          status: statusFilter,
          rating: ratingFilter,
          sortBy
        }}
        columns={columns}
        searchPlaceholder="Search reviews by comment, product or customer name..."
        headerToolbar={
          <>
            <div className="admin-filter-select-wrap" style={{ minWidth: '180px' }}>
              <CustomSelect
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                placeholder="Filter by Status"
              />
            </div>

            <div className="admin-filter-select-wrap" style={{ minWidth: '160px' }}>
              <CustomSelect
                options={RATING_FILTER_OPTIONS}
                value={ratingFilter}
                onChange={(val) => setRatingFilter(val)}
                placeholder="Filter by Rating"
              />
            </div>

            <div className="admin-filter-select-wrap" style={{ minWidth: '180px' }}>
              <CustomSelect
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                placeholder="Sort by"
              />
            </div>

            {(statusFilter !== 'all' || ratingFilter !== 'all' || sortBy !== 'newest') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all');
                  setRatingFilter('all');
                  setSortBy('newest');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color, #3b82f6)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  padding: '0 8px',
                  whiteSpace: 'nowrap'
                }}
              >
                Reset Filters
              </button>
            )}
          </>
        }
        keyField="_id"
      />

      {/* Lightbox Zoom Modal for Customer Review Photo */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              maxWidth: '650px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc'
              }}
            >
              <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>Customer Review Photo Attachment</strong>
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', maxHeight: '75vh' }}>
              <img
                src={zoomImage}
                alt="Zoomed customer photo"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
