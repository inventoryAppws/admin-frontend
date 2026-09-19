import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Star,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Tag,
  Eye,
  Camera,
  Check,
  X,
  Store,
  Mail,
  Phone,
  MapPin,
  Boxes,
  IndianRupee,
  Layers,
  UserCheck
} from 'lucide-react';
import {
  getProductById,
  getProductReviews,
  updateProduct,
  deleteProduct,
  moderateReview
} from '../services/adminService';
import Loader from '../components/Loader';
import SidepanelDrawer from '../components/SidepanelDrawer';
import { toast } from '../components/Toast';

export default function AdminProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    summary: { total: 0, average: 0, counts: {}, breakdown: {} }
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [moderatingId, setModifyingId] = useState(null);

  // Gallery active image
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Edit Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await getProductById(id);
      if (!data) throw new Error('Product not found in catalog');
      setProduct(data);
      setEditName(data.name || '');
      setEditPrice(data.price || '');
      setEditQty(data.quantity || 0);
    } catch (err) {
      console.error('Failed to load product:', err);
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const res = await getProductReviews(id);
      const items = res?.items || res?.reviews || [];
      const total = items.length;
      let sum = 0;
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      items.forEach((r) => {
        const rounded = Math.min(Math.max(Math.round(r.rating || 5), 1), 5);
        counts[rounded] = (counts[rounded] || 0) + 1;
        sum += r.rating || 5;
      });
      const average = total > 0 ? Number((sum / total).toFixed(1)) : 0;

      setReviewsData({
        reviews: items,
        summary: { total, average, counts }
      });
    } catch (err) {
      console.warn('Failed to load product reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [loadProduct, loadReviews]);

  // Handle Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProduct(product._id, {
        name: editName.trim(),
        price: Number(editPrice),
        quantity: Number(editQty)
      });
      toast.success('Product details updated successfully');
      setProduct((prev) => ({ ...prev, ...updated }));
      setDrawerOpen(false);
    } catch (err) {
      toast.error('Failed to save product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Product
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove "${product.name}" from the platform catalog?`)) return;
    try {
      await deleteProduct(product._id);
      toast.success('Product deleted successfully');
      navigate('/products');
    } catch (err) {
      toast.error('Failed to delete product: ' + err.message);
    }
  };

  // Handle Review Moderation
  const handleModerate = async (reviewId, status) => {
    setModifyingId(reviewId);
    try {
      await moderateReview(reviewId, { status });
      toast.success(`Review ${status.toUpperCase()}`);
      setReviewsData((prev) => ({
        ...prev,
        reviews: prev.reviews.map((r) => (r._id === reviewId ? { ...r, status } : r))
      }));
    } catch (err) {
      toast.error('Failed to moderate review: ' + err.message);
    } finally {
      setModifyingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <Loader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertTriangle size={36} color="#ef4444" style={{ margin: '0 auto 8px' }} />
        <h3 style={{ color: 'var(--admin-text-main, #0f172a)' }}>{error || 'Product Not Found'}</h3>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => navigate('/products')}
          style={{ marginTop: '1rem' }}
        >
          Back to Product Catalog
        </button>
      </div>
    );
  }

  // Calculate metrics
  const quantity = Number(product.quantity || 0);
  const isOutOfStock = quantity <= 0;
  const isLowStock = quantity > 0 && quantity <= 10;
  const price = Number(product.price || 0);
  const discount = Number(product.discountPercentage || 0);
  const discountedPrice = Math.round(price * (1 - discount / 100));
  const inventoryValue = Math.round(price * quantity);

  // Collect images
  const allImages = [];
  if (product.image) allImages.push(product.image);
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }
  if (allImages.length === 0) {
    allImages.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');
  }
  const currentHeroImg = allImages[selectedImageIndex] || allImages[0];

  // Collect customer photos from all reviews
  const allCustomerPhotos = [];
  (reviewsData.reviews || []).forEach((r) => {
    if (Array.isArray(r.images)) {
      r.images.forEach((img) => {
        if (img) allCustomerPhotos.push({ img, reviewId: r._id, customerName: r.customerName || r.customerId?.name, rating: r.rating });
      });
    }
  });

  // Filter reviews
  const filteredReviews = (reviewsData.reviews || []).filter((r) => {
    if (reviewFilter === 'all') return true;
    if (reviewFilter === 'photos') return Array.isArray(r.images) && r.images.length > 0;
    return String(Math.round(r.rating || 5)) === String(reviewFilter);
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => navigate('/products')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Catalog</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-color, #3b82f6)', textTransform: 'uppercase' }}>
                {product.category || 'General'}
              </span>
              <span style={{ color: 'var(--admin-border, #cbd5e1)' }}>•</span>
              <span style={{ fontSize: '12px', color: 'var(--admin-text-sub, #64748b)' }}>ID: {String(product._id).slice(-8).toUpperCase()}</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-main, #0f172a)', margin: '4px 0 0 0' }}>
              {product.name}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setDrawerOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <Edit3 size={14} />
            <span>Edit Product</span>
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={handleDelete}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            title="Delete from catalog"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2. ADMIN STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Stock */}
        <div style={{ background: 'var(--admin-card-bg, #fff)', border: '1px solid var(--admin-border, #e2e8f0)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub, #64748b)' }}>CURRENT INVENTORY</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                background: isOutOfStock ? '#fee2e2' : isLowStock ? '#fef3c7' : '#dcfce7',
                color: isOutOfStock ? '#b91c1c' : isLowStock ? '#b45309' : '#15803d'
              }}
            >
              {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? 'LOW STOCK' : 'IN STOCK'}
            </span>
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--admin-text-main, #0f172a)' }}>
            {quantity.toLocaleString('en-IN')}{' '}
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-text-sub, #64748b)' }}>units</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--admin-text-sub, #64748b)', marginTop: '4px' }}>
            Stock Value: <strong>₹{inventoryValue.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Pricing */}
        <div style={{ background: 'var(--admin-card-bg, #fff)', border: '1px solid var(--admin-border, #e2e8f0)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub, #64748b)' }}>LIST PRICE</span>
            {discount > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: '#e0e7ff', color: '#4338ca' }}>
                {discount}% OFF
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--admin-text-main, #0f172a)' }}>
              ₹{discountedPrice.toLocaleString('en-IN')}
            </span>
            {discount > 0 && (
              <span style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                ₹{price.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--admin-text-sub, #64748b)', marginTop: '4px' }}>
            Catalog MSRP: ₹{price.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Vendor Partner */}
        <div style={{ background: 'var(--admin-card-bg, #fff)', border: '1px solid var(--admin-border, #e2e8f0)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub, #64748b)' }}>VENDOR MERCHANT</span>
            <Store size={15} color="var(--primary-color, #3b82f6)" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text-main, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.vendorName || 'Merchant'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--admin-text-sub, #64748b)', marginTop: '4px' }}>
            {product.vendorEmail || 'Verified Merchant Partner'}
          </div>
        </div>

        {/* Rating */}
        <div style={{ background: 'var(--admin-card-bg, #fff)', border: '1px solid var(--admin-border, #e2e8f0)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-sub, #64748b)' }}>REVIEWS &amp; RATING</span>
            <Star size={15} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--admin-text-main, #0f172a)' }}>
              {reviewsData.summary.average || Number(product.rating || 4.5).toFixed(1)}
            </span>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  fill={s <= (reviewsData.summary.average || product.rating || 4.5) ? '#f59e0b' : 'none'}
                  color="#f59e0b"
                />
              ))}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--admin-text-sub, #64748b)', marginTop: '4px' }}>
            {reviewsData.summary.total || 0} customer reviews
          </div>
        </div>
      </div>

      {/* 3. PRODUCT MEDIA & MERCHANT OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left: Gallery */}
        <div style={{ background: 'var(--admin-card-bg, #fff)', border: '1px solid var(--admin-border, #e2e8f0)', borderRadius: '12px', padding: '1.2rem' }}>
          <div
            style={{
              width: '100%',
              height: '350px',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <img
              src={currentHeroImg}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: idx === selectedImageIndex ? '2px solid var(--primary-color, #3b82f6)' : '1px solid #e2e8f0',
                    background: '#f8fafc',
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Vendor Details & Specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Vendor Information Card */}
          <div style={{ background: 'var(--admin-card-bg, #fff)', border: '1px solid var(--admin-border, #e2e8f0)', borderRadius: '12px', padding: '1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="var(--primary-color, #3b82f6)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main, #0f172a)', margin: 0 }}>
                  Fulfilling Merchant Details
                </h3>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}
              >
                <UserCheck size={12} /> Verified Seller
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--admin-text-sub, #64748b)', display: 'block', fontSize: '11.5px' }}>STORE NAME</span>
                <strong style={{ color: 'var(--admin-text-main, #0f172a)' }}>{product.vendorName || 'Independent Vendor'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--admin-text-sub, #64748b)', display: 'block', fontSize: '11.5px' }}>EMAIL CONTACT</span>
                <span style={{ color: 'var(--admin-text-main, #0f172a)' }}>{product.vendorEmail || '—'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--admin-text-sub, #64748b)', display: 'block', fontSize: '11.5px' }}>PHONE</span>
                <span style={{ color: 'var(--admin-text-main, #0f172a)' }}>{product.vendorMobile || '—'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--admin-text-sub, #64748b)', display: 'block', fontSize: '11.5px' }}>DISPATCH WAREHOUSE</span>
                <span style={{ color: 'var(--admin-text-main, #0f172a)' }}>{product.vendorAddress || 'Central Hub'}</span>
              </div>
            </div>
          </div>

          {/* Description & Attributes Card */}
          <div style={{ background: 'var(--admin-card-bg, #fff)', border: '1px solid var(--admin-border, #e2e8f0)', borderRadius: '12px', padding: '1.4rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text-main, #0f172a)', marginBottom: '10px' }}>
              Product Specifications
            </h3>
            <p style={{ color: 'var(--admin-text-main, #334155)', fontSize: '13.5px', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
              {product.description || 'No detailed catalog description provided.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border, #f1f5f9)' }}>
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub, #64748b)', display: 'block' }}>RETURN WINDOW</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-main, #0f172a)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <RotateCcw size={13} color="#10b981" />
                  {product.returnPolicy || '7 Days Return & Exchange'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub, #64748b)', display: 'block' }}>WARRANTY</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--admin-text-main, #0f172a)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} color="#3b82f6" />
                  {product.warranty || '1 Year Manufacturer Warranty'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CUSTOMER REVIEWS & RATINGS (WITH PHOTOS & ZOOM) */}
      <div
        style={{
          background: 'var(--admin-card-bg, #fff)',
          border: '1px solid var(--admin-border, #e2e8f0)',
          borderRadius: '14px',
          padding: '1.8rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-text-main, #0f172a)', margin: 0 }}>
                Customer Product Reviews &amp; Photos
              </h2>
              <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                {reviewsData.summary.total || 0} Total
              </span>
            </div>
            <p style={{ color: 'var(--admin-text-sub, #64748b)', fontSize: '13px', marginTop: '4px' }}>
              Review customer feedback, photo attachments, and approve or reject submissions
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--admin-text-main, #0f172a)', lineHeight: 1 }}>
              {reviewsData.summary.average || 4.5} ★
            </div>
            <div style={{ fontSize: '12px', color: 'var(--admin-text-sub, #64748b)', marginTop: '2px' }}>
              Average Star Rating
            </div>
          </div>
        </div>

        {/* CUSTOMER UPLOADED PHOTOS CAROUSEL */}
        {allCustomerPhotos.length > 0 && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.2rem',
              marginBottom: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Camera size={16} color="#3b82f6" />
              <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>
                Customer Uploaded Photos ({allCustomerPhotos.length})
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>— Click to zoom</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
              {allCustomerPhotos.map((item, pIdx) => (
                <div
                  key={pIdx}
                  onClick={() => setActivePhotoModal(item.img)}
                  style={{
                    width: '85px',
                    height: '85px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                    position: 'relative',
                    border: '1.5px solid #cbd5e1',
                    background: '#fff'
                  }}
                  title={`Photo by ${item.customerName || 'Customer'} (${item.rating}★)`}
                >
                  <img src={item.img} alt="Customer upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(15, 23, 42, 0.65)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px 0'
                    }}
                  >
                    <span>{item.rating}★</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          {[
            { id: 'all', label: `All (${reviewsData.summary.total || 0})` },
            { id: 'photos', label: `With Photos (${allCustomerPhotos.length})` },
            { id: '5', label: `5 Stars (${reviewsData.summary.counts?.[5] || 0})` },
            { id: '4', label: `4 Stars (${reviewsData.summary.counts?.[4] || 0})` },
            { id: '3', label: `3 Stars (${reviewsData.summary.counts?.[3] || 0})` },
            { id: '2', label: `2 Stars (${reviewsData.summary.counts?.[2] || 0})` },
            { id: '1', label: `1 Star (${reviewsData.summary.counts?.[1] || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReviewFilter(tab.id)}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '8px',
                border: reviewFilter === tab.id ? '1.5px solid var(--primary-color, #3b82f6)' : '1px solid #e2e8f0',
                background: reviewFilter === tab.id ? '#eff6ff' : '#ffffff',
                color: reviewFilter === tab.id ? '#1d4ed8' : '#475569',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Review Feed */}
        {reviewsLoading ? (
          <Loader />
        ) : filteredReviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '10px' }}>
            <Star size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 4px 0' }}>
              No reviews matching criteria
            </h4>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
              Customer submissions for this product will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredReviews.map((rev) => {
              const isApproved = rev.status === 'approved' || !rev.status;
              const isRejected = rev.status === 'rejected';

              return (
                <div
                  key={rev._id}
                  style={{
                    padding: '1.2rem',
                    borderRadius: '10px',
                    border: '1px solid var(--admin-border, #e2e8f0)',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#e0e7ff',
                          color: '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}
                      >
                        {((rev.customerName || rev.customerId?.name || 'U')).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '13.5px', color: 'var(--admin-text-main, #0f172a)' }}>
                          {rev.customerName || rev.customerId?.name || 'Verified Customer'}
                        </strong>
                        <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub, #64748b)', marginLeft: '6px' }}>
                          {rev.customerId?.email || ''}
                        </span>
                      </div>
                    </div>

                    {/* Moderation Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                          color: isApproved ? '#15803d' : isRejected ? '#b91c1c' : '#b45309'
                        }}
                      >
                        {isRejected ? 'REJECTED' : 'APPROVED'}
                      </span>
                      {isRejected ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          disabled={moderatingId === rev._id}
                          onClick={() => handleModerate(rev._id, 'approved')}
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          disabled={moderatingId === rev._id}
                          onClick={() => handleModerate(rev._id, 'rejected')}
                        >
                          Reject / Hide
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          fill={s <= (rev.rating || 5) ? '#f59e0b' : 'none'}
                          color="#f59e0b"
                        />
                      ))}
                    </div>
                    {rev.title && (
                      <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--admin-text-main, #1e293b)' }}>
                        {rev.title}
                      </h5>
                    )}
                  </div>

                  {/* Review Text */}
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--admin-text-main, #334155)', lineHeight: 1.5 }}>
                    {rev.comment}
                  </p>

                  {/* Attached Customer Photos */}
                  {Array.isArray(rev.images) && rev.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {rev.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActivePhotoModal(imgUrl)}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc'
                          }}
                          title="Click to zoom customer photo"
                        >
                          <img src={imgUrl} alt="Customer upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT DRAWER */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={`Edit Catalog Product`}
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Product Title</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="admin-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Price (₹)</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="admin-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Stock Units</label>
            <input
              type="number"
              required
              min="0"
              value={editQty}
              onChange={(e) => setEditQty(e.target.value)}
              className="admin-input"
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="admin-btn admin-btn-outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Product'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>

      {/* LIGHTBOX PHOTO MODAL */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              maxWidth: '650px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc'
              }}
            >
              <strong style={{ fontSize: '13.5px', color: '#1e293b' }}>Customer Review Photo</strong>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', maxHeight: '75vh' }}>
              <img
                src={activePhotoModal}
                alt="Zoomed customer photo"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

