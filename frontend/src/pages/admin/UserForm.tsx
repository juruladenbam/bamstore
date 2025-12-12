import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Card,
  Stack,
  Field,
  Text,
} from '@chakra-ui/react';
import { Radio, RadioGroup } from '../../components/ui/radio';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import { toaster } from '../../components/ui/toaster';
import type { Role } from '../../types';

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchRoles = async () => {
    try {
      const response = await client.get('/admin/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await client.get(`/admin/users/${id}`);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        password: '',
        password_confirmation: '',
      });
      if (response.data.roles && response.data.roles.length > 0) {
        setSelectedRole(response.data.roles[0].name);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toaster.create({
        title: 'Error',
        description: 'Failed to fetch user details',
        type: 'error',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
          ...formData,
          roles: selectedRole ? [selectedRole] : [],
      };

      if (isEditMode) {
        // Only send password if it's filled
        const data: any = {
            name: formData.name,
            email: formData.email,
            roles: selectedRole ? [selectedRole] : [],
        };
        if (formData.password) {
            data.password = formData.password;
            data.password_confirmation = formData.password_confirmation;
        }
        await client.put(`/admin/users/${id}`, data);
        toaster.create({
          title: 'Success',
          description: 'User updated successfully',
          type: 'success',
        });
      } else {
        await client.post('/admin/users', payload);
        toaster.create({
          title: 'Success',
          description: 'User created successfully',
          type: 'success',
        });
      }
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.message || 'Failed to save user';
      toaster.create({
        title: 'Error',
        description: message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} maxW="600px" mx="auto">
      <Heading mb={6}>{isEditMode ? 'Edit User' : 'Add New User'}</Heading>
      <Card.Root>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              <Field.Root required>
                <Field.Label>Name</Field.Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                />
              </Field.Root>

              <Field.Root required>
                <Field.Label>Email</Field.Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </Field.Root>

              <Field.Root required={!isEditMode}>
                <Field.Label>{isEditMode ? 'Password (Leave blank to keep current)' : 'Password'}</Field.Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                />
              </Field.Root>

              <Field.Root required={!isEditMode || !!formData.password}>
                <Field.Label>Confirm Password</Field.Label>
                <Input
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm password"
                />
              </Field.Root>

              <Box>
                <Text fontWeight="medium" mb={2}>Role</Text>
                <RadioGroup 
                  value={selectedRole} 
                  onValueChange={(e) => setSelectedRole(e.value || '')}
                >
                  <Stack direction="row" gap={4} wrap="wrap">
                    {roles.map((role) => (
                      <Radio key={role.id} value={role.name}>
                        {role.name}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>

              <Stack direction="row" gap={4} mt={4}>
                <Button type="submit" colorPalette="blue" loading={loading}>
                  {isEditMode ? 'Update User' : 'Create User'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/users')}>
                  Cancel
                </Button>
              </Stack>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default UserForm;
