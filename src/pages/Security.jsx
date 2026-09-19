import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  ShieldCheck,
  Key,
  ShieldAlert,
  CheckCircle,
  Users,
  Store,
  Search,
  Edit2,
  Eye,
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  getSecurityOverview,
  getCustomers,
  updateCustomer,
  getVendors,
  updateVendor
} from '../services/adminService';
import SidepanelDrawer from '../components/SidepanelDrawer';
import { toast } from '../components/Toast';

export default function Security() {
  const [secData, setSecData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'password_management' | 'overview'
  const [activeTab, setActiveTab] = useState('password_management');

  // Sub-Tab inside Password Management: 'customers' | 'vendors'
  const [accountType, setAccountType] = useState('customers');

  // List states
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');

  // Edit Drawer state
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Initial load security posture
  useEffect(() => {
    (async () => {
      try {
        const res = await getSecurityOverview();
        setSecData(res);
      } catch (err) {
        toast.error('Failed to load security overview: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch accounts list (Customers or Vendors)
  const fetchAccounts = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setListLoading(true);
    try {
      const fetcher = accountType === 'customers' ? getCustomers : getVendors;
      const res = await fetcher({
        page: requestedPage,
        limit: 15,
        q: search
      });
      const list = res?.items || (Array.isArray(res) ? res : []);
      setItems((prev) => (append ? [...prev, ...list] : list));
      setPage(res?.page || requestedPage);
      setHasMore(Boolean(res?.hasMore ?? (res?.page < res?.totalPages)));
    } catch (err) {
      console.error('Error fetching accounts:', err);
      toast.error(`Failed to load ${accountType}: ` + err.message);
    } finally {
      append ? setLoadingMore(false) : setListLoading(false);
    }
  }, [accountType, search]);

  useEffect(() => {
    if (activeTab === 'password_management') {
      fetchAccounts(1, false);
    }
  }, [fetchAccounts, activeTab]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchAccounts(page + 1, true);
    }
  };

  const handleOpenEdit = (account) => {
    setSelectedAccount(account);
    setEditForm({
      name: account.name || '',
      email: account.email || '',
      phone: account.phone || account.mobile || '',
      businessName: account.businessName || '',
      newPassword: '',
      confirmPassword: ''
    });
    setEditDrawerOpen(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return toast.error('Name is required');
    if (!editForm.email.trim()) return toast.error('Email is required');

    if (editForm.newPassword) {
      if (editForm.newPassword.length < 6) {
        return toast.error('New password must be at least 6 characters long');
      }
      if (editForm.newPassword !== editForm.confirmPassword) {
        return toast.error('Passwords do not match');
      }
    }

    setSavingEdit(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim()
      };
      if (accountType === 'vendors') {
        payload.businessName = editForm.businessName.trim();
      }
      if (editForm.newPassword) {
        payload.password = editForm.newPassword;
      }

      if (accountType === 'customers') {
        await updateCustomer(selectedAccount._id, payload);
      } else {
        await updateVendor(selectedAccount._id, payload);
      }

      toast.success(
        `${accountType === 'customers' ? 'Customer' : 'Vendor'} ${
          editForm.newPassword ? 'details & password' : 'details'
        } updated successfully!`
      );

      // Update in table state
      setItems((prev) =>
        prev.map((it) => (it._id === selectedAccount._id ? { ...it, ...payload } : it))
      );

      setEditDrawerOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || 'Failed to update account');
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-text-sub)' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
          Scanning security posture &amp; access guard...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Security &amp; Password Management</h1>
          <p className="admin-page-subtitle">
            Manage credentials, reset passwords, update account details for Customers &amp; Vendors, and audit security compliance.
          </p>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--admin-border)', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('password_management')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'password_management' ? '2.5px solid var(--admin-primary, #2563eb)' : '2.5px solid transparent',
            color: activeTab === 'password_management' ? 'var(--admin-primary, #2563eb)' : 'var(--admin-text-sub, #64748b)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Key size={16} />
          <span>Credential &amp; Password Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2.5px solid var(--admin-primary, #2563eb)' : '2.5px solid transparent',
            color: activeTab === 'overview' ? 'var(--admin-primary, #2563eb)' : 'var(--admin-text-sub, #64748b)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ShieldCheck size={16} />
          <span>Security Guard &amp; Compliance</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CREDENTIAL & PASSWORD MANAGEMENT                   */}
      {/* ========================================================= */}
      {activeTab === 'password_management' && (
        <div>
          {/* Sub-Tabs: Customers vs Vendors */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '10px', padding: '4px' }}>
              <button
                type="button"
                onClick={() => { setAccountType('customers'); setSearch(''); }}
                style={{
                  padding: '8px 16px',
                  background: accountType === 'customers' ? 'var(--admin-primary, #2563eb)' : 'transparent',
                  color: accountType === 'customers' ? '#ffffff' : 'var(--admin-text-main)',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Users size={15} />
                <span>Customer Accounts</span>
              </button>

              <button
                type="button"
                onClick={() => { setAccountType('vendors'); setSearch(''); }}
                style={{
                  padding: '8px 16px',
                  background: accountType === 'vendors' ? 'var(--admin-primary, #2563eb)' : 'transparent',
                  color: accountType === 'vendors' ? '#ffffff' : 'var(--admin-text-main)',
                  border: 'none',
                  borderRadius: '7px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Store size={15} />
                <span>Vendor Accounts</span>
              </button>
            </div>

            {/* Search Box */}
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
              <input
                type="text"
                placeholder={`Search ${accountType} by name or email...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  background: 'var(--admin-card-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--admin-text-main)'
                }}
              />
            </div>
          </div>

          {/* Accounts Table */}
          <div style={{
            background: 'var(--admin-card-bg)',
            border: '1px solid var(--admin-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'var(--admin-card-shadow, 0 1px 3px rgba(0,0,0,0.05))'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--admin-table-header-bg, #f8fafc)', borderBottom: '1px solid var(--admin-border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--admin-text-sub)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                      User / Email
                    </th>
                    <th style={{ padding: '12px 16px', color: 'var(--admin-text-sub)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                      Phone / Details
                    </th>
                    {accountType === 'vendors' && (
                      <th style={{ padding: '12px 16px', color: 'var(--admin-text-sub)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                        Business Name
                      </th>
                    )}
                    <th style={{ padding: '12px 16px', color: 'var(--admin-text-sub)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700, textAlign: 'center' }}>
                      Security Status
                    </th>
                    <th style={{ padding: '12px 16px', color: 'var(--admin-text-sub)', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700, textAlign: 'center' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr>
                      <td colSpan={accountType === 'vendors' ? 5 : 4} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-sub)' }}>
                        <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                        Loading {accountType}...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={accountType === 'vendors' ? 5 : 4} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-sub)' }}>
                        No {accountType} found matching your query.
                      </td>
                    </tr>
                  ) : (
                    items.map((acc) => (
                      <tr
                        key={acc._id}
                        style={{ borderBottom: '1px solid var(--admin-border)', transition: 'background 0.15s ease' }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <strong style={{ display: 'block', color: 'var(--admin-text-main)' }}>{acc.name || 'Account Member'}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--admin-text-sub)' }}>{acc.email}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--admin-text-main)' }}>
                          {acc.phone || acc.mobile || <span style={{ color: 'var(--admin-text-muted)' }}>Not configured</span>}
                        </td>
                        {accountType === 'vendors' && (
                          <td style={{ padding: '12px 16px', color: 'var(--admin-text-main)' }}>
                            {acc.businessName || acc.name || 'Store Merchant'}
                          </td>
                        )}
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: acc.isBlocked || acc.status === 'suspended' ? '#fef2f2' : '#ecfdf5',
                              color: acc.isBlocked || acc.status === 'suspended' ? '#dc2626' : '#059669',
                              border: acc.isBlocked || acc.status === 'suspended' ? '1px solid #fecaca' : '1px solid #a7f3d0'
                            }}
                          >
                            {acc.isBlocked ? 'BLOCKED' : acc.status ? acc.status.toUpperCase() : 'ACTIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(acc)}
                            style={{
                              padding: '6px 14px',
                              background: 'var(--admin-primary, #2563eb)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Key size={13} />
                            <span>Edit / Reset Password</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--admin-border)' }}>
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '8px 20px',
                    background: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--admin-text-main)'
                  }}
                >
                  {loadingMore ? 'Loading more...' : 'Load More Accounts'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SECURITY GUARD & COMPLIANCE                        */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div>
          {/* Security Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--admin-card-shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-sub)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>SSL / TLS STATUS</span>
                <ShieldCheck size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                {secData?.sslStatus || 'ACTIVE (TLS 1.3)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', marginTop: '6px' }}>
                Encrypted in-transit communication
              </div>
            </div>

            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--admin-card-shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-sub)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>FIREWALL &amp; CORS</span>
                <Lock size={18} color="var(--admin-primary, #2563eb)" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px' }}>
                {secData?.firewallStatus || 'ENABLED'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', marginTop: '6px' }}>
                Strict origin validation active
              </div>
            </div>

            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--admin-card-shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--admin-text-sub)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>JWT AUTH ALGORITHM</span>
                <Key size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px' }}>
                {secData?.jwtAlgorithm || 'HS256'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-sub)', marginTop: '6px' }}>
                Token Expiry: {secData?.tokenExpiry || '7 days'}
              </div>
            </div>
          </div>

          {/* Compliance Checklist */}
          <div style={{
            background: 'var(--admin-card-bg)',
            border: '1px solid var(--admin-border)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--admin-card-shadow)'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Platform Compliance Matrix</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'One-Time Password (OTP) Admin Login', desc: 'Two-step cryptographic OTP verification for portal logins via email.', active: true },
                { title: 'Bcrypt Password Hashing (Salt Rounds: 10)', desc: 'Admin, merchant, and customer credentials salted and hashed before persistence.', active: true },
                { title: 'Automated Mongo Sanitization & NoSQL Injection Protection', desc: 'Queries sanitized against operator injection attacks.', active: true },
                { title: 'Role-Based Authorization Interceptors', desc: 'Every API endpoint guarded with token verification and role scopes.', active: true }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--admin-card-subtle, #f8fafc)', borderRadius: '8px' }}>
                  <CheckCircle size={20} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-sub)', marginTop: '2px' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Account & Reset Password Drawer */}
      <SidepanelDrawer
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        title={`Edit ${accountType === 'customers' ? 'Customer' : 'Vendor'} Account`}
        subtitle={`Update account profile or reset password for ${selectedAccount?.name || 'User'}`}
        icon={Key}
        maxWidth="520px"
      >
        <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '6px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                background: 'var(--admin-card-bg)',
                color: 'var(--admin-text-main)',
                fontSize: '13.5px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '6px' }}>
              Login Email *
            </label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                background: 'var(--admin-card-bg)',
                color: 'var(--admin-text-main)',
                fontSize: '13.5px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '6px' }}>
              Contact Phone
            </label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              placeholder="+91 98765 43210"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--admin-border)',
                background: 'var(--admin-card-bg)',
                color: 'var(--admin-text-main)',
                fontSize: '13.5px'
              }}
            />
          </div>

          {accountType === 'vendors' && (
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '6px' }}>
                Business / Store Name
              </label>
              <input
                type="text"
                value={editForm.businessName}
                onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                placeholder="Apex Retail Store"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--admin-border)',
                  background: 'var(--admin-card-bg)',
                  color: 'var(--admin-text-main)',
                  fontSize: '13.5px'
                }}
              />
            </div>
          )}

          {/* Password Reset Section */}
          <div style={{
            background: 'var(--admin-card-subtle, #f8fafc)',
            border: '1px solid var(--admin-border)',
            borderRadius: '10px',
            padding: '16px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Lock size={16} color="var(--admin-primary, #2563eb)" />
              <strong style={{ fontSize: '13.5px', color: 'var(--admin-text-main)' }}>Set New Password</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--admin-text-sub)', margin: '0 0 12px 0' }}>
              Leave blank if you only want to update name/email details without changing the password.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '4px' }}>
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--admin-border)',
                    background: 'var(--admin-card-bg)',
                    color: 'var(--admin-text-main)',
                    fontSize: '13px'
                  }}
                />
              </div>

              {editForm.newPassword && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '4px' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={editForm.confirmPassword}
                    onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--admin-border)',
                      background: 'var(--admin-card-bg)',
                      color: 'var(--admin-text-main)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setEditDrawerOpen(false)}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--admin-text-sub)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingEdit}
              style={{
                flex: 2,
                padding: '10px',
                background: 'var(--admin-primary, #2563eb)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {savingEdit ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </SidepanelDrawer>
    </div>
  );
}
