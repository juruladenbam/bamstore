import {
  Box,
  Heading,
  Button,
  Text,
  Badge,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { FiCheck, FiEye } from 'react-icons/fi';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { AdminOutletContext } from './AdminLayout';
import DataTable, { type Column } from '../../components/DataTable';
import type { Notification } from './AdminLayout'; // Import the interface from AdminLayout

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useOutletContext<AdminOutletContext>();
  const navigate = useNavigate();

  const viewOrder = (orderId: number, notificationId: string) => {
    navigate(`/admin/orders/${orderId}`, { state: { from: 'notifications', notificationId } });
  };

  const columns: Column<Notification>[] = [
    {
      header: 'Pesan',
      cell: (notification) => (
        <Box>
          <Text fontWeight="bold">{notification.message}</Text>
          <Text fontSize="sm" color="gray.500">Order #{notification.orderNumber}</Text>
        </Box>
      ),
    },
    {
      header: 'Tanggal',
      cell: (notification) => notification.time.toLocaleString(),
    },
    {
      header: 'Status',
      cell: (notification) => (
        notification.read ? (
          <Badge colorPalette="green">Sudah Dibaca</Badge>
        ) : (
          <Badge colorPalette="red">Belum Dibaca</Badge>
        )
      ),
    },
    {
      header: 'Aksi',
      cell: (notification) => (
        <Flex gap={2}>
          {!notification.read && (
            <IconButton
              aria-label="Tandai sudah dibaca"
              size="sm"
              onClick={() => markAsRead(notification.id)}
              title="Tandai sudah dibaca"
            >
              <FiCheck />
            </IconButton>
          )}
          <IconButton
            aria-label="Lihat Pesanan"
            size="sm"
            colorPalette="blue"
            onClick={() => viewOrder(notification.orderId!, notification.id)}
            title="Lihat Pesanan"
          >
            <FiEye />
          </IconButton>
        </Flex>
      ),
    },
  ];

  const handleBulkMarkAsRead = (ids: string[]) => {
    ids.forEach(id => markAsRead(id));
  };

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">Notifikasi</Heading>
        <Button colorPalette="blue" onClick={markAllAsRead} disabled={notifications.every(n => n.read)}>
          Tandai Semua Dibaca
        </Button>
      </Flex>

      <DataTable
        data={notifications}
        columns={columns}
        keyField="id"
        searchPlaceholder="Cari notifikasi..."
        renderBulkActions={(selectedIds) => (
          <Button
            size="sm"
            colorPalette="blue"
            variant="solid"
            onClick={() => handleBulkMarkAsRead(selectedIds)}
          >
            <FiCheck /> Tandai Dibaca
          </Button>
        )}
      />
    </Box>
  );
};

export default Notifications;
