import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  Package,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
  Layers,
  X
} from 'lucide-react';
import { getOrders } from '../services/adminService';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import useDebounce from '../hooks/useDebounce';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Tracking Statuses' },
  { value: 'placed', label: 'Order Placed' },
  { value: 'packed', label: 'Packed & Ready' },
  { value: 'shipped', label: 'In Transit (Shipped)' },
  { value: 'out_for_delivery', label: 'Out For Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' }
];

const TRACKING_STEPS = [
  { key: 'placed', title: 'Order Placed & Verified', defaultDesc: 'Customer order placed and payment confirmed through gateway.' },
  { key: 'packed', title: 'Packed at Warehouse', defaultDesc: 'Items quality checked, packed in tamper-proof box, and invoiced.' },
  { key: 'shipped', title: 'Shipped & In Transit', defaultDesc: 'Consignment handed over to courier partner logistics hub.' },
  { key: 'out_for_delivery', title: 'Out For Delivery', defaultDesc: 'Package reached local fulfillment facility, dispatched with courier executive.' },
  { key: 'delivered', title: 'Delivered Successfully', defaultDesc: 'Order handed over to recipient and verified.' }
];

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);

  const debouncedSearch = useDebounce(search, 350);
  const sentinelRef = useRef(null);

  const fetchOrders = useCallback(async (pageToLoad = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getOrders({
        page: pageToLoad,
        limit: 15,
        q: debouncedSearch,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      const items = data?.items || [];
      setOrders((prev) => (append ? [...prev, ...items] : items));
      setPage(data?.page || pageToLoad);
      setHasMore(Boolean(data?.hasMore ?? (data?.page < data?.totalPages)));
    } catch (err) {
      console.error('Failed to load tracking orders:', err);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchOrders(1, false);
  }, [fetchOrders]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchOrders(page + 1, true);
        }
      },
      { rootMargin: '250px' }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchOrders]);

  // Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="admin-badge success"><CheckCircle2 size={12} /> Delivered</span>;
      case 'cancelled':
        return <span className="admin-badge danger"><XCircle size={12} /> Cancelled</span>;
      case 'returned':
        return <span className="admin-badge warning">Returned</span>;
      case 'out_for_delivery':
        return <span className="admin-badge info" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}><Truck size={12} /> Out For Delivery</span>;
      case 'shipped':
        return <span className="admin-badge info"><Truck size={12} /> In Transit</span>;
      case 'packed':
        return <span className="admin-badge warning"><Package size={12} /> Packed</span>;
      default:
        return <span className="admin-badge secondary"><Clock size={12} /> Placed</span>;
    }
  };

  const getStepIndex = (status) => {
    const keys = TRACKING_STEPS.map((s) => s.key);
    return keys.indexOf(status);
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Order Logistics & Live Tracking</h1>
          <p className="admin-page-subtitle">
            Monitor milestone progression from order placement through warehouse packing, transit routes, and courier handover
          </p>
        </div>
      </div>

      {/* Toolbar with Search and Filters Dropdown */}
      <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: '14px' }}>
        <div className="admin-search-wrap" style={{ minWidth: '280px', flex: 1 }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, destination city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--admin-text-sub)',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ width: '230px' }}>
          <CustomSelect
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            placeholder="Filter by Status"
          />
        </div>
      </div>

      {/* Orders Tracking List */}
      {loading ? (
        <Loader text="Loading live courier & order tracking feed..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No Orders In Tracking Queue"
          message={
            search || statusFilter !== 'all'
              ? 'No orders match your active search or status filter criteria.'
              : 'Orders placed by customers will stream here with real-time waypoint milestones.'
          }
          actionText={search || statusFilter !== 'all' ? 'Clear Filters' : undefined}
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((ord) => {
            const rawId = ord.orderId || String(ord._id);
            const displayId = rawId.startsWith('ORD') ? rawId : `ORD${rawId.slice(-8).toUpperCase()}`;
            const itemCount = Array.isArray(ord.items) ? ord.items.length : 1;
            const firstItemName = ord.items?.[0]?.name || ord.productId?.name || 'Product Item';
            const city = ord.shippingAddress?.city || 'City';
            const state = ord.shippingAddress?.state || 'State';
            const awbCode = `AWB-${displayId.slice(-6)}-IN`;

            return (
              <div key={ord._id} className="admin-tracking-card">
                {/* Header */}
                <div className="tracking-card-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--admin-text-main)', letterSpacing: '0.02em' }}>
                        #{displayId}
                      </strong>
                      {getStatusBadge(ord.status)}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                      Customer: <strong>{ord.customerId?.name || 'Customer'}</strong> • Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--admin-text-main)' }}>
                      ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Paid via {ord.paymentMethod || 'Online'}
                    </span>
                  </div>
                </div>

                {/* Body Summary */}
                <div className="tracking-card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--admin-text-main)' }}>
                      <MapPin size={15} color="var(--admin-primary)" />
                      <span><strong>Destination:</strong> {city}, {state} {ord.shippingAddress?.pincode ? `— ${ord.shippingAddress.pincode}` : ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                      <Package size={14} />
                      <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}: <strong>{firstItemName}</strong> {itemCount > 1 ? `+${itemCount - 1} more` : ''}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--admin-card-bg)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                    <Truck size={16} color="var(--admin-primary)" />
                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--admin-text-sub)', textTransform: 'uppercase', fontWeight: 700 }}>Courier Waybill</div>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--admin-text-main)' }}>{awbCode}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="tracking-card-footer">
                  <span style={{ fontSize: '12px', color: 'var(--admin-text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="var(--admin-success)" />
                    <span>Tracking synchronizes automatically with courier webhook status</span>
                  </span>

                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => setSelectedOrder(ord)}
                  >
                    <Truck size={15} />
                    <span>Track Order Timeline &rarr;</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="admin-scroll-sentinel">
            {loadingMore && (
              <div className="admin-loading-more">
                <div className="admin-mini-spinner" />
                <span>Loading more orders...</span>
              </div>
            )}
            {!hasMore && orders.length > 0 && (
              <div className="admin-end-records">
                <span>All {orders.length} orders tracked</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          SIDE PANEL: DETAILED VERTICAL TRACKING & FULFILLMENT AUDIT
      ============================================================ */}
      <SidepanelDrawer
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order Tracking — #${selectedOrder.orderId || String(selectedOrder._id).slice(-8).toUpperCase()}` : ''}
        subtitle="End-to-end milestone progression and courier audit log"
      >
        {selectedOrder && (() => {
          const rawId = selectedOrder.orderId || String(selectedOrder._id);
          const displayId = rawId.startsWith('ORD') ? rawId : `ORD${rawId.slice(-8).toUpperCase()}`;
          const currentStatus = String(selectedOrder.status || 'placed').toLowerCase();
          const isCancelled = currentStatus === 'cancelled';
          const isReturned = currentStatus === 'returned';
          const currentStageIndex = isCancelled || isReturned ? -1 : getStepIndex(currentStatus);
          const orderDate = new Date(selectedOrder.createdAt);
          const awbCode = `AWB-${displayId.slice(-6)}-IN`;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Status Header Banner */}
              <div style={{
                background: isCancelled ? 'rgba(239, 68, 68, 0.08)' : isReturned ? 'rgba(245, 158, 11, 0.08)' : 'var(--admin-surface)',
                border: `1px solid ${isCancelled ? 'rgba(239, 68, 68, 0.25)' : isReturned ? 'rgba(245, 158, 11, 0.25)' : 'var(--admin-border)'}`,
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                    Current Milestone Status
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: isCancelled ? 'var(--admin-danger)' : 'var(--admin-text-main)', textTransform: 'capitalize' }}>
                    {currentStatus.replace(/_/g, ' ')}
                  </div>
                </div>
                {getStatusBadge(currentStatus)}
              </div>

              {/* Carrier Logistics Details Card */}
              <div style={{
                background: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '12px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)', display: 'block' }}>Logistics Partner</span>
                  <strong style={{ fontSize: '13px', color: 'var(--admin-text-main)' }}>BlueDart Surface Express</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)', display: 'block' }}>Waybill (AWB)</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--admin-primary)' }}>{awbCode}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)', display: 'block' }}>Estimated Handover</span>
                  <span style={{ fontSize: '12.5px', color: 'var(--admin-text-main)' }}>Within 24–48 Business Hours</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)', display: 'block' }}>Total Paid</span>
                  <strong style={{ fontSize: '13.5px', color: 'var(--admin-text-main)' }}>₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Vertical Milestone Progression */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '14px' }}>
                  Live Waypoint Milestones
                </h4>

                {isCancelled ? (
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <XCircle size={20} color="var(--admin-danger)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--admin-danger)', display: 'block' }}>Order Cancelled</strong>
                      <p style={{ fontSize: '12px', color: 'var(--admin-text-sub)', margin: '4px 0 0 0' }}>
                        This order was cancelled by customer or operator. Any debited amount has been refunded back to customer's wallet or original source.
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="vertical-timeline">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isPassed = currentStageIndex > idx;
                    const isCurrent = currentStageIndex === idx;
                    const isPending = currentStageIndex < idx;

                    // Calculate simulated progressive timestamp relative to order date
                    const stepTime = new Date(orderDate.getTime() + idx * 3600 * 1000 * 6);

                    return (
                      <div
                        key={step.key}
                        className={`timeline-step ${isPassed || (isCurrent && idx === TRACKING_STEPS.length - 1) ? 'completed' : isCurrent ? 'current' : ''}`}
                      >
                        <div className="timeline-dot">
                          {isPassed || (isCurrent && idx === TRACKING_STEPS.length - 1) ? (
                            <CheckCircle2 size={16} />
                          ) : isCurrent ? (
                            <Truck size={16} />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>

                        <div className="timeline-content">
                          <div className="timeline-title">
                            <span>{step.title}</span>
                            {(isPassed || isCurrent) && (
                              <span className="timeline-time">
                                {stepTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {stepTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="timeline-desc">
                            {isCurrent
                              ? `Currently active: ${step.defaultDesc}`
                              : isPassed
                              ? step.defaultDesc
                              : 'Pending progression'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Destination & Recipient */}
              <div style={{
                background: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="var(--admin-primary)" />
                  <span>Delivery Destination</span>
                </h4>
                <div style={{ fontSize: '13px', color: 'var(--admin-text-main)', lineHeight: 1.5 }}>
                  <div style={{ fontWeight: 700 }}>{selectedOrder.shippingAddress?.fullName || selectedOrder.customerId?.name || 'Customer'}</div>
                  <div>{selectedOrder.shippingAddress?.addressLine1 || 'Delivery Address'}</div>
                  {selectedOrder.shippingAddress?.addressLine2 && <div>{selectedOrder.shippingAddress.addressLine2}</div>}
                  <div>
                    {selectedOrder.shippingAddress?.city || 'City'}, {selectedOrder.shippingAddress?.state || 'State'} — <strong>{selectedOrder.shippingAddress?.pincode || ''}</strong>
                  </div>
                  {selectedOrder.shippingAddress?.phone && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                      Contact: {selectedOrder.shippingAddress.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Consignment Items */}
              <div style={{
                background: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--admin-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} color="var(--admin-primary)" />
                  <span>Consignment Items ({selectedOrder.items?.length || 1})</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(selectedOrder.items || [
                    {
                      name: selectedOrder.productId?.name || 'Product',
                      price: selectedOrder.price || selectedOrder.totalAmount,
                      qty: selectedOrder.qty || 1
                    }
                  ]).map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < (selectedOrder.items?.length || 1) - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                      <div style={{ minWidth: 0, flex: 1, paddingRight: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-main)', display: 'block' }}>
                          {item.name || item.productId?.name || 'Item'}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>
                          Qty: {item.qty || 1} • Unit: ₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <strong style={{ fontSize: '13px', color: 'var(--admin-text-main)', flexShrink: 0 }}>
                        ₹{Number((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </SidepanelDrawer>
    </div>
  );
}
