import React, { useRef, useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, Button, HStack, Spinner, Center } from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import { toaster } from '../components/ui/toaster';
import client from '../api/client';
import type { CartItem } from '../types';

interface OrderConfirmationState {
  orderId: number;
  orderNumber?: string;
  totalAmount: number;
  discountAmount?: number;
  grandTotal?: number;
  couponCode?: string;
  items: CartItem[];
  formData: {
    checkout_name: string;
    phone_number: string;
    qobilah: string;
    payment_method: string;
  };
}

// Unified Order Interface for Display
interface DisplayOrder {
  orderId: number;
  orderNumber: string;
  totalAmount: number; // This is subtotal
  discountAmount: number;
  grandTotal: number;
  couponCode?: string;
  items: {
    product_name: string;
    quantity: number;
    price: number;
    recipient_name?: string;
    variant_name?: string;
  }[];
  recipient: {
    name: string;
    phone: string;
    qobilah: string;
  };
  paymentMethod: string;
  createdAt: string;
  paymentSettings?: {
    payment_methods: any[];
    cash_payment_description: string;
  };
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  // const state = location.state as OrderConfirmationState | undefined;
  const printRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<DisplayOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      // 1. Try to use state from navigation (fastest)
      if (location.state) {
        const state = location.state as OrderConfirmationState & { settings?: any };
        setOrder({
          orderId: state.orderId,
          orderNumber: state.orderNumber || `#${state.orderId}`,
          totalAmount: Number(state.totalAmount),
          discountAmount: Number(state.discountAmount || 0),
          grandTotal: Number(state.grandTotal || state.totalAmount),
          couponCode: state.couponCode,
          items: state.items.map(item => ({
            product_name: item.product.name,
            quantity: item.quantity,
            price: item.unit_price,
            recipient_name: item.recipient_name,
            variant_name: item.variants.map(v => v.name).join(', ')
          })),
          recipient: {
            name: state.formData.checkout_name,
            phone: state.formData.phone_number,
            qobilah: state.formData.qobilah
          },
          paymentMethod: state.formData.payment_method,
          createdAt: new Date().toISOString(),
          paymentSettings: state.settings
        });
        setLoading(false);
        return;
      }

      // 2. If no state, try to fetch from API using orderNumber URL param
      if (orderNumber) {
        try {
          const res = await client.get(`/orders/${orderNumber}`);
          const data = res.data;
          setOrder({
            orderId: data.id,
            orderNumber: data.order_number,
            totalAmount: Number(data.total_amount),
            discountAmount: Number(data.discount_amount || 0),
            grandTotal: Number(data.grand_total || data.total_amount),
            couponCode: data.coupon_code,
            items: data.items.map((item: any) => ({
              product_name: item.product_name, // Backend transforms this
              quantity: item.quantity,
              price: item.price, // Backend transforms this
              recipient_name: item.recipient_name,
              variant_name: item.variant_name // Backend transforms this
            })),
            recipient: {
              name: data.checkout_name,
              phone: data.phone_number,
              qobilah: data.qobilah
            },
            paymentMethod: data.payment_method,
            createdAt: data.created_at,
            paymentSettings: data.settings // From backend
          });
          setLoading(false);
        } catch (err) {
          console.error(err);
          setError(true);
          setLoading(false);
        }
        return;
      }

