import React, { useState } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Filter, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { getAllTransactions } from '../services/adminService';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'payment', label: 'Customer Payments' },
  { value: 'refund', label: 'Refunds' },
  { value: 'wallet_topup', label: 'Wallet Topups' },
  { value: 'wallet_debit', label: 'Wallet Debits' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Amount: High to Low' },
  { value: 'amount_asc', label: 'Amount: Low to High' }
];

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const columns = [
    {
      header: 'Transaction ID & Type',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: t.direction === 'credit' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: t.direction === 'credit' ? '#10b981' : '#ef4444'
          }}>
            {t.direction === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{t.description || t.type}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {t._id}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Order Reference',
      render: (t) => (
        <span style={{ fontSize: '0.84rem', fontFamily: 'monospace', fontWeight: 600 }}>
          {t.orderDisplayId ? `#${t.orderDisplayId}` : '—'}
        </span>
      )
    },
    {
      header: 'Method',
      render: (t) => (
        <span style={{
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '6px',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)'
        }}>
          {t.paymentMethod || 'ONLINE'}
        </span>
      )
    },
    {
      header: 'Amount',
      render: (t) => (
        <span style={{
          fontWeight: 700,
          fontSize: '0.92rem',
          color: t.direction === 'credit' ? '#10b981' : 'var(--text-primary)'
        }}>
          {t.direction === 'credit' ? '+' : '-'} ₹{Number(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Status',
      render: (t) => {
        const isSuccess = t.status === 'success' || t.status === 'processed';
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '999px',
            background: isSuccess ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            color: isSuccess ? '#10b981' : '#f59e0b'
          }}>
            {isSuccess ? <CheckCircle size={12} /> : <Clock size={12} />}
            {t.status ? t.status.toUpperCase() : 'SUCCESS'}
          </span>
        );
      }
    },
    {
      header: 'Date & Time',
      render: (t) => (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          <div style={{ fontSize: '0.72rem' }}>{new Date(t.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      )
    },
    {
      header: 'Action',
      render: (t) => (
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          onClick={() => setSelectedTxn(t)}
        >
          Details
        </button>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Payments & Unified Transactions</h1>
          <p className="admin-page-subtitle">Real-time ledger of orders, gateway payments, refunds, and wallet movements</p>
        </div>
      </div>

      <InfiniteDataTable
        fetchData={getAllTransactions}
        extraParams={{
          type: typeFilter !== 'all' ? typeFilter : undefined,
          sortBy
        }}
        columns={columns}
        searchPlaceholder="Search by transaction ID, order ID, or description..."
        keyField="_id"
        headerToolbar={
          <>
            <div style={{ minWidth: '180px' }}>
              <CustomSelect
                options={TYPE_OPTIONS}
                value={typeFilter}
                onChange={(val) => setTypeFilter(val)}
                placeholder="Filter Type"
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

      {/* Transaction Details Drawer */}
      <SidepanelDrawer
        isOpen={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        title="Transaction Breakdown"
        subtitle={`Audit record for ${selectedTxn?._id || ''}`}
      >
        {selectedTxn && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TRANSACTION AMOUNT</div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: selectedTxn.direction === 'credit' ? '#10b981' : 'var(--text-primary)',
                marginTop: '4px'
              }}>
                {selectedTxn.direction === 'credit' ? '+' : '-'} ₹{Number(selectedTxn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ marginTop: '8px' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981'
                }}>
                  {selectedTxn.status?.toUpperCase() || 'COMPLETED'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>PAYMENT METHOD</div>
                <div style={{ fontWeight: 600, fontSize: '0.86rem', marginTop: '2px' }}>{(selectedTxn.paymentMethod || 'ONLINE').toUpperCase()}</div>
              </div>
              <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DIRECTION</div>
                <div style={{ fontWeight: 600, fontSize: '0.86rem', marginTop: '2px', textTransform: 'capitalize' }}>{selectedTxn.direction}</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>DESCRIPTION</div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', marginTop: '2px' }}>{selectedTxn.description || 'N/A'}</div>
            </div>

            {selectedTxn.orderDisplayId && (
              <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>LINKED ORDER</div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--primary-color)', marginTop: '2px' }}>
                  #{selectedTxn.orderDisplayId}
                </div>
              </div>
            )}

            <div style={{ background: 'var(--bg-card-subtle)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TIMESTAMP</div>
              <div style={{ fontWeight: 500, fontSize: '0.82rem', marginTop: '2px' }}>
                {new Date(selectedTxn.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'medium' })}
              </div>
            </div>
          </div>
        )}
      </SidepanelDrawer>
    </div>
  );
}

