import React, { useEffect, useState }                                                       from 'react';
import { useParams, Link }                                                                  from 'react-router-dom';
import { Box, Heading, Table, Button, HStack, VStack, Text, Input, NativeSelect, Textarea } from '@chakra-ui/react';
import client                                                                               from '../../api/client';
import type { Vendor }                                                                      from '../../types';
import { toaster }                                                                          from '../../components/ui/toaster';
import {
  DialogBody,
  DialogActionTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../../components/ui/dialog";

interface VendorPayment {
  id: number;
  amount: number;
  type: 'dp' | 'installment' | 'full_payment';
  payment_date: string;
  notes?: string;
}

const formatNumber = (num: number | string) => {
  if (num === '' || num === null || num === undefined) return '';
  if (num === '-') return '-';
  
  const str = num.toString();
  const isNegative = str.startsWith('-');
  const clean = str.replace(/\D/g, '');
  
  if (clean === '') return isNegative ? '-' : '';
  
  const formatted = Number(clean).toLocaleString('id-ID');
  return isNegative ? '-' + formatted : formatted;
};

const parseNumber = (str: string) => {
  if (!str) return 0;
  if (str === '-') return 0;
  const clean = str.replace(/[^0-9-]/g, '');
  return Number(clean);
};

const AdminVendorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // New Payment Form State
  const [newPayment, setNewPayment] = useState({
    amount: '',
    type: 'dp',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchPayments = async () => {
    try {
      const pRes = await client.get(`/admin/vendor-payments?vendor_id=${id}`);
      setPayments(pRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const vRes = await client.get(`/admin/vendors/${id}`);
        setVendor(vRes.data);
        
        const pRes = await client.get(`/admin/vendor-payments?vendor_id=${id}`);
        setPayments(pRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleAddPayment = async () => {
    const amountValue = parseNumber(newPayment.amount);
    if (!amountValue || amountValue <= 0) {
      toaster.create({ title: "Jumlah Tidak Valid", type: "error" });
      return;
    }

    try {
      await client.post('/admin/vendor-payments', {
        vendor_id: id,
        ...newPayment,
        amount: amountValue
      });
      toaster.create({ title: "Pembayaran Ditambahkan", type: "success" });
      setNewPayment({
        amount: '',
        type: 'dp',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchPayments();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Gagal menambah pembayaran", type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await client.delete(`/admin/vendor-payments/${deleteId}`);
      toaster.create({ title: "Pembayaran Dihapus", type: "success" });
      fetchPayments();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Gagal menghapus pembayaran", type: "error" });
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <Text>Memuat...</Text>;
  if (!vendor) return <Text>Vendor tidak ditemukan</Text>;

  return (
    <Box>
      <HStack mb={6} justify="space-between">
        <Heading>{vendor.name} - Pembayaran</Heading>
        <Button asChild variant="outline">
          <Link to="/admin/vendors">Kembali ke Vendor</Link>
        </Button>
      </HStack>

      <HStack align="start" gap={8} wrap="wrap">
        <Box flex={1} minW="300px" bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Tambah Pembayaran</Heading>
          <VStack gap={4} align="stretch">
            <Box>
              <Text mb={1}>Jumlah</Text>
              <Input 
                value={newPayment.amount} 
                onChange={e => setNewPayment({...newPayment, amount: formatNumber(e.target.value)})} 
              />
            </Box>
            <Box>
              <Text mb={1}>Tipe</Text>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={newPayment.type}
                  onChange={e => setNewPayment({...newPayment, type: e.target.value as VendorPayment['type']})}
                >
                  <option value="dp">Uang Muka (DP)</option>
                  <option value="installment">Cicilan</option>
                  <option value="full_payment">Pelunasan</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>
            <Box>
              <Text mb={1}>Tanggal</Text>
              <Input 
                type="date" 
                value={newPayment.payment_date} 
                onChange={e => setNewPayment({...newPayment, payment_date: e.target.value})} 
              />
            </Box>
            <Box>
              <Text mb={1}>Catatan</Text>
              <Textarea
                value={newPayment.notes}
                onChange={e => setNewPayment({...newPayment, notes: e.target.value})}
                placeholder="contoh: Uang Muka untuk Gamis A Batch 1"
              />
            </Box>
            <Button colorPalette="teal" onClick={handleAddPayment}>Catat Pembayaran</Button>
          </VStack>
        </Box>

        <Box flex={2} minW="300px" bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Tanggal</Table.ColumnHeader>
                <Table.ColumnHeader>Tipe</Table.ColumnHeader>
                <Table.ColumnHeader>Jumlah</Table.ColumnHeader>
                <Table.ColumnHeader>Catatan</Table.ColumnHeader>
                <Table.ColumnHeader>Aksi</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {payments.map(p => (
                <Table.Row key={p.id}>
                  <Table.Cell>{new Date(p.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Table.Cell>
                  <Table.Cell textTransform="uppercase">{p.type.replace('_', ' ')}</Table.Cell>
                  <Table.Cell>Rp {Number(p.amount).toLocaleString('id-ID')}</Table.Cell>
                  <Table.Cell>{p.notes}</Table.Cell>
                  <Table.Cell>
                    <Button size="xs" colorPalette="red" variant="ghost" onClick={() => setDeleteId(p.id)}>X</Button>
                  </Table.Cell>
                </Table.Row>
              ))}
              {payments.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center">Belum ada pembayaran tercatat.</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </Box>
      </HStack>

      <DialogRoot open={!!deleteId} onOpenChange={(e) => !e.open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pembayaran</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Apakah Anda yakin ingin menghapus catatan pembayaran ini?
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Batal</Button>
            </DialogActionTrigger>
            <Button colorPalette="red" onClick={confirmDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default AdminVendorDetail;
