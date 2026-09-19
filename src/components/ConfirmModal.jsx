import React from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirmation',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary', // 'primary' | 'danger' | 'warning' | 'success'
  icon = 'warning',
  onConfirm,
  onClose,
  loading = false
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case 'danger':
        return <AlertTriangle size={24} style={{ color: '#ef4444' }} />;
      case 'warning':
        return <AlertTriangle size={24} style={{ color: '#f59e0b' }} />;
      case 'success':
        return <CheckCircle2 size={24} style={{ color: '#10b981' }} />;
      default:
        return <Info size={24} style={{ color: '#3b82f6' }} />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'admin-btn admin-btn-danger';
      case 'success':
        return 'admin-btn admin-btn-success';
      case 'warning':
        return 'admin-btn admin-btn-warning';
      default:
        return 'admin-btn admin-btn-primary';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--admin-card-bg)',
          border: '1px solid var(--admin-border)',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          animation: 'fadeInScale 0.18s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {getIcon()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--admin-text-main)' }}>
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--admin-text-sub)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: '13.5px', color: 'var(--admin-text-sub)', lineHeight: 1.55, marginBottom: '22px' }}>
          {message}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={getConfirmButtonClass()}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

