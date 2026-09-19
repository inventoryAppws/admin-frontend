import React, { useState } from 'react';
import { Wallet, Plus, Minus, ArrowUpRight, ArrowDownLeft, Shield, AlertCircle } from 'lucide-react';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { getWalletsSummary, adjustCustomerWallet } from '../services/adminService';
import { toast } from '../components/Toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Accounts' },
  { value: 'active', label: 'Active Only' },
  { value: 'blocked', label: 'Blocked Only' }
];

const SORT_OPTIONS = [
  { value: 'balance_desc', label: 'Balance: High to Low' },
  { value: 'balance_asc', label: 'Balance: Low to High' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'newest', label: 'Newest First' }
];

export default function Wallets() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adjustmentAction, setAdjustmentAction] = useState('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('balance_desc');
  const [refreshKey, setRefreshKey] = useState(0);

  const columns = [
    {
      header: 'Customer Details',
      render: (c) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
          {c.mobile && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.mobile}</div>}
        </div>
      )
    },
    {
      header: 'Current Balance',
      render: (c) => (
        <span style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: Number(c.wallet?.balance || 0) > 0 ? '#10b981' : 'var(--text-muted)'
        }}>
          ₹{Number(c.wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Account Status',
      render: (c) => (
        <span style={{
          padding: '3px 8px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          background: c.isBlocked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          color: c.isBlocked ? '#ef4444' : '#10b981'
        }}>
          {c.isBlocked ? 'BLOCKED' : 'ACTIVE'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (c) => (
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
          onClick={() => {
            setSelectedCustomer(c);
            setAdjustAmount('');
            setAdjustReason('');
            setAdjustmentAction('credit');
          }}
        >
          Adjust Balance
        </button>
      )
    }
  ];

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustAmount || Number(adjustAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    try {
      await adjustCustomerWallet(selectedCustomer._id, {
        action: adjustmentAction,
        amount: Number(adjustAmount),
        reason: adjustReason || `Admin manual ${adjustmentAction}`
      });
      toast.success(`Successfully ${adjustmentAction === 'credit' ? 'credited' : 'debited'} ₹${adjustAmount} to customer's wallet!`);
      setSelectedCustomer(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      toast.error('Failed to adjust wallet: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Wallets & Ledger</h1>
          <p className="admin-page-subtitle">Manage customer store credits, reconcile balances, and issue authorized adjustments</p>
        </div>
      </div>

      <InfiniteDataTable
        key={refreshKey}
        fetchData={getWalletsSummary}
        extraParams={{
          status: statusFilter !== 'all' ? statusFilter : undefined,
          sortBy
        }}
        columns={columns}
        searchPlaceholder="Search customer by name, email or phone..."
        keyField="_id"
        headerToolbar={
          <>
            <div style={{ minWidth: '160px' }}>
              <CustomSelect
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(val) => setStatusFilter(val)}
                placeholder="All Statuses"
              />
            </div>
            <div style={{ minWidth: '180px' }}>
              <CustomSelect
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                placeholder="Sort By"
              />
            </div>
          </>
        }
      />

      {/* Adjust Balance Drawer */}
      <SidepanelDrawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title="Adjust Customer Wallet"
        subtitle={`Modifying credit for ${selectedCustomer?.name || ''}`}
      >
        {selectedCustomer && (
          <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT WALLET BALANCE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                ₹{Number(selectedCustomer.wallet?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <label className="admin-form-label">Adjustment Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  className={`admin-btn ${adjustmentAction === 'credit' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setAdjustmentAction('credit')}
                >
                  <Plus size={16} /> Credit (+)
                </button>
                <button
                  type="button"
                  className={`admin-btn ${adjustmentAction === 'debit' ? 'admin-btn-danger' : 'admin-btn-secondary'}`}
                  style={{ justifyContent: 'center' }}
                  onClick={() => setAdjustmentAction('debit')}
                >
                  <Minus size={16} /> Debit (-)
                </button>
              </div>
            </div>

            <div>
              <label className="admin-form-label">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                className="admin-form-input"
                placeholder="e.g. 500"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="admin-form-label">Reason / Reference Note</label>
              <textarea
                className="admin-form-textarea"
                rows={3}
                placeholder="Explain the reason for this manual wallet adjustment for audit records..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setSelectedCustomer(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`admin-btn ${adjustmentAction === 'credit' ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                style={{ flex: 1 }}
                disabled={submitting}
              >
                {submitting ? 'Applying...' : `Confirm ${adjustmentAction.toUpperCase()}`}
              </button>
            </div>
          </form>
        )}
      </SidepanelDrawer>
    </div>
  );
}

