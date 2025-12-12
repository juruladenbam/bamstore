import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Heading, Button, Badge, HStack, NativeSelect, Menu } from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';
import client from '../../api/client';
import type { Order } from '../../types';
import { toaster } from '../../components/ui/toaster';
import DataTable, { type Column } from '../../components/DataTable';

const AdminOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const params = filterStatus ? { status: filterStatus } : {};
    client.get('/admin/orders', { params })
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
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

  const handleBulkStatusUpdate = async (ids: any[], newStatus: string) => {
    try {
      await Promise.all(ids.map(id => client.put(`/admin/orders/${id}/status`, { status: newStatus })));
      toaster.create({
        title: "Status Diperbarui",
        description: `${ids.length} pesanan diperbarui ke ${newStatus}.`,
        type: "success",
      });
      fetchOrders();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Kesalahan",
        description: "Gagal memperbarui beberapa pesanan.",
        type: "error",
      });
    }
  };

  const columns: Column<Order>[] = [
    { 
      header: 'No. Pesanan', 
      cell: (order) => order.order_number || '#' + order.id 
    },
    { header: 'Nama', accessorKey: 'checkout_name' },
    { header: 'Qobilah', accessorKey: 'qobilah' },
    { 
      header: 'Total', 
      cell: (order) => `Rp ${Number(order.total_amount).toLocaleString()}` 
    },
    { 
      header: 'Status', 
      cell: (order) => (
        <Badge colorPalette={order.status === 'paid' ? 'green' : 'gray'}>
          {order.status}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      cell: (order) => (
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
      )
    }
  ];

  const renderBulkActions = (selectedIds: any[]) => {
    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    const firstStatus = selectedOrders[0]?.status;
    const allSameStatus = selectedOrders.every(o => o.status === firstStatus);

    if (!allSameStatus) {
      return (
        <Button size="sm" variant="outline" disabled colorPalette="gray" title="Status harus sama untuk semua item yang dipilih">
          Ubah Status (Status Berbeda)
        </Button>
      );
    }

    return (
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <Button size="sm" variant="outline">
            Ubah Status <FiChevronDown />
          </Button>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="paid" onClick={() => handleBulkStatusUpdate(selectedIds, 'paid')}>
              Tandai Dibayar
            </Menu.Item>
            <Menu.Item value="processed" onClick={() => handleBulkStatusUpdate(selectedIds, 'processed')}>
              Tandai Diproses
            </Menu.Item>
            <Menu.Item value="ready_pickup" onClick={() => handleBulkStatusUpdate(selectedIds, 'ready_pickup')}>
              Siap Diambil
            </Menu.Item>
            <Menu.Item value="completed" onClick={() => handleBulkStatusUpdate(selectedIds, 'completed')}>
              Selesai
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    );
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

      <DataTable 
        data={orders} 
        columns={columns} 
        keyField="id" 
        searchPlaceholder="Cari pesanan..."
        renderBulkActions={renderBulkActions}
        isLoading={loading}
      />
    </Box>
  );
};

export default AdminOrderList;
