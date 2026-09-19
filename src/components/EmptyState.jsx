import React from 'react';
import { PackageOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No Records Found',
  message = 'There are no records matching your current filter criteria.',
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  compact = false,
  className = ''
}) {
  return (
    <div className={`admin-empty-state ${compact ? 'compact' : ''} ${className}`}>
      <div className="admin-empty-icon-wrap">
        <Icon size={compact ? 28 : 34} />
      </div>
      <h4 className="admin-empty-title">{title}</h4>
      {message && <p className="admin-empty-desc">{message}</p>}
      {(actionText || secondaryActionText) && (
        <div className="admin-empty-actions">
          {actionText && onAction && (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={onAction}
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onSecondaryAction}
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

