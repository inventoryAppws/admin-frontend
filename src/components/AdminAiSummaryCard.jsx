import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  PackageX,
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import { getAdminAiSummary } from '../services/adminAiService';
import '../admin-ai.css';

function getAdminObservationIcon(iconName) {
  switch (iconName) {
    case 'trending-up':
      return <TrendingUp size={18} className="admin-obs-icon" />;
    case 'trending-down':
      return <TrendingDown size={18} className="admin-obs-icon" />;
    case 'alert-triangle':
      return <AlertTriangle size={18} className="admin-obs-icon" />;
    case 'package-x':
      return <PackageX size={18} className="admin-obs-icon" />;
    case 'shield-check':
      return <ShieldCheck size={18} className="admin-obs-icon" />;
    case 'zap':
      return <Zap size={18} className="admin-obs-icon" />;
    default:
      return <Sparkles size={18} className="admin-obs-icon" />;
  }
}

export default function AdminAiSummaryCard() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await getAdminAiSummary();
      setSummaryData(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const openAiDrawer = (query = '') => {
    window.dispatchEvent(
      new CustomEvent('open-admin-ai', { detail: { query } })
    );
  };

  if (loading) {
    return (
      <div className="admin-ai-summary-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--admin-text-muted)' }}>
          <Sparkles size={18} className="titan-ai-sparkle-icon" />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            Titan AI is synthesizing platform GMV, merchant drops &amp; risk factors...
          </span>
        </div>
      </div>
    );
  }

  if (!summaryData) return null;

  return (
    <div className="admin-ai-summary-card">
      {/* HEADER */}
      <div className="admin-ai-summary-header">
        <div className="admin-ai-title-wrap">
          <h2>Titan AI Platform Executive Summary</h2>
          <span className="admin-ai-badge">
            <Sparkles size={12} /> {summaryData.timeframe || 'Live BI'}
          </span>
        </div>

        <div className="admin-ai-summary-actions">
          <button
            type="button"
            className="admin-ai-ask-btn"
            onClick={() => openAiDrawer()}
          >
            <Sparkles size={14} />
            <span>Ask Titan AI</span>
          </button>
          <button
            type="button"
            className="admin-ai-refresh-btn"
            onClick={() => fetchSummary(true)}
            title="Refresh Platform Intelligence"
          >
            <RefreshCw size={14} className={refreshing ? 'admin-spin' : ''} />
          </button>
        </div>
      </div>

      {/* OBSERVATIONS GRID */}
      {Array.isArray(summaryData.observations) && summaryData.observations.length > 0 && (
        <div className="admin-ai-observations">
          {summaryData.observations.map((obs, idx) => (
            <div
              key={idx}
              className={`admin-obs-card ${obs.type || 'info'}`}
              style={{ cursor: 'pointer' }}
              onClick={() => openAiDrawer(`Tell me more about: ${obs.title}`)}
              title="Click to analyze with Titan"
            >
              {getAdminObservationIcon(obs.icon)}
              <div className="admin-obs-content">
                <strong>{obs.title}</strong>
                <p>{obs.text.replace(/\*\*/g, '')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUICK CHIPS */}
      {Array.isArray(summaryData.quickSuggestions) && summaryData.quickSuggestions.length > 0 && (
        <div className="admin-ai-quick-chips">
          <span>Platform Intelligence Queries:</span>
          {summaryData.quickSuggestions.map((sug, sIdx) => (
            <button
              key={sIdx}
              type="button"
              className="admin-quick-chip-btn"
              onClick={() => openAiDrawer(sug)}
            >
              {sug}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

