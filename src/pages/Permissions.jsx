import React, { useState } from 'react';
import { Key, Shield, Check, X, Save } from 'lucide-react';
import { toast } from '../components/Toast';

const INITIAL_ROLES = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full unrestricted platform access to all modules and configurations',
    permissions: {
      dashboard: { read: true, write: true, delete: true },
      orders: { read: true, write: true, delete: true },
      products: { read: true, write: true, delete: true },
      vendors: { read: true, write: true, delete: true },
      customers: { read: true, write: true, delete: true },
      finance: { read: true, write: true, delete: true },
      settings: { read: true, write: true, delete: true }
    }
  },
  {
    id: 'ops_manager',
    name: 'Operations Manager',
    description: 'Manages catalog, orders, warehouses, and merchant approvals',
    permissions: {
      dashboard: { read: true, write: false, delete: false },
      orders: { read: true, write: true, delete: false },
      products: { read: true, write: true, delete: true },
      vendors: { read: true, write: true, delete: false },
      customers: { read: true, write: false, delete: false },
      finance: { read: true, write: false, delete: false },
      settings: { read: false, write: false, delete: false }
    }
  },
  {
    id: 'support_agent',
    name: 'Support & Care Specialist',
    description: 'Customer inquiries, dispute tickets, and returns queue',
    permissions: {
      dashboard: { read: true, write: false, delete: false },
      orders: { read: true, write: true, delete: false },
      products: { read: true, write: false, delete: false },
      vendors: { read: true, write: false, delete: false },
      customers: { read: true, write: false, delete: false },
      finance: { read: false, write: false, delete: false },
      settings: { read: false, write: false, delete: false }
    }
  }
];

const MODULES = [
  { key: 'dashboard', label: 'Dashboard & Metrics' },
  { key: 'orders', label: 'Order Processing & Tracking' },
  { key: 'products', label: 'Catalog & Inventory Products' },
  { key: 'vendors', label: 'Vendor Merchants & Approvals' },
  { key: 'customers', label: 'Customer Wallets & Data' },
  { key: 'finance', label: 'Payments, Refunds & Payouts' },
  { key: 'settings', label: 'Platform Security & System Settings' }
];

export default function Permissions() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState(INITIAL_ROLES[0]);
  const [saving, setSaving] = useState(false);

  const togglePerm = (moduleKey, action) => {
    if (selectedRole.id === 'super_admin') {
      toast.error('Super Administrator permissions are immutable');
      return;
    }
    setSelectedRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleKey]: {
          ...prev.permissions[moduleKey],
          [action]: !prev.permissions[moduleKey]?.[action]
        }
      }
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setRoles(prev => prev.map(r => r.id === selectedRole.id ? selectedRole : r));
      setSaving(false);
      toast.success(`Permissions updated for ${selectedRole.name}!`);
    }, 400);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Role-Based Access Control (RBAC)</h1>
          <p className="admin-page-subtitle">Configure granular security permissions, feature flags, and administrative capabilities</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={handleSave}
          disabled={saving || selectedRole.id === 'super_admin'}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Matrix'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
        {/* Role Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {roles.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r)}
              style={{
                background: selectedRole.id === r.id ? 'var(--primary-color)' : 'var(--bg-card)',
                color: selectedRole.id === r.id ? '#ffffff' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                boxShadow: 'var(--card-shadow)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</div>
              <div style={{
                fontSize: '0.75rem',
                color: selectedRole.id === r.id ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                marginTop: '4px'
              }}>
                {r.description}
              </div>
            </div>
          ))}
        </div>

        {/* Matrix Grid */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Permissions for {selectedRole.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Toggle view, create/edit, or deletion rights for each sub-system
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '12px 8px' }}>MODULE / RESOURCE</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>VIEW / READ</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>CREATE / EDIT</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>DELETE / REMOVE</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => {
                  const perms = selectedRole.permissions[m.key] || { read: false, write: false, delete: false };
                  return (
                    <tr key={m.key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{m.label}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(perms.read)}
                          onChange={() => togglePerm(m.key, 'read')}
                          disabled={selectedRole.id === 'super_admin'}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(perms.write)}
                          onChange={() => togglePerm(m.key, 'write')}
                          disabled={selectedRole.id === 'super_admin'}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                        />
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(perms.delete)}
                          onChange={() => togglePerm(m.key, 'delete')}
                          disabled={selectedRole.id === 'super_admin'}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

