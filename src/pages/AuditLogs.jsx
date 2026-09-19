import React, { useState } from 'react';
import { FileCheck, Shield, Clock, Info } from 'lucide-react';
import InfiniteDataTable from '../components/InfiniteDataTable';
import CustomSelect from '../components/CustomSelect';
import { getAuditLogs } from '../services/adminService';

const ENTITY_OPTIONS = [
  { value: 'all', label: 'All Entities' },
  { value: 'customer', label: 'Customer Actions' },
  { value: 'wallet', label: 'Wallet Adjustments' },
  { value: 'refund', label: 'Refunds' },
  { value: 'settings', label: 'Settings Updates' },
  { value: 'notification', label: 'Notifications' },
  { value: 'cron_service', label: 'Cron / Email Triggers' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'action_asc', label: 'Action (A-Z)' },
  { value: 'admin_asc', label: 'Admin (A-Z)' }
];

export default function AuditLogs() {
  const [entityFilter, setEntityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const columns = [
    {
      header: 'Admin Actor',
      render: (log) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            background: 'var(--bg-card-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-color)'
          }}>
            <Shield size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{log.adminName || 'Super Admin'}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.adminId ? String(log.adminId).slice(-8) : 'ROOT'}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Action Taken',
      render: (log) => (
        <span style={{
          textTransform: 'uppercase',
          fontSize: '0.74rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'rgba(99, 102, 241, 0.1)',
          color: 'var(--primary-color)',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          {log.action}
        </span>
      )
    },
    {
      header: 'Entity & Target',
      render: (log) => (
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
            {log.entityType}
          </span>
          {log.entityId && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px', fontFamily: 'monospace' }}>
              #{String(log.entityId).slice(-8)}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Details / Description',
      render: (log) => (
        <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
          {log.details || 'Administrative state update'}
        </span>
      )
    },
    {
      header: 'Logged Timestamp',
      render: (log) => (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          <div style={{ fontSize: '0.72rem' }}>{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Audit Logs & Governance Trail</h1>
          <p className="admin-page-subtitle">Cryptographically sequenced audit trail recording internal operator actions, config updates, and balance modifications</p>
        </div>
      </div>

      <InfiniteDataTable
        fetchData={getAuditLogs}
        extraParams={{
          entityType: entityFilter !== 'all' ? entityFilter : undefined,
          sortBy
        }}
        columns={columns}
        searchPlaceholder="Filter audit records by action, admin, or target..."
        keyField="_id"
        headerToolbar={
          <>
            <div style={{ minWidth: '180px' }}>
              <CustomSelect
                options={ENTITY_OPTIONS}
                value={entityFilter}
                onChange={(val) => setEntityFilter(val)}
                placeholder="All Entities"
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
        emptyIcon={Shield}
        emptyTitle="No Audit Logs Recorded"
        emptyMessage="Security events, system updates, and admin actions will appear in this immutable trail."
      />
    </div>
  );
}

