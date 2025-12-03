import React from 'react';
import { Box, Flex, Heading, Link as ChakraLink, Badge } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { items } = useCart();

  // Calculate total items count
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (isAdmin) return null;

  return (
    <Box bg="teal.600" color="white" py={4} px={8}>
      <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
        <Heading size="lg">
          <Link to="/">BAM Store</Link>
        </Heading>
        <Flex gap={4} align="center">
          <ChakraLink asChild color="white">
            <Link to="/">Products</Link>
          </ChakraLink>
          <ChakraLink asChild color="white" position="relative">
            <Link to="/checkout">
              Cart
              {cartCount > 0 && (
                <Badge 
                  colorPalette="red" 
                  variant="solid" 
                  borderRadius="full" 
                  position="absolute" 
                  top="-8px" 
                  right="-12px"
                  fontSize="xs"
                  px={1.5}
                >
                  {cartCount}
                </Badge>
              )}
            </Link>
          </ChakraLink>
          <ChakraLink asChild color="white">
            <Link to="/activity">Activity</Link>
          </ChakraLink>
          <ChakraLink asChild color="white">
            <Link to="/history">My Orders</Link>
          </ChakraLink>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
