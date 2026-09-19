import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Layers,
  ShoppingBag,
  Truck,
  Boxes,
  History,
  RotateCcw,
  DollarSign,
  CreditCard,
  Wallet,
  FileText,
  Tag,
  Percent,
  Star,
  Image,
  Bell,
  Headphones,
  TrendingUp,
  UserCheck,
  Award,
  BarChart3,
  Download,
  Search,
  ShieldAlert,
  Key,
  FileCheck,
  Settings,
  Lock,
  Activity,
  Warehouse,
  ArrowRightLeft,
  Server,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ChevronRight,
  Send,
  Mail,
  Calendar,
  Sparkles,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { toast } from './Toast';
import { triggerMonthlyVendorEmails, triggerMonthlyAdminEmail, triggerScheduledEmails } from '../services/adminService';
import GlobalSearchModal from './GlobalSearchModal';
import AdminAiDrawer from './AdminAiDrawer';
import AdminAiFab from './AdminAiFab';

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/system-health', label: 'System Health', icon: Server, badge: 'Live' },
      { to: '/activity', label: 'Activity Feed', icon: Activity }
    ]
  },
  {
    title: 'Commerce & Catalog',
    items: [
      { to: '/orders', label: 'Order Management', icon: ShoppingBag },
      { to: '/order-tracking', label: 'Order Tracking', icon: Truck },
      { to: '/invoices', label: 'Invoice Archive', icon: FileText },
      { to: '/customers', label: 'Customers', icon: Users },
      { to: '/vendors', label: 'Vendors', icon: Store },
      { to: '/products', label: 'Products', icon: Package },
      { to: '/categories', label: 'Categories', icon: Layers }
    ]
  },
  {
    title: 'Inventory & Warehouses',
    items: [
      { to: '/inventory', label: 'Inventory Stock', icon: Boxes },
      { to: '/stock-history', label: 'Stock Movement', icon: History },
      { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
      { to: '/transfers', label: 'Inventory Transfers', icon: ArrowRightLeft }
    ]
  },
  {
    title: 'Financials & Post-Purchase',
    items: [
      { to: '/transactions', label: 'Payments & Txns', icon: CreditCard },
      { to: '/wallets', label: 'Customer Wallets', icon: Wallet },
      { to: '/returns', label: 'Returns Queue', icon: RotateCcw },
      { to: '/refunds', label: 'Refund Management', icon: DollarSign },
      { to: '/warranty-claims', label: 'Warranty Claims', icon: ShieldCheck }
    ]
  },
  {
    title: 'Marketing & Support',
    items: [
      { to: '/coupons', label: 'Coupon Codes', icon: Tag },
      { to: '/promotions', label: 'Campaigns & Sales', icon: Percent },
      { to: '/banners', label: 'Homepage Banners', icon: Image },
      { to: '/reviews', label: 'Reviews Moderation', icon: Star },
      { to: '/support-tickets', label: 'Support Desk', icon: Headphones },
      { to: '/notifications', label: 'Notification Center', icon: Bell }
    ]
  },
  {
    title: 'Analytics & Intelligence',
    items: [
      { to: '/analytics/sales', label: 'Sales Analytics', icon: TrendingUp },
      { to: '/analytics/customers', label: 'Customer Analytics', icon: UserCheck },
      { to: '/analytics/vendors', label: 'Vendor Analytics', icon: Award },
      { to: '/analytics/inventory', label: 'Inventory Analytics', icon: BarChart3 },
      { to: '/reports', label: 'Reports & Exports', icon: Download }
    ]
  },
  {
    title: 'Governance & Security',
    items: [
      { to: '/admin-users', label: 'Admin Users & Roles', icon: ShieldAlert },
      { to: '/permissions', label: 'Permissions Matrix', icon: Key },
      { to: '/audit-logs', label: 'Audit Logs', icon: FileCheck },
      { to: '/settings', label: 'Store Settings', icon: Settings },
      { to: '/security', label: 'Passwords & Security', icon: Lock }
    ]
  }
];

