import React, { useState } from 'react';
import { Box, Container, Heading, Input, Button, VStack, Text, Table, Badge, Card } from '@chakra-ui/react';
import client from '../api/client';
import { toaster } from '../components/ui/toaster';
import { Link } from 'react-router-dom';

interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
  recipient_name?: string;
  variants?: { name: string }[];
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
  checkout_name?: string;
  phone_number?: string;
  qobilah?: string;
  payment_method?: string;
}

const OrderHistory: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleCheck = async () => {
    if (!phoneNumber.trim()) {
      toaster.create({ title: "Masukkan nomor telepon Anda", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await client.post('/history', { phone_number: phoneNumber });
      setOrders(res.data);
      setSearched(true);
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Gagal memuat pesanan", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6} textAlign="center">Cek Pesanan Saya</Heading>

      <Card.Root mb={8}>
        <Card.Body>
          <VStack gap={4}>
            <Text>Masukkan nomor telepon untuk melihat riwayat pesanan Anda.</Text>
            <Input
              placeholder="contoh: 08123456789"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              size="lg"
            />
            <Button
              colorPalette="teal"
              size="lg"
              width="full"
              onClick={handleCheck}
              loading={loading}
            >
              Cek Pesanan
            </Button>
          </VStack>
        </Card.Body>
      </Card.Root>

      {searched && (
        <VStack gap={6} align="stretch">
          <Heading size="md">Ditemukan {orders.length} Pesanan</Heading>

          {orders.map(order => (
            <Box key={order.id} borderWidth="1px" borderRadius="lg" p={4} bg="white" shadow="sm">
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Text fontWeight="bold">#{order.order_number}</Text>
                <Badge colorPalette={order.status === 'paid' ? 'green' : 'yellow'}>{order.status}</Badge>
              </Box>
              <Text fontSize="sm" color="gray.500" mb={4}>
                {new Date(order.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </Text>

              <Table.Root size="sm" mb={4}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Produk</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Jml</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Harga</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {order.items.map(item => (
                    <Table.Row key={item.id}>
                      <Table.Cell>
                        {item.product_name}
                        {item.variant_name && <Text fontSize="xs" color="gray.500">{item.variant_name}</Text>}
                      </Table.Cell>
                      <Table.Cell textAlign="right">{item.quantity}</Table.Cell>
                      <Table.Cell textAlign="right">Rp {Number(item.price).toLocaleString('id-ID')}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              <Box display="flex" justifyContent="space-between" borderTopWidth="1px" pt={2} mb={4}>
                <Text fontWeight="bold">Total</Text>
                <Text fontWeight="bold">Rp {Number(order.total_amount).toLocaleString('id-ID')}</Text>
              </Box>

              <Button
                asChild
                variant="outline"
                size="sm"
                width="full"
              >
                <Link to={`/order-confirmation/${order.order_number}`}>
                  Lihat Detail Pesanan
                </Link>
              </Button>
            </Box>
          ))}

          {orders.length === 0 && (
            <Text textAlign="center" color="gray.500">Tidak ada pesanan untuk nomor telepon ini.</Text>
          )}
        </VStack>
      )}
    </Container>
  );
};

export default OrderHistory;
