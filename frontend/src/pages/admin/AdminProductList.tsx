import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, Badge, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import type { Product } from '../../types';
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

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteIds, setDeleteIds] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    client.get('/admin/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleBulkDelete = (ids: any[]) => {
    setDeleteIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(deleteIds.map(id => client.delete(`/admin/products/${id}`)));
      
      toaster.create({
        title: "Produk Dihapus",
        description: `${deleteIds.length} produk berhasil dihapus.`,
        type: "success",
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Kesalahan",
        description: "Gagal menghapus beberapa produk.",
        type: "error",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteIds([]);
    }
  };

  const columns: Column<Product>[] = [
    { header: 'Nama', accessorKey: 'name' },
    { 
      header: 'Status', 
      cell: (product) => (
        <Badge colorPalette={product.status === 'ready' ? 'green' : 'blue'}>
          {product.status}
        </Badge>
      )
    },
    { 
      header: 'Harga', 
      cell: (product) => `Rp ${Number(product.base_price).toLocaleString()}` 
    },
    { 
      header: 'Varian', 
      cell: (product) => `${product.variants?.length || 0} varian` 
    },
    {
      header: 'Aksi',
      cell: (product) => (
        <HStack>
          <Button asChild size="xs" variant="outline">
            <Link to={`/admin/products/${product.slug || product.id}/edit`}>Ubah</Link>
          </Button>
          <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleBulkDelete([product.id])}>
            Hapus
          </Button>
        </HStack>
      )
    }
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Produk</Heading>
        <Button asChild colorPalette="teal">
          <Link to="/admin/products/new">Tambah Produk</Link>
        </Button>
      </HStack>

      <DataTable 
        data={products} 
        columns={columns} 
        keyField="id" 
        searchPlaceholder="Cari produk..."
        onBulkDelete={handleBulkDelete}
        isLoading={loading}
      />

      <DialogRoot open={isDeleteDialogOpen} onOpenChange={(e) => setIsDeleteDialogOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Apakah Anda yakin ingin menghapus {deleteIds.length} produk yang dipilih? Tindakan ini tidak dapat dibatalkan.
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

export default AdminProductList;
