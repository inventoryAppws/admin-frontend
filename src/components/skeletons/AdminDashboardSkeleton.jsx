import React from 'react';
import Bone from './Skeleton';
import AdminStatGridSkeleton from './AdminStatGridSkeleton';

export default function AdminDashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Top Header Bone */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Bone height={26} width={260} style={{ marginBottom: '8px' }} />
          <Bone height={13} width={380} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Bone height={38} width={130} radius={8} />
          <Bone height={38} width={130} radius={8} />
        </div>
      </div>

      {/* KPI Cards */}
      <AdminStatGridSkeleton count={4} />

      {/* 2-Column Split: Orders Table + Activity Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="admin-skeleton-table-wrapper" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Bone height={18} width={160} />
            <Bone height={14} width={80} />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--admin-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <Bone width={32} height={32} radius="50%" />
                <div style={{ flex: 1 }}>
                  <Bone height={13} width="60%" style={{ marginBottom: '4px' }} />
                  <Bone height={10} width="40%" />
                </div>
              </div>
              <Bone height={18} width={70} radius={9999} />
            </div>
          ))}
        </div>

        <div className="admin-skeleton-table-wrapper" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Bone height={18} width={140} />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--admin-border)' }}>
              <Bone width={28} height={28} radius={6} />
              <div style={{ flex: 1 }}>
                <Bone height={12} width="85%" style={{ marginBottom: '5px' }} />
                <Bone height={10} width="50%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
