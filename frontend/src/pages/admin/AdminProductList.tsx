import React, { useEffect, useState } from 'react';
import { Box, Heading, Table, Button, Badge, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import type { Product } from '../../types';
import { toaster } from '../../components/ui/toaster';
import {
  DialogBody,
  DialogActionTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../../components/ui/dialog"

const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchProducts = () => {
    client.get('/admin/products')
      .then(res => setProducts(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await client.delete(`/admin/products/${deleteId}`);
      toaster.create({
        title: "Produk Dihapus",
        type: "success",
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Kesalahan",
        description: "Gagal menghapus produk.",
        type: "error",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Produk</Heading>
        <Button asChild colorPalette="teal">
          <Link to="/admin/products/new">Tambah Produk</Link>
        </Button>
      </HStack>

      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Nama</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Harga</Table.ColumnHeader>
              <Table.ColumnHeader>Varian</Table.ColumnHeader>
              <Table.ColumnHeader>Aksi</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {products.map(product => (
              <Table.Row key={product.id}>
                <Table.Cell>{product.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={product.status === 'ready' ? 'green' : 'blue'}>
                    {product.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell>Rp {Number(product.base_price).toLocaleString()}</Table.Cell>
                <Table.Cell>{product.variants?.length || 0} varian</Table.Cell>
                <Table.Cell>
                  <HStack>
                    <Button asChild size="xs" variant="outline">
                      <Link to={`/admin/products/${product.slug || product.id}/edit`}>Ubah</Link>
                    </Button>
                    <Button size="xs" colorPalette="red" variant="ghost" onClick={() => setDeleteId(product.id)}>
                      Hapus
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <DialogRoot open={!!deleteId} onOpenChange={(e) => !e.open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Produk</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
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
