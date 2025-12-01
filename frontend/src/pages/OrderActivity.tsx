import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, Table, Input, Badge, VStack } from '@chakra-ui/react';
import client from '../api/client';

interface ActivityItem {
  id: number;
  recipient_name: string;
  product_name: string;
  variants: string;
  quantity: number;
  date: string;
  status: string;
}

const OrderActivity: React.FC = () => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await client.get(`/order-activity?search=${search}`);
        setItems(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchActivity();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <Container maxW="container.lg" py={10}>
      <Heading mb={6}>Order Activity</Heading>
      
      <VStack gap={6} align="stretch">
        <Input 
          placeholder="Search by Recipient Name..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          maxW="md"
        />

        <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Recipient</Table.ColumnHeader>
                <Table.ColumnHeader>Product</Table.ColumnHeader>
                <Table.ColumnHeader>Variants</Table.ColumnHeader>
                <Table.ColumnHeader>Qty</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Time</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {items.map(item => (
                <Table.Row key={item.id}>
                  <Table.Cell fontWeight="medium">{item.recipient_name}</Table.Cell>
                  <Table.Cell>{item.product_name}</Table.Cell>
                  <Table.Cell>{item.variants || '-'}</Table.Cell>
                  <Table.Cell>{item.quantity}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={item.status === 'paid' ? 'green' : 'yellow'}>
                      {item.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell color="gray.500" fontSize="sm">{item.date}</Table.Cell>
                </Table.Row>
              ))}
              {items.length === 0 && !loading && (
                <Table.Row>
                  <Table.Cell colSpan={6} textAlign="center">No activity found.</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </VStack>
    </Container>
  );
};

export default OrderActivity;
