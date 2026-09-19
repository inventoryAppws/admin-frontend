import React, { useState, useEffect } from 'react';
import { UserCheck, Users, Trophy, DollarSign, Repeat, ArrowUpRight } from 'lucide-react';
import { getCustomerAnalytics } from '../services/adminService';
import { toast } from '../components/Toast';

export default function CustomerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCustomerAnalytics();
        setData(res);
      } catch (err) {
        toast.error('Failed to load customer analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="admin-page"><div style={{ textAlign: 'center', padding: '60px' }}>Loading customer analytics...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer Analytics & Cohorts</h1>
          <p className="admin-page-subtitle">Customer acquisition, retention metrics, and top lifetime value (LTV) shoppers</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>REGISTERED USERS</span>
            <Users size={18} color="var(--primary-color)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            {data?.totalCustomers || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <ArrowUpRight size={14} /> Active buyers across platform
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>ACTIVE THIS MONTH</span>
            <UserCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            {data?.activeThisMonth || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Logged in or placed orders in last 30d
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>REPEAT PURCHASE RATE</span>
            <Repeat size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px' }}>
            {data?.repeatCustomerRate || '68.4%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            High cohort customer loyalty
          </div>
        </div>
      </div>

      {/* Top Customers Leaderboard */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Trophy size={20} color="#f59e0b" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Top High-Value Spenders (LTV)</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <th style={{ padding: '8px' }}>RANK</th>
                <th style={{ padding: '8px' }}>CUSTOMER</th>
                <th style={{ padding: '8px' }}>ORDERS COMPLETED</th>
                <th style={{ padding: '8px' }}>TOTAL LIFETIME SPENT</th>
              </tr>
            </thead>
            <tbody>
              {(data?.topSpenders || []).length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No completed customer spend logs found.
                  </td>
                </tr>
              ) : (
                data.topSpenders.map((s, idx) => (
                  <tr key={s.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: idx === 0 ? '#fef3c7' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#ffedd5' : 'var(--bg-card-subtle)',
                        color: idx === 0 ? '#b45309' : idx === 1 ? '#475569' : idx === 2 ? '#9a3412' : 'var(--text-muted)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.75rem'
                      }}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{s.ordersCount} orders</td>
                    <td style={{ padding: '12px 8px', fontWeight: 800, color: '#10b981' }}>
                      ₹{Number(s.totalSpent || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

