import React from 'react';
import {
  Sparkles,
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  Package,
  FileText,
  DollarSign,
  Users,
  CheckCircle2,
  Bot
} from 'lucide-react';
import { getAdminPageContext } from '../utils/adminPageContext';

const CORE_PLATFORM_CAPABILITIES = [
  {
    id: 'gmv-analysis',
    title: 'Platform GMV & Volume',
    query: 'Provide an executive summary of platform GMV, total orders, and growth over the last 30 days',
    icon: TrendingUp,
    color: '#0284c7',
    bg: '#e0f2fe'
  },
  {
    id: 'vendor-risk',
    title: 'Vendor Drop-Offs (>20%)',
    query: 'Audit vendor performance and identify merchants with a sales drop greater than 20%',
    icon: AlertTriangle,
    color: '#d97706',
    bg: '#fef3c7'
  },
  {
    id: 'inventory-bottlenecks',
    title: 'Stockout GMV Loss Risk',
    query: 'Audit platform-wide inventory risk: which high-demand products are stocked out and what is the GMV loss?',
    icon: Package,
    color: '#dc2626',
    bg: '#fee2e2'
  },
  {
    id: 'customer-retention',
    title: 'Customer Cohorts & Churn',
    query: 'Show me insights on our top customer cohorts and identify signs of buyer drop-off',
    icon: Users,
    color: '#7c3aed',
    bg: '#f5f3ff'
  },
  {
    id: 'campaign-roi',
    title: 'Marketing & Coupon ROI',
    query: 'Audit active coupon redemption rates and calculate the total promotional discount given',
    icon: DollarSign,
    color: '#059669',
    bg: '#d1fae5'
  },
  {
    id: 'strategic-health',
    title: 'Strategic C-Suite Health Brief',
    query: 'Generate an executive platform health brief covering GMV, commission revenue, and critical risks',
    icon: Shield,
    color: '#4f46e5',
    bg: '#eef2ff'
  }
];

export default function AdminAiWelcome({ onSelectPrompt }) {
  const pageContext = getAdminPageContext(window.location.pathname);

  return (
    <div className="admin-ai-welcome-view">
      {/* 1. HERO BANNER */}
      <div className="admin-ai-welcome-hero">
        <div className="admin-ai-hero-avatar">
          <img
            src="/titan-mascot.png"
            alt="Titan AI Mascot"
            className="admin-ai-hero-mascot-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span className="admin-ai-hero-pulse-dot" />
        </div>
        <div className="admin-ai-hero-text">
          <span className="admin-ai-hero-tag">Titan Executive Intelligence</span>
          <h2>Platform Strategic Intelligence</h2>
          <p>
            Autonomous C-Suite analytics, vendor drop-off detection, supply chain bottleneck audits, and gross merchandise value forecasting.
          </p>
        </div>
      </div>

      {/* 2. CONTEXTUAL DECISIONS BASED ON CURRENT SCREEN */}
      {pageContext && Array.isArray(pageContext.decisions) && pageContext.decisions.length > 0 && (
        <div className="admin-ai-welcome-section admin-context-section">
          <div className="admin-context-header">
            <div className="admin-context-tag">
              <span className="admin-context-dot" />
              <span>📍 {pageContext.pageTitle}</span>
            </div>
            <span className="admin-section-label">Executive Decisions for this Portal Area</span>
          </div>

          <div className="admin-context-decisions-grid">
            {pageContext.decisions.map((dec) => (
              <button
                key={dec.id}
                type="button"
                className="admin-decision-card"
                onClick={() => onSelectPrompt && onSelectPrompt(dec.query)}
              >
                <div className="admin-decision-content">
                  <strong>{dec.title}</strong>
                  <p>{dec.desc}</p>
                </div>
                <div className="admin-decision-arrow">
                  <Sparkles size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. CORE PLATFORM CAPABILITIES */}
      <div className="admin-ai-welcome-section">
        <span className="admin-section-label">Core Platform Intelligence Capabilities</span>
        <div className="admin-capabilities-grid">
          {CORE_PLATFORM_CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <button
                key={cap.id}
                type="button"
                className="admin-capability-card"
                onClick={() => onSelectPrompt && onSelectPrompt(cap.query)}
              >
                <div
                  className="admin-capability-icon"
                  style={{ background: cap.bg, color: cap.color }}
                >
                  <Icon size={18} />
                </div>
                <div className="admin-capability-info">
                  <strong>{cap.title}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
