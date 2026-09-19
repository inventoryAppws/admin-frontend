import React from 'react';
import Bone from './Skeleton';

export default function AdminStatGridSkeleton({ count = 4 }) {
  return (
    <div className="admin-skeleton-kpi-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-skeleton-kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Bone height={12} width="55%" style={{ marginBottom: '8px' }} />
              <Bone height={26} width="80%" style={{ marginBottom: '6px' }} />
            </div>
            <Bone width={42} height={42} radius={10} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--admin-border)', paddingTop: '10px' }}>
            <Bone height={11} width="40%" />
            <Bone height={11} width="25%" radius={9999} />
          </div>
        </div>
      ))}
    </div>
  );
}
