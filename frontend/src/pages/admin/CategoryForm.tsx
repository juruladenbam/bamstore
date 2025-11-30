import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Heading, Input, Button, VStack, Text } from '@chakra-ui/react';
import client from '../../api/client';
import { toaster } from '../../components/ui/toaster';

const CategoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: ''
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isEdit) {
      client.get(`/admin/categories/${id}`).then(res => {
        setFormData({
          name: res.data.name
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setErrors({ name: true });
      toaster.create({
        title: "Validation Error",
        description: "Category Name is required.",
        type: "error",
      });
      return;
    }

    try {
      if (isEdit) {
        await client.put(`/admin/categories/${id}`, { name: formData.name });
      } else {
        await client.post('/admin/categories', { name: formData.name });
      }
      toaster.create({
        title: "Success",
        description: `Category ${isEdit ? 'updated' : 'created'} successfully.`,
        type: "success",
      });
      navigate('/admin/categories');
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Error",
        description: "Failed to save category.",
        type: "error",
      });
    }
  };

  return (
    <Box maxW="500px" bg="white" p={6} borderRadius="lg" shadow="sm">
      <Heading mb={6}>{isEdit ? 'Edit Category' : 'New Category'}</Heading>
      
      <VStack gap={4} align="stretch">
        <Box>
          <Text mb={1}>Name <Text as="span" color="red.500">*</Text></Text>
          <Input 
            value={formData.name} 
            onChange={e => {
              setFormData({...formData, name: e.target.value});
              if (errors.name) setErrors({});
            }} 
            placeholder="e.g. T-Shirts"
            borderColor={errors.name ? "red.500" : undefined}
          />
        </Box>

        <Button colorPalette="teal" onClick={handleSubmit}>Save Category</Button>
      </VStack>
    </Box>
  );
};

export default CategoryForm;
