import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Sparkles, Zap, Bot, Search, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { getTitanSettings, updateTitanSettings } from '../services/adminAiService';
import { toast } from './Toast';

const PROVIDER_OPTIONS = [
  {
    value: 'auto',
    label: 'Auto Router (Recommended)',
    desc: '5-tier cascade: Gemini → OpenRouter → Groq → Cerebras → Local NLP',
    icon: <Sparkles size={16} />,
    color: '#0ea5e9'
  },
  {
    value: 'gemini',
    label: 'Google Gemini AI',
    desc: 'Deep platform analytics, multi-tool queries, and financial auditing',
    icon: <Zap size={16} />,
    color: '#10b981'
  },
  {
    value: 'openrouter',
    label: 'OpenRouter Cloud AI',
    desc: 'Multi-LLM gateway router (Llama 3.3 / Mistral)',
    icon: <Bot size={16} />,
    color: '#f59e0b'
  },
  {
    value: 'groq',
    label: 'Groq LPU Cloud AI',
    desc: 'High-speed LPU inference engine (openai/gpt-oss-120b)',
    icon: <Cpu size={16} />,
    color: '#f97316'
  },
  {
    value: 'cerebras',
    label: 'Cerebras Wafer AI',
    desc: 'Wafer-scale high-throughput inference (gpt-oss-120b)',
    icon: <Layers size={16} />,
    color: '#8b5cf6'
  },
  {
    value: 'nlp',
    label: 'Fast Platform Rule Engine',
    desc: 'Deterministic platform analytics queries (zero latency)',
    icon: <Search size={16} />,
    color: '#6366f1'
  }
];

export default function AdminAiSettings({ onBack, onProviderChange }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    aiProviderPreference: localStorage.getItem('titan_ai_provider') || 'auto',
    voiceInputEnabled: true,
    suggestedPromptsEnabled: true,
    saveConversationsEnabled: true,
    anomalyThresholdPct: 20,
    defaultTimeframe: '30d',
    alertNotifications: true
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getTitanSettings();
        if (isMounted && res?.settings) {
          const s = res.settings;
          const localPref = localStorage.getItem('titan_ai_provider') || s.aiProviderPreference || 'auto';
          setFormData({
            aiProviderPreference: localPref,
            voiceInputEnabled: s.voiceInputEnabled !== false,
            suggestedPromptsEnabled: s.suggestedPromptsEnabled !== false,
            saveConversationsEnabled: s.saveConversationsEnabled !== false,
            anomalyThresholdPct: s.anomalyThresholdPct || 20,
            defaultTimeframe: s.defaultTimeframe || '30d',
            alertNotifications: s.alertNotifications !== false
          });
        }
      } catch (err) {
        console.warn('Could not load Titan settings:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateTitanSettings({
        aiProviderPreference: formData.aiProviderPreference,
        voiceInputEnabled: Boolean(formData.voiceInputEnabled),
        suggestedPromptsEnabled: Boolean(formData.suggestedPromptsEnabled),
        saveConversationsEnabled: Boolean(formData.saveConversationsEnabled),
        anomalyThresholdPct: Number(formData.anomalyThresholdPct) || 20,
        defaultTimeframe: formData.defaultTimeframe || '30d',
        alertNotifications: Boolean(formData.alertNotifications)
      });
      localStorage.setItem('titan_ai_provider', formData.aiProviderPreference);
      if (onProviderChange) onProviderChange(formData.aiProviderPreference);
      toast.success('Titan AI settings saved successfully!');
      if (onBack) onBack();
    } catch (err) {
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="titan-ai-subpanel">
      <div className="titan-ai-subpanel-header">
        <div className="titan-ai-subpanel-header-left">
          <button type="button" className="titan-ai-subpanel-back-btn" onClick={onBack} title="Back to Chat">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3>Titan Settings</h3>
            <p>Configure intelligence models &amp; risk anomaly thresholds</p>
          </div>
        </div>
        <button
          type="button"
          className="titan-ai-subpanel-action-btn primary"
          onClick={handleSave}
          disabled={saving || loading}
        >
          <Save size={15} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {loading ? (
        <div className="titan-ai-subpanel-loading">
          <div className="titan-ai-spinner" />
          <span>Loading settings...</span>
        </div>
      ) : (
        <form className="titan-ai-settings-form" onSubmit={handleSave}>
          {/* Section 1: AI Model Engine */}
          <div className="titan-ai-settings-section">
            <label className="titan-ai-section-title">AI Intelligence Engine</label>
            <p className="titan-ai-section-sub">Choose which model powers platform audits and BI generation</p>

            <div className="titan-ai-provider-cards">
              {PROVIDER_OPTIONS.map((opt) => {
                const isSelected = formData.aiProviderPreference === opt.value;
                return (
                  <div
                    key={opt.value}
                    className={`titan-ai-provider-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setFormData((prev) => ({ ...prev, aiProviderPreference: opt.value }))}
                  >
                    <div className="titan-ai-provider-icon" style={{ color: opt.color }}>
                      {opt.icon}
                    </div>
                    <div className="titan-ai-provider-text">
                      <strong>{opt.label}</strong>
                      <p>{opt.desc}</p>
                    </div>
                    <div className={`titan-ai-radio-circle ${isSelected ? 'checked' : ''}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Anomaly Sensitivity & Timeframe */}
          <div className="titan-ai-settings-section">
            <label className="titan-ai-section-title">Risk &amp; Anomaly Thresholds</label>
            <p className="titan-ai-section-sub">Audit thresholds applied when scanning merchant drops and payment spikes</p>

            <div className="titan-ai-settings-grid">
              <div className="titan-ai-field-group">
                <label>Merchant Drop Sensitivity (%)</label>
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={formData.anomalyThresholdPct}
                  onChange={(e) => setFormData((prev) => ({ ...prev, anomalyThresholdPct: e.target.value }))}
                  className="titan-ai-text-input"
                />
                <span className="titan-ai-field-hint">Flag vendors with revenue drop exceeding this %</span>
              </div>

              <div className="titan-ai-field-group">
                <label>Default Audit Timeframe</label>
                <select
                  value={formData.defaultTimeframe}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultTimeframe: e.target.value }))}
                  className="titan-ai-text-input"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days (Default)</option>
                  <option value="90d">Last Quarter (90 Days)</option>
                </select>
                <span className="titan-ai-field-hint">Default period for platform health scans</span>
              </div>
            </div>
          </div>

          {/* Section 3: Preferences Toggles */}
          <div className="titan-ai-settings-section">
            <label className="titan-ai-section-title">Operational Preferences</label>

            <div className="titan-ai-toggle-row">
              <div>
                <strong>Voice Speech Dictation</strong>
                <p>Enable microphone dictation in the input bar</p>
              </div>
              <input
                type="checkbox"
                checked={formData.voiceInputEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, voiceInputEnabled: e.target.checked }))}
                className="titan-ai-checkbox"
              />
            </div>

            <div className="titan-ai-toggle-row">
              <div>
                <strong>Auto Quick-Prompt Chips</strong>
                <p>Display contextual audit prompts after responses</p>
              </div>
              <input
                type="checkbox"
                checked={formData.suggestedPromptsEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, suggestedPromptsEnabled: e.target.checked }))}
                className="titan-ai-checkbox"
              />
            </div>

            <div className="titan-ai-toggle-row">
              <div>
                <strong>Save Audit History</strong>
                <p>Retain audit records and chats in MongoDB</p>
              </div>
              <input
                type="checkbox"
                checked={formData.saveConversationsEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, saveConversationsEnabled: e.target.checked }))}
                className="titan-ai-checkbox"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

