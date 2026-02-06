import React, { useRef, useEffect } from 'react';
import type { Order } from '../../../types';

interface PrintContainerProps {
  orders: Order[];
  title?: string;
  onPrintComplete?: () => void;
}

const PrintContainer: React.FC<PrintContainerProps> = ({
  orders,
  title = 'Daftar Pesanan',
  onPrintComplete,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title}</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              
              * {
                box-sizing: border-box;
              }
              
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .print-container {
                padding: 10mm;
              }
              
              .print-title {
                text-align: center;
                margin-bottom: 10px;
                font-size: 14px;
                font-weight: bold;
                border-bottom: 2px solid #000;
                padding-bottom: 5px;
              }
              
              .print-title-sub {
                font-size: 10px;
                font-weight: normal;
                margin-top: 3px;
              }
              
              .print-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8mm;
                align-content: start;
              }
              
              .order-card {
                width: 100%;
                border: 2px solid #000;
                padding: 12px;
                background-color: #fff;
                font-size: 11px;
                line-height: 1.4;
                page-break-inside: avoid;
                break-inside: avoid;
              }
              
              .order-header {
                border-bottom: 2px solid #000;
                padding-bottom: 8px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              
              .order-number {
                font-weight: bold;
                font-size: 13px;
              }
              
              .order-index {
                font-size: 10px;
                color: #666;
              }
              
              .order-date {
                font-size: 10px;
                color: #333;
                margin-top: 2px;
              }
              
              .customer-info {
                margin-bottom: 8px;
              }
              
              .info-row {
                margin-bottom: 4px;
              }
              
              .info-label {
                font-weight: bold;
              }
              
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 8px;
                font-size: 10px;
              }
              
              .items-table th {
                text-align: left;
                padding: 4px 2px;
                font-weight: bold;
                border-bottom: 1px solid #000;
              }
              
              .items-table td {
                padding: 3px 2px;
                vertical-align: top;
                border-bottom: 1px solid #ddd;
              }
              
              .items-table th:nth-child(3),
              .items-table td:nth-child(3) {
                text-align: center;
                width: 10%;
              }
              
              .items-table th:nth-child(4),
              .items-table td:nth-child(4) {
                text-align: right;
                width: 20%;
              }
              
              .variant-text {
                font-size: 9px;
                color: #666;
              }
              
              .total-section {
                border-top: 2px solid #000;
                padding-top: 6px;
                margin-top: 6px;
              }
              
              .total-row {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
              }
              
              .discount-row {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                color: #d32f2f;
              }
              
              .grand-total {
                display: flex;
                justify-content: space-between;
                font-weight: bold;
                font-size: 12px;
                margin-top: 4px;
                padding-top: 4px;
                border-top: 1px dashed #000;
              }
              
              .footer {
                margin-top: 10px;
                padding-top: 6px;
                border-top: 1px solid #ccc;
                text-align: center;
                font-size: 9px;
                color: #666;
              }
              
              .footer-brand {
                font-weight: bold;
                color: #000;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <div class="print-grid">
                ${orders.map((order, index) => `
                  <div class="order-card">
                    <div class="order-header">
                      <div>
                        <div class="order-number">PESANAN #${order.order_number || order.id}</div>
                        <div class="order-date">${new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                      </div>
                      <div class="order-index">#${index + 1}</div>
                    </div>
                    
                    <div class="customer-info">
                      <div class="info-row"><span class="info-label">Nama:</span> ${order.checkout_name}</div>
                      <div class="info-row"><span class="info-label">Telepon:</span> ${order.phone_number}</div>
                      <div class="info-row"><span class="info-label">Qobilah:</span> ${order.qobilah}</div>
                      <div class="info-row"><span class="info-label">Pembayaran:</span> ${order.payment_method === 'transfer' ? 'Transfer Bank' : 'Tunai'}</div>
                    </div>
                    
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th>Produk</th>
                          <th>Penerima</th>
                          <th>Qty</th>
                          <th>Harga</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${order.items?.map(item => `
                          <tr>
                            <td>
                              ${item.product?.name || 'Unknown'}
                              ${item.variants && item.variants.length > 0 ? `
                                <div class="variant-text">(${item.variants.map(v => v.name).join(', ')})</div>
                              ` : ''}
                            </td>
                            <td>${item.recipient_name}</td>
                            <td>${item.quantity}</td>
                            <td>Rp ${Number(item.unit_price_at_order).toLocaleString('id-ID')}</td>
                          </tr>
                        `).join('') || ''}
                      </tbody>
                    </table>
                    
                    <div class="total-section">
                      <div class="total-row">
                        <span>Subtotal:</span>
                        <span>Rp ${Number(order.total_amount).toLocaleString('id-ID')}</span>
                      </div>
                      ${Number(order.discount_amount) > 0 ? `
                        <div class="discount-row">
                          <span>Diskon ${order.coupon_code ? `(${order.coupon_code})` : ''}:</span>
                          <span>-Rp ${Number(order.discount_amount).toLocaleString('id-ID')}</span>
                        </div>
                      ` : ''}
                      <div class="grand-total">
                        <span>TOTAL:</span>
                        <span>Rp ${Number(order.grand_total || order.total_amount).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    
                    <div class="footer">
                      <div class="footer-brand">BAM Store</div>
                      <div>Terima kasih atas pesanan Anda</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </body>
          </html>
        `);
        iframeDoc.close();

        // Trigger print after content is loaded
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Call onPrintComplete after print dialog closes
          setTimeout(() => {
            onPrintComplete?.();
          }, 100);
        }, 100);
      }
    }
  }, [orders, title, onPrintComplete]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        border: 'none',
      }}
      title="Print Frame"
    />
  );
};

export default PrintContainer;
