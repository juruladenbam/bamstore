import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Heading, Table, Button, Badge, HStack, NativeSelect } from '@chakra-ui/react';
import client from '../../api/client';
import type { Order } from '../../types';
import { toaster } from '../../components/ui/toaster';

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = () => {
    const params = filterStatus ? { status: filterStatus } : {};
    client.get('/admin/orders', { params })
      .then(res => setOrders(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await client.put(`/admin/orders/${id}/status`, { status: newStatus });
      toaster.create({
        title: "Status Diperbarui",
        description: `Pesanan #${id} ditandai sebagai ${newStatus}.`,
        type: "success",
      });
      fetchOrders();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Kesalahan",
        description: "Gagal memperbarui status.",
        type: "error",
      });
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Pesanan</Heading>
        <Box w="200px">
          <NativeSelect.Root>
            <NativeSelect.Field 
              placeholder="Filter Status" 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="new">Baru</option>
              <option value="paid">Dibayar</option>
              <option value="processed">Diproses</option>
              <option value="ready_pickup">Siap Ambil</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Box>
      </HStack>

      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>No. Pesanan</Table.ColumnHeader>
              <Table.ColumnHeader>Nama</Table.ColumnHeader>
              <Table.ColumnHeader>Qobilah</Table.ColumnHeader>
              <Table.ColumnHeader>Total</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Aksi</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.map(order => (
              <Table.Row key={order.id}>
                <Table.Cell>{order.order_number || '#' + order.id}</Table.Cell>
                <Table.Cell>{order.checkout_name}</Table.Cell>
                <Table.Cell>{order.qobilah}</Table.Cell>
                <Table.Cell>Rp {Number(order.total_amount).toLocaleString()}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={order.status === 'paid' ? 'green' : 'gray'}>
                    {order.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <HStack>
                    <Link to={`/admin/orders/${order.order_number || order.id}`}>
                      <Button size="xs" variant="outline">Lihat</Button>
                    </Link>
                    {order.status === 'new' && (
                      <Button size="xs" colorPalette="green" onClick={() => updateStatus(order.id, 'paid')}>
                        Tandai Dibayar
                      </Button>
                    )}
                    {order.status === 'paid' && (
                      <Button size="xs" colorPalette="blue" onClick={() => updateStatus(order.id, 'processed')}>
                        Proses
                      </Button>
                    )}
                    {order.status === 'processed' && (
                      <Button size="xs" colorPalette="purple" onClick={() => updateStatus(order.id, 'ready_pickup')}>
                        Siap
                      </Button>
                    )}
                    {order.status === 'ready_pickup' && (
                      <Button size="xs" colorPalette="teal" onClick={() => updateStatus(order.id, 'completed')}>
                        Selesai
                      </Button>
                    )}
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};

export default AdminOrderList;
