import React from 'react';
import Bone from './Skeleton';

export default function AdminTableSkeleton({ rows = 6, columns = 6, withSearch = true }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {withSearch && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <Bone height={38} width={280} radius={8} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Bone height={38} width={100} radius={8} />
            <Bone height={38} width={120} radius={8} />
          </div>
        </div>
      )}

      <div className="admin-skeleton-table-wrapper">
        {/* Table Header */}
        <div className="admin-skeleton-table-head">
          {Array.from({ length: columns }).map((_, i) => (
            <Bone
              key={i}
              height={14}
              width={i === 0 ? '22%' : i === columns - 1 ? '10%' : '14%'}
              radius={4}
            />
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="admin-skeleton-table-row">
            {Array.from({ length: columns }).map((_, c) => {
              if (c === 0) {
                return (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '22%' }}>
                    <Bone width={34} height={34} radius="50%" />
                    <div style={{ flex: 1 }}>
                      <Bone height={13} width="85%" style={{ marginBottom: '5px' }} />
                      <Bone height={10} width="55%" />
                    </div>
                  </div>
                );
              }
              if (c === columns - 2) {
                // Status Pill
                return (
                  <div key={c} style={{ width: '14%' }}>
                    <Bone height={24} width={75} radius={9999} />
                  </div>
                );
              }
              if (c === columns - 1) {
                // Action Buttons
                return (
                  <div key={c} style={{ width: '10%', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Bone height={30} width={30} radius={6} />
                    <Bone height={30} width={30} radius={6} />
                  </div>
                );
              }
              return (
                <div key={c} style={{ width: '14%' }}>
                  <Bone height={13} width={`${60 + ((r * 11 + c * 17) % 35)}%`} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
