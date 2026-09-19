import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Tag,
  Search,
  Smartphone,
  Headphones,
  Laptop,
  Tv,
  Camera,
  Gamepad2,
  Watch,
  Shirt,
  Briefcase,
  Sparkles,
  HeartPulse,
  Home,
  Utensils,
  Coffee,
  Activity,
  Trophy,
  Compass,
  BookOpen,
  Car,
  Flame,
  Footprints,
  Armchair
} from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/adminService';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { toast } from '../components/Toast';

const ICON_MAP = {
  Smartphone,
  Headphones,
  Laptop,
  Tv,
  Camera,
  Gamepad2,
  Watch,
  Shirt,
  Footprints,
  Briefcase,
  Sparkles,
  HeartPulse,
  Home,
  Armchair,
  Utensils,
  Coffee,
  Activity,
  Trophy,
  Compass,
  BookOpen,
  Car,
  Flame,
  Tag,
  Layers
};

const AVAILABLE_ICONS = [
  'Tag', 'Layers', 'Smartphone', 'Headphones', 'Laptop', 'Tv', 'Camera',
  'Gamepad2', 'Watch', 'Shirt', 'Footprints', 'Briefcase', 'Sparkles',
  'HeartPulse', 'Home', 'Armchair', 'Utensils', 'Coffee', 'Activity',
  'Trophy', 'Compass', 'BookOpen', 'Car', 'Flame'
];

const SORT_OPTIONS = [
  { value: 'order_asc', label: 'Storefront Priority' },
  { value: 'name_asc', label: 'Name (A - Z)' },
  { value: 'name_desc', label: 'Name (Z - A)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' }
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('order_asc');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const filteredCategories = useMemo(() => {
    let result = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      // default: order_asc (displayOrder)
      return (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0);
    });
  }, [categories, search, sortBy]);

  const handleOpenCreate = () => {
    setEditCat(null);
    setName('');
    setDescription('');
    setIcon('Tag');
    setDisplayOrder(categories.length + 1);
    setDrawerOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Tag');
    setDisplayOrder(cat.displayOrder || 0);
    setDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editCat) {
        const res = await updateCategory(editCat._id, { name, description, icon, displayOrder });
        toast.success('Category updated successfully');
        setCategories((prev) => prev.map((c) => (c._id === editCat._id ? res : c)));
      } else {
        const res = await createCategory({ name, description, icon, displayOrder });
        toast.success('Category created successfully');
        setCategories((prev) => [...prev, res]);
      }
      setDrawerOpen(false);
    } catch (err) {
      toast.error('Failed to save category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  if (loading) return <Loader text="Loading all product categories & taxonomies..." />;

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="admin-page-title">Category & Taxonomy Management</h1>
            <span className="admin-badge info" style={{ fontSize: '11.5px', padding: '3px 9px' }}>
              {categories.length} Taxonomies
            </span>
          </div>
          <p className="admin-page-subtitle">
            Organize products into hierarchical categories, icons, and storefront display priority
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenCreate}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Sorting */}
      <div className="admin-toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <div className="admin-search-wrap" style={{ flex: '1 1 300px', maxWidth: '440px', position: 'relative' }}>
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search across all categories by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--admin-text-sub)',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          )}
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

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={search ? 'No Matching Categories' : 'No Categories Configured'}
          message={
            search
              ? `No categories match "${search}". Try clearing your search keyword.`
              : 'Organize your marketplace products by creating taxonomy categories and assigning display priority.'
          }
          actionText={search ? 'Clear Search' : 'Create First Category'}
          onAction={search ? () => setSearch('') : handleOpenCreate}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {filteredCategories.map((cat) => {
            const IconComp = ICON_MAP[cat.icon] || Tag;

            return (
              <div
                key={cat._id}
                style={{
                  background: 'var(--admin-card-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: 'var(--admin-shadow)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(59, 130, 246, 0.12)',
                        color: 'var(--admin-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComp size={20} />
                    </div>
                    <span className="admin-badge success">Active</span>
                  </div>

                  <h3 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--admin-text-main)', margin: '0 0 5px 0' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--admin-text-sub)', margin: 0, lineHeight: 1.45 }}>
                    {cat.description || `${cat.name} products catalog items`}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--admin-border)'
                  }}
                >
                  <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)', fontWeight: 600 }}>
                    Priority #{cat.displayOrder ?? 0}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-outline"
                      style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleOpenEdit(cat)}
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => handleDelete(cat._id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Category Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editCat ? `Edit Category — ${editCat.name}` : 'Create New Product Category'}
        subtitle="Configure taxonomy classification, display icon, and storefront priority"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              Category Title <span className="req-star">*</span>
            </label>
            <input
              type="text"
              required
              className="admin-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smartphones & Tablets"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Description / Subtitle</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown in storefront navigation..."
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Select Visual Icon</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '8px', background: 'var(--admin-surface)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              {AVAILABLE_ICONS.map((ic) => {
                const IC = ICON_MAP[ic] || Tag;
                const isSelected = icon === ic;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    title={ic}
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                      background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--admin-card-bg)',
                      color: isSelected ? 'var(--admin-primary)' : 'var(--admin-text-sub)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IC size={18} />
                  </button>
                );
              })}
            </div>
            <span className="admin-form-hint">Selected: <strong>{icon}</strong></span>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Display Order Priority</label>
            <input
              type="number"
              min="0"
              className="admin-form-input"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
            <span className="admin-form-hint">Lower numbers appear first on customer app category navigation</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
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
              disabled={saving}
            >
              {saving ? 'Saving Category...' : editCat ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>
    </div>
  );
}
