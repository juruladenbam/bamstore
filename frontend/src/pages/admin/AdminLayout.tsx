import React, { useEffect, useState }             from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  VStack, 
  Link as ChakraLink, 
  Spinner, 
  Center,
  Icon,
  Text,
  HStack,
  Breadcrumb,
  Button,
  Spacer,
  Avatar
} from '@chakra-ui/react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiBox, 
  FiList, 
  FiUsers, 
  FiFileText, 
  FiDollarSign, 
  FiHome, 
  FiLogOut, 
  FiSettings,
  FiChevronRight,
  FiGrid
} from 'react-icons/fi';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Generate breadcrumbs
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
  
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    
    const text = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return (
      <React.Fragment key={path}>
        <Breadcrumb.Item>
          {isLast ? (
             <Breadcrumb.CurrentLink fontWeight="semibold" color="gray.600">{text}</Breadcrumb.CurrentLink>
          ) : (
             <Breadcrumb.Link asChild color="blue.500">
               <Link to={path}>{text}</Link>
             </Breadcrumb.Link>
          )}
        </Breadcrumb.Item>
        {!isLast && <Breadcrumb.Separator><Icon as={FiChevronRight} color="gray.400" /></Breadcrumb.Separator>}
      </React.Fragment>
    );
  });

  const NavItem = ({ to, icon, children }: { to: string, icon: any, children: React.ReactNode }) => {
    const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
    return (
      <ChakraLink asChild w="full" _hover={{ textDecoration: 'none' }} display="block">
        <Link to={to}>
          <HStack 
            gap={3} 
            py={3}
            px={6}
            bg={isActive ? 'blue.600' : 'transparent'} 
            color={isActive ? 'white' : 'gray.300'}
            _hover={{ bg: 'blue.700', color: 'white' }}
            transition="all 0.2s"
            w="full"
            borderRightWidth={isActive ? "4px" : "0px"}
            borderRightColor="blue.300"
          >
            <Icon as={icon} boxSize={5} />
            <Text fontWeight="medium">{children}</Text>
          </HStack>
        </Link>
      </ChakraLink>
    );
  };

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box w="260px" bg="gray.900" color="white" display="flex" flexDirection="column" position="fixed" h="full" zIndex={10}>
        <Box py={6}>
          <Heading size="md" mb={8} px={6} color="white" letterSpacing="tight">BAM Admin</Heading>
          
          <VStack align="stretch" gap={0} w="full">
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2} px={6}>
              Management
            </Text>
            <NavItem to="/admin/orders" icon={FiList}>Orders</NavItem>
            <NavItem to="/admin/products" icon={FiBox}>Products</NavItem>
            <NavItem to="/admin/categories" icon={FiGrid}>Categories</NavItem>
            <NavItem to="/admin/vendors" icon={FiUsers}>Vendors</NavItem>
            
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mt={6} mb={2} px={6}>
              Reports
            </Text>
            <NavItem to="/admin/reports/vendor" icon={FiFileText}>Vendor Reports</NavItem>
            <NavItem to="/admin/reports/finance" icon={FiDollarSign}>Financial</NavItem>
          </VStack>
        </Box>

        <Spacer />

        <Box py={6} borderTop="1px" borderColor="gray.700" bg="gray.900">
           <VStack align="stretch" gap={0} w="full">
            <NavItem to="/" icon={FiHome}>Back to Store</NavItem>
            <Button 
              w="full" 
              variant="ghost" 
              justifyContent="flex-start" 
              color="red.300" 
              _hover={{ bg: 'red.900', color: 'red.200' }}
              onClick={handleLogout}
              px={6}
              h="auto"
              py={3}
              borderRadius={0}
            >
               <Icon as={FiLogOut} mr={3} boxSize={5} />
               Logout
            </Button>
          </VStack>
          
          {/* User Profile Snippet */}
          <HStack mt={6} px={6} gap={3} align="center">
            <Avatar.Root size="sm" bg="blue.500">
                <Avatar.Fallback>AD</Avatar.Fallback>
            </Avatar.Root>
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="bold">Admin</Text>
              <Text fontSize="xs" color="gray.400">Super User</Text>
            </Box>
            <Icon as={FiSettings} color="gray.400" cursor="pointer" _hover={{ color: 'white' }} />
          </HStack>
        </Box>
      </Box>

      {/* Main Content Wrapper - needs margin left to account for fixed sidebar */}
      <Box flex={1} ml="260px" bg="gray.50" display="flex" flexDirection="column" minH="100vh">
        {/* Header with Breadcrumbs */}
        <Box bg="white" borderBottom="1px" borderColor="gray.200" px={8} py={4} position="sticky" top={0} zIndex={5}>
          <Breadcrumb.Root>
            <Breadcrumb.List>
                {/* Always show Home/Admin root */}
                {breadcrumbItems.length === 0 && (
                <Breadcrumb.Item>
                    <Breadcrumb.CurrentLink fontWeight="semibold" color="gray.600">Dashboard</Breadcrumb.CurrentLink>
                </Breadcrumb.Item>
                )}
                {breadcrumbItems}
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Box>

        {/* Content Area */}
        <Box flex={1} p={8}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default AdminLayout;
