import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Search, CheckCircle2, RotateCcw } from 'lucide-react';
import { getReturns } from '../services/adminService';
import InfiniteDataTable from '../components/InfiniteDataTable';
import CustomSelect from '../components/CustomSelect';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'refund_credited', label: 'Credited to Wallet' },
  { value: 'pending', label: 'Pending Verification' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Refund: High to Low' },
  { value: 'amount_asc', label: 'Refund: Low to High' }
];

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const fetchRefunds = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getReturns({
        page: requestedPage,
        limit: 15,
        q: search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy
      });
      const items = (data.items || []).filter(r => r.refundAmount > 0);
      setRefunds((prev) => (append ? [...prev, ...items] : items));
      setPage(data.page || requestedPage);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    fetchRefunds(1, false);
  }, [fetchRefunds]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) fetchRefunds(page + 1, true);
  };

  const columns = [
    { header: 'Refund Record / Order' },
    { header: 'Customer Recipient' },
    { header: 'Refund Amount', className: 'text-right' },
    { header: 'Refund Method' },
    { header: 'Status', className: 'text-center' },
    { header: 'Credited Timestamp' }
  ];

  const renderRow = (rf) => (
    <tr key={rf._id}>
      <td>
        <strong style={{ fontSize: '13px', color: 'var(--admin-primary)' }}>#{rf.orderId?.orderId || 'ORD'}</strong>
        <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>ID: {rf._id}</div>
      </td>
      <td>
        <strong>{rf.customerId?.name || 'Customer'}</strong>
        <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>{rf.customerId?.email}</div>
      </td>
      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-danger)' }}>
        ₹{Number(rf.refundAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td>
        <span className="admin-badge info">Customer Wallet Credit</span>
      </td>
      <td style={{ textAlign: 'center' }}>
        <span className={`admin-badge ${rf.status === 'refund_credited' ? 'success' : 'warning'}`}>
          {rf.status === 'refund_credited' ? 'Credited Successfully' : 'Pending Verification'}
        </span>
      </td>
      <td style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
        {new Date(rf.updatedAt || rf.createdAt).toLocaleString('en-IN')}
      </td>
    </tr>
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Refund Pipeline & Disbursals</h2>
          <p className="admin-page-subtitle">Track processed refunds, wallet balance reimbursements, and refund audit records</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search refunds by order ID, customer name/email..."
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
        data={refunds}
        renderRow={renderRow}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyIcon={DollarSign}
        emptyTitle="No Refunds Processed Yet"
      />
    </div>
  );
}

