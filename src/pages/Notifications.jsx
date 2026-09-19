import React, { useState } from 'react';
import { Bell, Send, Users, Store, Globe, AlertTriangle, Info, Tag } from 'lucide-react';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import AiWriteButton from '../components/AiWriteButton';
import { getNotifications, broadcastNotification } from '../services/adminService';
import { toast } from '../components/Toast';

const TARGET_OPTIONS = [
  { value: 'all', label: 'All Users (Customers & Vendors)' },
  { value: 'customers', label: 'Customers Only' },
  { value: 'vendors', label: 'Vendors Only' }
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Notification Types' },
  { value: 'info', label: 'General Information' },
  { value: 'promotion', label: 'Promotional Announcement' },
  { value: 'alert', label: 'System Alert / Notice' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title (A-Z)' }
];

export default function Notifications() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [refreshKey, setRefreshKey] = useState(0);

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [type, setType] = useState('info');

  const columns = [
    {
      header: 'Notification Title & Message',
      render: (n) => (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: n.type === 'alert' ? 'rgba(239, 68, 68, 0.12)' : n.type === 'promotion' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(59, 130, 246, 0.12)',
            color: n.type === 'alert' ? '#ef4444' : n.type === 'promotion' ? 'var(--primary-color)' : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '2px'
          }}>
            {n.type === 'alert' ? <AlertTriangle size={16} /> : n.type === 'promotion' ? <Tag size={16} /> : <Info size={16} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{n.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '400px' }}>{n.message}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Recipient Target',
      render: (n) => (
        <span style={{
          textTransform: 'uppercase',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)'
        }}>
          {n.userType || 'Customer'}
        </span>
      )
    },
    {
      header: 'Category',
      render: (n) => (
        <span style={{
          textTransform: 'capitalize',
          fontSize: '0.76rem',
          fontWeight: 600,
          color: 'var(--primary-color)'
        }}>
          {n.type || 'info'}
        </span>
      )
    },
    {
      header: 'Dispatched At',
      render: (n) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    }
  ];

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Title and message are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await broadcastNotification({ title, message, target, type });
      toast.success(res.msg || 'Notification broadcast dispatched successfully!');
      setDrawerOpen(false);
      setTitle('');
      setMessage('');
      setTarget('all');
      setType('info');
      setRefreshKey(k => k + 1);
    } catch (err) {
      toast.error('Failed to broadcast notification: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Notification Broadcast Center</h1>
          <p className="admin-page-subtitle">Send targeted platform announcements, policy updates, and marketing alerts to customers and vendors</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setDrawerOpen(true)}
        >
          <Send size={16} /> Broadcast Notification
        </button>
      </div>

      <InfiniteDataTable
        key={refreshKey}
        fetchData={getNotifications}
        extraParams={{
          type: typeFilter !== 'all' ? typeFilter : undefined,
          target: targetFilter !== 'all' ? targetFilter : undefined,
          sortBy
        }}
        columns={columns}
        searchPlaceholder="Filter broadcast log..."
        keyField="_id"
        headerToolbar={
          <>
            <div style={{ minWidth: '180px' }}>
              <CustomSelect
                options={[{ value: 'all', label: 'All Recipients' }, ...TARGET_OPTIONS.slice(1)]}
                value={targetFilter}
                onChange={(val) => setTargetFilter(val)}
                placeholder="Target Audience"
              />
            </div>
            <div style={{ minWidth: '180px' }}>
              <CustomSelect
                options={TYPE_OPTIONS}
                value={typeFilter}
                onChange={(val) => setTypeFilter(val)}
                placeholder="All Types"
              />
            </div>
            <div style={{ minWidth: '160px' }}>
              <CustomSelect
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                placeholder="Sort By"
              />
            </div>
          </>
        }
      />

      {/* Broadcast Drawer */}
      <SidepanelDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Broadcast System Notification"
        subtitle="Push messages directly to app notification feeds"
      >
        <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="admin-form-label">Audience Target</label>
            <CustomSelect
              options={TARGET_OPTIONS}
              value={target}
              onChange={(val) => setTarget(val)}
            />
          </div>

          <div>
            <label className="admin-form-label">Notification Type</label>
            <CustomSelect
              options={TYPE_OPTIONS}
              value={type}
              onChange={(val) => setType(val)}
            />
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.06) 0%, rgba(99, 102, 241, 0.08) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.18)',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#6d28d9' }}>✨ AI Announcement Drafter</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Generate headline & message with Ollama/Groq AI</div>
            </div>
            <AiWriteButton
              task="broadcast_announcement"
              input={title || message || `${type} notification for ${target}`}
              context={{ audience: target === 'all' ? 'All Customers and Vendors' : target === 'vendors' ? 'Vendors' : 'Customers', type }}
              onGenerated={(res) => {
                if (res?.title) setTitle(res.title);
                if (res?.message) setMessage(res.message);
              }}
              label="Draft with AI"
              size="small"
            />
          </div>

          <div>
            <label className="admin-form-label">Headline Title</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="e.g. Platform Scheduled Maintenance Notice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="admin-form-label" style={{ margin: 0 }}>Message Content</label>
              <AiWriteButton
                task="refine_text"
                input={message}
                context={{ tone: 'professional platform announcement' }}
                onGenerated={(res) => {
                  if (res?.result) setMessage(res.result);
                  else if (res?.text) setMessage(res.text);
                }}
                label="✨ Polish Message"
                size="small"
              />
            </div>
            <textarea
              className="admin-form-textarea"
              rows={4}
              placeholder="Enter message details that will appear in user notification inbox..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              {submitting ? 'Broadcasting...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </SidepanelDrawer>
    </div>
  );
}

