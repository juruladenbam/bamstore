import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, Table, Input, Badge, VStack, Text, Flex, Button } from '@chakra-ui/react';
import { FiShare2 } from 'react-icons/fi';
import client from '../api/client';
import ShareActivityDrawer from '../components/ShareActivityDrawer';

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
  const [isShareOpen, setIsShareOpen] = useState(false);

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
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Aktivitas Pesanan</Heading>
        <Button
          colorPalette="blue"
          variant="outline"
          size="sm"
          onClick={() => setIsShareOpen(true)}
        >
          <FiShare2 />
          <Text ml={2}>Share</Text>
        </Button>
      </Flex>

      <VStack gap={6} align="stretch">
        <Input
          placeholder="Cari berdasarkan Nama Penerima..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          maxW="md"
        />

        {/* Desktop Table View */}
        <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden" display={{ base: 'none', md: 'block' }}>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Penerima</Table.ColumnHeader>
                <Table.ColumnHeader>Produk</Table.ColumnHeader>
                <Table.ColumnHeader>Varian</Table.ColumnHeader>
                <Table.ColumnHeader>Jml</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Waktu</Table.ColumnHeader>
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
                  <Table.Cell colSpan={6} textAlign="center">Tidak ada aktivitas.</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>

        {/* Mobile List View */}
        <VStack gap={4} display={{ base: 'flex', md: 'none' }} align="stretch">
          {items.map(item => (
            <Box key={item.id} bg="white" p={4} borderRadius="lg" shadow="sm" borderWidth="1px">
              <Flex justify="space-between" align="start" mb={2}>
                <VStack align="start" gap={0}>
                  <Text fontWeight="bold" fontSize="md">{item.recipient_name}</Text>
                  <Text fontSize="xs" color="gray.500">{item.date}</Text>
                </VStack>
                <Badge colorPalette={item.status === 'paid' ? 'green' : 'yellow'}>
                  {item.status}
                </Badge>
              </Flex>

              <Box mb={2}>
                <Text fontSize="sm" fontWeight="medium">{item.product_name}</Text>
                <Text fontSize="xs" color="gray.600">
                  {item.variants ? `Varian: ${item.variants}` : 'Tanpa Varian'} • Jml: {item.quantity}
                </Text>
              </Box>
            </Box>
          ))}
          {items.length === 0 && !loading && (
            <Text textAlign="center" color="gray.500">Tidak ada aktivitas.</Text>
          )}
        </VStack>

      </VStack>

      {/* Share Drawer */}
      <ShareActivityDrawer
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </Container>
  );
};

export default OrderActivity;

