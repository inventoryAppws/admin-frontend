import React, { useState, useEffect, useMemo } from 'react';
import { Image, Plus, ExternalLink, Eye, Edit3, Trash2, Search } from 'lucide-react';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../services/adminService';
import { toast } from '../components/Toast';
import { API_BASE_URL } from '../services/api';

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanPath}`;
};

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'hidden', label: 'Hidden' }
];

const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'published', label: 'Published Only' },
  { value: 'hidden', label: 'Hidden Only' }
];

const SORT_OPTIONS = [
  { value: 'priority_asc', label: 'Priority (High to Low)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title (A - Z)' }
];

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority_asc');

  // Edit state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  // Custom Confirm Modal Popup State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'danger',
    icon: 'danger',
    onConfirm: null,
    loading: false
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
  };

  // Form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [priority, setPriority] = useState('1');
  const [status, setStatus] = useState('published');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load banners: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setLinkUrl('');
    setPriority('1');
    setStatus('published');
    setDrawerOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      toast.error('Title and Image URL are required');
      return;
    }
    setSubmitting(true);
    try {
      await createBanner({
        title,
        subtitle,
        imageUrl,
        linkUrl: linkUrl || '/',
        priority: Number(priority || 1),
        isActive: status === 'published'
      });
      toast.success('Hero banner uploaded successfully!');
      setDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to create banner: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (b) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl || '');
    setLinkUrl(b.linkUrl || '/');
    setPriority(b.priority != null ? String(b.priority) : '1');
    setStatus(b.isActive !== false ? 'published' : 'hidden');
    setEditDrawerOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBanner) return;
    if (!title || !imageUrl) {
      toast.error('Title and Image URL are required');
      return;
    }
    setSubmitting(true);
    try {
      await updateBanner(editingBanner._id, {
        title,
        subtitle,
        imageUrl,
        linkUrl: linkUrl || '/',
        priority: Number(priority || 1),
        isActive: status === 'published'
      });
      toast.success('Banner updated successfully!');
      setEditDrawerOpen(false);
      setEditingBanner(null);
      loadData();
    } catch (err) {
      toast.error('Failed to update banner: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const executeDeleteBanner = async (b) => {
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await deleteBanner(b._id);
      toast.success(`Banner "${b.title}" removed successfully`);
      loadData();
      closeConfirmModal();
    } catch (err) {
      toast.error('Failed to remove banner: ' + (err.response?.data?.msg || err.message));
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = (b) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Homepage Banner',
      message: `Are you sure you want to remove banner "${b.title}"? It will immediately stop appearing on the customer storefront.`,
      confirmText: 'Yes, Remove Banner',
      confirmVariant: 'danger',
      icon: 'danger',
      onConfirm: () => executeDeleteBanner(b),
      loading: false
    });
  };

  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = (b.title || '').toLowerCase().includes(q);
          const matchesSub = (b.subtitle || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesSub) return false;
        }
        if (statusFilter === 'published' && b.isActive === false) {
          return false;
        }
        if (statusFilter === 'hidden' && b.isActive !== false) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority_asc') {
          return (Number(a.priority) || 1) - (Number(b.priority) || 1);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'title_asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        // default: newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [banners, search, statusFilter, sortBy]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Homepage Banners & Hero Showcase</h1>
          <p className="admin-page-subtitle">Configure high-conversion storefront promotional banners, carousel slides, and deep links</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleOpenCreate}
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Toolbar: Search, Filters, and Sorting */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <div className="admin-search-wrap" style={{ flex: '1 1 260px', minWidth: '220px' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search banners by title or subtitle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '170px' }}>
          <CustomSelect
            options={FILTER_STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status"
          />
        </div>

        <div style={{ width: '210px' }}>
          <CustomSelect
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading banners...</div>
        ) : filteredBanners.length === 0 ? (
          <div style={{ gridColumn: '1/-1' }}>
            <EmptyState
              icon={Image}
              title={search || statusFilter !== 'all' ? "No Banners Match Filters" : "No Banners Configured"}
              message={search || statusFilter !== 'all' ? "Try adjusting your search query or status filter." : "Publish promotional slides and hero campaign banners to feature on the customer storefront."}
              actionText={search || statusFilter !== 'all' ? "Clear Filters" : "Add First Banner"}
              onAction={search || statusFilter !== 'all' ? () => { setSearch(''); setStatusFilter('all'); } : handleOpenCreate}
            />
          </div>
        ) : (
          filteredBanners.map((b) => (
            <div
              key={b._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ height: '160px', width: '100%', background: 'var(--admin-surface, #151e32)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={resolveImageUrl(b.imageUrl)}
                    alt={b.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      // If image path fails, try backend API_BASE_URL path
                      if (!e.target.src.startsWith(API_BASE_URL)) {
                        const clean = b.imageUrl.startsWith('/') ? b.imageUrl : `/${b.imageUrl}`;
                        e.target.src = `${API_BASE_URL}${clean}`;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backdropFilter: 'blur(4px)',
                    zIndex: 2
                  }}>
                    Priority #{b.priority || 1}
                  </div>
                </div>

                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{b.title}</h3>
                  {b.subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{b.subtitle}</p>}

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={13} /> {b.linkUrl || '/'}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: b.isActive !== false ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.14)',
                      color: b.isActive !== false ? 'var(--admin-primary)' : '#64748b',
                      border: b.isActive !== false ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid rgba(148, 163, 184, 0.25)',
                      fontWeight: 700,
                      fontSize: '0.7rem'
                    }}>
                      {b.isActive !== false ? 'PUBLISHED' : 'HIDDEN'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit & Remove */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                borderTop: '1px solid var(--border-color)',
                padding: '12px 16px',
                background: 'var(--bg-card-subtle)'
              }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => handleOpenEdit(b)}
                  title="Edit Banner"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                  onClick={() => handleDelete(b)}
                  title="Remove Banner"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Banner Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Storefront Banner"
        subtitle="Upload a graphic banner for customer app home carousel"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Headline Title</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Mega Summer Electronics Fest"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Subtitle / Subtext</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Enjoy up to 50% discount on headphones"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div>
            <label className="admin-form-label">Image URL</label>
            <input
              type="url"
              className="admin-form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label className="admin-form-label">Target Deep Link</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="/products?category=Electronics"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-form-label">Priority Order</label>
              <input
                type="number"
                min="1"
                className="admin-form-input"
                placeholder="1"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="admin-form-label">Status</label>
            <CustomSelect
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => setStatus(val)}
            />
          </div>

          {imageUrl && (
            <div style={{ marginTop: '8px' }}>
              <label className="admin-form-label">Preview</label>
              <div style={{ height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

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
              {submitting ? 'Publishing...' : 'Publish Banner'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>

      {/* Edit Banner Drawer */}
      <SidepanelDrawer
        isOpen={editDrawerOpen}
        onClose={() => { setEditDrawerOpen(false); setEditingBanner(null); }}
        title={`Edit Banner: ${editingBanner?.title || ''}`}
        subtitle="Update banner image, link, priority, or publication status"
      >
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Headline Title</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Mega Summer Electronics Fest"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Subtitle / Subtext</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Enjoy up to 50% discount on headphones"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div>
            <label className="admin-form-label">Image URL</label>
            <input
              type="url"
              className="admin-form-input"
              placeholder="https://images.unsplash.com/photo-..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label className="admin-form-label">Target Deep Link</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="/products?category=Electronics"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-form-label">Priority Order</label>
              <input
                type="number"
                min="1"
                className="admin-form-input"
                placeholder="1"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="admin-form-label">Status</label>
            <CustomSelect
              options={STATUS_OPTIONS}
              value={status}
              onChange={(val) => setStatus(val)}
            />
          </div>

          {imageUrl && (
            <div style={{ marginTop: '8px' }}>
              <label className="admin-form-label">Preview</label>
              <div style={{ height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => { setEditDrawerOpen(false); setEditingBanner(null); }}
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

      {/* Confirmation Modal Popup */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText="Cancel"
        confirmVariant={confirmModal.confirmVariant}
        icon={confirmModal.icon}
        onConfirm={confirmModal.onConfirm}
        onClose={closeConfirmModal}
        loading={confirmModal.loading}
      />
    </div>
  );
}

