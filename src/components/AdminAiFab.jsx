import React, { useState } from 'react';
import { Sparkles, Bot } from 'lucide-react';

export default function AdminAiFab({ onClick, isOpen = false }) {
  const [imgError, setImgError] = useState(false);

  if (isOpen) return null;

  return (
    <button
      type="button"
      className="titan-fab-btn"
      onClick={onClick}
      aria-label="Open Titan AI Platform Intelligence"
      title="Ask Titan AI"
    >
      <div className="titan-fab-icon-wrap">
        {!imgError ? (
          <img
            src="/titan-mascot.png"
            alt="Titan AI"
            className="titan-fab-avatar"
            onError={() => setImgError(true)}
          />
        ) : (
          <Bot size={22} className="titan-fab-avatar-icon" />
        )}
        <span className="titan-fab-status-dot" />
      </div>

      <div className="titan-fab-label-area">
        <span className="titan-fab-sparkle">
          <Sparkles size={15} />
        </span>
        <span className="titan-fab-text">
          <span className="titan-fab-ask">Ask</span>{' '}
          <span className="titan-fab-name">Titan</span>
        </span>
      </div>
    </button>
  );
}

