import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Plus, Key, Mail, Lock, Edit3, Trash2, CheckCircle, AlertTriangle, Send, Search, UserX, UserCheck } from 'lucide-react';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import ConfirmModal from '../components/ConfirmModal';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  requestAdminPasswordOtp,
  toggleAdminBlock
} from '../services/adminService';
import { toast } from '../components/Toast';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Super Administrator' },
  { value: 'manager', label: 'Operations Manager' },
  { value: 'support', label: 'Support Agent' }
];

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Super Administrator' },
  { value: 'manager', label: 'Operations Manager' },
  { value: 'support', label: 'Support Agent' }
];

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A - Z)' },
  { value: 'name_desc', label: 'Name (Z - A)' },
  { value: 'role_asc', label: 'Role' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' }
];

export default function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  // Create Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');

  // Edit Form State
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('admin');
  const [editPassword, setEditPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const isDefaultAdmin = Boolean(
    selectedAdmin?.isDefault ||
    String(selectedAdmin?._id) === '69cbebc1afbc23659cc20bd4' ||
    selectedAdmin?.email === 'jkarumajji@gmail.com'
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load admin team: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      await createAdminUser({ name, email, password, role });
      toast.success(`Admin user ${email} created successfully!`);
      setCreateDrawerOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('admin');
      loadData();
    } catch (err) {
      toast.error('Failed to create admin: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (adm) => {
    setSelectedAdmin(adm);
    setEditName(adm.name || '');
    setEditEmail(adm.email || '');
    setEditRole(adm.role || 'admin');
    setEditPassword('');
    setOtp('');
    setOtpSent(false);
    setEditDrawerOpen(true);
  };

  const handleRequestOtp = async () => {
    if (!selectedAdmin) return;
    setSendingOtp(true);
    try {
      const res = await requestAdminPasswordOtp(selectedAdmin._id);
      setOtpSent(true);
      toast.success(res.msg || `Verification OTP sent to ${selectedAdmin.email}`);
    } catch (err) {
      toast.error('Failed to send OTP: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    const trimmedPassword = (editPassword || '').trim();

    if (trimmedPassword && trimmedPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (isDefaultAdmin && !otp.trim()) {
      toast.error('Please request and enter the email verification OTP to update the default administrator account');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        role: editRole
      };
      if (isDefaultAdmin) {
        payload.otp = otp.trim();
      }
      if (trimmedPassword) {
        payload.password = trimmedPassword;
      }

      const res = await updateAdminUser(selectedAdmin._id, payload);
      toast.success(res.msg || 'Admin user updated successfully');
      setEditDrawerOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to update admin: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Custom Confirm Modal Popup State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmVariant: 'primary',
    icon: 'warning',
    onConfirm: null,
    loading: false
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));
  };

  const executeToggleBlockAdmin = async (adm) => {
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      const res = await toggleAdminBlock(adm._id);
      toast.success(res.msg);
      setAdmins((prev) =>
        prev.map((item) => (item._id === adm._id ? { ...item, isBlocked: !item.isBlocked } : item))
      );
      if (selectedAdmin && selectedAdmin._id === adm._id) {
        setSelectedAdmin((prev) => prev ? ({ ...prev, isBlocked: !prev.isBlocked }) : prev);
      }
      closeConfirmModal();
    } catch (err) {
      toast.error('Failed to update access: ' + (err.response?.data?.msg || err.message));
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleToggleBlockAdmin = (adm) => {
    const isDefault = adm.isDefault || String(adm._id) === '69cbebc1afbc23659cc20bd4' || adm.email === 'jkarumajji@gmail.com';
    if (isDefault) {
      toast.error('The default administrator cannot be blocked.');
      return;
    }

    const action = adm.isBlocked ? 'unblock' : 'block';
    setConfirmModal({
      isOpen: true,
      title: adm.isBlocked ? 'Unblock Admin Access' : 'Block Admin Access',
      message: `Are you sure you want to ${action} access for administrator "${adm.name || adm.email}"? ${
        adm.isBlocked
          ? 'They will be allowed to log in and access allowed administrative features.'
          : 'They will be immediately logged out and prohibited from accessing the system.'
      }`,
      confirmText: adm.isBlocked ? 'Yes, Unblock Access' : 'Yes, Block Access',
      confirmVariant: adm.isBlocked ? 'success' : 'danger',
      icon: adm.isBlocked ? 'success' : 'danger',
      onConfirm: () => executeToggleBlockAdmin(adm),
      loading: false
    });
  };

  const executeDeleteAdmin = async (adm) => {
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await deleteAdminUser(adm._id);
      toast.success('Admin user removed successfully');
      loadData();
      closeConfirmModal();
    } catch (err) {
      toast.error('Failed to remove admin: ' + (err.response?.data?.msg || err.message));
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteAdmin = (adm) => {
    const isDefault = adm.isDefault || String(adm._id) === '69cbebc1afbc23659cc20bd4';
    if (isDefault) {
      toast.error('The default administrator cannot be deleted.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Remove Administrator',
      message: `Are you sure you want to remove admin user "${adm.name || adm.email}" from the system? This action cannot be undone.`,
      confirmText: 'Yes, Remove Admin',
      confirmVariant: 'danger',
      icon: 'danger',
      onConfirm: () => executeDeleteAdmin(adm),
      loading: false
    });
  };

  const filteredAdmins = useMemo(() => {
    return admins
      .filter((adm) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesName = (adm.name || '').toLowerCase().includes(q);
          const matchesEmail = (adm.email || '').toLowerCase().includes(q);
          if (!matchesName && !matchesEmail) return false;
        }
        if (roleFilter !== 'all' && adm.role !== roleFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_desc') {
          return (b.name || '').localeCompare(a.name || '');
        }
        if (sortBy === 'role_asc') {
          return (a.role || '').localeCompare(b.role || '');
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        // default: name_asc
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [admins, search, roleFilter, sortBy]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Admin Team & User Accounts</h1>
          <p className="admin-page-subtitle">Manage internal administration staff, assign operational roles, and enforce security policies</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setCreateDrawerOpen(true)}
        >
          <Plus size={16} /> Add Admin User
        </button>
      </div>

      {/* Toolbar: Search, Role Filter, and Sort */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <div className="admin-search-wrap" style={{ flex: '1 1 260px', minWidth: '220px' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search admins by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '190px' }}>
          <CustomSelect
            options={ROLE_FILTER_OPTIONS}
            value={roleFilter}
            onChange={setRoleFilter}
            placeholder="Role"
          />
        </div>

        <div style={{ width: '190px' }}>
          <CustomSelect
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading admin accounts...</div>
        ) : filteredAdmins.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            {search || roleFilter !== 'all' ? 'No admin users match your search or role filter.' : 'No admin users found.'}
          </div>
        ) : (
          filteredAdmins.map((adm) => {
            const isDefault = adm.isDefault || String(adm._id) === '69cbebc1afbc23659cc20bd4';
            return (
              <div
                key={adm._id}
                style={{
                  background: 'var(--bg-card)',
                  border: isDefault ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: 'var(--card-shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: isDefault ? 'rgba(59, 130, 246, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                  color: isDefault ? 'var(--admin-primary)' : 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Shield size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {adm.name || 'Admin User'}
                    </div>
                    {isDefault && (
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: 'var(--admin-primary)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        flexShrink: 0
                      }}>
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {adm.email}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--primary-color)'
                    }}>
                      {adm.role || (isDefault ? 'Super Admin' : 'Admin')}
                    </span>
                    {adm.isBlocked ? (
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: 'rgba(239, 68, 68, 0.12)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                        BLOCKED
                      </span>
                    ) : (
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Edit & Remove (Block option is managed safely inside Edit drawer) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => handleOpenEdit(adm)}
                    title="Edit Admin User"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>

                  {!isDefault && (
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                      onClick={() => handleDeleteAdmin(adm)}
                      title="Remove Admin User"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Admin Drawer */}
      <SidepanelDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        title="Create Admin Account"
        subtitle="Provision portal access credentials for internal staff"
      >
        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Full Name</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="admin-form-label">Work Email *</label>
            <input
              type="email"
              className="admin-form-input"
              placeholder="sarah@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Temporary Password *</label>
            <input
              type="password"
              className="admin-form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Assigned Role</label>
            <CustomSelect
              options={ROLE_OPTIONS}
              value={role}
              onChange={(val) => setRole(val)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setCreateDrawerOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Provision Admin'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>

      {/* Edit Admin Drawer */}
      <SidepanelDrawer
        isOpen={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        title={isDefaultAdmin ? 'Edit Default Master Administrator' : 'Edit Admin Details'}
        subtitle={selectedAdmin?.email}
        icon={Shield}
      >
        {selectedAdmin && (
          <form onSubmit={handleUpdateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {isDefaultAdmin && (
              <div style={{
                padding: '14px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.05))',
                border: '1px solid rgba(59, 130, 246, 0.28)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-primary)', fontWeight: 700, fontSize: '13px' }}>
                  <Shield size={17} />
                  <span>Permanent Master Administrator</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--admin-text-sub)', lineHeight: 1.5 }}>
                  This primary account cannot be deleted. Any changes to profile details (Name, Email) or Password require live Email OTP verification sent to <strong>{selectedAdmin.email}</strong>.
                </p>
              </div>
            )}

            <div>
              <label className="admin-form-label">Full Name *</label>
              <input
                type="text"
                className="admin-form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-form-label">Admin Email Address *</label>
              <input
                type="email"
                className="admin-form-input"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            {!isDefaultAdmin && (
              <div>
                <label className="admin-form-label">Assigned Role</label>
                <CustomSelect
                  options={ROLE_OPTIONS}
                  value={editRole}
                  onChange={(val) => setEditRole(val)}
                />
              </div>
            )}

            {!isDefaultAdmin && (
              <div style={{
                padding: '14px',
                borderRadius: '10px',
                background: selectedAdmin?.isBlocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                border: selectedAdmin?.isBlocked ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: selectedAdmin?.isBlocked ? '#ef4444' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {selectedAdmin?.isBlocked ? <UserX size={15} /> : <UserCheck size={15} />}
                    <span>{selectedAdmin?.isBlocked ? 'Account Access is BLOCKED' : 'Account Access is ACTIVE'}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>
                    {selectedAdmin?.isBlocked
                      ? 'This admin cannot log in or make any API requests.'
                      : 'This admin has active credentials and dashboard permissions.'}
                  </p>
                </div>
                <button
                  type="button"
                  className={`admin-btn ${selectedAdmin?.isBlocked ? 'admin-btn-success' : 'admin-btn-danger'}`}
                  style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  onClick={async () => {
                    await handleToggleBlockAdmin(selectedAdmin);
                    setSelectedAdmin(prev => prev ? ({ ...prev, isBlocked: !prev.isBlocked }) : prev);
                  }}
                >
                  {selectedAdmin?.isBlocked ? 'Unblock Account' : 'Block Access'}
                </button>
              </div>
            )}

            {/* Password Section */}
            <div style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: '10px',
              padding: '14px'
            }}>
              <label className="admin-form-label" style={{ marginBottom: '6px' }}>
                Change Password (Leave blank to keep current)
              </label>
              <input
                type="password"
                className="admin-form-input"
                placeholder="Enter new password (min 6 characters)"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Dedicated OTP Verification Card for Default Admin */}
            {isDefaultAdmin && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.04)',
                border: '1px dashed rgba(59, 130, 246, 0.4)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--admin-text-main)', display: 'block' }}>
                      Authorization OTP Required *
                    </span>
                    <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>
                      Sent to registered email ({selectedAdmin.email})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={handleRequestOtp}
                    disabled={sendingOtp}
                  >
                    <Send size={13} />
                    {sendingOtp ? 'Sending...' : otpSent ? 'Resend Code' : 'Send Code'}
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Enter 6-digit OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    style={{
                      letterSpacing: '3px',
                      fontWeight: 700,
                      fontSize: '15px',
                      textAlign: 'center',
                      background: 'var(--admin-card-bg)'
                    }}
                  />
                  {otpSent && (
                    <div style={{ fontSize: '11.5px', color: 'var(--admin-success)', marginTop: '6px', textAlign: 'center', fontWeight: 600 }}>
                      ✓ Verification code sent to {selectedAdmin.email}. Check your inbox.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setEditDrawerOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                style={{ flex: 1 }}
                disabled={submitting}
              >
                {submitting ? 'Verifying & Saving...' : 'Save Admin Changes'}
              </button>
            </div>
          </form>
        )}
      </SidepanelDrawer>

      {/* Confirmation Modal Popup (Replaces all browser window.confirm alertboxes) */}
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

