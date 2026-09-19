import React, { useState, useEffect } from 'react';
import { Search, Users, Store, Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { globalSearch } from '../services/adminService';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearch(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Global Platform Search</h1>
          <p className="admin-page-subtitle">Instant lookup across customers, verified vendors, product inventory, and customer orders</p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="admin-form-input"
          style={{ paddingLeft: '48px', height: '48px', fontSize: '1rem', borderRadius: '12px' }}
          placeholder="Search by customer name, vendor store, product title, order #, or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Searching platform database...
        </div>
      )}

      {results && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Customers */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem' }}>
              <Users size={18} /> Customers ({results.customers?.length || 0})
            </div>
            {(results.customers || []).length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 0' }}>No matching customers</div>
            ) : (
              results.customers.map((c) => (
                <div
                  key={c._id}
                  onClick={() => navigate('/customers')}
                  style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.email}</div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>

          {/* Vendors */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
              <Store size={18} /> Vendors ({results.vendors?.length || 0})
            </div>
            {(results.vendors || []).length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 0' }}>No matching vendors</div>
            ) : (
              results.vendors.map((v) => (
                <div
                  key={v._id}
                  onClick={() => navigate('/vendors')}
                  style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{v.storeName || v.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{v.email}</div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>

          {/* Products */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
              <Package size={18} /> Products ({results.products?.length || 0})
            </div>
            {(results.products || []).length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 0' }}>No matching products</div>
            ) : (
              results.products.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate('/products')}
                  style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>₹{Number(p.price || 0).toLocaleString('en-IN')} • Stock: {p.stock}</div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>

          {/* Orders */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#ec4899', fontWeight: 700, fontSize: '0.9rem' }}>
              <ShoppingBag size={18} /> Orders ({results.orders?.length || 0})
            </div>
            {(results.orders || []).length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '8px 0' }}>No matching orders</div>
            ) : (
              results.orders.map((o) => (
                <div
                  key={o._id}
                  onClick={() => navigate('/orders')}
                  style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>#{o.orderId || String(o._id).slice(-8)}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>₹{Number(o.totalAmount || 0).toLocaleString('en-IN')} • {(o.status || 'delivered').toUpperCase()}</div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

