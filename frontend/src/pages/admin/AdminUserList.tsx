import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  HStack,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import client from '../../api/client';
import type { User } from '../../types';
import { toaster } from '../../components/ui/toaster';
import DataTable, { type Column } from '../../components/DataTable';
import { useNavigate } from 'react-router-dom';

const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await client.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to fetch users',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await client.delete(`/admin/users/${id}`);
      toaster.create({
        title: 'Success',
        description: 'User deleted successfully',
        type: 'success',
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toaster.create({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        type: 'error',
      });
    }
  };

  const columns: Column<User>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    {
      header: 'Roles',
      cell: (user) => user.roles?.map(r => r.name).join(', ') || 'N/A'
    },
    { 
      header: 'Created At', 
      cell: (user) => new Date(user.created_at).toLocaleDateString() 
    },
    {
      header: 'Actions',
      cell: (user) => (
        <HStack gap={2}>
          <IconButton
            aria-label="Edit User"
            size="sm"
            colorPalette="blue"
            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
          >
            <FiEdit2 />
          </IconButton>
          <IconButton
            aria-label="Delete User"
            size="sm"
            colorPalette="red"
            onClick={() => handleDelete(user.id)}
          >
            <FiTrash2 />
          </IconButton>
        </HStack>
      ),
    },
  ];

  return (
    <Box p={5}>
      <Flex justify="space-between" align="center" mb={5}>
        <Heading size="lg">User Management</Heading>
        <Button colorPalette="blue" onClick={() => navigate('/admin/users/new')}>
          <FiPlus /> Add User
        </Button>
      </Flex>

      <DataTable
        data={users}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search users..."
        isLoading={loading}
      />
    </Box>
  );
};

export default AdminUserList;
