import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRightLeft, Plus, Warehouse, Package, CheckCircle, Clock, Truck, Search } from 'lucide-react';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { getTransfers, createTransfer, getWarehouses } from '../services/adminService';
import { toast } from '../components/Toast';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'qty_desc', label: 'Quantity (High to Low)' },
  { value: 'qty_asc', label: 'Quantity (Low to High)' }
];

export default function InventoryTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Form
  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destWarehouse, setDestWarehouse] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, wData] = await Promise.all([getTransfers(), getWarehouses()]);
      setTransfers(Array.isArray(tData) ? tData : []);
      setWarehouses(Array.isArray(wData) ? wData : []);
      if (wData && wData.length >= 2) {
        setSourceWarehouse(wData[0].name || wData[0].code);
        setDestWarehouse(wData[1].name || wData[1].code);
      }
    } catch (err) {
      toast.error('Failed to load transfers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const warehouseOptions = warehouses.map(w => ({
    value: w.name || w.code,
    label: `${w.name} (${w.code})`
  }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!sourceWarehouse || !destWarehouse) {
      toast.error('Please select source and destination warehouses');
      return;
    }
    if (sourceWarehouse === destWarehouse) {
      toast.error('Source and destination cannot be identical');
      return;
    }
    setSubmitting(true);
    try {
      await createTransfer({
        sourceWarehouse,
        destinationWarehouse: destWarehouse,
        productName: productName || 'Standard Restock Consignment',
        quantity: Number(quantity || 1),
        notes,
        status: 'in_transit'
      });
      toast.success('Stock transfer order dispatched successfully!');
      setDrawerOpen(false);
      setProductName('');
      setQuantity('50');
      setNotes('');
      loadData();
    } catch (err) {
      toast.error('Failed to dispatch transfer: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransfers = useMemo(() => {
    return transfers
      .filter((t) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesProd = (t.productName || '').toLowerCase().includes(q);
          const matchesSrc = (t.sourceWarehouse || '').toLowerCase().includes(q);
          const matchesDest = (t.destinationWarehouse || '').toLowerCase().includes(q);
          const matchesNotes = (t.notes || '').toLowerCase().includes(q);
          if (!matchesProd && !matchesSrc && !matchesDest && !matchesNotes) return false;
        }
        if (statusFilter !== 'all' && t.status !== statusFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'qty_desc') {
          return Number(b.quantity || 0) - Number(a.quantity || 0);
        }
        if (sortBy === 'qty_asc') {
          return Number(a.quantity || 0) - Number(b.quantity || 0);
        }
        // default: newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [transfers, search, statusFilter, sortBy]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inter-Warehouse Stock Transfers</h1>
          <p className="admin-page-subtitle">Coordinate stock redistribution, balance regional facility inventory, and track transit custody</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setDrawerOpen(true)}
        >
          <Plus size={16} /> New Stock Transfer
        </button>
      </div>

      {/* Toolbar: Search, Filter, and Sort */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <div className="admin-search-wrap" style={{ flex: '1 1 260px', minWidth: '220px' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search transfers by item, warehouse, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '170px' }}>
          <CustomSelect
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status"
          />
        </div>

        <div style={{ width: '200px' }}>
          <CustomSelect
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            placeholder="Sort by"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading stock transfer manifests...</div>
        ) : filteredTransfers.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            {search || statusFilter !== 'all'
              ? 'No transfer manifests match your search or filter criteria.'
              : 'No transfer manifests found. Click "New Stock Transfer" to initiate cross-dock redistribution.'}
          </div>
        ) : (
          filteredTransfers.map((t) => (
            <div
              key={t._id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '18px 22px',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>
                      {t.productName || 'Merchandise Stock Bundle'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      {t.quantity || 1} units
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>From: <strong>{t.sourceWarehouse || 'Origin Hub'}</strong></span>
                    <span>→</span>
                    <span>To: <strong>{t.destinationWarehouse || 'Destination Hub'}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: t.status === 'received' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                    color: t.status === 'received' ? '#10b981' : '#3b82f6',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {t.status === 'received' ? <CheckCircle size={12} /> : <Truck size={12} />}
                    {(t.status || 'IN TRANSIT').replace('_', ' ').toUpperCase()}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(t.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Transfer Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Initiate Stock Transfer"
        subtitle="Transfer product batch between fulfillment nodes"
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Source Fulfillment Node</label>
            <CustomSelect
              options={warehouseOptions}
              value={sourceWarehouse}
              onChange={(val) => setSourceWarehouse(val)}
              placeholder="Select Origin Warehouse"
            />
          </div>

          <div>
            <label className="admin-form-label">Destination Node</label>
            <CustomSelect
              options={warehouseOptions}
              value={destWarehouse}
              onChange={(val) => setDestWarehouse(val)}
              placeholder="Select Target Warehouse"
            />
          </div>

          <div>
            <label className="admin-form-label">Product / Inventory Description</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Wireless Noise Canceling Headphones"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Units Quantity</label>
            <input
              type="number"
              min="1"
              className="admin-form-input"
              placeholder="50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-form-label">Dispatch Notes / Transport Waybill</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              placeholder="Driver details, truck license plate, or airway bill reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {submitting ? 'Dispatching...' : 'Dispatch Transfer'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>
    </div>
  );
}

