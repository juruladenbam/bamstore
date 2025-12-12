import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import type { Vendor } from '../../types';
import { toaster } from '../../components/ui/toaster';
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

const AdminVendorList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteIds, setDeleteIds] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchVendors = () => {
    setLoading(true);
    client.get('/admin/vendors')
      .then(res => {
        setVendors(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleBulkDelete = (ids: any[]) => {
    setDeleteIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(deleteIds.map(id => client.delete(`/admin/vendors/${id}`)));
      toaster.create({
        title: "Vendor Dihapus",
        description: `${deleteIds.length} vendor berhasil dihapus.`,
        type: "success",
      });
      fetchVendors();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Kesalahan",
        description: "Gagal menghapus beberapa vendor.",
        type: "error",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteIds([]);
    }
  };

  const columns: Column<Vendor>[] = [
    { header: 'Nama', accessorKey: 'name' },
    { header: 'Slug', accessorKey: 'slug' },
    { header: 'Info Kontak', accessorKey: 'contact_info' },
    {
      header: 'Aksi',
      cell: (vendor) => (
        <HStack>
          <Button asChild size="xs" variant="outline">
            <Link to={`/admin/vendors/${vendor.slug || vendor.id}/edit`}>Ubah</Link>
          </Button>
          <Button asChild size="xs" variant="outline" colorPalette="blue">
            <Link to={`/admin/vendors/${vendor.id}/payments`}>Pembayaran</Link>
          </Button>
          <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleBulkDelete([vendor.id])}>
            Hapus
          </Button>
        </HStack>
      )
    }
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Vendor</Heading>
        <Button asChild colorPalette="teal">
          <Link to="/admin/vendors/new">Tambah Vendor</Link>
        </Button>
      </HStack>

      <DataTable 
        data={vendors} 
        columns={columns} 
        keyField="id" 
        searchPlaceholder="Cari vendor..."
        onBulkDelete={handleBulkDelete}
        isLoading={loading}
      />

      <DialogRoot open={isDeleteDialogOpen} onOpenChange={(e) => setIsDeleteDialogOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Apakah Anda yakin ingin menghapus {deleteIds.length} vendor yang dipilih? Tindakan ini tidak dapat dibatalkan.
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

export default AdminVendorList;
