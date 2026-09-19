import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Store, Search, CheckCircle, Ban, Eye, Mail, Award, Clock } from 'lucide-react';
import { getVendors, updateVendorStatus } from '../services/adminService';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { toast } from '../components/Toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Vendors' },
  { value: 'active', label: 'Active Partners' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending_approval', label: 'Pending Approval' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'business_asc', label: 'Store Name (A-Z)' }
];

export default function Vendors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const sParam = searchParams.get('status') || 'all';
  const inspectIdParam = searchParams.get('inspectId') || '';

  const [vendors, setVendors] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState(qParam);
  const [statusFilter, setStatusFilter] = useState(sParam);
  const [sortBy, setSortBy] = useState('newest');

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchVendors = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getVendors({
        page: requestedPage,
        limit: 15,
        q: search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy
      });
      const items = data.items || [];
      setVendors((prev) => (append ? [...prev, ...items] : items));
      setPage(data.page || requestedPage);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error('Failed to load vendors:', err);
      toast.error('Failed to fetch vendors');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    fetchVendors(1, false);
  }, [fetchVendors]);

  // Synchronize when URL searchParams change
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== search) setSearch(q);
    else if (q === null && search !== '') setSearch('');

    const s = searchParams.get('status');
    if (s && s !== statusFilter) setStatusFilter(s);
    else if (!s && statusFilter !== 'all') setStatusFilter('all');
  }, [searchParams]);

  // Automatically open drawer if inspectId is present in URL
  useEffect(() => {
    if (inspectIdParam && vendors.length > 0) {
      const match = vendors.find(
        (v) => String(v._id) === String(inspectIdParam)
      );
      if (match) {
        setSelectedVendor(match);
        setDrawerOpen(true);
      }
    }
  }, [inspectIdParam, vendors]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchVendors(page + 1, true);
    }
  };

  const handleUpdateStatus = async (vendorId, newStatus) => {
    try {
      const res = await updateVendorStatus(vendorId, newStatus);
      toast.success(res.msg);
      setVendors((prev) =>
        prev.map((v) => (v._id === vendorId ? { ...v, status: newStatus } : v))
      );
      if (selectedVendor && selectedVendor._id === vendorId) {
        setSelectedVendor((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const columns = [
    { header: 'Vendor Merchant / Email' },
    { header: 'Business / Brand' },
    { header: 'Commission Rate' },
    { header: 'Partner Status', className: 'text-center' },
    { header: 'Actions', className: 'text-center' }
  ];

  const renderRow = (v) => {
    const status = v.status || 'active';
    const isSuspended = status === 'suspended';
    const isPending = status === 'pending_approval';

    return (
      <tr key={v._id}>
        <td>
          <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--admin-text-main)' }}>{v.name}</strong>
          <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>{v.email}</span>
        </td>
        <td>{v.businessName || v.name || 'Store'}</td>
        <td style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>5.0% Standard</td>
        <td style={{ textAlign: 'center' }}>
          <span className={`admin-badge ${status === 'active' ? 'success' : isSuspended ? 'danger' : 'warning'}`}>
            {status.replace(/_/g, ' ')}
          </span>
        </td>
        <td style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              style={{ padding: '5px 10px', fontSize: '12px' }}
              onClick={() => {
                setSelectedVendor(v);
                setDrawerOpen(true);
              }}
            >
              <Eye size={13} />
              <span>Details</span>
            </button>
            {isSuspended ? (
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--admin-success)' }}
                onClick={() => handleUpdateStatus(v._id, 'active')}
              >
                <CheckCircle size={13} />
                <span>Activate</span>
              </button>
            ) : (
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => handleUpdateStatus(v._id, 'suspended')}
              >
                <Ban size={13} />
                <span>Suspend</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Vendor & Merchant Management</h2>
          <p className="admin-page-subtitle">Oversee merchant partners, evaluate account verifications, and inspect revenues</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search vendors by name, email, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-select-wrap">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
        </div>

        <div className="admin-filter-select-wrap">
          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      <InfiniteDataTable
        columns={columns}
        data={vendors}
        renderRow={renderRow}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyIcon={Store}
        emptyTitle="No Vendors Found"
      />

      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedVendor?.name || 'Vendor Details'}
        subtitle={selectedVendor?.email}
        icon={Store}
      >
        {selectedVendor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', background: 'var(--admin-surface)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>Vendor Details</span>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                <div><strong>Merchant:</strong> {selectedVendor.name}</div>
                <div><strong>Email:</strong> {selectedVendor.email}</div>
                <div><strong>Joined On:</strong> {new Date(selectedVendor.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--admin-surface)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--admin-text-main)', display: 'block' }}>Account Status</strong>
                <span style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>Current status is {selectedVendor.status || 'active'}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  onClick={() => handleUpdateStatus(selectedVendor._id, 'active')}
                >
                  Set Active
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={() => handleUpdateStatus(selectedVendor._id, 'suspended')}
                >
                  Suspend
                </button>
              </div>
            </div>
          </div>
        )}
      </SidepanelDrawer>
    </div>
  );
}

