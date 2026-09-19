import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Users,
  Store,
  Package,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  Clock,
  Laptop,
  Shirt,
  Sparkles,
  Ticket,
  AlertTriangle,
  FileText,
  Star,
  Layers
} from 'lucide-react';
import { globalSearch } from '../services/adminService';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ customers: [], vendors: [], products: [], orders: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open-global-search'));
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], vendors: [], products: [], orders: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearch(query.trim());
        setResults(data || { customers: [], vendors: [], products: [], orders: [] });
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.directPath) {
      handleNavigate(suggestion.directPath);
    } else {
      setQuery(suggestion.term);
    }
  };

  const hasResults =
    results.customers.length > 0 ||
    results.vendors.length > 0 ||
    results.products.length > 0 ||
    results.orders.length > 0;

  const SUGGESTIONS = [
    { label: 'Delivered Orders', directPath: '/orders?status=delivered', icon: CheckCircle2, color: '#10b981' },
    { label: 'Pending Orders', directPath: '/orders?status=placed', icon: Clock, color: '#f59e0b' },
    { label: 'Out for Delivery', directPath: '/orders?status=out_for_delivery', icon: ShoppingBag, color: '#6366f1' },
    { label: 'Electronics Catalog', directPath: '/products?category=Electronics', icon: Laptop, color: '#3b82f6' },
    { label: 'Low Stock Alerts', directPath: '/products?stock=low_stock', icon: AlertTriangle, color: '#ef4444' },
    { label: 'Out of Stock', directPath: '/products?stock=out_of_stock', icon: AlertTriangle, color: '#dc2626' },
    { label: 'Active Vendors', directPath: '/vendors?status=active', icon: Store, color: '#8b5cf6' },
    { label: 'Active Customers', directPath: '/customers?status=active', icon: Users, color: '#06b6d4' },
    { label: 'Blocked Customers', directPath: '/customers?status=blocked', icon: Users, color: '#dc2626' },
    { label: 'Coupons & Promos', directPath: '/coupons', icon: Ticket, color: '#f97316' },
    { label: 'Customer Reviews', directPath: '/reviews', icon: Star, color: '#eab308' },
    { label: 'Invoices & Billing', directPath: '/invoices', icon: FileText, color: '#64748b' }
  ];

  return (
    <div className="admin-search-backdrop" onClick={onClose}>
      <div className="admin-search-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="admin-search-input-box">
          <Search size={20} className="admin-search-dialog-icon" />
          <input
            type="text"
            placeholder="Search across customers, vendors, products, orders, or invoices... (ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="admin-search-dialog-input"
            autoFocus
          />
          {query && (
            <button type="button" className="admin-search-clear-btn" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="admin-search-results-body">
          {loading && <div className="admin-search-loading">Searching platform databases...</div>}

          {!loading && !query && (
            <div className="admin-search-hint">
              <p>Type anything to search live records: Order ID, Customer Name, Vendor Email, or Product.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <span className="admin-search-tags-label">Quick Suggestions</span>
                <div className="admin-search-tags">
                  {SUGGESTIONS.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <span
                        key={idx}
                        className="admin-search-tag-chip"
                        onClick={() => handleSuggestionClick(s)}
                        title={s.directPath ? `Navigate to ${s.label}` : `Search for ${s.term}`}
                        style={{ cursor: 'pointer' }}
                      >
                        <Icon size={12} style={{ color: s.color }} />
                        <span>{s.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!loading && query && !hasResults && (
            <div className="admin-search-empty">
              No results found for "<strong>{query}</strong>". Try a different query.
            </div>
          )}

          {!loading && hasResults && (
            <div className="admin-search-groups">
              {/* Orders */}
              {results.orders.length > 0 && (
                <div className="admin-search-group">
                  <div className="admin-search-group-title">
                    <ShoppingBag size={14} /> Orders ({results.orders.length})
                  </div>
                  {results.orders.map((ord) => {
                    const orderDisplay = ord.orderId || String(ord._id).slice(-8).toUpperCase();
                    return (
                      <div
                        key={ord._id}
                        className="admin-search-result-item"
                        onClick={() => handleNavigate(`/orders?q=${encodeURIComponent(ord.orderId || orderDisplay)}&inspectId=${ord._id}`)}
                      >
                        <div>
                          <strong>#{orderDisplay}</strong>
                          <span className="sub-info">Status: {ord.status} • Total: ₹{ord.totalAmount}</span>
                        </div>
                        <ArrowRight size={14} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Customers */}
              {results.customers.length > 0 && (
                <div className="admin-search-group">
                  <div className="admin-search-group-title">
                    <Users size={14} /> Customers ({results.customers.length})
                  </div>
                  {results.customers.map((c) => (
                    <div
                      key={c._id}
                      className="admin-search-result-item"
                      onClick={() => handleNavigate(`/customers?q=${encodeURIComponent(c.email || c.name)}&inspectId=${c._id}`)}
                    >
                      <div>
                        <strong>{c.name}</strong>
                        <span className="sub-info">{c.email} • {c.mobile || 'No phone'}</span>
                      </div>
                      <ArrowRight size={14} />
                    </div>
                  ))}
                </div>
              )}

              {/* Vendors */}
              {results.vendors.length > 0 && (
                <div className="admin-search-group">
                  <div className="admin-search-group-title">
                    <Store size={14} /> Vendors ({results.vendors.length})
                  </div>
                  {results.vendors.map((v) => (
                    <div
                      key={v._id}
                      className="admin-search-result-item"
                      onClick={() => handleNavigate(`/vendors?q=${encodeURIComponent(v.name || v.email)}&inspectId=${v._id}`)}
                    >
                      <div>
                        <strong>{v.name}</strong>
                        <span className="sub-info">{v.email}</span>
                      </div>
                      <ArrowRight size={14} />
                    </div>
                  ))}
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div className="admin-search-group">
                  <div className="admin-search-group-title">
                    <Package size={14} /> Products ({results.products.length})
                  </div>
                  {results.products.map((p) => (
                    <div
                      key={p._id}
                      className="admin-search-result-item"
                      onClick={() => handleNavigate(`/products?q=${encodeURIComponent(p.name)}&inspectId=${p._id}`)}
                    >
                      <div>
                        <strong>{p.name}</strong>
                        <span className="sub-info">Qty: {p.quantity} • ₹{p.price}</span>
                      </div>
                      <ArrowRight size={14} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

