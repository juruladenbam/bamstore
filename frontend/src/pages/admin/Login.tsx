import React, { useState } from 'react';
import { Box, Button, Container, Heading, Input, VStack, Text } from '@chakra-ui/react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { toaster } from '../../components/ui/toaster';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await client.post('/admin/login', { email, password });
      localStorage.setItem('token', res.data.token);
      toaster.create({ title: "Login Successful", type: "success" });
      navigate('/admin/products');
    } catch (error) {
      toaster.create({ title: "Login Failed", description: "Invalid credentials", type: "error" });
    }
  };

  return (
    <Container maxW="sm" py={20}>
      <VStack gap={6}>
        <Heading>Admin Login</Heading>
        <Box w="full">
          <Text mb={1}>Email</Text>
          <Input value={email} onChange={e => setEmail(e.target.value)} />
        </Box>
        <Box w="full">
          <Text mb={1}>Password</Text>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </Box>
        <Button colorPalette="teal" w="full" onClick={handleLogin}>Login</Button>
      </VStack>
    </Container>
  );
};

export default Login;
