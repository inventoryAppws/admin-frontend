import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Wrench,
  RotateCcw,
  RefreshCw,
  Phone,
  User,
  MapPin,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import { getAdminWarrantyClaims, updateWarrantyClaimStatus } from '../services/adminService';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { toast } from '../components/Toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Claim Statuses' },
  { value: 'submitted', label: 'Submitted (Awaiting Review)' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'in_inspection', label: 'In Diagnostic Inspection' },
  { value: 'approved', label: 'Approved (Free Repair/Replacement)' },
  { value: 'resolved', label: 'Resolved & Dispatched' },
  { value: 'rejected', label: 'Rejected' }
];

const SERVICE_OPTIONS = [
  { value: 'all', label: 'All Resolution Types' },
  { value: 'repair', label: 'Free Repair' },
  { value: 'replacement', label: 'Unit Replacement' },
  { value: 'exchange', label: 'Exchange / Credit' }
];

export default function WarrantyClaims() {
  const [claims, setClaims] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    submitted: 0,
    pickup_scheduled: 0,
    in_inspection: 0,
    approved: 0,
    resolved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');

  // Selected claim for Inspection Drawer
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states in drawer
  const [adminInspectionNotes, setAdminInspectionNotes] = useState('');
  const [adminTechnicianName, setAdminTechnicianName] = useState('');
  const [adminTechnicianPhone, setAdminTechnicianPhone] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminWarrantyClaims({
        q: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        serviceType: serviceFilter !== 'all' ? serviceFilter : undefined
      });
      setClaims(data.claims || []);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load admin warranty claims:', err);
      toast.error('Failed to fetch warranty claims');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, serviceFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleOpenInspect = (claim) => {
    setSelectedClaim(claim);
    setAdminInspectionNotes(claim.inspectionNotes || '');
    setAdminTechnicianName(claim.technicianName || '');
    setAdminTechnicianPhone(claim.technicianPhone || '');
    setRejectionReason('');
    setShowRejectForm(false);
    setDrawerOpen(true);
  };

  const handleStatusUpdate = async (newStatus, extraData = {}) => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      const payload = {
        status: newStatus,
        inspectionNotes: adminInspectionNotes,
        technicianName: adminTechnicianName,
        technicianPhone: adminTechnicianPhone,
        resolutionType: selectedClaim.serviceType,
        ...extraData
      };

      const updated = await updateWarrantyClaimStatus(selectedClaim.claimId || selectedClaim._id, payload);
      setSelectedClaim(updated);
      toast.success(`Claim ${updated.claimId} updated to ${newStatus.replace('_', ' ').toUpperCase()}!`);
      fetchClaims();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update warranty claim');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Warranty &amp; RMA Claims Management</h1>
          <p className="admin-page-subtitle">
            Central platform console to inspect, adjudicate, assign technicians, and approve manufacturer warranty claims.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={fetchClaims}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Claims</span>
        </button>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Total Claims Raised</span>
            <div className="admin-kpi-icon-bubble blue">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">{summary.total || claims.length}</div>
          <span style={{ fontSize: '11.5px', color: 'var(--admin-text-sub)' }}>All warranty submissions</span>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Awaiting Pickup</span>
            <div className="admin-kpi-icon-bubble amber">
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">{summary.submitted || 0}</div>
          <span style={{ fontSize: '11.5px', color: 'var(--admin-warning)' }}>Pending doorstep pickup</span>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">In Diagnostic Lab</span>
            <div className="admin-kpi-icon-bubble purple">
              <Wrench size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">{summary.in_inspection || 0}</div>
          <span style={{ fontSize: '11.5px', color: 'var(--admin-purple)' }}>Under technical diagnosis</span>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <span className="admin-kpi-label">Approved Replacements</span>
            <div className="admin-kpi-icon-bubble green">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="admin-kpi-val">{summary.approved || 0}</div>
          <span style={{ fontSize: '11.5px', color: 'var(--admin-success)' }}>Approved for resolution</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search Claim ID, Product Name, Serial No, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-select-wrap" style={{ minWidth: '230px' }}>
          <CustomSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>

        <div className="admin-filter-select-wrap" style={{ minWidth: '200px' }}>
          <CustomSelect
            options={SERVICE_OPTIONS}
            value={serviceFilter}
            onChange={setServiceFilter}
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 10px', display: 'block', color: '#2563eb' }} />
            <span>Loading warranty claims queue...</span>
          </div>
        ) : claims.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <ShieldCheck size={44} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
            <h3 style={{ margin: '0 0 6px', color: 'var(--admin-text-main)', fontSize: '16px' }}>No Warranty Claims Found</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--admin-text-sub)' }}>There are currently no claims matching your filter criteria.</p>
          </div>
        ) : (
          <div className="admin-table-scroll-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Product &amp; Serial</th>
                  <th>Customer Info</th>
                  <th>Issue Category</th>
                  <th>Pickup Slot</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Adjudicate</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => {
                  const s = c.status || 'submitted';
                  return (
                    <tr key={c._id || c.claimId}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: '#2563eb' }}>{c.claimId}</strong>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{formatDate(c.createdAt)}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={c.productImage || (c.productId && c.productId.image) || 'https://via.placeholder.com/40'}
                            alt=""
                            style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                          />
                          <div>
                            <strong style={{ display: 'block', fontSize: '13px', color: '#0f172a' }}>{c.productName}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>SN: {c.serialNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                          {c.customerName || (c.customerId && c.customerId.name) || 'Customer'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {c.customerPhone || (c.customerId && c.customerId.phone) || '+91 98765 43210'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#334155' }}>
                          {c.issueCategory || 'Hardware Defect'}
                        </span>
                        <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#2563eb', marginTop: '2px', textTransform: 'uppercase' }}>
                          {c.serviceType || 'repair'}
                        </div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {c.pickupSlot || 'Tomorrow 10 AM'}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            background: s === 'approved' ? '#ecfdf5' : s === 'in_inspection' ? '#faf5ff' : s === 'pickup_scheduled' ? '#fffbeb' : s === 'rejected' ? '#fef2f2' : '#eff6ff',
                            color: s === 'approved' ? '#059669' : s === 'in_inspection' ? '#7c3aed' : s === 'pickup_scheduled' ? '#d97706' : s === 'rejected' ? '#dc2626' : '#2563eb'
                          }}
                        >
                          ● {s.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleOpenInspect(c)}
                        >
                          <Eye size={13} />
                          <span>Inspect Claim</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection Drawer */}
      {selectedClaim && (
        <SidepanelDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={`Claim Inspection: ${selectedClaim.claimId}`}
          subtitle={`Product: ${selectedClaim.productName}`}
          icon={ShieldCheck}
          maxWidth="620px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Status & Service Banner */}
            <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--admin-text-sub)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Status</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--admin-text-main)', textTransform: 'capitalize' }}>
                  {selectedClaim.status?.replace('_', ' ')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--admin-text-sub)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Requested Action</span>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--admin-primary)', textTransform: 'uppercase' }}>
                  {selectedClaim.serviceType}
                </div>
              </div>
            </div>

            {/* Customer Defect Report */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-text-main)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} color="#6366f1" /> Reported Defect &amp; Symptoms
              </h4>
              <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: 'var(--admin-text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {selectedClaim.issueDescription || 'No description provided.'}
              </div>
            </div>

            {/* Customer & Doorstep Info */}
            <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>Customer Name</span>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--admin-text-main)' }}>{selectedClaim.customerName || 'Customer'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>Customer Phone</span>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--admin-text-main)' }}>{selectedClaim.customerPhone || '+91 98765 43210'}</div>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--admin-text-sub)', textTransform: 'uppercase' }}>Pickup Address</span>
                <div style={{ fontSize: '13px', color: 'var(--admin-text-main)', marginTop: '2px' }}>{selectedClaim.pickupAddress || 'Customer registered address'}</div>
              </div>
            </div>

            {/* Technician & Pickup Assignment */}
            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '18px 20px', boxShadow: 'var(--admin-shadow)' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--admin-text-main)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} color="#d97706" /> Technician Pickup Dispatch
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ marginBottom: '6px' }}>Technician Name</label>
                  <div className="admin-input-wrap has-icon">
                    <User size={15} className="admin-input-icon" />
                    <input
                      type="text"
                      className="admin-form-input"
                      value={adminTechnicianName}
                      onChange={(e) => setAdminTechnicianName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ marginBottom: '6px' }}>Technician Phone</label>
                  <div className="admin-input-wrap has-icon">
                    <Phone size={15} className="admin-input-icon" />
                    <input
                      type="text"
                      className="admin-form-input"
                      value={adminTechnicianPhone}
                      onChange={(e) => setAdminTechnicianPhone(e.target.value)}
                      placeholder="e.g. +91 98234 11223"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={actionLoading}
                onClick={() => handleStatusUpdate('pickup_scheduled')}
              >
                <Truck size={14} />
                <span>Confirm Technician &amp; Schedule Pickup</span>
              </button>
            </div>

            {/* Diagnostic Inspection Findings */}
            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '18px 20px', boxShadow: 'var(--admin-shadow)' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--admin-text-main)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={16} color="#7c3aed" /> Laboratory Diagnostic Test Findings
              </h4>
              <div className="admin-form-group" style={{ marginBottom: '14px' }}>
                <textarea
                  rows={3}
                  className="admin-form-textarea"
                  value={adminInspectionNotes}
                  onChange={(e) => setAdminInspectionNotes(e.target.value)}
                  placeholder="Enter diagnostic report notes (e.g. Solder micro-fracture confirmed on GPU; display matrix requires replacement; no liquid damage found)..."
                />
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={actionLoading || !adminInspectionNotes.trim()}
                onClick={() => handleStatusUpdate('in_inspection')}
              >
                <Wrench size={14} />
                <span>Save Diagnostics &amp; Set In-Inspection</span>
              </button>
            </div>

            {/* Adjudication Decisions */}
            <div style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '12px', padding: '18px 20px', boxShadow: 'var(--admin-shadow)' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--admin-text-main)', margin: '0 0 12px' }}>
                Platform Adjudication Decision
              </h4>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  style={{ background: '#059669', borderColor: '#059669' }}
                  disabled={actionLoading}
                  onClick={() => handleStatusUpdate('approved', {
                    resolutionNotes: 'Platform administration approved free manufacturer warranty resolution.'
                  })}
                >
                  <Check size={14} />
                  <span>Approve Free {selectedClaim.serviceType?.toUpperCase()}</span>
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn-primary"
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                  disabled={actionLoading}
                  onClick={() => handleStatusUpdate('resolved', {
                    resolutionNotes: 'Replacement unit tested and delivered successfully.'
                  })}
                >
                  <Truck size={14} />
                  <span>Mark Resolved &amp; Completed</span>
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  disabled={actionLoading}
                  onClick={() => setShowRejectForm(!showRejectForm)}
                >
                  <XCircle size={14} />
                  <span>Reject Claim</span>
                </button>
              </div>

              {showRejectForm && (
                <div style={{ marginTop: '14px', padding: '14px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px' }}>
                  <label className="admin-form-label" style={{ color: 'var(--admin-danger)', marginBottom: '8px' }}>
                    Rejection Reason (Sent to Customer) <span className="req-star">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className="admin-form-textarea"
                    style={{ marginBottom: '12px' }}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Device exhibits physical shock or liquid ingress not covered by manufacturer warranty."
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      disabled={actionLoading || !rejectionReason.trim()}
                      onClick={() => handleStatusUpdate('rejected', { resolutionNotes: rejectionReason })}
                    >
                      Confirm Rejection
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => setShowRejectForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chronological Audit Log Timeline */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--admin-text-main)', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="var(--admin-text-sub)" /> Claim Audit Log Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(selectedClaim.timeline || []).map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'var(--admin-surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--admin-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10.5px', fontWeight: 800, flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <strong style={{ fontSize: '12.5px', color: 'var(--admin-text-main)', textTransform: 'capitalize' }}>{t.status?.replace('_', ' ')}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--admin-text-sub)' }}>{formatDate(t.timestamp)}</span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--admin-text-sub)' }}>{t.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SidepanelDrawer>
      )}
    </div>
  );
}

