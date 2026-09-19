import React, { useState } from 'react';
import { Activity, Shield, ShoppingBag, RotateCcw, Wallet, Clock } from 'lucide-react';
import InfiniteDataTable from '../components/InfiniteDataTable';
import CustomSelect from '../components/CustomSelect';
import { getActivityFeed } from '../services/adminService';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'action_asc', label: 'Action (A-Z)' }
];

export default function ActivityMonitoring() {
  const [sortBy, setSortBy] = useState('newest');
  const columns = [
    {
      header: 'Event Activity',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.12)',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.details || item.action}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Actor: {item.adminName || 'System Automated Job'} • Target: {item.entityType}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Action Flag',
      render: (item) => (
        <span style={{
          textTransform: 'uppercase',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)'
        }}>
          {item.action}
        </span>
      )
    },
    {
      header: 'Timestamp',
      render: (item) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Live Activity & Telemetry Feed</h1>
          <p className="admin-page-subtitle">Unified timeline of administrative operations, order state transitions, and system triggers</p>
        </div>
      </div>

      <InfiniteDataTable
        fetchData={getActivityFeed}
        extraParams={{ sortBy }}
        columns={columns}
        searchPlaceholder="Filter activity log by action, actor, or entity..."
        keyField="_id"
        headerToolbar={
          <div style={{ minWidth: '180px' }}>
            <CustomSelect
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              placeholder="Sort By"
            />
          </div>
        }
      />
    </div>
  );
}

