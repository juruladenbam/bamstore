import React from 'react';
import { Box, Flex, Heading, VStack, Link as ChakraLink } from '@chakra-ui/react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box w="250px" bg="gray.800" color="white" p={6}>
        <Heading size="md" mb={8}>BAM Admin</Heading>
        <VStack align="start" gap={4}>
          <ChakraLink asChild color="gray.300" _hover={{ color: 'white' }}>
            <Link to="/admin/products">Products</Link>
          </ChakraLink>
          <ChakraLink asChild color="gray.300" _hover={{ color: 'white' }}>
            <Link to="/admin/categories">Categories</Link>
          </ChakraLink>
          <ChakraLink asChild color="gray.300" _hover={{ color: 'white' }}>
            <Link to="/admin/orders">Orders</Link>
          </ChakraLink>
          <ChakraLink asChild color="gray.300" _hover={{ color: 'white' }}>
            <Link to="/">Back to Store</Link>
          </ChakraLink>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} bg="gray.50" p={8} overflowY="auto">
        <Outlet />
      </Box>
    </Flex>
  );
};

export default AdminLayout;
