import React, { useState, useEffect, useCallback } from 'react';
import { Boxes, AlertTriangle, AlertCircle, DollarSign, Search, Edit3 } from 'lucide-react';
import { getInventoryOverview, getProducts, updateProduct } from '../services/adminService';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { toast } from '../components/Toast';

const STOCK_STATUS_OPTIONS = [
  { value: 'all', label: 'All Stock Levels' },
  { value: 'in_stock', label: 'In Stock (> 10)' },
  { value: 'low_stock', label: 'Low Stock (1-10)' },
  { value: 'out_of_stock', label: 'Out of Stock (0)' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'stock_asc', label: 'Stock: Low to High' },
  { value: 'stock_desc', label: 'Stock: High to Low' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'name_asc', label: 'Product Name (A-Z)' }
];

export default function Inventory() {
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('stock_asc');

  // Quick Restock Drawer
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQty, setNewQty] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOverview = async () => {
    try {
      const data = await getInventoryOverview();
      setOverview(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getProducts({
        page: requestedPage,
        limit: 15,
        q: search,
        stockStatus: stockFilter !== 'all' ? stockFilter : undefined,
        sortBy
      });
      const items = data.items || [];
      setProducts((prev) => (append ? [...prev, ...items] : items));
      setPage(data.page || requestedPage);
      setHasMore(data.page < data.totalPages);
    } catch (err) {
      toast.error('Failed to load inventory stock');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [search, stockFilter, sortBy]);

  useEffect(() => {
    fetchOverview();
    fetchProducts(1, false);
  }, [fetchProducts]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) fetchProducts(page + 1, true);
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProduct(selectedProduct._id, { quantity: Number(newQty) });
      toast.success('Stock adjusted successfully');
      setProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? { ...p, quantity: Number(newQty) } : p))
      );
      setDrawerOpen(false);
      fetchOverview();
    } catch (err) {
      toast.error('Failed to adjust stock: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Product Item' },
    { header: 'Vendor' },
    { header: 'Unit Price', className: 'text-right' },
    { header: 'Available Units', className: 'text-center' },
    { header: 'Stock Value', className: 'text-right' },
    { header: 'Restock Action', className: 'text-center' }
  ];

  const renderRow = (p) => {
    const stockVal = Number(p.price || 0) * Number(p.quantity || 0);
    const isOut = p.quantity <= 0;
    const isLow = p.quantity > 0 && p.quantity <= 10;

    return (
      <tr key={p._id}>
        <td>
          <strong style={{ display: 'block', fontSize: '13px', color: 'var(--admin-text-main)' }}>{p.name}</strong>
          <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>SKU: {p._id}</span>
        </td>
        <td>{p.vendorName || 'Vendor'}</td>
        <td style={{ textAlign: 'right' }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</td>
        <td style={{ textAlign: 'center' }}>
          <span className={`admin-badge ${isOut ? 'danger' : isLow ? 'warning' : 'success'}`}>
            {p.quantity} units {isOut ? '(Out of Stock)' : isLow ? '(Low Stock)' : ''}
          </span>
        </td>
        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-text-main)' }}>
          ₹{stockVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </td>
        <td style={{ textAlign: 'center' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={() => {
              setSelectedProduct(p);
              setNewQty(p.quantity);
              setDrawerOpen(true);
            }}
          >
            <Edit3 size={13} />
            <span>Adjust</span>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Inventory Stock & Valuation</h2>
          <p className="admin-page-subtitle">Monitor catalog stock, investigate low-stock alerts, and assess total platform stock capital</p>
        </div>
      </div>

      {overview && (
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">Total Stock Capital</span>
              <div className="admin-kpi-icon-bubble green"><DollarSign size={18} /></div>
            </div>
            <div className="admin-kpi-val">₹{Number(overview.valuation || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>{overview.totalUnits || 0} total units across SKUs</span>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">Active SKUs</span>
              <div className="admin-kpi-icon-bubble blue"><Boxes size={18} /></div>
            </div>
            <div className="admin-kpi-val">{overview.totalProducts || 0}</div>
            <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>Unique catalog items</span>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">Low Stock Alerts</span>
              <div className="admin-kpi-icon-bubble amber"><AlertTriangle size={18} /></div>
            </div>
            <div className="admin-kpi-val" style={{ color: 'var(--admin-warning)' }}>{overview.lowStock || 0}</div>
            <span style={{ fontSize: '11.5px', color: 'var(--admin-warning)' }}>Under 10 units left</span>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">Out of Stock</span>
              <div className="admin-kpi-icon-bubble red"><AlertCircle size={18} /></div>
            </div>
            <div className="admin-kpi-val" style={{ color: 'var(--admin-danger)' }}>{overview.outOfStock || 0}</div>
            <span style={{ fontSize: '11.5px', color: 'var(--admin-danger)' }}>Immediate restock required</span>
          </div>
        </div>
      )}

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search inventory by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-select-wrap">
          <CustomSelect
            value={stockFilter}
            onChange={setStockFilter}
            options={STOCK_STATUS_OPTIONS}
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

      <InfiniteDataTable
        columns={columns}
        data={products}
        renderRow={renderRow}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        emptyIcon={Boxes}
        emptyTitle="No Products in Inventory"
      />

      {/* Adjust Stock Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Adjust Inventory Stock"
        subtitle={selectedProduct?.name}
        icon={Boxes}
      >
        {selectedProduct && (
          <form onSubmit={handleRestockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '4px' }}>Product Title</label>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--admin-text-main)' }}>{selectedProduct.name}</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '4px' }}>New Physical Stock Count *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className="admin-search-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', height: '40px', marginTop: '10px' }}
            >
              {saving ? 'Updating...' : 'Save Stock Adjustment'}
            </button>
          </form>
        )}
      </SidepanelDrawer>
    </div>
  );
}

