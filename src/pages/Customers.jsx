import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Ban,
  CheckCircle,
  Wallet,
  Eye,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { getCustomers, getCustomerById, toggleCustomerBlock, adjustCustomerWallet } from '../services/adminService';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { toast } from '../components/Toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Customers' },
  { value: 'active', label: 'Active Only' },
  { value: 'blocked', label: 'Blocked Only' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'wallet_desc', label: 'Wallet: High to Low' },
  { value: 'wallet_asc', label: 'Wallet: Low to High' }
];

export default function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const sParam = searchParams.get('status') || 'all';
  const inspectIdParam = searchParams.get('inspectId') || '';

  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState(qParam);
  const [statusFilter, setStatusFilter] = useState(sParam);
  const [sortBy, setSortBy] = useState('newest');

  // Inspection Drawer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Wallet adjustment form
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDirection, setAdjustDirection] = useState('credit');
  const [adjustDesc, setAdjustDesc] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const fetchCustomers = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getCustomers({
        page: requestedPage,
        limit: 15,
        q: search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy
      });
      const items = data.items || [];
      setCustomers((prev) => (append ? [...prev, ...items] : items));
      setPage(data.page || requestedPage);
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error('Failed to load customers:', err);
      toast.error('Failed to fetch customers');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    fetchCustomers(1, false);
  }, [fetchCustomers]);

  // Synchronize when URL searchParams change
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== search) setSearch(q);
    else if (q === null && search !== '') setSearch('');

    const s = searchParams.get('status');
    if (s && s !== statusFilter) setStatusFilter(s);
    else if (!s && statusFilter !== 'all') setStatusFilter('all');
  }, [searchParams]);

  // Automatically inspect customer if inspectId is present in URL
  useEffect(() => {
    if (inspectIdParam && customers.length > 0) {
      const match = customers.find(
        (c) => String(c._id) === String(inspectIdParam)
      );
      if (match) {
        handleInspect(match);
      }
    }
  }, [inspectIdParam, customers]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchCustomers(page + 1, true);
    }
  };

  const handleInspect = async (c) => {
    setSelectedCustomer(c);
    setCustomerDetails(null);
    setDrawerOpen(true);
    setLoadingDetails(true);
    try {
      const details = await getCustomerById(c._id);
      setCustomerDetails(details);
    } catch (err) {
      console.error('Failed to fetch customer profile details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleBlock = async (c) => {
    try {
      const res = await toggleCustomerBlock(c._id);
      toast.success(res.msg);
      setCustomers((prev) =>
        prev.map((item) => (item._id === c._id ? { ...item, isBlocked: !item.isBlocked } : item))
      );
      if (selectedCustomer && selectedCustomer._id === c._id) {
        setSelectedCustomer((prev) => ({ ...prev, isBlocked: !prev.isBlocked }));
      }
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const handleWalletAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustAmount || Number(adjustAmount) <= 0) return toast.error('Enter a valid amount');
    setAdjusting(true);
    try {
      const res = await adjustCustomerWallet(selectedCustomer._id, {
        amount: Number(adjustAmount),
        direction: adjustDirection,
        description: adjustDesc
      });
      toast.success(res.msg);
      setSelectedCustomer((prev) => ({
        ...prev,
        wallet: { ...(prev.wallet || {}), balance: res.balance }
      }));
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === selectedCustomer._id
            ? { ...c, wallet: { ...(c.wallet || {}), balance: res.balance } }
            : c
        )
      );
      setAdjustAmount('');
      setAdjustDesc('');
    } catch (err) {
      toast.error('Failed to adjust wallet: ' + err.message);
    } finally {
      setAdjusting(false);
    }
  };

  const columns = [
    { header: 'Customer / Email' },
    { header: 'Mobile Phone' },
    { header: 'Registered On' },
    { header: 'Wallet Balance', className: 'text-right' },
    { header: 'Account Status', className: 'text-center' },
    { header: 'Actions', className: 'text-center' }
  ];

  const renderRow = (c) => {
    const phoneNumber = c.phone || c.mobile || '';
    return (
      <tr key={c._id}>
        <td>
          <strong style={{ display: 'block', fontSize: '13.5px', color: 'var(--admin-text-main)' }}>{c.name}</strong>
          <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>{c.email}</span>
        </td>
        <td>
          {phoneNumber ? (
            <span style={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--admin-text-main)', fontWeight: 500 }}>
              +91 {phoneNumber}
            </span>
          ) : (
            <span style={{ color: 'var(--admin-text-sub)', fontSize: '12px' }}>Not Provided</span>
          )}
        </td>
        <td style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>
          {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </td>
        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-success)' }}>
          ₹{Number(c.wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>
        <td style={{ textAlign: 'center' }}>
          <span className={`admin-badge ${c.isBlocked ? 'danger' : 'success'}`}>
            {c.isBlocked ? 'Blocked' : 'Active'}
          </span>
        </td>
        <td style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              style={{ padding: '5px 10px', fontSize: '12px' }}
              onClick={() => handleInspect(c)}
            >
              <Eye size={13} />
              <span>Inspect</span>
            </button>
            <button
              type="button"
              className={`admin-btn ${c.isBlocked ? 'admin-btn-outline' : 'admin-btn-danger'}`}
              style={{ padding: '5px 10px', fontSize: '12px' }}
              onClick={() => handleToggleBlock(c)}
              title={c.isBlocked ? 'Unblock Customer' : 'Block Customer'}
            >
              {c.isBlocked ? <CheckCircle size={13} /> : <Ban size={13} />}
              <span>{c.isBlocked ? 'Unblock' : 'Block'}</span>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const activeCustomer = customerDetails?.customer || selectedCustomer;
  const phoneNumber = activeCustomer?.phone || activeCustomer?.mobile || '';

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Customer Management</h2>
          <p className="admin-page-subtitle">Inspect customer profiles, order activity, contact details, and account access</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search customer by name, email, or mobile number..."
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

      {/* Infinite Data Table */}
      <InfiniteDataTable
        columns={columns}
        data={customers}
        renderRow={renderRow}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyIcon={Users}
        emptyTitle="No Customers Found"
        emptyMessage="Try adjusting your search query or filter."
      />

      {/* Sidepanel Drawer for Comprehensive Customer Inspection */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={activeCustomer?.name || 'Customer Profile'}
        subtitle={activeCustomer?.email}
        icon={Users}
      >
        {activeCustomer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Quick Profile Summary */}
            <div style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>
                  Account Profile
                </span>
                <span className={`admin-badge ${activeCustomer.isBlocked ? 'danger' : 'success'}`}>
                  {activeCustomer.isBlocked ? 'Blocked Account' : 'Active Account'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="var(--admin-primary)" />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--admin-text-sub)' }}>Email</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-main)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {activeCustomer.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="var(--admin-primary)" />
                  <div>
                    <div style={{ fontSize: '10.5px', color: 'var(--admin-text-sub)' }}>Phone</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
                      {phoneNumber ? `+91 ${phoneNumber}` : 'Not Provided'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="var(--admin-primary)" />
                  <div>
                    <div style={{ fontSize: '10.5px', color: 'var(--admin-text-sub)' }}>Joined On</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-main)' }}>
                      {new Date(activeCustomer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={14} color="var(--admin-success)" />
                  <div>
                    <div style={{ fontSize: '10.5px', color: 'var(--admin-text-sub)' }}>Wallet Balance</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--admin-success)' }}>
                      ₹{Number(activeCustomer.wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shopping & Order Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{
                background: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <ShoppingBag size={20} color="var(--admin-primary)" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)', fontWeight: 600 }}>TOTAL ORDERS</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--admin-text-main)', marginTop: '2px' }}>
                  {loadingDetails ? '...' : (customerDetails?.totalOrders ?? 0)}
                </div>
              </div>

              <div style={{
                background: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <CreditCard size={20} color="var(--admin-purple)" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '11px', color: 'var(--admin-text-sub)', fontWeight: 600 }}>TOTAL SPENT</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--admin-text-main)', marginTop: '2px' }}>
                  {loadingDetails ? '...' : `₹${Number(customerDetails?.totalSpent || 0).toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                  Recent Orders
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>
                  {(customerDetails?.recentOrders || []).length} recorded
                </span>
              </div>

              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                  Loading order history...
                </div>
              ) : (customerDetails?.recentOrders || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: 'var(--admin-text-sub)' }}>
                  No orders placed yet by this customer.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {customerDetails.recentOrders.slice(0, 5).map((ord) => (
                    <div
                      key={ord._id}
                      style={{
                        padding: '10px 12px',
                        background: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--admin-text-main)', display: 'block' }}>
                          #{ord.orderId || String(ord._id).slice(-8).toUpperCase()}
                        </strong>
                        <span style={{ color: 'var(--admin-text-sub)', fontSize: '11px' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {ord.items?.[0]?.name || 'Item'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                          ₹{Number(ord.totalAmount || ord.price || 0).toLocaleString('en-IN')}
                        </div>
                        <span className={`admin-badge ${ord.status === 'delivered' ? 'success' : ord.status === 'cancelled' ? 'danger' : 'warning'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {ord.status || 'placed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Shipping Addresses */}
            <div style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <MapPin size={15} color="var(--admin-primary)" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                  Saved Addresses
                </span>
              </div>

              {(customerDetails?.addresses || []).length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--admin-text-sub)', textAlign: 'center', padding: '10px' }}>
                  No saved addresses found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {customerDetails.addresses.map((a) => (
                    <div
                      key={a._id}
                      style={{
                        padding: '10px',
                        background: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <strong>{a.fullName}</strong>
                        <span style={{ color: 'var(--admin-primary)', fontWeight: 600, fontSize: '10.5px' }}>{a.type || 'Home'}</span>
                      </div>
                      <div style={{ color: 'var(--admin-text-sub)', fontSize: '11.5px' }}>
                        {a.addressLine1}, {a.city}, {a.state} - {a.pincode}
                      </div>
                      {a.phone && (
                        <div style={{ color: 'var(--admin-text-main)', fontSize: '11px', marginTop: '3px', fontWeight: 500 }}>
                          📞 +91 {a.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Status Control */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              background: 'var(--admin-surface)',
              borderRadius: '10px',
              border: '1px solid var(--admin-border)'
            }}>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--admin-text-main)', display: 'block' }}>Account Access</strong>
                <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>
                  {activeCustomer.isBlocked ? 'Customer is currently blocked' : 'Customer is active & verified'}
                </span>
              </div>
              <button
                type="button"
                className={`admin-btn ${activeCustomer.isBlocked ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                onClick={() => handleToggleBlock(activeCustomer)}
              >
                {activeCustomer.isBlocked ? 'Unblock Account' : 'Block Access'}
              </button>
            </div>
          </div>
        )}
      </SidepanelDrawer>
    </div>
  );
}

