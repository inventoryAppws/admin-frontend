import React, { useState, useEffect, useMemo } from 'react';
import { Warehouse, Plus, MapPin, User, Package, CheckCircle, Search } from 'lucide-react';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import EmptyState from '../components/EmptyState';
import { getWarehouses, createWarehouse } from '../services/adminService';
import { toast } from '../components/Toast';

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A - Z)' },
  { value: 'name_desc', label: 'Name (Z - A)' },
  { value: 'capacity_desc', label: 'Capacity (High to Low)' },
  { value: 'capacity_asc', label: 'Capacity (Low to High)' },
  { value: 'newest', label: 'Newest First' }
];

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Sort state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  // Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [capacity, setCapacity] = useState('50000');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getWarehouses();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load warehouses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !code) {
      toast.error('Name and warehouse code are required');
      return;
    }
    setSubmitting(true);
    try {
      await createWarehouse({
        name,
        code: code.toUpperCase().trim(),
        address,
        city,
        state: stateName,
        pincode,
        capacity: Number(capacity || 0),
        managerName,
        managerPhone
      });
      toast.success(`Warehouse facility ${name} registered!`);
      setDrawerOpen(false);
      setName('');
      setCode('');
      setAddress('');
      setCity('');
      setStateName('');
      setPincode('');
      setCapacity('50000');
      setManagerName('');
      setManagerPhone('');
      loadData();
    } catch (err) {
      toast.error('Failed to register warehouse: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWarehouses = useMemo(() => {
    return warehouses
      .filter((w) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          (w.name || '').toLowerCase().includes(q) ||
          (w.code || '').toLowerCase().includes(q) ||
          (w.city || '').toLowerCase().includes(q) ||
          (w.state || '').toLowerCase().includes(q) ||
          (w.managerName || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name_desc') {
          return (b.name || '').localeCompare(a.name || '');
        }
        if (sortBy === 'capacity_desc') {
          return Number(b.capacity || 0) - Number(a.capacity || 0);
        }
        if (sortBy === 'capacity_asc') {
          return Number(a.capacity || 0) - Number(b.capacity || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        // default: name_asc
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [warehouses, search, sortBy]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Warehouses & Fulfillment Hubs</h1>
          <p className="admin-page-subtitle">Manage multi-node distribution centers, stock storage capacity, and regional dispatch hubs</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setDrawerOpen(true)}
        >
          <Plus size={16} /> Register Facility
        </button>
      </div>

      {/* Toolbar: Search and Sort */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <div className="admin-search-wrap" style={{ flex: '1 1 280px', minWidth: '240px' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search warehouses by name, code, city, or manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '220px' }}>
          <CustomSelect
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>Loading fulfillment centers...</div>
        ) : filteredWarehouses.length === 0 ? (
          <div style={{ gridColumn: '1/-1' }}>
            <EmptyState
              icon={Warehouse}
              title={search ? "No Warehouses Match Search" : "No Warehouses Configured"}
              message={search ? "Try searching by a different name, code, or city location." : "Register fulfillment nodes and distribution centers to track multi-warehouse inventory allocation."}
              actionText={search ? "Clear Search" : "Register Facility"}
              onAction={search ? () => setSearch('') : () => setDrawerOpen(true)}
            />
          </div>
        ) : (
          filteredWarehouses.map((w) => (
            <div
              key={w._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Warehouse size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{w.name}</h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>CODE: {w.code}</span>
                  </div>
                </div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981'
                }}>
                  ACTIVE
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{w.address ? `${w.address}, ` : ''}{w.city || 'Bangalore'}, {w.state || 'Karnataka'} - {w.pincode || '560001'}</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'var(--bg-card-subtle)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.78rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Storage Capacity:</span>
                  <div style={{ fontWeight: 700, marginTop: '2px' }}>{Number(w.capacity || 0).toLocaleString('en-IN')} units</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Facility Manager:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{w.managerName || 'Operations Head'}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Warehouse Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Register Warehouse Facility"
        subtitle="Set up a multi-location stock storage and dispatch node"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Facility Name</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Bangalore North Central Fulfillment Center"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Unique Facility Code</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. BLR-01"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Street Address</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Industrial Area, Phase 2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="admin-form-label">City</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Bangalore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-form-label">State</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="Karnataka"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="admin-form-label">Pincode</label>
              <input
                type="text"
                className="admin-form-input"
                placeholder="560064"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
            <div>
              <label className="admin-form-label">Unit Capacity</label>
              <input
                type="number"
                min="1000"
                className="admin-form-input"
                placeholder="50000"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="admin-form-label">Manager Name</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="Ramesh Kumar"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              {submitting ? 'Registering...' : 'Save Facility'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>
    </div>
  );
}

