import api from './api';

// Auth
export const adminLogin = (data) => api.post('/login', data).then(r => r.data);
export const requestLoginOtp = (email) => api.post('/login-otp/request', { email }).then(r => r.data);
export const verifyLoginOtp = (data) => api.post('/login-otp/verify', data).then(r => r.data);

// Dashboard & Overview
export const getDashboardData = () => api.get('/dashboard-data').then(r => r.data);
export const getOverview = (range) => api.get('/overview', { params: { range } }).then(r => r.data);

// Customers
export const getCustomers = (params) => api.get('/customers', { params }).then(r => r.data);
export const getCustomerById = (id) => api.get(`/customers/${id}`).then(r => r.data);
export const updateCustomer = (id, data) => api.patch(`/customers/${id}`, data).then(r => r.data);
export const toggleCustomerBlock = (id) => api.post(`/customers/${id}/toggle-block`).then(r => r.data);
export const adjustCustomerWallet = (id, data) => api.post(`/customers/${id}/adjust-wallet`, data).then(r => r.data);

// Vendors
export const getVendors = (params) => api.get('/vendors', { params }).then(r => r.data);
export const updateVendor = (id, data) => api.patch(`/vendors/${id}`, data).then(r => r.data);
export const updateVendorStatus = (id, status) => api.patch(`/vendors/${id}/status`, { status }).then(r => r.data);

// Products & Categories
export const getProducts = (params) => api.get('/products', { params }).then(r => r.data);
export const getProductById = (id) => api.get(`/products/${id}`).then(r => r.data);
export const getProductReviews = (id) => api.get('/reviews', { params: { productId: id } }).then(r => r.data);
export const updateProduct = (id, data) => api.patch(`/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);

export const getCategories = () => api.get('/categories').then(r => r.data);
export const createCategory = (data) => api.post('/categories', data).then(r => r.data);
export const updateCategory = (id, data) => api.patch(`/categories/${id}`, data).then(r => r.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`).then(r => r.data);

// Orders
export const getOrders = (params) => api.get('/orders', { params }).then(r => r.data);
export const updateOrderStatus = (id, data) => api.patch(`/orders/${id}/status`, data).then(r => r.data);

// Inventory & Warehouses
export const getInventoryOverview = () => api.get('/inventory/overview').then(r => r.data);
export const getStockHistory = (params) => api.get('/inventory/history', { params }).then(r => r.data);
export const getWarehouses = () => api.get('/warehouses').then(r => r.data);
export const createWarehouse = (data) => api.post('/warehouses', data).then(r => r.data);
export const getTransfers = () => api.get('/transfers').then(r => r.data);
export const createTransfer = (data) => api.post('/transfers', data).then(r => r.data);

// Returns & Refunds
export const getReturns = (params) => api.get('/returns', { params }).then(r => r.data);
export const processRefund = (data) => api.post('/refunds/process', data).then(r => r.data);

// Financials & Transactions & Wallets
export const getAllTransactions = (params) => api.get('/transactions', { params }).then(r => r.data);
export const getInvoices = (params) => api.get('/invoices', { params }).then(r => r.data);
export const getWalletsSummary = (params) => api.get('/wallets', { params }).then(r => r.data);

// Marketing: Coupons, Promotions & Banners
export const getCoupons = () => api.get('/coupons').then(r => r.data);
export const createCoupon = (data) => api.post('/coupons', data).then(r => r.data);
export const updateCoupon = (id, data) => api.patch(`/coupons/${id}`, data).then(r => r.data);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`).then(r => r.data);
export const getPromotions = () => api.get('/promotions').then(r => r.data);
export const createPromotion = (data) => api.post('/promotions', data).then(r => r.data);
export const deletePromotion = (id) => api.delete(`/promotions/${id}`).then(r => r.data);
export const getBanners = () => api.get('/banners').then(r => r.data);
export const createBanner = (data) => api.post('/banners', data).then(r => r.data);
export const updateBanner = (id, data) => api.patch(`/banners/${id}`, data).then(r => r.data);
export const deleteBanner = (id) => api.delete(`/banners/${id}`).then(r => r.data);

// Reviews & Support
export const getReviews = (params) => api.get('/reviews', { params }).then(r => r.data);
export const moderateReview = (id, data) => api.patch(`/reviews/${id}`, data).then(r => r.data);
export const getSupportTickets = () => api.get('/support-tickets').then(r => r.data);
export const replySupportTicket = (id, data) => api.post(`/support-tickets/${id}/reply`, data).then(r => r.data);

// Notifications
export const getNotifications = (params) => api.get('/notifications', { params }).then(r => r.data);
export const broadcastNotification = (data) => api.post('/notifications/broadcast', data).then(r => r.data);

// Analytics & Reports
export const getSalesAnalytics = () => api.get('/analytics/sales').then(r => r.data);
export const getCustomerAnalytics = () => api.get('/analytics/customers').then(r => r.data);
export const getVendorAnalytics = () => api.get('/analytics/vendors').then(r => r.data);
export const getInventoryAnalytics = () => api.get('/analytics/inventory').then(r => r.data);
export const generateReport = (type) => api.get('/reports/generate', { params: { type } }).then(r => r.data);

// Admin Users, Roles & Permissions
export const getAdminUsers = () => api.get('/admin-users').then(r => r.data);
export const createAdminUser = (data) => api.post('/admin-users', data).then(r => r.data);
export const updateAdminUser = (id, data) => api.patch(`/admin-users/${id}`, data).then(r => r.data);
export const toggleAdminBlock = (id) => api.post(`/admin-users/${id}/toggle-block`).then(r => r.data);
export const deleteAdminUser = (id) => api.delete(`/admin-users/${id}`).then(r => r.data);
export const requestAdminPasswordOtp = (id) => api.post(`/admin-users/${id}/password-otp`).then(r => r.data);
export const getAdminRoles = () => api.get('/roles').then(r => r.data);
export const createAdminRole = (data) => api.post('/roles', data).then(r => r.data);
export const updateAdminRole = (id, data) => api.patch(`/roles/${id}`, data).then(r => r.data);

// Security & Activity Feed
export const getSecurityOverview = () => api.get('/security').then(r => r.data);
export const getActivityFeed = (params) => api.get('/activity', { params }).then(r => r.data);

// Global Search
export const globalSearch = (q) => api.get('/global-search', { params: { q } }).then(r => r.data);

// Audit & Settings & Health
export const getAuditLogs = (params) => api.get('/audit-logs', { params }).then(r => r.data);
export const getStoreSettings = () => api.get('/settings').then(r => r.data);
export const updateStoreSettings = (data) => api.patch('/settings', data).then(r => r.data);
export const getSystemHealth = () => api.get('/system-health').then(r => r.data);

// Monthly & Scheduled Emails
export const triggerMonthlyVendorEmails = () => api.post('/emails/trigger-vendor-monthly').then(r => r.data);
export const triggerMonthlyAdminEmail = () => api.post('/emails/trigger-admin-monthly').then(r => r.data);
export const triggerScheduledEmails = (type = 'monthly') => api.post('/emails/trigger-scheduled', { type, force: true }).then(r => r.data);

// Warranty Claims (RMA)
export const getAdminWarrantyClaims = (params) => api.get('/warranties/admin/claims', { params }).then(r => r.data);
export const updateWarrantyClaimStatus = (claimId, data) => api.patch(`/warranties/claims/${claimId}/status`, data).then(r => r.data);


