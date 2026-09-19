import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  AlertCircle,
  DollarSign,
  Layers,
  Smartphone,
  Shirt,
  Footprints,
  Tv,
  UtensilsCrossed,
  Armchair,
  Sparkles,
  Dumbbell,
  Gamepad2,
  Coffee,
  Tag,
  ShoppingBag,
  Flame,
  BookOpen
} from 'lucide-react';
import { getInventoryAnalytics } from '../services/adminService';
import { toast } from '../components/Toast';

const getCategoryIcon = (categoryName) => {
  const norm = String(categoryName || '').toLowerCase().trim();
  if (norm.includes('electronic') || norm.includes('phone') || norm.includes('mobile') || norm.includes('tablet')) return Smartphone;
  if (norm.includes('fashion') || norm.includes('cloth') || norm.includes('apparel')) return Shirt;
  if (norm.includes('shoe') || norm.includes('footwear')) return Footprints;
  if (norm.includes('appliance') || norm.includes('tv')) return Tv;
  if (norm.includes('kitchen') || norm.includes('cook')) return UtensilsCrossed;
  if (norm.includes('home') || norm.includes('furnitur') || norm.includes('decor')) return Armchair;
  if (norm.includes('beauty') || norm.includes('care') || norm.includes('perfume') || norm.includes('fragrance') || norm.includes('cosmetic')) return Sparkles;
  if (norm.includes('sport') || norm.includes('fitness') || norm.includes('gym')) return Dumbbell;
  if (norm.includes('game') || norm.includes('gaming') || norm.includes('toy')) return Gamepad2;
  if (norm.includes('food') || norm.includes('beverage') || norm.includes('gourmet') || norm.includes('dessert') || norm.includes('ice cream')) return Coffee;
  if (norm.includes('pooja') || norm.includes('spiritual')) return Flame;
  if (norm.includes('stationery') || norm.includes('office') || norm.includes('book')) return BookOpen;
  return Tag;
};

export default function InventoryAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getInventoryAnalytics();
        setData(res);
      } catch (err) {
        toast.error('Failed to load inventory analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="admin-page"><div style={{ textAlign: 'center', padding: '60px' }}>Analyzing inventory holdings...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inventory Health & Valuation Analytics</h1>
          <p className="admin-page-subtitle">Real-time asset valuation, category stock distribution, and critical reorder alerts</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>TOTAL STOCK UNITS</span>
            <Boxes size={18} color="var(--primary-color)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            {data?.totalStock || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Across {data?.totalProducts || 0} product SKUs
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>ESTIMATED ASSET VALUATION</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            ₹{Number(data?.totalValuation || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px' }}>
            Retail inventory capital value
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>LOW STOCK ALERTS</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: (data?.lowStockCount || 0) > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
            {data?.lowStockCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {data?.outOfStockCount || 0} out of stock items
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Layers size={20} color="var(--primary-color)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Stock Distribution by Category</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '12px' }}>
          {(data?.categoryBreakdown || []).map((cat, idx) => {
            const CatIcon = getCategoryIcon(cat.category);
            return (
              <div key={idx} style={{
                background: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  <CatIcon size={14} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cat.category}>
                    {cat.category}
                  </span>
                </div>
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {cat.count}
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                    units
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Critical Stock Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Immediate Reorder Attention Required</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '8px' }}>PRODUCT NAME</th>
                <th style={{ padding: '8px' }}>CATEGORY</th>
                <th style={{ padding: '8px' }}>PRICE</th>
                <th style={{ padding: '8px' }}>CURRENT STOCK</th>
                <th style={{ padding: '8px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {(data?.lowStockItems || []).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#10b981', fontWeight: 600 }}>
                    All product inventory levels are healthy! No restock alerts.
                  </td>
                </tr>
              ) : (
                data.lowStockItems.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{p.category || 'General'}</td>
                    <td style={{ padding: '12px 8px' }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 800, color: p.stock === 0 ? '#ef4444' : '#f59e0b' }}>
                      {p.stock} units
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: p.stock === 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: p.stock === 0 ? '#ef4444' : '#f59e0b'
                      }}>
                        {p.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

