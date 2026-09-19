import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Activity,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { getDashboardData } from '../services/adminService';
import Loader from '../components/Loader';
import { toast } from '../components/Toast';
import AdminAiSummaryCard from '../components/AdminAiSummaryCard';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getDashboardData();
      setData(res);
      if (isManual) toast.success('Live dashboard updated');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Failed to load live metrics: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loader text="Loading Enterprise Executive Overview..." />;
  if (!data) return <div className="admin-table-empty"><h4>Unable to load dashboard data</h4></div>;

  const { summary, ordersByStatus = [], recentOrders = [], lowStockProducts = [], recentAuditLogs = [] } = data;

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Executive Overview & Dashboard</h2>
          <p className="admin-page-subtitle">Real-time pulse of revenue, orders, customers, vendors, and inventory status</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? 'admin-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Live Sync'}</span>
          </button>
        </div>
      </div>

      {/* PLATFORM EXECUTIVE AI SUMMARY */}
      <AdminAiSummaryCard />

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        {/* Gross Revenue */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Gross Revenue</span>
            <div className="admin-kpi-icon-bubble green">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">₹{Number(summary.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--admin-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} />
            <span>Delivered: ₹{Number(summary.deliveredRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Total Orders</span>
            <div className="admin-kpi-icon-bubble blue">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">{summary.totalOrders || 0}</div>
          <NavLink to="/orders" style={{ fontSize: '11.5px', color: 'var(--admin-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Manage all orders</span>
            <ArrowUpRight size={13} />
          </NavLink>
        </div>

        {/* Platform Commission (5%) */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Platform Fee (5%)</span>
            <div className="admin-kpi-icon-bubble purple">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">₹{Number(summary.platformCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>Marketplace commission</span>
        </div>

        {/* Active Customers */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Total Customers</span>
            <div className="admin-kpi-icon-bubble amber">
              <Users size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">{summary.totalCustomers || 0}</div>
          <NavLink to="/customers" style={{ fontSize: '11.5px', color: 'var(--admin-warning)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>View directory</span>
            <ArrowUpRight size={13} />
          </NavLink>
        </div>

        {/* Active Vendors */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Registered Vendors</span>
            <div className="admin-kpi-icon-bubble blue">
              <Store size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">{summary.totalVendors || 0}</div>
          <NavLink to="/vendors" style={{ fontSize: '11.5px', color: 'var(--admin-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>View merchant partners</span>
            <ArrowUpRight size={13} />
          </NavLink>
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Low Stock Alerts</span>
            <div className="admin-kpi-icon-bubble red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="admin-kpi-val" style={{ color: summary.lowStockCount > 0 ? 'var(--admin-danger)' : 'var(--admin-text-main)' }}>
            {summary.lowStockCount || 0}
          </div>
          <NavLink to="/inventory" style={{ fontSize: '11.5px', color: 'var(--admin-danger)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Restock required</span>
            <ArrowUpRight size={13} />
          </NavLink>
        </div>
      </div>

      {/* Orders By Status Distribution */}
      <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', boxShadow: 'var(--admin-shadow)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--admin-text-main)' }}>Order Pipeline Distribution</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          {['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].map((st) => {
            const match = ordersByStatus.find(s => s._id === st) || { count: 0, totalRevenue: 0 };
            return (
              <div key={st} style={{ background: 'var(--admin-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>{st.replace(/_/g, ' ')}</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--admin-text-main)', marginTop: '4px' }}>{match.count}</div>
                <span style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>₹{Number(match.totalRevenue || 0).toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Recent Orders & Recent Platform Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        
        {/* Recent Orders Card */}
        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--admin-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--admin-text-main)' }}>Recent Customer Orders</h3>
            <NavLink to="/orders" style={{ fontSize: '12px', color: 'var(--admin-primary)', textDecoration: 'none', fontWeight: 600 }}>View all &rarr;</NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentOrders.map((ord) => (
              <div key={ord._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--admin-surface)', borderRadius: '8px', gap: '12px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong style={{ fontSize: '13.5px', color: 'var(--admin-text-main)', display: 'block' }}>#{ord.orderId || String(ord._id).slice(-8).toUpperCase()}</strong>
                  <div style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ord.customerId?.name || 'Customer'} • {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                    ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                  <span className={`admin-badge ${ord.status === 'delivered' ? 'success' : ord.status === 'cancelled' ? 'danger' : 'info'}`} style={{ fontSize: '10.5px', padding: '2px 8px', textTransform: 'capitalize' }}>
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Activity Stream */}
        <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--admin-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--admin-text-main)' }}>Live Audit Trail</h3>
            <NavLink to="/audit-logs" style={{ fontSize: '12px', color: 'var(--admin-primary)', textDecoration: 'none', fontWeight: 600 }}>Full Audit &rarr;</NavLink>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentAuditLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-text-sub)', fontSize: '13px' }}>
                System events and admin actions will be logged here.
              </div>
            ) : (
              recentAuditLogs.map((log) => (
                <div key={log._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: 'var(--admin-surface)', borderRadius: '8px' }}>
                  <div style={{ marginTop: '2px', color: 'var(--admin-primary)' }}>
                    <Activity size={15} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-main)', display: 'block' }}>{log.details || log.action}</span>
                    <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>By {log.adminName} • {new Date(log.createdAt).toLocaleTimeString('en-IN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

