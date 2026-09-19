import React, { useState } from 'react';
import { FileText, Printer, Download, Eye, CheckCircle, Clock } from 'lucide-react';
import InfiniteDataTable from '../components/InfiniteDataTable';
import SidepanelDrawer from '../components/SidepanelDrawer';
import CustomSelect from '../components/CustomSelect';
import { getInvoices } from '../services/adminService';
import { toast } from '../components/Toast';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Amount: High to Low' },
  { value: 'amount_asc', label: 'Amount: Low to High' }
];

export default function Invoices() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const columns = [
    {
      header: 'Invoice Number',
      render: (inv) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} color="var(--primary-color)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace' }}>
              {inv.invoiceNumber}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Order #{inv.orderId}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      render: (inv) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{inv.customerName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.customerEmail}</div>
        </div>
      )
    },
    {
      header: 'Vendor / Store',
      render: (inv) => (
        <span style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
          {inv.vendorName}
        </span>
      )
    },
    {
      header: 'Amount',
      render: (inv) => (
        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
          ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Method',
      render: (inv) => (
        <span style={{
          textTransform: 'uppercase',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)'
        }}>
          {inv.paymentMethod}
        </span>
      )
    },
    {
      header: 'Date',
      render: (inv) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Action',
      render: (inv) => (
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          onClick={() => setSelectedInvoice(inv)}
        >
          <Eye size={14} /> View
        </button>
      )
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tax Invoices Archive</h1>
          <p className="admin-page-subtitle">Compliant GST invoices, order billing statements, and printable receipts</p>
        </div>
      </div>

      <InfiniteDataTable
        fetchData={getInvoices}
        extraParams={{ sortBy }}
        columns={columns}
        searchPlaceholder="Search by invoice number, order ID, or customer name..."
        keyField="_id"
        headerToolbar={
          <div style={{ minWidth: '180px' }}>
            <CustomSelect
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              placeholder="Sort By"
            />
          </div>
        }
      />

      {/* Printable Invoice Preview Drawer */}
      <SidepanelDrawer
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        title="Tax Invoice Preview"
        subtitle={selectedInvoice?.invoiceNumber}
        width="600px"
      >
        {selectedInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                style={{ flex: 1 }}
                onClick={handlePrint}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>

            {/* Document Body */}
            <div style={{
              background: 'var(--bg-card)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>TAX INVOICE</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Invoice: {selectedInvoice.invoiceNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID: #{selectedInvoice.orderId}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>E-Commerce Multi-Vendor Hub</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>GSTIN: 29ABCDE1234F1Z5</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Vendor: {selectedInvoice.vendorName}</div>
                </div>
              </div>

              <div style={{ margin: '16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>BILLED TO:</div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', marginTop: '4px' }}>{selectedInvoice.customerName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedInvoice.customerEmail}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>PAYMENT METHOD:</div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', textTransform: 'uppercase', marginTop: '4px' }}>{selectedInvoice.paymentMethod}</div>
                  <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>PAID IN FULL</div>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <div>ITEM</div>
                  <div style={{ textAlign: 'center' }}>QTY</div>
                  <div style={{ textAlign: 'right' }}>PRICE</div>
                  <div style={{ textAlign: 'right' }}>TOTAL</div>
                </div>
                {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                  selectedInvoice.items.map((it, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontSize: '0.82rem', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div>{it.name}</div>
                      <div style={{ textAlign: 'center' }}>{it.quantity}</div>
                      <div style={{ textAlign: 'right' }}>₹{Number(it.price || 0).toLocaleString('en-IN')}</div>
                      <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{(Number(it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', fontSize: '0.82rem', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>Order Merchandise Package</div>
                    <div style={{ textAlign: 'center' }}>1</div>
                    <div style={{ textAlign: 'right' }}>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}</div>
                    <div style={{ textAlign: 'right', fontWeight: 600 }}>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}</div>
                  </div>
                )}
              </div>

              {/* Total Summary */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                  <span>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (Included):</span>
                  <span>₹0.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', fontSize: '1rem', fontWeight: 800, borderTop: '2px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--primary-color)' }}>₹{Number(selectedInvoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div style={{ marginTop: '30px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                This is a computer-generated invoice and requires no physical signature. Authorized by Platform Administration.
              </div>
            </div>
          </div>
        )}
      </SidepanelDrawer>
    </div>
  );
}

