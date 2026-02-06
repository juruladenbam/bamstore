import React from 'react';
import type { Order } from '../../../types';

interface PrintCardProps {
  order: Order;
  index?: number;
}

const PrintCard: React.FC<PrintCardProps> = ({ order, index }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${Number(amount).toLocaleString('id-ID')}`;
  };

  return (
    <div
      style={{
        width: '100%',
        border: '2px solid #000',
        padding: '12px',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        lineHeight: '1.4',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '2px solid #000',
          paddingBottom: '8px',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
            PESANAN #{order.order_number || order.id}
          </div>
          {index !== undefined && (
            <div
              style={{
                fontSize: '10px',
                color: '#666',
              }}
            >
              #{index + 1}
            </div>
          )}
        </div>
        <div style={{ fontSize: '10px', color: '#333', marginTop: '2px' }}>
          {formatDate(order.created_at)}
        </div>
      </div>

      {/* Customer Info */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ marginBottom: '4px' }}>
          <strong>Nama:</strong> {order.checkout_name}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Telepon:</strong> {order.phone_number}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <strong>Qobilah:</strong> {order.qobilah}
        </div>
        <div>
          <strong>Pembayaran:</strong>{' '}
          {order.payment_method === 'transfer' ? 'Transfer Bank' : 'Tunai'}
        </div>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '8px',
          fontSize: '10px',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #000' }}>
            <th
              style={{
                textAlign: 'left',
                padding: '4px 2px',
                fontWeight: 'bold',
              }}
            >
              Produk
            </th>
            <th
              style={{
                textAlign: 'left',
                padding: '4px 2px',
                fontWeight: 'bold',
                width: '35%',
              }}
            >
              Penerima
            </th>
            <th
              style={{
                textAlign: 'center',
                padding: '4px 2px',
                fontWeight: 'bold',
                width: '10%',
              }}
            >
              Qty
            </th>
            <th
              style={{
                textAlign: 'right',
                padding: '4px 2px',
                fontWeight: 'bold',
                width: '20%',
              }}
            >
              Harga
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '3px 2px', verticalAlign: 'top' }}>
                {item.product?.name || 'Unknown'}
                {item.variants && item.variants.length > 0 && (
                  <div style={{ fontSize: '9px', color: '#666' }}>
                    ({item.variants.map((v) => v.name).join(', ')})
                  </div>
                )}
              </td>
              <td style={{ padding: '3px 2px', verticalAlign: 'top' }}>
                {item.recipient_name}
              </td>
              <td style={{ textAlign: 'center', padding: '3px 2px' }}>
                {item.quantity}
              </td>
              <td style={{ textAlign: 'right', padding: '3px 2px' }}>
                {formatCurrency(item.unit_price_at_order)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total Section */}
      <div
        style={{
          borderTop: '2px solid #000',
          paddingTop: '6px',
          marginTop: '6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
          }}
        >
          <span>Subtotal:</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
        {Number(order.discount_amount) > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#d32f2f',
            }}
          >
            <span>
              Diskon
              {order.coupon_code ? ` (${order.coupon_code})` : ''}:
            </span>
            <span>-{formatCurrency(order.discount_amount || 0)}</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '12px',
            marginTop: '4px',
            paddingTop: '4px',
            borderTop: '1px dashed #000',
          }}
        >
          <span>TOTAL:</span>
          <span>
            {formatCurrency(order.grand_total || order.total_amount)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '10px',
          paddingTop: '6px',
          borderTop: '1px solid #ccc',
          textAlign: 'center',
          fontSize: '9px',
          color: '#666',
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#000' }}>BAM Store</div>
        <div>Terima kasih atas pesanan Anda</div>
      </div>
    </div>
  );
};

export default PrintCard;
