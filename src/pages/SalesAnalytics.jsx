import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, CreditCard, ArrowUpRight, BarChart2 } from 'lucide-react';
import { getSalesAnalytics } from '../services/adminService';
import { toast } from '../components/Toast';

export default function SalesAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSalesAnalytics();
        setData(res);
      } catch (err) {
        toast.error('Failed to load sales analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="admin-page"><div style={{ textAlign: 'center', padding: '60px' }}>Crunching financial telemetry...</div></div>;
  }

  const summary = data?.summary || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, growth: '+14.8%' };
  const chartData = data?.chartData || [];
  const maxRevenue = Math.max(...chartData.map(c => c.revenue), 1000);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Sales & Revenue Intelligence</h1>
          <p className="admin-page-subtitle">Platform gross merchandise volume (GMV), daily cash collection, and order velocity</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>GROSS VOLUME</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            ₹{Number(summary.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <ArrowUpRight size={14} /> {summary.growth} vs last period
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>TOTAL ORDERS COMPLETED</span>
            <ShoppingBag size={18} color="var(--primary-color)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            {summary.totalOrders}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Across all vendors
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>AVERAGE ORDER VALUE</span>
            <TrendingUp size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            ₹{Number(summary.avgOrderValue || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Per completed checkout
          </div>
        </div>
      </div>

      {/* Revenue Trend Visualizer */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Daily Revenue Trajectory</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Daily checkout transaction inflow</p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}>Last 10 Active Periods</span>
        </div>

        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingTop: '20px' }}>
          {chartData.length === 0 ? (
            <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>No historical revenue points available yet</div>
          ) : (
            chartData.map((pt, idx) => {
              const heightPercent = Math.max(Math.round((pt.revenue / maxRevenue) * 100), 12);
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ₹{pt.revenue > 1000 ? `${(pt.revenue / 1000).toFixed(1)}k` : pt.revenue}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '42px',
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, var(--primary-color) 0%, rgba(99, 102, 241, 0.4) 100%)',
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {pt.date}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent High-Volume Orders Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Recent Order Flow</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '8px' }}>ORDER ID</th>
                <th style={{ padding: '8px' }}>AMOUNT</th>
                <th style={{ padding: '8px' }}>PAYMENT METHOD</th>
                <th style={{ padding: '8px' }}>STATUS</th>
                <th style={{ padding: '8px' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentTransactions || []).map((o) => (
                <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>#{o.orderId || String(o._id).slice(-8)}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 700 }}>₹{Number(o.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 8px', textTransform: 'uppercase', fontSize: '0.75rem' }}>{o.paymentMethod}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                      {(o.status || 'DELIVERED').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {new Date(o.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

