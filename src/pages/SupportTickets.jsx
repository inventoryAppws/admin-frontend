import React, { useState, useEffect, useMemo } from 'react';
import {
  Headphones,
  Send,
  Search,
  ArrowUpDown,
  User,
  Store,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Package,
  X,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import EmptyState from '../components/EmptyState';
import AiWriteButton from '../components/AiWriteButton';
import { getSupportTickets, replySupportTicket } from '../services/adminService';
import { toast } from '../components/Toast';

const STATUS_FILTER = [
  { value: 'all', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending Customer Reply' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

const USER_TYPE_FILTER = [
  { value: 'all', label: 'All Sources (Customer & Vendor)' },
  { value: 'customer', label: 'Customers Only' },
  { value: 'vendor', label: 'Vendors / Merchants Only' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Tickets First' },
  { value: 'oldest', label: 'Oldest Tickets First' },
  { value: 'priority_desc', label: 'Priority: High to Low' },
  { value: 'priority_asc', label: 'Priority: Low to High' },
  { value: 'status', label: 'Status' }
];

const PRIORITY_ORDER = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

const REPLY_STATUS_OPTIONS = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending Customer Reply' },
  { value: 'resolved', label: 'Mark as Resolved' },
  { value: 'closed', label: 'Close Ticket' }
];

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Sidepanel & Reply
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('resolved');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getSupportTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load tickets: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }
    setSubmitting(true);
    try {
      const res = await replySupportTicket(selectedTicket._id, {
        text: replyText.trim(),
        status: newStatus
      });
      toast.success('Reply submitted and ticket updated');
      setReplyText('');
      setSelectedTicket(res.ticket || { ...selectedTicket, status: newStatus });
      loadData(true);
    } catch (err) {
      toast.error('Failed to send reply: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to extract sender info
  const getTicketSender = (t) => {
    const isVendor = t.userType === 'vendor' || Boolean(t.vendorId);
    const name =
      t.vendorId?.name ||
      t.vendorId?.businessName ||
      t.customerId?.name ||
      t.userName ||
      t.customerName ||
      (isVendor ? 'Vendor' : 'Customer');

    const email =
      t.vendorId?.email ||
      t.customerId?.email ||
      t.userEmail ||
      t.customerEmail ||
      '';

    const phone =
      t.vendorId?.phone ||
      t.customerId?.phone ||
      '';

    const businessName = t.vendorId?.businessName || '';

    return { isVendor, name, email, phone, businessName };
  };

  // Filter & Sort Logic
  const filteredAndSortedTickets = useMemo(() => {
    let list = [...tickets];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }

    // User Type filter
    if (userTypeFilter !== 'all') {
      list = list.filter((t) => {
        const isVendor = t.userType === 'vendor' || Boolean(t.vendorId);
        return userTypeFilter === 'vendor' ? isVendor : !isVendor;
      });
    }

    // Search filter across Ticket ID, Subject, Order ID, Customer/Vendor Name, Email, Phone
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => {
        const sender = getTicketSender(t);
        return (
          (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          (t.orderId && t.orderId.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          sender.name.toLowerCase().includes(q) ||
          sender.email.toLowerCase().includes(q) ||
          sender.phone.toLowerCase().includes(q) ||
          sender.businessName.toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'priority_desc') {
        return (PRIORITY_ORDER[b.priority?.toLowerCase()] || 2) - (PRIORITY_ORDER[a.priority?.toLowerCase()] || 2);
      }
      if (sortBy === 'priority_asc') {
        return (PRIORITY_ORDER[a.priority?.toLowerCase()] || 2) - (PRIORITY_ORDER[b.priority?.toLowerCase()] || 2);
      }
      if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });

    return list;
  }, [tickets, statusFilter, userTypeFilter, searchQuery, sortBy]);

  // Priority styling helper
  const getPriorityBadge = (priority) => {
    const p = String(priority || 'normal').toLowerCase();
    if (p === 'urgent') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'URGENT' };
    if (p === 'high') return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'HIGH' };
    if (p === 'medium') return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'MEDIUM' };
    return { bg: 'rgba(107, 114, 128, 0.15)', color: '#6b7280', label: 'LOW' };
  };

  // Status styling helper
  const getStatusBadge = (status) => {
    const s = String(status || 'open').toLowerCase();
    if (s === 'resolved') return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', label: 'RESOLVED' };
    if (s === 'closed') return { bg: 'rgba(107, 114, 128, 0.12)', color: '#6b7280', label: 'CLOSED' };
    if (s === 'in_progress') return { bg: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b', label: 'IN PROGRESS' };
    if (s === 'pending') return { bg: 'rgba(139, 92, 246, 0.14)', color: '#8b5cf6', label: 'PENDING' };
    return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', label: 'OPEN' };
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customer &amp; Vendor Support Helpdesk</h1>
          <p className="admin-page-subtitle">
            Manage, search, sort, and resolve dispute inquiries, order grievances, vendor settlement queries, and customer care tickets
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
          >
            <RefreshCw size={14} className={refreshing ? 'admin-mini-spinner' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Edge-to-Edge Search & Filter Toolbar */}
      <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
        {/* Search Bar */}
        <div className="admin-search-wrap" style={{ flex: '1 1 260px' }}>
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by ticket ID, subject, customer, vendor, email, or order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--admin-text-sub)'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* User Type Filter: Customer / Vendor */}
        <div className="admin-filter-select-wrap" style={{ minWidth: '220px' }}>
          <CustomSelect
            options={USER_TYPE_FILTER}
            value={userTypeFilter}
            onChange={(val) => setUserTypeFilter(val)}
            placeholder="Filter by Source"
          />
        </div>

        {/* Status Filter */}
        <div className="admin-filter-select-wrap" style={{ minWidth: '170px' }}>
          <CustomSelect
            options={STATUS_FILTER}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            placeholder="Filter by Status"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="admin-filter-select-wrap" style={{ minWidth: '190px' }}>
          <CustomSelect
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            placeholder="Sort by"
          />
        </div>
      </div>

      {/* Ticket List Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <span>
          Showing <strong>{filteredAndSortedTickets.length}</strong> of <strong>{tickets.length}</strong> total tickets
        </span>
        {(searchQuery || statusFilter !== 'all' || userTypeFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setUserTypeFilter('all');
              setSortBy('newest');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color, #3b82f6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Tickets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div className="admin-mini-spinner" style={{ margin: '0 auto 12px auto', width: '28px', height: '28px' }} />
            Loading support tickets...
          </div>
        ) : filteredAndSortedTickets.length === 0 ? (
          <EmptyState
            icon={Headphones}
            title="No Support Tickets Found"
            message="No active support tickets match your search keywords or filter criteria."
          />
        ) : (
          filteredAndSortedTickets.map((t) => {
            const isResolved = t.status === 'resolved' || t.status === 'closed';
            const sender = getTicketSender(t);
            const priorityBadge = getPriorityBadge(t.priority);
            const statusBadge = getStatusBadge(t.status);

            return (
              <div
                key={t._id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: 'var(--card-shadow)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  gap: '16px'
                }}
                className="admin-ticket-row"
                onClick={() => setSelectedTicket(t)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: sender.isVendor ? 'rgba(139, 92, 246, 0.12)' : isResolved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      color: sender.isVendor ? '#8b5cf6' : isResolved ? '#10b981' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {sender.isVendor ? <Store size={22} /> : <Headphones size={22} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {t.subject || 'Support Request'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        #{t.ticketId || String(t._id).slice(-6).toUpperCase()}
                      </span>
                      {t.orderId && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 600
                          }}
                        >
                          Order #{t.orderId}
                        </span>
                      )}
                    </div>

                    {/* Sender Details: Customer or Vendor Information */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
                      {/* Sender pill */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          background: sender.isVendor ? 'rgba(139, 92, 246, 0.12)' : 'rgba(14, 165, 233, 0.12)',
                          color: sender.isVendor ? '#8b5cf6' : '#0284c7'
                        }}
                      >
                        {sender.isVendor ? <Store size={12} /> : <User size={12} />}
                        {sender.isVendor ? 'Vendor / Merchant' : 'Customer'}
                      </span>

                      <span>
                        <strong>{sender.name}</strong>
                        {sender.businessName && sender.businessName !== sender.name && ` (${sender.businessName})`}
                      </span>

                      {sender.email && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Mail size={12} /> {sender.email}
                        </span>
                      )}

                      {sender.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Phone size={12} /> {sender.phone}
                        </span>
                      )}

                      <span>•</span>

                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: priorityBadge.color
                          }}
                        />
                        Priority: <strong style={{ color: priorityBadge.color }}>{priorityBadge.label}</strong>
                      </span>

                      <span>•</span>

                      <span>
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right badges & action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: statusBadge.bg,
                      color: statusBadge.color,
                      border: `1px solid ${statusBadge.color}33`
                    }}
                  >
                    {statusBadge.label}
                  </span>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                  >
                    Respond
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply / Chat Thread Sidepanel Drawer */}
      <SidepanelDrawer
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title={selectedTicket?.subject || 'Ticket Conversation'}
        subtitle={`Ticket #${selectedTicket?.ticketId || String(selectedTicket?._id || '').slice(-6).toUpperCase()}`}
        width="580px"
      >
        {selectedTicket && (() => {
          const sender = getTicketSender(selectedTicket);
          const priorityBadge = getPriorityBadge(selectedTicket.priority);
          const statusBadge = getStatusBadge(selectedTicket.status);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              {/* Comprehensive Contact & Ticket Info Card */}
              <div
                style={{
                  background: 'var(--bg-card-subtle)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        background: sender.isVendor ? 'rgba(139, 92, 246, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                        color: sender.isVendor ? '#8b5cf6' : '#0284c7'
                      }}
                    >
                      {sender.isVendor ? <Store size={12} /> : <User size={12} />}
                      {sender.isVendor ? 'Vendor / Merchant Profile' : 'Customer Profile'}
                    </span>
                  </div>

                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: statusBadge.bg,
                      color: statusBadge.color
                    }}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '4px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                      {sender.isVendor ? 'Vendor / Business Name' : 'Customer Name'}
                    </span>
                    <strong>{sender.name}</strong>
                    {sender.businessName && sender.businessName !== sender.name && ` (${sender.businessName})`}
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Email Address</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} color="var(--text-muted)" />
                      {sender.email || 'N/A'}
                    </span>
                  </div>

                  {sender.phone && (
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Phone Number</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} color="var(--text-muted)" />
                        {sender.phone}
                      </span>
                    </div>
                  )}

                  {selectedTicket.orderId && (
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Order Reference</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary-color, #3b82f6)' }}>
                        #{selectedTicket.orderId}
                      </span>
                    </div>
                  )}

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Priority</span>
                    <strong style={{ color: priorityBadge.color }}>{priorityBadge.label}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Submitted On</span>
                    <span>
                      {selectedTicket.createdAt
                        ? new Date(selectedTicket.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversation History */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  paddingRight: '4px'
                }}
              >
                {(selectedTicket.messages || []).length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', padding: '20px' }}>
                    {selectedTicket.initialMessage || 'Customer reported an issue regarding their account or order.'}
                  </div>
                ) : (
                  selectedTicket.messages.map((m, idx) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                          maxWidth: '85%',
                          background: isAdmin ? 'var(--primary-color, #3b82f6)' : 'var(--bg-card-subtle)',
                          color: isAdmin ? '#ffffff' : 'var(--text-primary)',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          borderBottomRightRadius: isAdmin ? '2px' : '12px',
                          borderBottomLeftRadius: isAdmin ? '12px' : '2px',
                          border: isAdmin ? 'none' : '1px solid var(--border-color)',
                          fontSize: '0.84rem'
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '4px', fontWeight: 600 }}>
                          {m.senderName || (isAdmin ? 'Admin Support Desk' : sender.name)}
                        </div>
                        <div style={{ lineHeight: 1.45 }}>{m.text}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Response Composer Form */}
              <form
                onSubmit={handleReply}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Status after reply:</span>
                  <div style={{ flex: 1 }}>
                    <CustomSelect
                      options={REPLY_STATUS_OPTIONS}
                      value={newStatus}
                      onChange={(val) => setNewStatus(val)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)' }}>Official Reply:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <AiWriteButton
                      task="support_reply"
                      input={replyText}
                      context={{
                        customerName: sender.name,
                        subject: selectedTicket.subject,
                        status: newStatus,
                        history: (selectedTicket.messages || []).slice(-3).map(m => `${m.senderName}: ${m.text}`).join(' | ')
                      }}
                      onGenerated={(res) => {
                        if (res?.message) setReplyText(res.message);
                        else if (res?.result) setReplyText(res.result);
                        else if (res?.text) setReplyText(res.text);
                      }}
                      label="✨ AI Support Reply"
                      size="small"
                      title="Generate official support response using Ollama / Groq"
                    />
                    {replyText.trim() && (
                      <AiWriteButton
                        task="refine_text"
                        input={replyText}
                        context={{ tone: 'professional, empathetic administrative support response' }}
                        onGenerated={(res) => {
                          if (res?.result) setReplyText(res.result);
                          else if (res?.text) setReplyText(res.text);
                        }}
                        label="✨ Polish"
                        size="small"
                        title="Polish grammar and tone"
                      />
                    )}
                  </div>
                </div>

                <textarea
                  className="admin-form-textarea"
                  rows={3}
                  placeholder={`Type your official administrative support response to ${sender.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  style={{ alignSelf: 'flex-end' }}
                  disabled={submitting}
                >
                  <Send size={15} /> {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </div>
          );
        })()}
      </SidepanelDrawer>
    </div>
  );
}
