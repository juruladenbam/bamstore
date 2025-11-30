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
        title: "Product Deleted",
        type: "success",
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Error",
        description: "Failed to delete product.",
        type: "error",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Products</Heading>
        <Button asChild colorPalette="teal">
          <Link to="/admin/products/new">Add Product</Link>
        </Button>
      </HStack>

      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Price</Table.ColumnHeader>
              <Table.ColumnHeader>Variants</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
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
                <Table.Cell>{product.variants?.length || 0} variants</Table.Cell>
                <Table.Cell>
                  <HStack>
                    <Button asChild size="xs" variant="outline">
                      <Link to={`/admin/products/${product.id}/edit`}>Edit</Link>
                    </Button>
                    <Button size="xs" colorPalette="red" variant="ghost" onClick={() => setDeleteId(product.id)}>
                      Delete
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
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button colorPalette="red" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
};

export default AdminProductList;
