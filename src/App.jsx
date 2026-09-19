import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ToastContainer from './components/Toast';

// Auth
import AdminLogin from './pages/AdminLogin';

// 35 Concepts
import Dashboard from './pages/Dashboard';
import SystemHealth from './pages/SystemHealth';
import ActivityMonitoring from './pages/ActivityMonitoring';
import Orders from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import Invoices from './pages/Invoices';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Products from './pages/Products';
import AdminProductDetails from './pages/AdminProductDetails';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import StockHistory from './pages/StockHistory';
import Warehouses from './pages/Warehouses';
import InventoryTransfers from './pages/InventoryTransfers';
import Transactions from './pages/Transactions';
import Wallets from './pages/Wallets';
import Returns from './pages/Returns';
import Refunds from './pages/Refunds';
import WarrantyClaims from './pages/WarrantyClaims';
import Coupons from './pages/Coupons';
import Promotions from './pages/Promotions';
import Banners from './pages/Banners';
import Reviews from './pages/Reviews';
import SupportTickets from './pages/SupportTickets';
import Notifications from './pages/Notifications';
import SalesAnalytics from './pages/SalesAnalytics';
import CustomerAnalytics from './pages/CustomerAnalytics';
import VendorAnalytics from './pages/VendorAnalytics';
import InventoryAnalytics from './pages/InventoryAnalytics';
import Reports from './pages/Reports';
import GlobalSearch from './pages/GlobalSearch';
import AdminUsers from './pages/AdminUsers';
import Permissions from './pages/Permissions';
import AuditLogs from './pages/AuditLogs';
import StoreSettings from './pages/StoreSettings';
import Security from './pages/Security';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected Admin Modules */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/system-health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><ActivityMonitoring /></ProtectedRoute>} />

        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/products/:id" element={<ProtectedRoute><AdminProductDetails /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />

        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/stock-history" element={<ProtectedRoute><StockHistory /></ProtectedRoute>} />
        <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
        <Route path="/transfers" element={<ProtectedRoute><InventoryTransfers /></ProtectedRoute>} />

        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/wallets" element={<ProtectedRoute><Wallets /></ProtectedRoute>} />
        <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
        <Route path="/refunds" element={<ProtectedRoute><Refunds /></ProtectedRoute>} />
        <Route path="/warranty-claims" element={<ProtectedRoute><WarrantyClaims /></ProtectedRoute>} />

        <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
        <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
        <Route path="/banners" element={<ProtectedRoute><Banners /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/support-tickets" element={<ProtectedRoute><SupportTickets /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        <Route path="/analytics/sales" element={<ProtectedRoute><SalesAnalytics /></ProtectedRoute>} />
        <Route path="/analytics/customers" element={<ProtectedRoute><CustomerAnalytics /></ProtectedRoute>} />
        <Route path="/analytics/vendors" element={<ProtectedRoute><VendorAnalytics /></ProtectedRoute>} />
        <Route path="/analytics/inventory" element={<ProtectedRoute><InventoryAnalytics /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

        <Route path="/search" element={<ProtectedRoute><GlobalSearch /></ProtectedRoute>} />
        <Route path="/admin-users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
        <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
        <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><StoreSettings /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global Toast Container */}
      <ToastContainer />
    </>
  );
}

