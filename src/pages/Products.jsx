import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Package, Search, Edit3, Trash2, Tag, AlertTriangle, Layers, Filter, Eye } from 'lucide-react';
import { getProducts, updateProduct, deleteProduct, getCategories } from '../services/adminService';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import AiWriteButton from '../components/AiWriteButton';
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
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'stock_asc', label: 'Stock: Low to High' },
  { value: 'stock_desc', label: 'Stock: High to Low' },
  { value: 'name_asc', label: 'Product Name (A-Z)' }
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const qParam = searchParams.get('q') || '';
  const catParam = searchParams.get('category') || 'all';
  const stockParam = searchParams.get('stock') || 'all';
  const inspectIdParam = searchParams.get('inspectId') || searchParams.get('editId') || '';

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState(qParam);
  const [categoryFilter, setCategoryFilter] = useState(catParam);
  const [stockFilter, setStockFilter] = useState(stockParam);
  const [sortBy, setSortBy] = useState('newest');
  const [categoryOptions, setCategoryOptions] = useState([
    { value: 'all', label: 'All Categories' }
  ]);

  // Edit Drawer
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  // Load available categories for filter dropdown
  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((cats) => {
        if (!mounted) return;
        const list = Array.isArray(cats) ? cats : cats?.items || [];
        const opts = [
          { value: 'all', label: 'All Categories' },
          ...list.map((c) => ({
            value: typeof c === 'string' ? c : c.name,
            label: typeof c === 'string' ? c : c.name
          }))
        ];
        setCategoryOptions(opts);
      })
      .catch((err) => {
        console.warn('Failed to load categories for filter:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const fetchProducts = useCallback(async (requestedPage = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const data = await getProducts({
        page: requestedPage,
        limit: 15,
        q: search,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        stockStatus: stockFilter !== 'all' ? stockFilter : undefined,
        sortBy
      });
      const items = data.items || [];
      setProducts((prev) => (append ? [...prev, ...items] : items));
      setPage(data.page || requestedPage);
      setHasMore(data.page < data.totalPages);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error('Failed to load catalog products');
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  }, [search, categoryFilter, stockFilter, sortBy]);

  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Synchronize when URL searchParams change
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== search) setSearch(q);
    else if (q === null && search !== '') setSearch('');

    const c = searchParams.get('category');
    if (c && c !== categoryFilter) setCategoryFilter(c);
    else if (!c && categoryFilter !== 'all') setCategoryFilter('all');

    const s = searchParams.get('stock');
    if (s && s !== stockFilter) setStockFilter(s);
    else if (!s && stockFilter !== 'all') setStockFilter('all');
  }, [searchParams]);

  // Automatically inspect/edit product if inspectId or editId is present in URL or updated
  useEffect(() => {
    if (inspectIdParam && products.length > 0) {
      const match = products.find((p) => String(p._id) === String(inspectIdParam));
      if (match) {
        handleOpenEdit(match);
      }
    }
  }, [inspectIdParam, products]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchProducts(page + 1, true);
    }
  };

  const handleOpenEdit = (p) => {
    setSelectedProduct(p);
    setEditName(p.name || '');
    setEditPrice(p.price || '');
    setEditQty(p.quantity || '');
    setEditDesc(p.description || '');
    setDrawerOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProduct(selectedProduct._id, {
        name: editName,
        price: Number(editPrice),
        quantity: Number(editQty),
        description: editDesc
      });
      toast.success('Product updated successfully');
      setProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? { ...p, ...res } : p))
      );
      setDrawerOpen(false);
    } catch (err) {
      toast.error('Failed to save product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from the platform?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product removed from catalog');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error('Failed to delete product: ' + err.message);
    }
  };

  const columns = [
    { header: 'Product Item' },
    { header: 'Category' },
    { header: 'Vendor Merchant' },
    { header: 'Stock Units', className: 'text-center' },
    { header: 'Unit Price', className: 'text-right' },
    { header: 'Actions', className: 'text-center' }
  ];

  const renderRow = (p) => (
    <tr key={p._id}>
      <td>
        <strong
          onClick={() => navigate(`/products/${p._id}`)}
          style={{
            display: 'block',
            fontSize: '13.5px',
            color: 'var(--admin-text-main)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-color, #3b82f6)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--admin-text-main)')}
          title="View detailed product page & customer reviews"
        >
          {p.name}
        </strong>
      </td>
      <td>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11.5px',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: 'var(--admin-card-bg, #f1f5f9)',
            border: '1px solid var(--admin-border, #e2e8f0)',
            color: 'var(--admin-text-sub, #64748b)'
          }}
        >
          <Tag size={11} />
          {p.category || 'General'}
        </span>
      </td>
      <td>{p.vendorName || 'Merchant'}</td>
      <td style={{ textAlign: 'center' }}>
        <span className={`admin-badge ${p.quantity <= 0 ? 'danger' : p.quantity <= 10 ? 'warning' : 'neutral'}`}>
          {p.quantity} in stock
        </span>
      </td>
      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-text-main)' }}>
        ₹{Number(p.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--primary-color, #3b82f6)' }}
            onClick={() => navigate(`/products/${p._id}`)}
            title="View Details & Reviews"
          >
            <Eye size={13} />
            <span>View</span>
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            onClick={() => handleOpenEdit(p)}
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            onClick={() => handleDelete(p._id)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Global Product Catalog</h2>
          <p className="admin-page-subtitle">Inspect and curate all vendor products, stock volumes, and price points</p>
        </div>
      </div>

      <div className="admin-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div className="admin-search-wrap" style={{ flex: '1 1 240px', minWidth: '220px' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search products by title or vendor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-select-wrap" style={{ minWidth: '180px' }}>
          <CustomSelect
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
            placeholder="All Categories"
            prefixIcon={<Layers size={14} />}
          />
        </div>

        <div className="admin-filter-select-wrap" style={{ minWidth: '170px' }}>
          <CustomSelect
            value={stockFilter}
            onChange={setStockFilter}
            options={STOCK_STATUS_OPTIONS}
            placeholder="All Stock Levels"
            prefixIcon={<Filter size={14} />}
          />
        </div>

        <div className="admin-filter-select-wrap" style={{ minWidth: '170px' }}>
          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={SORT_OPTIONS}
            placeholder="Sort Products"
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
        emptyIcon={Package}
        emptyTitle="No Products Found"
      />

      {/* Edit Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Edit Product Details"
        subtitle={selectedProduct?.name}
        icon={Package}
      >
        {selectedProduct && (
          <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub)' }}>Product Title *</label>
                <AiWriteButton
                  task="product_title"
                  input={editName}
                  context={{ productName: editName, category: selectedProduct?.category }}
                  onGenerated={(res) => {
                    if (res?.title) setEditName(res.title);
                    else if (res?.result) setEditName(res.result);
                  }}
                  label="✨ AI Title"
                  size="small"
                />
              </div>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="admin-search-input"
                required
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub)' }}>Product Description</label>
                <AiWriteButton
                  task="product_description"
                  input={editDesc || editName}
                  context={{ productName: editName, category: selectedProduct?.category, price: editPrice }}
                  onGenerated={(res) => {
                    if (res?.description) setEditDesc(res.description);
                    else if (res?.result) setEditDesc(res.result);
                  }}
                  label="✨ AI Description"
                  size="small"
                />
              </div>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="admin-search-input"
                rows={4}
                placeholder="Product highlights, specifications, and details..."
                style={{ resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '4px' }}>Unit Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="admin-search-input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub)', marginBottom: '4px' }}>Available Stock Units *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
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
              {saving ? 'Saving Changes...' : 'Save Product Changes'}
            </button>
          </form>
        )}
      </SidepanelDrawer>
    </div>
  );
}

