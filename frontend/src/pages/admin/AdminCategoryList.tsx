import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import type { Category } from '../../types';
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

const AdminCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteIds, setDeleteIds] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    client.get('/admin/categories')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleBulkDelete = (ids: any[]) => {
    setDeleteIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(deleteIds.map(id => client.delete(`/admin/categories/${id}`)));
      toaster.create({
        title: "Kategori Dihapus",
        description: `${deleteIds.length} kategori berhasil dihapus.`,
        type: "success",
      });
      fetchCategories();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Kesalahan",
        description: "Gagal menghapus beberapa kategori. Mungkin masih digunakan.",
        type: "error",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteIds([]);
    }
  };

  const columns: Column<Category>[] = [
    { header: 'Nama', accessorKey: 'name' },
    { header: 'Slug', accessorKey: 'slug' },
    {
      header: 'Aksi',
      cell: (category) => (
        <HStack>
          <Button asChild size="xs" variant="outline">
            <Link to={`/admin/categories/${category.slug || category.id}/edit`}>Ubah</Link>
          </Button>
          <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleBulkDelete([category.id])}>
            Hapus
          </Button>
        </HStack>
      )
    }
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Kategori</Heading>
        <Button asChild colorPalette="teal">
          <Link to="/admin/categories/new">Tambah Kategori</Link>
        </Button>
      </HStack>

      <DataTable 
        data={categories} 
        columns={columns} 
        keyField="id" 
        searchPlaceholder="Cari kategori..."
        onBulkDelete={handleBulkDelete}
        isLoading={loading}
      />

      <DialogRoot open={isDeleteDialogOpen} onOpenChange={(e) => setIsDeleteDialogOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Apakah Anda yakin ingin menghapus {deleteIds.length} kategori yang dipilih? Tindakan ini tidak dapat dibatalkan.
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

export default AdminCategoryList;
