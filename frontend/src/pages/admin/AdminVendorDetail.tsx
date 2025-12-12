import React, { useEffect, useState }                                                       from 'react';
import { useParams, Link }                                                                  from 'react-router-dom';
import { Box, Heading, Button, HStack, VStack, Text, Input, NativeSelect, Textarea } from '@chakra-ui/react';
import client                                                                               from '../../api/client';
import type { Vendor }                                                                      from '../../types';
import { toaster }                                                                          from '../../components/ui/toaster';
import DataTable, { type Column } from '../../components/DataTable';
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
  const [deleteIds, setDeleteIds] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
      
      toaster.create({ title: "Pembayaran Dicatat", type: "success" });
      setNewPayment({
        amount: '',
        type: 'dp',
        payment_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      fetchPayments();
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Gagal mencatat pembayaran", type: "error" });
    }
  };

  const handleBulkDelete = (ids: any[]) => {
    setDeleteIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(deleteIds.map(pid => client.delete(`/admin/vendor-payments/${pid}`)));
      toaster.create({
        title: "Pembayaran Dihapus",
        description: `${deleteIds.length} pembayaran berhasil dihapus.`,
        type: "success",
      });
      fetchPayments();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Kesalahan",
        description: "Gagal menghapus beberapa pembayaran.",
        type: "error",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteIds([]);
    }
  };

  const columns: Column<VendorPayment>[] = [
    { 
      header: 'Tanggal', 
      cell: (p) => new Date(p.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    },
    { 
      header: 'Tipe', 
      cell: (p) => p.type.replace('_', ' ').toUpperCase() 
    },
    { 
      header: 'Jumlah', 
      cell: (p) => `Rp ${Number(p.amount).toLocaleString('id-ID')}` 
    },
    { header: 'Catatan', accessorKey: 'notes' },
    {
      header: 'Aksi',
      cell: (p) => (
        <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleBulkDelete([p.id])}>Hapus</Button>
      )
    }
  ];

  if (loading) return <Box p={5}>Loading...</Box>;
  if (!vendor) return <Box p={5}>Vendor not found</Box>;

  return (
    <Box>
      <HStack mb={6}>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/vendors">Kembali</Link>
        </Button>
        <Heading size="lg">{vendor.name}</Heading>
      </HStack>

      <HStack align="start" gap={8} wrap="wrap">
        <Box flex={1} minW="300px" bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="md" mb={4}>Catat Pembayaran Baru</Heading>
          <VStack align="stretch" gap={4}>
            <Box>
              <Text mb={1}>Jumlah (Rp)</Text>
              <Input 
                value={newPayment.amount} 
                onChange={e => {
                  const val = e.target.value;
                  // Allow typing numbers and formatting
                  const num = parseNumber(val);
                  setNewPayment({...newPayment, amount: formatNumber(num)})
                }}
                placeholder="0"
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

        <Box flex={2} minW="300px">
          <DataTable 
            data={payments} 
            columns={columns} 
            keyField="id" 
            title="Riwayat Pembayaran"
            searchPlaceholder="Cari pembayaran..."
            onBulkDelete={handleBulkDelete}
          />
        </Box>
      </HStack>

      <DialogRoot open={isDeleteDialogOpen} onOpenChange={(e) => setIsDeleteDialogOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Apakah Anda yakin ingin menghapus {deleteIds.length} pembayaran yang dipilih? Tindakan ini tidak dapat dibatalkan.
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
