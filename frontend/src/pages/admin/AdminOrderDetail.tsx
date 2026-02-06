import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Heading, Text, Table, Badge, Button, VStack, HStack, Container,
  Input, NativeSelect, RadioGroup, Stack, Separator, IconButton, Collapsible
} from '@chakra-ui/react';
import { FiEdit2, FiX, FiSave, FiTrash2, FiPlus, FiChevronDown, FiChevronUp, FiPrinter } from 'react-icons/fi';
import PrintContainer from '../../components/admin/order-print/PrintContainer';
import client from '../../api/client';
import type { Order, OrderItem, OrderEditLog } from '../../types';
import { toaster } from '../../components/ui/toaster';
import { QOBILAHS } from '../../constants';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
} from '../../components/ui/dialog';
import ProductSelectorModal from '../../components/admin/ProductSelectorModal';

const ORDER_STATUSES = [
  { value: 'new', label: 'Baru', color: 'gray' },
  { value: 'paid', label: 'Dibayar', color: 'green' },
  { value: 'processed', label: 'Diproses', color: 'blue' },
  { value: 'ready_pickup', label: 'Siap Diambil', color: 'purple' },
  { value: 'completed', label: 'Selesai', color: 'teal' },
  { value: 'cancelled', label: 'Dibatalkan', color: 'red' },
];

