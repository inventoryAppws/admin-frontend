/**
 * Admin Platform Page-Context Intelligence Helper (Titan)
 * Detects the platform administrator's current screen and generates tailored executive decisions & prompts
 */

export function getAdminPageContext(pathname = window.location.pathname) {
  const path = String(pathname || '').toLowerCase();

  // 1. Platform Orders & Fulfillment
  if (path.includes('/orders') || path.includes('/order-tracking')) {
    return {
      pageKey: 'orders',
      pageTitle: 'Platform Orders & Fulfillment',
      badge: 'Order Operations Active',
      decisions: [
        {
          id: 'shipping-delays-platform',
          title: 'Platform-wide Delivery Delays',
          desc: 'Audit orders stalled in transit across all merchant accounts',
          query: 'Audit platform-wide order fulfillments and identify couriers or regions experiencing transit delays'
        },
        {
          id: 'high-value-audits',
          title: 'High-Value Order Audits',
          desc: 'Audit transactions >₹25,000 for verification or fulfillment SLA',
          query: 'Show me high-value orders placed this week and verify their fulfillment progress'
        },
        {
          id: 'refund-disputes',
          title: 'Refund & Return Interventions',
          desc: 'Identify return claims pending merchant review >48 hours',
          query: 'Are there any unresolved return claims or customer refund disputes requiring admin intervention?'
        },
        {
          id: 'order-velocity',
          title: 'Order Velocity & Peak Hours',
          desc: 'Analyze order volume spikes and system checkout load',
          query: 'Analyze today’s order velocity and identify peak ordering hours'
        }
      ],
      quickChips: [
        'Delayed shipments audit',
        'High-value orders (>₹25k)',
        'Unresolved refund disputes',
        'Order volume velocity'
      ]
    };
  }

  // 2. Vendors & Merchant Management
  if (path.includes('/vendors') || path.includes('/vendor-analytics')) {
    return {
      pageKey: 'vendors',
      pageTitle: 'Merchant Ecosystem & Performance',
      badge: 'Vendor Auditor Active',
      decisions: [
        {
          id: 'sales-drop-alert',
          title: 'Vendor Drop-Offs (>20%)',
          desc: 'Detect merchants experiencing significant sales or revenue decline',
          query: 'Run a merchant audit and detect vendors experiencing a sales drop greater than 20%'
        },
        {
          id: 'top-merchants',
          title: 'Top GMV Drivers',
          desc: 'Identify the top 10 merchants generating platform commission',
          query: 'Which merchants generate the highest Gross Merchandise Value (GMV) and commission this month?'
        },
        {
          id: 'commission-compliance',
          title: 'Commission & Payout Audit',
          desc: 'Verify 5% platform commission collections vs settled payouts',
          query: 'Audit vendor commission compliance and review pending payout liabilities'
        },
        {
          id: 'vendor-health-scores',
          title: 'Merchant Health & SLA',
          desc: 'Benchmark cancellation rates, return rates, and dispatch times',
          query: 'Analyze vendor health scores: which merchants have high cancellation or return rates?'
        }
      ],
      quickChips: [
        'Vendors with >20% drop',
        'Top 10 GMV merchants',
        'Commission collections',
        'Vendor SLA compliance'
      ]
    };
  }

  // 3. Platform Inventory & Warehouses
  if (path.includes('/inventory') || path.includes('/warehouses') || path.includes('/stock') || path.includes('/transfers')) {
    return {
      pageKey: 'inventory',
      pageTitle: 'Ecosystem Inventory & Supply Chain',
      badge: 'Supply Chain Auditor Active',
      decisions: [
        {
          id: 'stockout-risks',
          title: 'Platform Stockout Bottlenecks',
          desc: 'Identify out-of-stock items and calculate potential lost GMV',
          query: 'Audit platform-wide inventory risk: which high-demand products are stocked out and what is the GMV loss?'
        },
        {
          id: 'dead-capital-platform',
          title: 'Dead Inventory Locked Capital',
          desc: 'Audit slow-moving catalog stock across all vendors',
          query: 'Calculate total locked capital across all platform merchants from dead stock'
        },
        {
          id: 'warehouse-transfers',
          title: 'Warehouse Balance Audit',
          desc: 'Review multi-facility inventory allocation and transfer delays',
          query: 'Are there any pending warehouse inventory transfers experiencing bottlenecks?'
        }
      ],
      quickChips: [
        'Stockout GMV loss risk',
        'Dead stock locked capital',
        'Fastest depleting SKUs',
        'Warehouse transfer status'
      ]
    };
  }

  // 4. Customers & Retention
  if (path.includes('/customers') || path.includes('/customer-analytics')) {
    return {
      pageKey: 'customers',
      pageTitle: 'Customer Base & Retention',
      badge: 'Customer Intelligence Active',
      decisions: [
        {
          id: 'vip-cohort',
          title: 'VIP & High-LTV Cohort',
          desc: 'Analyze top 5% repeat buyers and average order frequency',
          query: 'Show me insights on our top customer cohorts and their average order value'
        },
        {
          id: 'churn-risk',
          title: 'Customer Churn Detection',
          desc: 'Identify previously active customers with no orders in 60 days',
          query: 'Analyze customer retention and identify signs of buyer churn or drop-off'
        },
        {
          id: 'wallet-liabilities',
          title: 'Wallet Balance Liability',
          desc: 'Audit customer wallet balances and cashback liabilities',
          query: 'What is the total outstanding customer wallet balance liability across the platform?'
        }
      ],
      quickChips: [
        'VIP customer cohorts',
        'Customer churn analysis',
        'Wallet balance liability',
        'Repeat buyer rate'
      ]
    };
  }

  // 5. Marketing, Coupons & Promotions
  if (path.includes('/coupons') || path.includes('/promotions') || path.includes('/banners')) {
    return {
      pageKey: 'marketing',
      pageTitle: 'Marketing, Coupons & Campaigns',
      badge: 'Campaign Auditor Active',
      decisions: [
        {
          id: 'coupon-burn',
          title: 'Coupon Redemption & Burn Rate',
          desc: 'Analyze coupon discounts given vs gross incremental sales',
          query: 'Audit active coupon redemption rates and calculate the total promotional discount given'
        },
        {
          id: 'promotion-roi',
          title: 'Promotion Campaign ROI',
          desc: 'Analyze which active deals generate the strongest conversion',
          query: 'Which promotional campaigns are driving the most order volume this month?'
        },
        {
          id: 'banner-engagement',
          title: 'Banner Click & Conversion Audit',
          desc: 'Verify hero banners driving customer traffic to categories',
          query: 'Review active homepage banners and recommend visual or category optimizations'
        }
      ],
      quickChips: [
        'Coupon burn rate',
        'Promotion campaign ROI',
        'Active banners review',
        'Discount vs GMV impact'
      ]
    };
  }

  // Default: Dashboard / Strategic Overview
  return {
    pageKey: 'dashboard',
    pageTitle: 'Executive Platform Overview',
    badge: 'Titan Executive BI Active',
    decisions: [
      {
        id: 'gmv-growth',
        title: 'Platform GMV & Order Growth',
        desc: 'Review total platform sales, growth trends, and transaction volume',
        query: 'Provide an executive summary of platform GMV, total orders, and growth over the last 30 days'
      },
      {
        id: 'vendor-audit-executive',
        title: 'Merchant Performance Drop-Offs',
        desc: 'Detect any merchants with sales decline >20% requiring support',
        query: 'Check vendor performance comparison and identify merchants experiencing significant sales drops'
      },
      {
        id: 'ecosystem-health',
        title: 'Platform Strategic Health Brief',
        desc: 'Audit commission revenue, inventory stockouts, and order velocity',
        query: 'Generate an executive platform health brief covering GMV, commission revenue, and critical risks'
      },
      {
        id: 'anomaly-detection',
        title: 'Fraud & Anomaly Detection',
        desc: 'Scan for suspicious order clusters, high return spikes, or failed payouts',
        query: 'Scan the platform for unusual patterns, return spikes, or payment anomalies'
      }
    ],
    quickChips: [
      'Platform GMV summary (30d)',
      'Vendor drop-offs (>20%)',
      'Inventory risk audit',
      'Executive health brief'
    ]
  };
}
