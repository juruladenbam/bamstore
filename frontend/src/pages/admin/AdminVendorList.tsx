import React, { useEffect, useState } from 'react';
import { Box, Heading, Table, Button, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import type { Vendor } from '../../types';
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

const AdminVendorList: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchVendors = () => {
    client.get('/admin/vendors')
      .then(res => setVendors(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await client.delete(`/admin/vendors/${deleteId}`);
      toaster.create({
        title: "Vendor Deleted",
        type: "success",
      });
      fetchVendors();
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Error",
        description: "Failed to delete vendor.",
        type: "error",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading>Vendors</Heading>
        <Button asChild colorPalette="teal">
          <Link to="/admin/vendors/new">Add Vendor</Link>
        </Button>
      </HStack>

      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Slug</Table.ColumnHeader>
              <Table.ColumnHeader>Contact Info</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {vendors.map(vendor => (
              <Table.Row key={vendor.id}>
                <Table.Cell>{vendor.name}</Table.Cell>
                <Table.Cell>{vendor.slug}</Table.Cell>
                <Table.Cell>{vendor.contact_info}</Table.Cell>
                <Table.Cell>
                  <HStack>
                    <Button asChild size="xs" variant="outline">
                      <Link to={`/admin/vendors/${vendor.slug || vendor.id}/edit`}>Edit</Link>
                    </Button>
                    <Button asChild size="xs" variant="outline" colorPalette="blue">
                      <Link to={`/admin/vendors/${vendor.id}/payments`}>Payments</Link>
                    </Button>
                    <Button size="xs" colorPalette="red" variant="ghost" onClick={() => setDeleteId(vendor.id)}>
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
            <DialogTitle>Delete Vendor</DialogTitle>
          </DialogHeader>
          <DialogBody>
            Are you sure? This will delete all associated products and payments.
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

export default AdminVendorList;
