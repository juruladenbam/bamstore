import React, { useEffect, useState } from 'react';
import { Box, Heading, Table, Button, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import type { Category } from '../../types';
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

const AdminCategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCategories = () => {
    client.get('/admin/categories')
      .then(res => setCategories(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await client.delete(`/admin/categories/${deleteId}`);
      toaster.create({
        title: "Category Deleted",
        type: "success",
      });
      fetchCategories();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Error",
        description: "Failed to delete category. It might be in use.",
        type: "error",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Categories</Heading>
        <Button asChild colorPalette="teal">
          <Link to="/admin/categories/new">Add Category</Link>
        </Button>
      </HStack>

      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Slug</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {categories.map(category => (
              <Table.Row key={category.id}>
                <Table.Cell>{category.name}</Table.Cell>
                <Table.Cell>{category.slug}</Table.Cell>
                <Table.Cell>
                  <HStack>
                    <Button asChild size="xs" variant="outline">
                      <Link to={`/admin/categories/${category.id}/edit`}>Edit</Link>
                    </Button>
                    <Button size="xs" colorPalette="red" variant="ghost" onClick={() => setDeleteId(category.id)}>
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
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Are you sure? This might affect products in this category.
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

export default AdminCategoryList;
