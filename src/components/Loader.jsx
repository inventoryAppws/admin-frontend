import React from 'react';
import AdminTableSkeleton from './skeletons/AdminTableSkeleton';
import AdminStatGridSkeleton from './skeletons/AdminStatGridSkeleton';
import AdminDashboardSkeleton from './skeletons/AdminDashboardSkeleton';

export default function Loader({
  type,
  text = 'Loading data...',
  rows = 6,
  columns = 6,
  count = 4
}) {
  if (type === 'dashboard' || (text && text.toLowerCase().includes('dashboard'))) {
    return <AdminDashboardSkeleton />;
  }

  if (type === 'stats' || (text && text.toLowerCase().includes('analytics'))) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        <AdminStatGridSkeleton count={count} />
        <AdminTableSkeleton rows={rows} columns={columns} />
      </div>
    );
  }

  // Default to Look-Alike Admin Table Skeleton
  return <AdminTableSkeleton rows={rows} columns={columns} withSearch={true} />;
}
