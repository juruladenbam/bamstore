import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Heading, Text, Table, Badge, Button, VStack, HStack, Container } from '@chakra-ui/react';
import client from '../../api/client';
import type { Order } from '../../types';

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    client.get(`/admin/orders/${id}`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    await client.put(`/admin/orders/${order.id}/status`, { status: newStatus });
    fetchOrder();
  };

  if (loading) return <Container py={10}><Text>Loading...</Text></Container>;
  if (!order) return <Container py={10}><Text>Order not found</Text></Container>;

  return (
    <Container maxW="container.lg" py={6}>
      <Link to="/admin/orders">
        <Button variant="outline" size="sm" mb={4}>Back to Orders</Button>
      </Link>
      
      <Box bg="white" p={6} borderRadius="lg" shadow="sm" mb={6}>
        <HStack justify="space-between" mb={4}>
          <Heading size="lg">Order {order.order_number || '#' + order.id}</Heading>
          <Badge size="lg" colorPalette={order.status === 'paid' ? 'green' : 'gray'}>
            {order.status.toUpperCase()}
          </Badge>
        </HStack>
        
        <VStack align="start" gap={2} mb={6}>
          <Text><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</Text>
          <Text><strong>Name:</strong> {order.checkout_name}</Text>
          <Text><strong>Phone:</strong> {order.phone_number}</Text>
          <Text><strong>Qobilah:</strong> {order.qobilah}</Text>
          <Text><strong>Payment Method:</strong> {order.payment_method}</Text>
        </VStack>

        <Heading size="md" mb={4}>Items</Heading>
        <Table.Root mb={6}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Product</Table.ColumnHeader>
              <Table.ColumnHeader>SKU</Table.ColumnHeader>
              <Table.ColumnHeader>Variant</Table.ColumnHeader>
              <Table.ColumnHeader>Recipient</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Price</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Qty</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Subtotal</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {order.items?.map(item => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.product?.name}</Table.Cell>
                <Table.Cell>{item.sku || '-'}</Table.Cell>
                <Table.Cell>
                  {item.variants?.map(v => v.name).join(', ') || '-'}
                </Table.Cell>
                <Table.Cell>{item.recipient_name}</Table.Cell>
                <Table.Cell textAlign="end">Rp {Number(item.unit_price_at_order).toLocaleString()}</Table.Cell>
                <Table.Cell textAlign="end">{item.quantity}</Table.Cell>
                <Table.Cell textAlign="end">Rp {(Number(item.unit_price_at_order) * item.quantity).toLocaleString()}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>

        <HStack justify="flex-end" mb={6}>
            <Heading size="md">Total: Rp {Number(order.total_amount).toLocaleString()}</Heading>
        </HStack>

        <Heading size="md" mb={4}>Actions</Heading>
        <HStack>
            {order.status === 'new' && (
                <Button colorPalette="green" onClick={() => updateStatus('paid')}>Mark Paid</Button>
            )}
            {order.status === 'paid' && (
                <Button colorPalette="blue" onClick={() => updateStatus('processed')}>Process Order</Button>
            )}
            {order.status === 'processed' && (
                <Button colorPalette="purple" onClick={() => updateStatus('ready_pickup')}>Ready for Pickup</Button>
            )}
            {order.status === 'ready_pickup' && (
                <Button colorPalette="teal" onClick={() => updateStatus('completed')}>Complete Order</Button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
                <Button colorPalette="red" variant="outline" onClick={() => updateStatus('cancelled')}>Cancel Order</Button>
            )}
        </HStack>
      </Box>
    </Container>
  );
};

export default AdminOrderDetail;
