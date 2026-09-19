import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getStockHistory } from '../services/adminService';
import InfiniteDataTable from '../components/InfiniteDataTable';
import CustomSelect from '../components/CustomSelect';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'qty_desc', label: 'Qty: High to Low' },
  { value: 'qty_asc', label: 'Qty: Low to High' }
];

export default function StockHistory() {
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchHistory = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getStockHistory({
        page: requestedPage,
        limit: 20,
        q: search,
        sortBy
      });
      const items = data.items || [];
      setHistory((prev) => (append ? [...prev, ...items] : items));
      setPage(data.page || requestedPage);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error(err);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [search, sortBy]);

  useEffect(() => {
    fetchHistory(1, false);
  }, [fetchHistory]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) fetchHistory(page + 1, true);
  };

  const columns = [
    { header: 'Product Item' },
    { header: 'Event / Reason' },
    { header: 'Quantity Changed', className: 'text-center' },
    { header: 'Balance After', className: 'text-center' },
    { header: 'Timestamp' }
  ];

  const renderRow = (h) => {
    // 1. Resolve quantity change from field or fallback to regex from reason
    let qtyChange = h.quantityChange ?? h.quantityChanged;
    if (qtyChange == null && h.reason) {
      const match = h.reason.match(/\(([+-]?\d+)\s*(?:units?)?\)/i);
      if (match) {
        qtyChange = parseInt(match[1], 10);
      }
    }
    const isAddition = (qtyChange || 0) > 0;
    const isZero = qtyChange === 0;

    // 2. Resolve balance after from field or calculate
    let balanceAfter = h.stockAfter ?? h.newQuantity;
    if (balanceAfter == null) {
      if (h.stockBefore != null && qtyChange != null) {
        balanceAfter = h.stockBefore + qtyChange;
      } else if (h.productId?.quantity != null) {
        balanceAfter = h.productId.quantity;
      }
    }

    return (
      <tr key={h._id}>
        <td>
          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--admin-text-main)' }}>
            {h.productId?.name || 'Product'}
          </strong>
          <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>
            Vendor: {h.vendorId?.name || 'Vendor'}
          </span>
        </td>
        <td>
          <span style={{ fontSize: '12.5px', color: 'var(--admin-text-main)', fontWeight: 500 }}>
            {h.reason?.replace(/_/g, ' ') || 'Stock adjustment'}
          </span>
          {h.type && (
            <span style={{ display: 'block', fontSize: '10.5px', color: 'var(--admin-text-sub)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
              {h.type.replace(/_/g, ' ')}
            </span>
          )}
        </td>
        <td style={{ textAlign: 'center' }}>
          {qtyChange != null ? (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '12px',
                background: isAddition ? 'rgba(16, 185, 129, 0.12)' : isZero ? 'var(--admin-surface)' : 'rgba(239, 68, 68, 0.12)',
                color: isAddition ? 'var(--admin-success)' : isZero ? 'var(--admin-text-sub)' : 'var(--admin-danger)'
              }}
            >
              {isAddition ? `+${qtyChange}` : qtyChange}
            </span>
          ) : (
            <span style={{ color: 'var(--admin-text-sub)' }}>—</span>
          )}
        </td>
        <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '13px', color: 'var(--admin-text-main)' }}>
          {balanceAfter != null ? `${balanceAfter} Units` : '—'}
        </td>
        <td style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
          {new Date(h.createdAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Stock Movement & Ledger</h2>
          <p className="admin-page-subtitle">Complete chronological trace of inventory restocks, checkout deductions, and returns</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search stock movements by product name, reason, or event type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
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
        data={history}
        renderRow={renderRow}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyIcon={History}
        emptyTitle="No Stock Movements Recorded"
        emptyMessage="Inventory movements will automatically log here as orders and restocks occur."
      />
    </div>
  );
}

