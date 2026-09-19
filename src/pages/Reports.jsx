import React, { useState } from 'react';
import { Download, FileSpreadsheet, Filter, CheckCircle, RefreshCw } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import { generateReport } from '../services/adminService';
import { toast } from '../components/Toast';

const REPORT_TYPES = [
  { value: 'transactions', label: 'Financial Transactions Ledger' },
  { value: 'orders', label: 'Completed Orders & Sales' },
  { value: 'customers', label: 'Customer Directory & Wallets' },
  { value: 'inventory', label: 'Inventory Stock Valuation' }
];

export default function Reports() {
  const [reportType, setReportType] = useState('transactions');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateReport(reportType);
      setReportData(res);
      toast.success(`Generated ${res.totalRows} records for ${reportType} report`);
    } catch (err) {
      toast.error('Failed to generate report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) {
      toast.error('No report data to export');
      return;
    }

    const rows = reportData.rows;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => headers.map(h => {
        let val = row[h];
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        return `"${String(val || '').replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV export file downloaded successfully!');
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Reports & Data Export Center</h1>
          <p className="admin-page-subtitle">Generate business intelligence datasets, audit summaries, and spreadsheet CSV downloads</p>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <label className="admin-form-label">Report Data Category</label>
          <CustomSelect
            options={REPORT_TYPES}
            value={reportType}
            onChange={(val) => setReportType(val)}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spinner-small" /> : <FileSpreadsheet size={16} />}
            {loading ? 'Compiling...' : 'Generate Report'}
          </button>

          {reportData && reportData.rows && reportData.rows.length > 0 && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={handleDownloadCSV}
            >
              <Download size={16} /> Export to CSV
            </button>
          )}
        </div>
      </div>

      {reportData && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, textTransform: 'capitalize' }}>
                {reportData.type} Dataset Preview
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Total rows compiled: {reportData.totalRows} • Generated {new Date(reportData.generatedAt).toLocaleTimeString()}
              </p>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={handleDownloadCSV}
            >
              <Download size={14} /> Download CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '440px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)', borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  {reportData.rows.length > 0 && Object.keys(reportData.rows[0]).map((h) => (
                    <th key={h} style={{ padding: '10px 12px', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.rows.slice(0, 50).map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {Object.entries(row).map(([key, val], cIdx) => {
                      const isStatus = key.toLowerCase().includes('status');
                      const isAmount = key.includes('(₹)');
                      return (
                        <td key={cIdx} style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                          {isStatus ? (
                            <span className={`admin-badge ${String(val).includes('DELIVERED') || String(val).includes('ACTIVE') || String(val).includes('IN STOCK') || String(val).includes('SUCCESS') ? 'success' : String(val).includes('OUT') || String(val).includes('CANCELLED') || String(val).includes('BLOCKED') ? 'danger' : 'warning'}`} style={{ fontSize: '10.5px' }}>
                              {String(val)}
                            </span>
                          ) : isAmount && typeof val === 'number' ? (
                            <span style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>
                              ₹{val.toLocaleString('en-IN')}
                            </span>
                          ) : typeof val === 'object' && val !== null ? (
                            JSON.stringify(val)
                          ) : (
                            String(val ?? '—')
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reportData.rows.length > 50 && (
            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              Showing first 50 rows in preview. Download full CSV to inspect all {reportData.totalRows} rows.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

