import React from 'react';
import { Box, Flex, Heading, Link as ChakraLink, Badge, Input, Icon, VStack, Text } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaHome, FaBoxOpen, FaClipboardList, FaHistory, FaShoppingCart, FaSearch } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { items } = useCart();

  // Calculate total items count
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (isAdmin) return null;

  return (
    <>
      {/* Top Navbar - Fixed */}
      <Box 
        bg="teal.600" 
        color="white" 
        py={3} 
        px={{ base: 4, md: 8 }} 
        position="sticky" 
        top="0" 
        zIndex="1000" 
        shadow="md"
      >
        <Flex justify="space-between" align="center" maxW="container.xl" mx="auto" gap={4}>
          {/* Brand */}
          <Heading size={{ base: "md", md: "lg" }} whiteSpace="nowrap">
            <Link to="/">BAM Store</Link>
          </Heading>

          {/* Search Bar - Center */}
          <Box flex="1" maxW="600px" mx={{ base: 2, md: 8 }}>
             <Box position="relative" width="full">
                <Input 
                  placeholder="Search products..." 
                  bg="white" 
                  color="gray.800" 
                  borderRadius="md" 
                  size={{ base: "sm", md: "md" }}
                  _placeholder={{ color: 'gray.500' }}
                  paddingRight="2.5rem"
                />
                <Box position="absolute" right="3" top="50%" transform="translateY(-50%)" color="gray.500">
                    <FaSearch />
                </Box>
             </Box>
          </Box>

          {/* Desktop Menu */}
          <Flex gap={6} align="center" display={{ base: 'none', md: 'flex' }}>
            <ChakraLink asChild color="white" fontWeight="medium">
              <Link to="/">Products</Link>
            </ChakraLink>
            
            <ChakraLink asChild color="white" position="relative" fontWeight="medium">
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

            <ChakraLink asChild color="white" fontWeight="medium">
              <Link to="/activity">Activity</Link>
            </ChakraLink>
            
            <ChakraLink asChild color="white" fontWeight="medium">
              <Link to="/history">My Orders</Link>
            </ChakraLink>
          </Flex>

          {/* Mobile Cart Icon (Top Right) */}
          <Flex display={{ base: 'flex', md: 'none' }} align="center">
             <ChakraLink asChild color="white" position="relative">
                <Link to="/checkout">
                  <Icon fontSize="xl">
                    <FaShoppingCart />
                  </Icon>
                  {cartCount > 0 && (
                    <Badge 
                      colorPalette="red" 
                      variant="solid" 
                      borderRadius="full" 
                      position="absolute" 
                      top="-8px" 
                      right="-8px"
                      fontSize="xs"
                      px={1}
                      minW="16px"
                      textAlign="center"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Link>
             </ChakraLink>
          </Flex>
        </Flex>
      </Box>

      {/* Bottom Navigation - Mobile Only */}
      <Box 
        position="fixed" 
        bottom="0" 
        left="0" 
        right="0" 
        bg="white" 
        borderTopWidth="1px" 
        borderColor="gray.200" 
        py={2} 
        px={4} 
        display={{ base: 'block', md: 'none' }} 
        zIndex="1000"
        boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      >
        <Flex justify="space-around" align="center">
          <NavItem to="/" icon={FaHome} label="Home" isActive={location.pathname === '/'} />
          <NavItem to="/" icon={FaBoxOpen} label="Products" isActive={location.pathname === '/products'} />
          <NavItem to="/activity" icon={FaClipboardList} label="Activity" isActive={location.pathname === '/activity'} />
          <NavItem to="/history" icon={FaHistory} label="My Orders" isActive={location.pathname === '/history'} />
        </Flex>
      </Box>
      
      {/* Spacer for Bottom Nav on Mobile to prevent content being hidden */}
      <Box height={{ base: "60px", md: "0" }} display={{ base: 'block', md: 'none' }} />
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <ChakraLink asChild _hover={{ textDecoration: 'none' }}>
      <Link to={to}>
        <VStack gap={0} color={isActive ? "teal.600" : "gray.500"}>
          <Icon fontSize="xl" as={icon} />
          <Text fontSize="xs" fontWeight={isActive ? "bold" : "normal"}>{label}</Text>
        </VStack>
      </Link>
    </ChakraLink>
  );
};

export default Navbar;
