import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function SidepanelDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = '540px'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-sidepanel-backdrop" onClick={onClose}>
      <div
        className="admin-sidepanel-drawer"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-sidepanel-header">
          <div className="admin-sidepanel-header-info">
            {Icon && (
              <div className="admin-sidepanel-icon-box">
                <Icon size={20} />
              </div>
            )}
            <div>
              <h3 className="admin-sidepanel-title">{title}</h3>
              {subtitle && <p className="admin-sidepanel-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            className="admin-sidepanel-close-btn"
            onClick={onClose}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-sidepanel-body">
          {children}
        </div>

        {footer && (
          <div className="admin-sidepanel-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

