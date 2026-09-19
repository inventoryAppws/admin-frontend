import React, { useState, useEffect } from 'react';
import { Store, Award, DollarSign, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { getVendorAnalytics } from '../services/adminService';
import { toast } from '../components/Toast';

export default function VendorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getVendorAnalytics();
        setData(res);
      } catch (err) {
        toast.error('Failed to load vendor analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="admin-page"><div style={{ textAlign: 'center', padding: '60px' }}>Loading vendor performance telemetry...</div></div>;
  }

  const vendors = data?.allVendors || [];
  const totalPlatformSales = vendors.reduce((s, v) => s + (v.grossSales || 0), 0);
  const totalCommissionEarned = vendors.reduce((s, v) => s + (v.commission || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Vendor Performance Analytics</h1>
          <p className="admin-page-subtitle">Track marketplace merchant sales volume, order fulfillment velocity, and commission earnings</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>TOTAL REGISTERED VENDORS</span>
            <Store size={18} color="var(--primary-color)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            {data?.totalVendors || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            Active verified merchants
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>VENDOR GMV SALES</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            ₹{Number(totalPlatformSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Fulfilled merchant volume
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>PLATFORM COMMISSION EARNED</span>
            <Award size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            ₹{Number(totalCommissionEarned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            Net marketplace revenue (5%)
          </div>
        </div>
      </div>

      {/* Vendor Leaderboard Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}>Merchant Volume Leaderboard</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '8px' }}>STORE NAME</th>
                <th style={{ padding: '8px' }}>CONTACT</th>
                <th style={{ padding: '8px' }}>ORDERS</th>
                <th style={{ padding: '8px' }}>GROSS SALES</th>
                <th style={{ padding: '8px' }}>PLATFORM COMMISSION</th>
                <th style={{ padding: '8px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No vendor sales data found.
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{v.storeName || v.name}</td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{v.email}</td>
                    <td style={{ padding: '12px 8px' }}>{v.ordersCount} orders</td>
                    <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹{Number(v.grossSales || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 700, color: '#10b981' }}>₹{Number(v.commission || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: v.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: v.status === 'active' ? '#10b981' : '#f59e0b'
                      }}>
                        {(v.status || 'ACTIVE').toUpperCase()}
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