export default function AdminLayout({ children }) {
  const { isDark, toggleTheme } = useTheme();
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailMenuOpen, setEmailMenuOpen] = useState(false);

  // Titan Platform Intelligence AI Drawer
  const [titanAiOpen, setTitanAiOpen] = useState(false);
  const [titanAiInitialQuery, setTitanAiInitialQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || '{"name":"Administrator","email":""}');
    } catch {
      return { name: "Administrator", email: "" };
    }
  });

  useEffect(() => {
    const handleAdminUserUpdate = () => {
      try {
        setAdminUser(JSON.parse(localStorage.getItem('admin_user') || '{"name":"Administrator","email":""}'));
      } catch {}
    };
    window.addEventListener('admin_user_updated', handleAdminUserUpdate);
    return () => window.removeEventListener('admin_user_updated', handleAdminUserUpdate);
  }, []);

  useEffect(() => {
    const handleOpenSearch = () => setSearchModalOpen(true);
    window.addEventListener('open-global-search', handleOpenSearch);
    return () => window.removeEventListener('open-global-search', handleOpenSearch);
  }, []);

  useEffect(() => {
    const handleOpenAi = (e) => {
      setTitanAiInitialQuery(e.detail?.query || '');
      setTitanAiOpen(true);
    };
    window.addEventListener('open-admin-ai', handleOpenAi);
    return () => window.removeEventListener('open-admin-ai', handleOpenAi);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast.success('You have been logged out safely.');
    navigate('/login');
  };

  const toggleGroup = (title) => {
    setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleTriggerScheduled = async (type) => {
    setSendingEmails(true);
    setEmailMenuOpen(false);
    const safetyTimer = setTimeout(() => {
      setSendingEmails(false);
    }, 12000);

    try {
      const res = await triggerScheduledEmails(type);
      clearTimeout(safetyTimer);
      const labels = {
        monthly: 'Monthly statements & digests for Customers, Vendors & Admin',
        six_month: '6-Month Mid-Year Platform & Loyalty Reviews',
        annual: '1-Year Annual Platform & Growth Celebration Reviews',
        daily_vendor: 'Daily Vendor EOD Digest'
      };
      toast.success(res?.msg || `${labels[type] || type} dispatched via email!`);
    } catch (err) {
      clearTimeout(safetyTimer);
      toast.error(`Failed to dispatch ${type} emails: ` + (err.response?.data?.msg || err.message));
    } finally {
      setSendingEmails(false);
    }
  };

  const handleTriggerVendorEmails = async () => {
    setSendingEmails(true);
    const safetyTimer = setTimeout(() => {
      setSendingEmails(false);
    }, 12000);

    try {
      const res = await triggerMonthlyVendorEmails();
      clearTimeout(safetyTimer);
      toast.success(res?.msg || 'Monthly vendor payout statements sent via email!');
    } catch (err) {
      clearTimeout(safetyTimer);
      toast.error('Failed to send vendor emails: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSendingEmails(false);
    }
  };

  const handleTriggerAdminEmail = async () => {
    setSendingEmails(true);
    const safetyTimer = setTimeout(() => {
      setSendingEmails(false);
    }, 12000);

    try {
      const res = await triggerMonthlyAdminEmail();
      clearTimeout(safetyTimer);
      toast.success(res?.msg || 'Executive monthly revenue digest dispatched to admin email!');
    } catch (err) {
      clearTimeout(safetyTimer);
      toast.error('Failed to send admin email: ' + (err.response?.data?.msg || err.message));
    } finally {
      setSendingEmails(false);
    }
  };

  return (
    <div className="admin-app-root">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand-box">
            <div className="admin-logo-mark">
              <Boxes size={22} />
            </div>
            <div className="admin-brand-text">
              <h1 className="admin-brand-title">InventoryApp</h1>
              <span className="admin-brand-badge">ADMIN SUPER APP</span>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = collapsedGroups[group.title];
            return (
              <div key={group.title} className="admin-nav-group">
                <button
                  type="button"
                  className="admin-nav-group-header"
                  onClick={() => toggleGroup(group.title)}
                >
                  <span>{group.title}</span>
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </button>

                {!isCollapsed && (
                  <div className="admin-nav-group-items">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `admin-nav-item ${isActive ? 'active' : ''}`
                          }
                        >
                          <Icon size={17} className="nav-icon" />
                          <span className="nav-label">{item.label}</span>
                          {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-preview">
            <div className="admin-avatar">
              {adminUser.name?.charAt(0) || 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{adminUser.name || 'Super Admin'}</span>
              <span className="admin-user-email">{adminUser.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
            title="Logout from Admin"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="admin-main-viewport">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-search-trigger-btn"
              onClick={() => setSearchModalOpen(true)}
            >
              <Search size={15} />
              <span>Search platform... (Ctrl + K)</span>
            </button>
          </div>

          <div className="admin-topbar-right">
            {/* Quick Email Triggers */}
            <div className="admin-email-actions" style={{ position: 'relative' }}>
              <button
                type="button"
                className="admin-topbar-btn highlight"
                onClick={() => !sendingEmails && setEmailMenuOpen(!emailMenuOpen)}
                disabled={sendingEmails}
                title="Trigger Automated Scheduled Email Cycles"
              >
                {sendingEmails ? (
                  <>
                    <Loader2 size={15} className="admin-spin" />
                    <span>Sending Reports...</span>
                  </>
                ) : (
                  <>
                    <Mail size={15} />
                    <span>Scheduled Emails</span>
                    <ChevronDown size={14} />
                  </>
                )}
              </button>

              {emailMenuOpen && (
                <div
                  className="admin-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: '115%',
                    right: 0,
                    width: '280px',
                    background: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                    padding: '8px',
                    zIndex: 250
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--admin-border)', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-text-sub)' }}>
                      Automated Email Triggers
                    </span>
                  </div>

                  <button
                    type="button"
                    className="admin-dropdown-item"
                    onClick={() => handleTriggerScheduled('monthly')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--admin-text-main)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      textAlign: 'left'
                    }}
                  >
                    <Calendar size={16} style={{ color: '#3b82f6' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>1st of Month Statement</div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>Customer, Vendor & Admin monthly</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="admin-dropdown-item"
                    onClick={() => handleTriggerScheduled('six_month')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--admin-text-main)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      textAlign: 'left'
                    }}
                  >
                    <Sparkles size={16} style={{ color: '#8b5cf6' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>6-Month Milestone Review</div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>Semi-annual loyalty & performance</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="admin-dropdown-item"
                    onClick={() => handleTriggerScheduled('daily_vendor')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--admin-text-main)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      textAlign: 'left'
                    }}
                  >
                    <Send size={16} style={{ color: '#f59e0b' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Daily Vendor Digest (EOD)</div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>Today's orders, revenue & refunds to vendors</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="admin-dropdown-item"
                    onClick={() => handleTriggerScheduled('annual')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--admin-text-main)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      textAlign: 'left'
                    }}
                  >
                    <Send size={16} style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>1-Year Annual Review</div>
                      <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>Annual platform celebration digest</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              className="admin-theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications Shortcut */}
            <NavLink to="/notifications" className="admin-icon-nav-btn" title="Notifications">
              <Bell size={17} />
              <span className="admin-bell-dot" />
            </NavLink>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="admin-content-area">
          {children}
        </main>
      </div>

      {/* GLOBAL SEARCH DIALOG (CTRL+K) */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Titan AI Platform Intelligence Wide Modal */}
      <AdminAiDrawer
        isOpen={titanAiOpen}
        onClose={() => {
          setTitanAiOpen(false);
          setTitanAiInitialQuery('');
        }}
        initialQuery={titanAiInitialQuery}
      />

      {/* Titan Floating Action Pill */}
      <AdminAiFab
        onClick={() => setTitanAiOpen(true)}
        isOpen={titanAiOpen}
      />
    </div>
  );
}

