import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Heading, Input, Button, VStack, Text, Textarea } from '@chakra-ui/react';
import client from '../../api/client';
import { toaster } from '../../components/ui/toaster';

const VendorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    contact_info: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isEdit) {
      client.get(`/admin/vendors/${id}`).then(res => {
        setFormData({
          name: res.data.name,
          contact_info: res.data.contact_info || '',
          address: res.data.address || ''
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.name.trim()) newErrors.name = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEdit) {
        await client.put(`/admin/vendors/${id}`, formData);
      } else {
        await client.post('/admin/vendors', formData);
      }
      toaster.create({
        title: "Success",
        description: `Vendor ${isEdit ? 'updated' : 'created'} successfully.`,
        type: "success",
      });
      navigate('/admin/vendors');
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Error",
        description: "Failed to save vendor.",
        type: "error",
      });
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm" maxW="container.md">
      <Heading mb={6}>{isEdit ? 'Edit Vendor' : 'New Vendor'}</Heading>
      
      <VStack gap={4} align="stretch">
        <Box>
          <Text mb={1}>Name <Text as="span" color="red.500">*</Text></Text>
          <Input 
            value={formData.name} 
            onChange={e => {
              setFormData({...formData, name: e.target.value});
              if (errors.name) setErrors(prev => ({...prev, name: false}));
            }} 
            borderColor={errors.name ? "red.500" : undefined}
          />
        </Box>

        <Box>
          <Text mb={1}>Contact Info</Text>
          <Input 
            value={formData.contact_info} 
            onChange={e => setFormData({...formData, contact_info: e.target.value})} 
          />
        </Box>

        <Box>
          <Text mb={1}>Address</Text>
          <Textarea 
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})} 
          />
        </Box>

        <Button colorPalette="teal" onClick={handleSubmit}>Save Vendor</Button>
      </VStack>
    </Box>
  );
};

export default VendorForm;
