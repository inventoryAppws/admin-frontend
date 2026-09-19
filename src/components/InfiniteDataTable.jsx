import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Loader from './Loader';
import EmptyState from './EmptyState';

export default function InfiniteDataTable({
  columns = [],
  // Mode 1: Parent-controlled
  data: externalData,
  renderRow,
  loading: externalLoading,
  loadingMore: externalLoadingMore,
  hasMore: externalHasMore,
  onLoadMore: externalOnLoadMore,
  
  // Mode 2: Autonomous fetchData
  fetchData,
  extraParams = {},
  searchPlaceholder,
  headerToolbar,
  keyField = '_id',
  
  // Empty state configuration
  emptyIcon: EmptyIcon,
  emptyTitle = 'No Records Found',
  emptyMessage = 'There are no records matching your current filter criteria.',
  emptyActionText,
  onEmptyAction
}) {
  const isAutonomous = typeof fetchData === 'function';

  // Internal state for autonomous mode
  const [internalItems, setInternalItems] = useState([]);
  const [internalPage, setInternalPage] = useState(1);
  const [internalHasMore, setInternalHasMore] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalLoadingMore, setInternalLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    if (!isAutonomous) return;
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search, isAutonomous]);

  // Autonomous fetch function
  const loadAutonomousData = useCallback(async (pageToLoad = 1, append = false) => {
    if (!isAutonomous) return;
    append ? setInternalLoadingMore(true) : setInternalLoading(true);
    try {
      const res = await fetchData({
        page: pageToLoad,
        limit: 15,
        q: debouncedSearch,
        ...extraParams
      });
      const items = res?.items || (Array.isArray(res) ? res : []);
      setInternalItems((prev) => (append ? [...prev, ...items] : items));
      setInternalPage(res?.page || pageToLoad);
      setInternalHasMore(Boolean(res?.hasMore ?? (res?.page < res?.totalPages)));
    } catch (err) {
      console.error('InfiniteDataTable autonomous load error:', err);
    } finally {
      append ? setInternalLoadingMore(false) : setInternalLoading(false);
    }
  }, [fetchData, debouncedSearch, isAutonomous, JSON.stringify(extraParams)]);

  // Trigger initial fetch & refetch on debounced search change
  useEffect(() => {
    if (isAutonomous) {
      loadAutonomousData(1, false);
    }
  }, [loadAutonomousData, isAutonomous]);

  // Effective values depending on mode
  const data = isAutonomous ? internalItems : (externalData || []);
  const loading = isAutonomous ? internalLoading : (externalLoading || false);
  const loadingMore = isAutonomous ? internalLoadingMore : (externalLoadingMore || false);
  const hasMore = isAutonomous ? internalHasMore : (externalHasMore || false);
  const onLoadMore = isAutonomous
    ? () => {
        if (hasMore && !loadingMore) {
          loadAutonomousData(internalPage + 1, true);
        }
      }
    : externalOnLoadMore;

  // Infinite scroll intersection observer sentinel
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasMore || loading || loadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '250px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Search Toolbar for Autonomous Mode */}
      {isAutonomous && (searchPlaceholder || headerToolbar) && (
        <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: 0 }}>
          {searchPlaceholder && (
            <div className="admin-search-wrap" style={{ flex: '1 1 260px' }}>
              <Search size={15} className="admin-search-icon" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search-input"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--admin-text-sub)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Sibling filter components in the same single row */}
          {headerToolbar}
        </div>
      )}

      {/* Main Table Container */}
      <div className="admin-table-container">
        <div className="admin-table-scroll-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={col.className || ''}
                    style={col.style}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                if (typeof renderRow === 'function') {
                  return renderRow(item, index);
                }
                // Default row renderer from columns
                return (
                  <tr key={item[keyField] || item._id || index}>
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className={col.className || ''} style={col.style}>
                        {typeof col.render === 'function'
                          ? col.render(item, index)
                          : item[col.accessor || col.field || '']}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && (
            <div className="admin-table-loading" style={{ padding: '40px 20px' }}>
              <Loader text="Loading live records..." />
            </div>
          )}

          {!loading && data.length === 0 && (
            <div style={{ padding: '24px 16px' }}>
              <EmptyState
                icon={EmptyIcon}
                title={emptyTitle}
                message={emptyMessage}
                actionText={emptyActionText}
                onAction={onEmptyAction}
              />
            </div>
          )}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} className="admin-scroll-sentinel">
            {loadingMore && (
              <div className="admin-loading-more">
                <div className="admin-mini-spinner" />
                <span>Loading more records...</span>
              </div>
            )}
            {!hasMore && data.length > 0 && (
              <div className="admin-end-records">
                <span>All {data.length} records loaded</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
