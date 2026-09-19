import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Search, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { getReturns, processRefund } from '../services/adminService';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { toast } from '../components/Toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Stages' },
  { value: 'requested', label: 'Return Requested' },
  { value: 'pickup_confirmed', label: 'Pickup Confirmed' },
  { value: 'item_received', label: 'Item Received' },
  { value: 'quality_passed', label: 'Quality Passed' },
  { value: 'refund_credited', label: 'Refund Credited' },
  { value: 'rejected', label: 'Rejected' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Refund: High to Low' },
  { value: 'amount_asc', label: 'Refund: Low to High' },
  { value: 'status', label: 'Status' }
];

export default function Returns() {
  const [returnsList, setReturnsList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchReturns = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getReturns({
        page: requestedPage,
        limit: 15,
        q: search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy
      });
      const items = data.items || [];
      setReturnsList((prev) => (append ? [...prev, ...items] : items));
      setPage(data.page || requestedPage);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    fetchReturns(1, false);
  }, [fetchReturns]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) fetchReturns(page + 1, true);
  };

  const handleApproveRefund = async (ret) => {
    setProcessing(true);
    try {
      const res = await processRefund({
        returnId: ret._id,
        amount: ret.refundAmount || 0,
        method: 'wallet',
        reason: 'Admin approved customer return'
      });
      toast.success('Return approved and ₹' + res.refundAmount + ' credited to customer wallet!');
      setReturnsList((prev) =>
        prev.map((r) => (r._id === ret._id ? { ...r, status: 'refund_credited' } : r))
      );
      setDrawerOpen(false);
    } catch (err) {
      toast.error('Failed to process return: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { header: 'Order Ref' },
    { header: 'Customer' },
    { header: 'Return Reason' },
    { header: 'Refund Value', className: 'text-right' },
    { header: 'Return Stage', className: 'text-center' },
    { header: 'Action', className: 'text-center' }
  ];

  const renderRow = (ret) => (
    <tr key={ret._id}>
      <td>
        <strong style={{ fontSize: '13px', color: 'var(--admin-primary)' }}>#{ret.orderId?.orderId || 'ORD'}</strong>
        <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>ID: {ret._id}</div>
      </td>
      <td>
        <strong>{ret.customerId?.name || 'Customer'}</strong>
        <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>{ret.customerId?.email}</div>
      </td>
      <td>{ret.reason || 'Item defect or sizing issue'}</td>
      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-warning)' }}>
        ₹{Number(ret.refundAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td style={{ textAlign: 'center' }}>
        <span className={`admin-badge ${ret.status === 'refund_credited' ? 'success' : ret.status === 'rejected' ? 'danger' : 'warning'}`}>
          {ret.status?.replace(/_/g, ' ')}
        </span>
      </td>
      <td style={{ textAlign: 'center' }}>
        <button
          type="button"
          className="admin-btn admin-btn-outline"
          style={{ padding: '4px 10px', fontSize: '12px' }}
          onClick={() => {
            setSelectedReturn(ret);
            setDrawerOpen(true);
          }}
        >
          <Eye size={13} />
          <span>Review</span>
        </button>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Customer Return Requests</h2>
          <p className="admin-page-subtitle">Inspect customer return claims, approve restocks, and trigger automated wallet credits</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer name/email, or reason..."
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
        data={returnsList}
        renderRow={renderRow}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyIcon={RotateCcw}
        emptyTitle="No Active Return Requests"
        emptyMessage="Return claims submitted by customers will be queued here for review."
      />

      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Return Claim Review"
        icon={RotateCcw}
      >
        {selectedReturn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--admin-surface)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
              <div><strong>Order Reference:</strong> #{selectedReturn.orderId?.orderId || 'ORD'}</div>
              <div><strong>Customer:</strong> {selectedReturn.customerId?.name} ({selectedReturn.customerId?.email})</div>
              <div><strong>Refund Amount:</strong> ₹{Number(selectedReturn.refundAmount || 0).toLocaleString('en-IN')}</div>
              <div style={{ marginTop: '8px' }}><strong>Customer Stated Reason:</strong> {selectedReturn.reason || 'None'}</div>
            </div>

            {selectedReturn.status !== 'refund_credited' && (
              <button
                type="button"
                disabled={processing}
                className="admin-btn admin-btn-primary"
                onClick={() => handleApproveRefund(selectedReturn)}
                style={{ height: '42px', fontSize: '13.5px' }}
              >
                {processing ? 'Crediting Wallet...' : 'Approve & Credit ₹' + (selectedReturn.refundAmount || 0) + ' to Wallet'}
              </button>
            )}
          </div>
        )}
      </SidepanelDrawer>
    </div>
  );
}