      // 3. Neither state nor orderNumber available
      setError(true);
      setLoading(false);
    };

    fetchOrder();
  }, [location.state, orderNumber]);

  const handleDownload = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Order-${order?.orderNumber}.png`;
      link.click();
      toaster.create({ title: "Berhasil Diunduh", type: "success" });
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Gagal Mengunduh", type: "error" });
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (error || !order) {
    return (
      <Container py={10}>
        <Heading mb={4}>Pesanan Tidak Ditemukan</Heading>
        <Text mb={4}>Maaf, kami tidak dapat menemukan detail pesanan Anda.</Text>
        <Button asChild colorPalette="teal">
          <Link to="/">Kembali ke Beranda</Link>
        </Button>
      </Container>
    );
  }

  const renderPaymentDetails = () => {
    if (order.paymentMethod === 'transfer') {
      const methods = order.paymentSettings?.payment_methods || [];
      if (methods.length > 0) {
        return (
          <VStack align="start" gap={1}>
            {methods.map((method: any, idx: number) => (
              <Box key={idx}>
                <Text fontSize="sm" fontWeight="bold">{method.bankName} {method.accountNumber}</Text>
                <Text fontSize="sm">a.n {method.accountHolder}</Text>
              </Box>
            ))}
          </VStack>
        );
      }
      return <Text fontSize="sm">Silakan hubungi admin untuk info rekening.</Text>;
    } else {
      return <Text fontSize="sm">{order.paymentSettings?.cash_payment_description || 'Bayar di Sekretariat'}</Text>;
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack gap={6}>
        <Heading color="teal.600">Pesanan Berhasil Dibuat!</Heading>
        <Text>Terima kasih atas pesanan Anda. Silakan simpan konfirmasi ini.</Text>

        <HStack>
          <Button onClick={handleDownload} colorPalette="blue">Unduh sebagai Gambar</Button>
          <Button asChild variant="outline">
            <Link to="/">Kembali ke Beranda</Link>
          </Button>
        </HStack>

        <Box
          ref={printRef}
          bg="#ffffff"
          p={8}
          borderRadius="lg"
          w="full"
          borderWidth="1px"
          borderColor="#e2e8f0"
        >
          <VStack align="stretch" gap={4}>
            <Heading size="md" textAlign="center" mb={2} color="#000000">Pesanan BAM Store {order.orderNumber}</Heading>

            <Box color="#000000">
              <Text fontWeight="bold">Detail Penerima</Text>
              <Text>{order.recipient.name || '-'}</Text>
              <Text>{order.recipient.phone || '-'}</Text>
              <Text>{order.recipient.qobilah || '-'}</Text>
            </Box>

            <Box borderBottomWidth="1px" borderColor="#e2e8f0" />

            <Box color="#000000">
              <Text fontWeight="bold" mb={2}>Item</Text>
              {order.items.map((item, index) => (
                <Box key={index} mb={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="medium">{item.product_name}</Text>
                    <Text>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</Text>
                  </HStack>
                  <Text fontSize="sm" color="#4a5568">
                    {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                    {item.variant_name && ` (${item.variant_name})`}
                  </Text>
                  {item.recipient_name && <Text fontSize="xs" color="#718096">Untuk: {item.recipient_name}</Text>}
                </Box>
              ))}
            </Box>

            <Box borderBottomWidth="1px" borderColor="#e2e8f0" />

            <VStack align="stretch" gap={1} color="#000000">
              <HStack justify="space-between">
                <Text>Subtotal</Text>
                <Text>Rp {order.totalAmount.toLocaleString('id-ID')}</Text>
              </HStack>
              {order.discountAmount > 0 && (
                <HStack justify="space-between" color="#2f855a">
                  <Text>Diskon {order.couponCode ? `(${order.couponCode})` : ''}</Text>
                  <Text>-Rp {order.discountAmount.toLocaleString('id-ID')}</Text>
                </HStack>
              )}
              <HStack justify="space-between" pt={2}>
                <Heading size="sm">Total Pembayaran</Heading>
                <Heading size="sm" color="#2c7a7b">Rp {order.grandTotal.toLocaleString('id-ID')}</Heading>
              </HStack>
            </VStack>

            <Box bg="#f7fafc" p={3} borderRadius="md" mt={2} color="#000000">
              <Text fontWeight="bold" fontSize="sm">Metode Pembayaran: {order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'Tunai'}</Text>
              {renderPaymentDetails()}
            </Box>

            <Text fontSize="xs" textAlign="center" color="#a0aec0" mt={4}>
              Dibuat pada {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default OrderConfirmation;
