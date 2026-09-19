import React, { useState, useEffect } from 'react';
import { Settings, Save, Store, Mail, Phone, DollarSign, Clock, Shield, Percent, Truck, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import { getStoreSettings, updateStoreSettings } from '../services/adminService';
import { toast } from '../components/Toast';

export default function StoreSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State
  const [storeName, setStoreName] = useState('MarketHub Global');
  const [supportEmail, setSupportEmail] = useState('support@markethub.com');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [currency, setCurrency] = useState('INR');
  const [commissionRate, setCommissionRate] = useState('5.0');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('500');
  const [returnWindowDays, setReturnWindowDays] = useState('7');
  const [taxPercentage, setTaxPercentage] = useState('18');

  useEffect(() => {
    (async () => {
      try {
        const s = await getStoreSettings();
        if (s) {
          if (s.storeName) setStoreName(s.storeName);
          if (s.supportEmail) setSupportEmail(s.supportEmail);
          if (s.supportPhone) setSupportPhone(s.supportPhone);
          if (s.currency) setCurrency(s.currency);
          if (s.commissionRate != null) setCommissionRate(String(s.commissionRate));
          if (s.freeShippingThreshold != null) setFreeShippingThreshold(String(s.freeShippingThreshold));
          if (s.returnWindowDays != null) setReturnWindowDays(String(s.returnWindowDays));
          if (s.taxPercentage != null) setTaxPercentage(String(s.taxPercentage));
        }
      } catch (err) {
        toast.error('Failed to load store settings: ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateStoreSettings({
        storeName,
        supportEmail,
        supportPhone,
        currency,
        commissionRate: Number(commissionRate),
        freeShippingThreshold: Number(freeShippingThreshold),
        returnWindowDays: Number(returnWindowDays),
        taxPercentage: Number(taxPercentage)
      });
      toast.success('Store platform configuration successfully updated!');
    } catch (err) {
      toast.error('Failed to save settings: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-text-sub)' }}>
          Loading platform configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Store & Marketplace Configuration</h1>
          <p className="admin-page-subtitle">
            Configure global business rules, commission structures, tax rates, and customer support contacts
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Card 1: Marketplace Identity & Support */}
        <div className="admin-settings-card">
          <div className="admin-settings-header">
            <div className="admin-settings-header-left">
              <div className="admin-settings-icon-box" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                <Store size={22} />
              </div>
              <div>
                <h3 className="admin-settings-title">Marketplace Identity & Support</h3>
                <p className="admin-settings-desc">Platform branding and customer support contact details</p>
              </div>
            </div>
            <span className="admin-badge primary">Identity</span>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Platform Storefront Name <span className="req-star">*</span>
              </label>
              <div className="admin-input-wrap has-icon">
                <span className="admin-input-icon">
                  <Store size={16} />
                </span>
                <input
                  type="text"
                  className="admin-form-input"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. MarketHub Global"
                  required
                />
              </div>
              <span className="admin-form-hint">Displayed on customer invoices, emails, and platform header</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Primary Currency</label>
              <div className="admin-input-wrap has-suffix">
                <input
                  type="text"
                  className="admin-form-input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled
                />
                <span className="admin-input-suffix">₹ INR</span>
              </div>
              <span className="admin-form-hint">Default currency for catalog pricing & vendor settlements</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                Customer Support Email <span className="req-star">*</span>
              </label>
              <div className="admin-input-wrap has-icon">
                <span className="admin-input-icon">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="admin-form-input"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@markethub.com"
                  required
                />
              </div>
              <span className="admin-form-hint">Receives ticket escalations and customer support queries</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Support Helpline Phone</label>
              <div className="admin-input-wrap has-icon">
                <span className="admin-input-icon">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  className="admin-form-input"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <span className="admin-form-hint">Official contact line shown on invoices and help center</span>
            </div>
          </div>
        </div>

        {/* Card 2: Monetization & Fulfillment Policies */}
        <div className="admin-settings-card">
          <div className="admin-settings-header">
            <div className="admin-settings-header-left">
              <div className="admin-settings-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <DollarSign size={22} />
              </div>
              <div>
                <h3 className="admin-settings-title">Monetization & Fulfillment Policies</h3>
                <p className="admin-settings-desc">Commission structure, delivery rules, and compliance tax parameters</p>
              </div>
            </div>
            <span className="admin-badge success">Business Rules</span>
          </div>

          <div className="admin-form-grid-2">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Default Vendor Commission Rate <span className="req-star">*</span>
              </label>
              <div className="admin-input-wrap has-suffix">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  className="admin-form-input"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  required
                />
                <span className="admin-input-suffix">%</span>
              </div>
              <span className="admin-form-hint">Marketplace commission deducted from vendor payout settlements</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Free Delivery Minimum Threshold</label>
              <div className="admin-input-wrap has-suffix">
                <input
                  type="number"
                  min="0"
                  step="10"
                  className="admin-form-input"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                />
                <span className="admin-input-suffix">₹</span>
              </div>
              <span className="admin-form-hint">Customer orders equal to or above this amount qualify for zero shipping fee</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Return & Replacement Window</label>
              <div className="admin-input-wrap has-suffix">
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="admin-form-input"
                  value={returnWindowDays}
                  onChange={(e) => setReturnWindowDays(e.target.value)}
                />
                <span className="admin-input-suffix">Days</span>
              </div>
              <span className="admin-form-hint">Number of days after delivery customers can submit return claims</span>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">GST Tax Percentage</label>
              <div className="admin-input-wrap has-suffix">
                <input
                  type="number"
                  min="0"
                  max="28"
                  className="admin-form-input"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(e.target.value)}
                />
                <span className="admin-input-suffix">%</span>
              </div>
              <span className="admin-form-hint">Standard GST rate factored into platform invoices and reports</span>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.94rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            disabled={saving}
          >
            <Save size={18} />
            <span>{saving ? 'Saving Platform Rules...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
