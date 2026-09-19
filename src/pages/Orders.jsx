import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Eye, Truck, CheckCircle2, XCircle, FileText, ArrowRight, Printer } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../services/adminService';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { toast } from '../components/Toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'placed', label: 'Placed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out For Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Amount: High to Low' },
  { value: 'amount_asc', label: 'Amount: Low to High' },
  { value: 'status', label: 'Status' }
];

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const sParam = searchParams.get('status') || 'all';
  const inspectIdParam = searchParams.get('inspectId') || '';

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState(qParam);
  const [statusFilter, setStatusFilter] = useState(sParam);
  const [sortBy, setSortBy] = useState('newest');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getOrders({
        page: requestedPage,
        limit: 15,
        q: search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy
      });
      const items = data.items || [];
      setOrders((prev) => (append ? [...prev, ...items] : items));
      setPage(data.page || requestedPage);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error('Failed to load orders:', err);
      toast.error('Failed to load orders');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    fetchOrders(1, false);
  }, [fetchOrders]);

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
    if (inspectIdParam && orders.length > 0) {
      const match = orders.find(
        (o) =>
          String(o._id) === String(inspectIdParam) ||
          String(o.orderId) === String(inspectIdParam)
      );
      if (match) {
        setSelectedOrder(match);
        setDrawerOpen(true);
      }
    }
  }, [inspectIdParam, orders]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchOrders(page + 1, true);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const res = await updateOrderStatus(orderId, { status: newStatus });
      toast.success(res.msg || `Order moved to ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { header: 'Order & Invoice ID' },
    { header: 'Customer' },
    { header: 'Date Placed' },
    { header: 'Items & Units' },
    { header: 'Total Value', className: 'text-right' },
    { header: 'Order Status', className: 'text-center' },
    { header: 'Actions', className: 'text-center' }
  ];

  const renderRow = (ord) => {
    const orderDisplay = ord.orderId || String(ord._id).slice(-8).toUpperCase();
    const invoiceDisplay = ord.invoiceId || `INV-${orderDisplay.replace(/^ORD-?/, '')}`;
    const itemCount = (ord.items || []).length || 1;

    return (
      <tr key={ord._id}>
        <td>
          <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--admin-primary)' }}>#{orderDisplay}</strong>
          <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>{invoiceDisplay}</span>
        </td>
        <td>
          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--admin-text-main)' }}>{ord.customerId?.name || 'Customer'}</strong>
          <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>{ord.customerId?.email}</span>
        </td>
        <td style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
          {new Date(ord.createdAt).toLocaleDateString('en-IN')}
        </td>
        <td>{itemCount} product{itemCount > 1 ? 's' : ''}</td>
        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-text-main)' }}>
          ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>
        <td style={{ textAlign: 'center' }}>
          <span className={`admin-badge ${ord.status === 'delivered' ? 'success' : ord.status === 'cancelled' ? 'danger' : 'info'}`}>
            {ord.status?.replace(/_/g, ' ')}
          </span>
        </td>
        <td style={{ textAlign: 'center' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            onClick={() => {
              setSelectedOrder(ord);
              setDrawerOpen(true);
            }}
          >
            <Eye size={13} />
            <span>Inspect</span>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Orders Management & Logistics</h2>
          <p className="admin-page-subtitle">Track and progress customer orders across placed, packed, shipped, and delivered states</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search orders by Order ID or Invoice ID..."
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
        data={orders}
        renderRow={renderRow}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyIcon={ShoppingBag}
        emptyTitle="No Orders Found"
      />

      {/* Inspection Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Order #${selectedOrder?.orderId || 'ORD'}`}
        subtitle={`Invoice: ${selectedOrder?.invoiceId || 'N/A'}`}
        icon={ShoppingBag}
        maxWidth="580px"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status Transition Bar */}
            <div style={{ padding: '16px', background: 'var(--admin-surface)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>Current Order Status</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <span className={`admin-badge ${selectedOrder.status === 'delivered' ? 'success' : selectedOrder.status === 'cancelled' ? 'danger' : 'info'}`} style={{ fontSize: '13px', padding: '4px 10px' }}>
                  {selectedOrder.status?.toUpperCase().replace(/_/g, ' ')}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {selectedOrder.status === 'placed' && (
                    <button
                      type="button"
                      disabled={updating}
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'packed')}
                    >
                      Mark Packed
                    </button>
                  )}
                  {selectedOrder.status === 'packed' && (
                    <button
                      type="button"
                      disabled={updating}
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'shipped')}
                    >
                      Mark Shipped
                    </button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <button
                      type="button"
                      disabled={updating}
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'out_for_delivery')}
                    >
                      Out for Delivery
                    </button>
                  )}
                  {selectedOrder.status === 'out_for_delivery' && (
                    <button
                      type="button"
                      disabled={updating}
                      className="admin-btn admin-btn-primary"
                      style={{ padding: '5px 12px', fontSize: '12px', background: 'var(--admin-success)' }}
                      onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')}
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--admin-text-main)' }}>
                Purchased Products ({(selectedOrder.items || []).length || 1})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--admin-surface)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--admin-text-main)' }}>{it.name || 'Product'}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>Vendor: {it.vendorName || 'Vendor'} • Qty: {it.qty || 1}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                      ₹{Number(it.price * (it.qty || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Breakdown */}
            <div style={{ padding: '16px', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '10px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>Financial Summary</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Subtotal</span>
                <strong>₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Shipping Delivery</span>
                <strong style={{ color: 'var(--admin-success)' }}>FREE</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--admin-border)' }}>
                <span>Total Settled</span>
                <span style={{ color: 'var(--admin-primary)' }}>₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div style={{ padding: '14px', background: 'var(--admin-surface)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>Delivery Destination</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--admin-text-main)' }}>
                  <strong>{selectedOrder.shippingAddress.fullName}</strong><br />
                  {selectedOrder.shippingAddress.addressLine1 || selectedOrder.shippingAddress.address}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>
        )}
      </SidepanelDrawer>
    </div>
  );
}