const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const fromNotifications = location.state?.from === 'notifications';
  const notificationId = location.state?.notificationId;

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Partial<Order>>({});
  const [editedItems, setEditedItems] = useState<Record<number, Partial<OrderItem>>>({});

  // History state
  const [history, setHistory] = useState<OrderEditLog[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Delete confirmation
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Price adjustment resolution
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveReason, setResolveReason] = useState('');

  // Product selector modal
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  // Print state
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
  };

  const handlePrintComplete = () => {
    setIsPrinting(false);
  };

  const fetchOrder = useCallback(() => {
    setLoading(true);
    client.get(`/admin/orders/${id}`)
      .then(res => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const fetchHistory = useCallback(() => {
    if (!id) return;
    setLoadingHistory(true);
    client.get(`/admin/orders/${id}/history`)
      .then(res => {
        setHistory(res.data.logs || []);
        setLoadingHistory(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingHistory(false);
      });
  }, [id]);

  useEffect(() => {
    fetchOrder();
    if (notificationId) {
      client.post(`/admin/notifications/${notificationId}/read`).catch(console.error);
    }
  }, [fetchOrder, notificationId]);

  // Initialize edit state when entering edit mode
  const enterEditMode = () => {
    if (!order) return;
    setEditedOrder({
      checkout_name: order.checkout_name,
      phone_number: order.phone_number,
      qobilah: order.qobilah,
      payment_method: order.payment_method,
      status: order.status,
    });
    const itemEdits: Record<number, Partial<OrderItem>> = {};
    order.items?.forEach(item => {
      itemEdits[item.id] = {
        quantity: item.quantity,
        recipient_name: item.recipient_name,
      };
    });
    setEditedItems(itemEdits);
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
    setEditedOrder({});
    setEditedItems({});
  };

  // Save order info changes
  const saveOrderInfo = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await client.put(`/admin/orders/${order.id}`, editedOrder);
      setOrder(res.data.order);
      toaster.create({
        title: "Berhasil",
        description: "Informasi pesanan berhasil diperbarui",
        type: "success",
      });
      setIsEditMode(false);
      fetchHistory();
    } catch (error: any) {
      toaster.create({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menyimpan perubahan",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update single item
  const saveItemChanges = async (itemId: number) => {
    if (!order) return;
    const changes = editedItems[itemId];
    if (!changes) return;

    setSaving(true);
    try {
      const res = await client.put(`/admin/orders/${order.id}/items/${itemId}`, changes);
      setOrder(res.data.order);
      toaster.create({
        title: "Berhasil",
        description: "Item berhasil diperbarui",
        type: "success",
      });
      fetchHistory();
    } catch (error: any) {
      toaster.create({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal memperbarui item",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Add item
  const addItem = async (data: {
    product_id: number;
    variant_ids: number[];
    quantity: number;
    recipient_name: string;
  }) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await client.post(`/admin/orders/${order.id}/items`, data);
      setOrder(res.data.order);
      toaster.create({
        title: "Berhasil",
        description: "Item berhasil ditambahkan ke pesanan",
        type: "success",
      });
      fetchHistory();
    } catch (error: any) {
      toaster.create({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menambahkan item",
        type: "error",
      });
      throw error; // Re-throw to let the modal handle it
    } finally {
      setSaving(false);
    }
  };

  // Delete item
  const confirmDeleteItem = async () => {
    if (!order || !deleteItemId) return;
    setSaving(true);
    try {
      const res = await client.delete(`/admin/orders/${order.id}/items/${deleteItemId}`);
      setOrder(res.data.order);
      toaster.create({
        title: "Berhasil",
        description: "Item berhasil dihapus",
        type: "success",
      });
      fetchHistory();
    } catch (error: any) {
      toaster.create({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menghapus item",
        type: "error",
      });
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
      setDeleteItemId(null);
    }
  };

  // Resolve price adjustment
  const resolveAdjustment = async (resolution: 'paid' | 'refunded' | 'ignored') => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await client.post(`/admin/orders/${order.id}/resolve-adjustment`, {
        resolution,
        reason: resolution === 'ignored' ? resolveReason : null,
      });
      setOrder(res.data.order);
      toaster.create({
        title: "Berhasil",
        description: "Penyesuaian harga telah diselesaikan",
        type: "success",
      });
      fetchHistory();
    } catch (error: any) {
      toaster.create({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menyelesaikan penyesuaian",
        type: "error",
      });
    } finally {
      setSaving(false);
      setResolveDialogOpen(false);
      setResolveReason('');
    }
  };

  // Quick status update (same as before, but uses new API)
  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    setSaving(true);
    try {
      const res = await client.put(`/admin/orders/${order.id}`, { status: newStatus });
      setOrder(res.data.order);
      toaster.create({
        title: "Berhasil",
        description: `Status berubah menjadi ${newStatus}`,
        type: "success",
      });
      fetchHistory();
    } catch (error: any) {
      toaster.create({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal memperbarui status",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status)?.color || 'gray';
  };

  if (loading) return <Container py={10}><Text>Memuat...</Text></Container>;
  if (!order) return <Container py={10}><Text>Pesanan tidak ditemukan</Text></Container>;

  return (
    <Container maxW="container.lg" py={6}>
      {/* Back button */}
      {fromNotifications ? (
        <Button variant="outline" size="sm" mb={4} onClick={() => navigate('/admin/notifications')}>
          Kembali ke Notifikasi
        </Button>
      ) : (
        <Link to="/admin/orders">
          <Button variant="outline" size="sm" mb={4}>Kembali ke Pesanan</Button>
        </Link>
      )}

      {/* Price Adjustment Banner */}
      {order.price_adjustment_status && order.price_adjustment_status !== 'none' && (
        <Box
          bg={order.price_adjustment_status === 'underpaid' ? 'orange.50' : 'blue.50'}
          borderWidth="1px"
          borderColor={order.price_adjustment_status === 'underpaid' ? 'orange.300' : 'blue.300'}
          borderRadius="lg"
          p={4}
          mb={4}
        >
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <VStack align="start" gap={0}>
              <Text fontWeight="bold" color={order.price_adjustment_status === 'underpaid' ? 'orange.700' : 'blue.700'}>
                ⚠️ Penyesuaian Harga Diperlukan
              </Text>
              <Text fontSize="sm">
                {order.price_adjustment_status === 'underpaid'
                  ? `Customer perlu membayar tambahan: Rp ${Number(order.price_adjustment_amount).toLocaleString()}`
                  : `Customer kelebihan bayar: Rp ${Number(order.price_adjustment_amount).toLocaleString()}`
                }
              </Text>
            </VStack>
            <HStack>
              {order.price_adjustment_status === 'underpaid' ? (
                <Button size="sm" colorPalette="green" onClick={() => resolveAdjustment('paid')}>
                  Tandai Sudah Bayar
                </Button>
              ) : (
                <Button size="sm" colorPalette="blue" onClick={() => resolveAdjustment('refunded')}>
                  Tandai Sudah Refund
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setResolveDialogOpen(true)}>
                Abaikan
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}

      <Box bg="white" p={6} borderRadius="lg" shadow="sm" mb={6}>
        {/* Header */}
        <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
          <HStack gap={3}>
            <Heading size="lg">Pesanan {order.order_number || '#' + order.id}</Heading>
            {isEditMode ? (
              <NativeSelect.Root size="sm" w="150px">
                <NativeSelect.Field
                  value={editedOrder.status || order.status}
                  onChange={e => setEditedOrder({ ...editedOrder, status: e.target.value })}
                >
                  {ORDER_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </NativeSelect.Field>
              </NativeSelect.Root>
            ) : (
              <Badge size="lg" colorPalette={getStatusColor(order.status)}>
                {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status.toUpperCase()}
              </Badge>
            )}
          </HStack>
          <HStack>
            {!isEditMode && (
              <Button size="sm" colorPalette="blue" variant="outline" onClick={handlePrint} loading={isPrinting}>
                <FiPrinter /> Cetak
              </Button>
            )}
            {isEditMode ? (
              <>
                <Button size="sm" colorPalette="green" onClick={saveOrderInfo} loading={saving}>
                  <FiSave /> Simpan
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEditMode}>
                  <FiX /> Batal
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={enterEditMode}>
                <FiEdit2 /> Edit
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Customer Info */}
        <Box mb={6} p={4} bg="gray.50" borderRadius="md">
          <Heading size="sm" mb={3}>Info Pemesan</Heading>
          {isEditMode ? (
            <VStack align="stretch" gap={3}>
              <HStack>
                <Text w="120px" fontWeight="medium">Nama:</Text>
                <Input
                  size="sm"
                  value={editedOrder.checkout_name || ''}
                  onChange={e => setEditedOrder({ ...editedOrder, checkout_name: e.target.value })}
                />
              </HStack>
              <HStack>
                <Text w="120px" fontWeight="medium">Telepon:</Text>
                <Input
                  size="sm"
                  value={editedOrder.phone_number || ''}
                  onChange={e => setEditedOrder({ ...editedOrder, phone_number: e.target.value })}
                />
              </HStack>
              <HStack>
                <Text w="120px" fontWeight="medium">Qobilah:</Text>
                <NativeSelect.Root size="sm" flex={1}>
                  <NativeSelect.Field
                    value={editedOrder.qobilah || ''}
                    onChange={e => setEditedOrder({ ...editedOrder, qobilah: e.target.value })}
                  >
                    {QOBILAHS.map(q => <option key={q} value={q}>{q}</option>)}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </HStack>
              <HStack>
                <Text w="120px" fontWeight="medium">Pembayaran:</Text>
                <RadioGroup.Root
                  value={editedOrder.payment_method || 'transfer'}
                  onValueChange={e => setEditedOrder({ ...editedOrder, payment_method: e.value as 'transfer' | 'cash' })}
                >
                  <Stack direction="row" gap={4}>
                    <RadioGroup.Item value="transfer">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemControl />
                      <RadioGroup.ItemText>Transfer</RadioGroup.ItemText>
                    </RadioGroup.Item>
                    <RadioGroup.Item value="cash">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemControl />
                      <RadioGroup.ItemText>Tunai</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  </Stack>
                </RadioGroup.Root>
              </HStack>
            </VStack>
          ) : (
            <VStack align="start" gap={1}>
              <Text><strong>Tanggal:</strong> {new Date(order.created_at).toLocaleString('id-ID')}</Text>
              <Text><strong>Nama:</strong> {order.checkout_name}</Text>
              <Text><strong>Telepon:</strong> {order.phone_number}</Text>
              <Text><strong>Qobilah:</strong> {order.qobilah}</Text>
              <Text><strong>Metode Pembayaran:</strong> {order.payment_method === 'transfer' ? 'Transfer Bank' : 'Tunai'}</Text>
              {order.last_edited_at && (
                <Text fontSize="sm" color="gray.500">
                  Terakhir diedit: {new Date(order.last_edited_at).toLocaleString('id-ID')}
                  {order.last_editor && ` oleh ${order.last_editor.name}`}
                </Text>
              )}
            </VStack>
          )}
        </Box>

        {/* Items Section */}
        <HStack justify="space-between" mb={3}>
          <Heading size="md">Item Pesanan</Heading>
          {isEditMode && (
            <Button size="sm" colorPalette="teal" variant="outline" onClick={() => setIsProductSelectorOpen(true)}>
              <FiPlus /> Tambah Item
            </Button>
          )}
        </HStack>

        <Table.Root mb={6}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Produk</Table.ColumnHeader>
              <Table.ColumnHeader>SKU</Table.ColumnHeader>
              <Table.ColumnHeader>Varian</Table.ColumnHeader>
              <Table.ColumnHeader>Penerima</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Harga</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="center">Jml</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Subtotal</Table.ColumnHeader>
              {isEditMode && <Table.ColumnHeader textAlign="center">Aksi</Table.ColumnHeader>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {order.items?.map(item => {
              const itemEdit = editedItems[item.id] || {};
              const currentQty = isEditMode ? (itemEdit.quantity ?? item.quantity) : item.quantity;
              const currentRecipient = isEditMode ? (itemEdit.recipient_name ?? item.recipient_name) : item.recipient_name;

              return (
                <Table.Row key={item.id}>
                  <Table.Cell>{item.product?.name || 'Unknown'}</Table.Cell>
                  <Table.Cell>{item.sku || '-'}</Table.Cell>
                  <Table.Cell>{item.variants?.map(v => v.name).join(', ') || '-'}</Table.Cell>
                  <Table.Cell>
                    {isEditMode ? (
                      <Input
                        size="sm"
                        w="120px"
                        value={currentRecipient}
                        onChange={e => setEditedItems({
                          ...editedItems,
                          [item.id]: { ...itemEdit, recipient_name: e.target.value }
                        })}
                        onBlur={() => saveItemChanges(item.id)}
                      />
                    ) : (
                      currentRecipient
                    )}
                  </Table.Cell>
                  <Table.Cell textAlign="end">Rp {Number(item.unit_price_at_order).toLocaleString()}</Table.Cell>
                  <Table.Cell textAlign="center">
                    {isEditMode ? (
                      <Input
                        size="sm"
                        type="number"
                        w="60px"
                        min={1}
                        textAlign="center"
                        value={currentQty}
                        onChange={e => setEditedItems({
                          ...editedItems,
                          [item.id]: { ...itemEdit, quantity: parseInt(e.target.value) || 1 }
                        })}
                        onBlur={() => saveItemChanges(item.id)}
                      />
                    ) : (
                      currentQty
                    )}
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    Rp {(Number(item.unit_price_at_order) * currentQty).toLocaleString()}
                  </Table.Cell>
                  {isEditMode && (
                    <Table.Cell textAlign="center">
                      <IconButton
                        aria-label="Hapus item"
                        size="sm"
                        colorPalette="red"
                        variant="ghost"
                        onClick={() => {
                          setDeleteItemId(item.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Table.Cell>
                  )}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>

        {/* Totals */}
        <VStack align="flex-end" gap={1} mb={6}>
          <Text>Subtotal: Rp {Number(order.total_amount).toLocaleString()}</Text>
          {Number(order.discount_amount) > 0 && (
            <Text color="red.500">
              Diskon {order.coupon_code ? `(${order.coupon_code})` : ''}: -Rp {Number(order.discount_amount).toLocaleString()}
            </Text>
          )}
          <Separator />
          <Heading size="md">Total Akhir: Rp {Number(order.grand_total || order.total_amount).toLocaleString()}</Heading>
        </VStack>

        {/* Quick Actions (only when not in edit mode) */}
        {!isEditMode && (
          <>
            <Heading size="md" mb={4}>Aksi Cepat</Heading>
            <HStack flexWrap="wrap" gap={2}>
              {order.status === 'new' && (
                <Button colorPalette="green" onClick={() => updateStatus('paid')} loading={saving}>
                  Tandai Dibayar
                </Button>
              )}
              {order.status === 'paid' && (
                <Button colorPalette="blue" onClick={() => updateStatus('processed')} loading={saving}>
                  Proses Pesanan
                </Button>
              )}
              {order.status === 'processed' && (
                <Button colorPalette="purple" onClick={() => updateStatus('ready_pickup')} loading={saving}>
                  Siap Diambil
                </Button>
              )}
              {order.status === 'ready_pickup' && (
                <Button colorPalette="teal" onClick={() => updateStatus('completed')} loading={saving}>
                  Selesaikan Pesanan
                </Button>
              )}
              {order.status !== 'cancelled' && order.status !== 'completed' && (
                <Button colorPalette="red" variant="outline" onClick={() => updateStatus('cancelled')} loading={saving}>
                  Batalkan Pesanan
                </Button>
              )}
            </HStack>
          </>
        )}
      </Box>

      {/* Edit History Section */}
      <Box bg="white" p={6} borderRadius="lg" shadow="sm">
        <Collapsible.Root open={historyOpen} onOpenChange={(e) => {
          setHistoryOpen(e.open);
          if (e.open && history.length === 0) {
            fetchHistory();
          }
        }}>
          <Collapsible.Trigger asChild>
            <Button variant="ghost" w="full" justifyContent="space-between">
              <HStack>
                <Text fontWeight="bold">Riwayat Perubahan</Text>
                {history.length > 0 && <Badge size="sm">{history.length}</Badge>}
              </HStack>
              {historyOpen ? <FiChevronUp /> : <FiChevronDown />}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Box pt={4}>
              {loadingHistory ? (
                <Text color="gray.500">Memuat riwayat...</Text>
              ) : history.length === 0 ? (
                <Text color="gray.500">Belum ada perubahan tercatat</Text>
              ) : (
                <VStack align="stretch" gap={2}>
                  {history.map(log => (
                    <Box key={log.id} p={3} bg="gray.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="blue.400">
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="medium">{log.description}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(log.created_at).toLocaleString('id-ID')}
                        </Text>
                      </HStack>
                      {log.user && (
                        <Text fontSize="xs" color="gray.500">oleh {log.user.name}</Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </Box>

      {/* Delete Item Confirmation Dialog */}
      <DialogRoot open={isDeleteDialogOpen} onOpenChange={(e) => setIsDeleteDialogOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Item</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>Apakah Anda yakin ingin menghapus item ini? Stock akan dikembalikan.</Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Batal</Button>
            </DialogActionTrigger>
            <Button colorPalette="red" onClick={confirmDeleteItem} loading={saving}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Ignore Adjustment Dialog */}
      <DialogRoot open={resolveDialogOpen} onOpenChange={(e) => setResolveDialogOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abaikan Penyesuaian Harga</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack align="stretch" gap={3}>
              <Text>Masukkan alasan mengapa penyesuaian diabaikan:</Text>
              <Input
                placeholder="Alasan (opsional)"
                value={resolveReason}
                onChange={e => setResolveReason(e.target.value)}
              />
            </VStack>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Batal</Button>
            </DialogActionTrigger>
            <Button colorPalette="orange" onClick={() => resolveAdjustment('ignored')} loading={saving}>
              Abaikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        onAddItem={addItem}
      />

      {/* Print Container */}
      {isPrinting && order && (
        <PrintContainer
          orders={[order]}
          title={`Pesanan ${order.order_number || '#' + order.id}`}
          onPrintComplete={handlePrintComplete}
        />
      )}
    </Container>
  );
};

export default AdminOrderDetail;
