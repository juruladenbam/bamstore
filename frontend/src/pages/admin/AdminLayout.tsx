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
  Avatar,
  Menu,
  Badge,
  IconButton
} from '@chakra-ui/react';
import echoInstance                               from '../../echo'; // Import echoInstance
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
  FiGrid,
  FiBell,
  FiPieChart
} from 'react-icons/fi';
import { toaster }                                from '../../components/ui/toaster';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  orderId?: number;
  orderNumber?: string;
  read: boolean;
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsLoading(false);
      // Request notification permission on mount
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
    }
  }, [navigate]);

  // Chakra UI v3 seems to have removed or changed useToast.
  // Temporarily commenting out toast related code to fix build.
  // const toast = useToast(); 

  useEffect(() => {
    // Listen for new orders
    echoInstance.channel('admin-orders')
      .listen('.NewOrderReceived', (e: any) => { // Prepend dot to bypass namespace
         
        console.log('NewOrderReceived event received:', e);

        const newNotif: Notification = {
            id: Date.now().toString(),
            title: 'Pesanan Baru',
            message: `Pesanan #${e.order_number} - Rp ${e.total_amount.toLocaleString('id-ID')}`,
            time: new Date(),
            orderId: e.id,
            orderNumber: e.order_number,
            read: false
        };

        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Browser Notification
        if (Notification.permission === "granted") {
          new Notification("Pesanan Baru Diterima!", {
            body: `Pesanan #${e.order_number} dari ${e.checkout_name}`,
            icon: "/vite.svg" // Placeholder icon
          });
        }

        // Show In-App Toast
        toaster.create({
          title: 'Pesanan Baru Diterima!',
          description: `Pesanan #${e.order_number} dari ${e.checkout_name} senilai Rp ${e.total_amount.toLocaleString('id-ID')} telah dibuat.`,
          type: 'success',
          duration: 9000,
        });
      });

    return () => {
      echoInstance.leaveChannel('admin-orders');
    };
  }, []); // Removed 'toast' from dependency array as it's commented out

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notif: Notification) => {
      // Mark specific as read logic could go here
      const targetId = notif.orderNumber || notif.orderId;
      if (targetId) {
          navigate(`/admin/orders/${targetId}`);
      }
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
            <NavItem to="/admin" icon={FiPieChart}>Dashboard</NavItem>
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mt={4} mb={2} px={6}>
              Manajemen
            </Text>
            <NavItem to="/admin/orders" icon={FiList}>Pesanan</NavItem>
            <NavItem to="/admin/products" icon={FiBox}>Produk</NavItem>
            <NavItem to="/admin/categories" icon={FiGrid}>Kategori</NavItem>
            <NavItem to="/admin/vendors" icon={FiUsers}>Vendor</NavItem>

            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mt={6} mb={2} px={6}>
              Laporan
            </Text>
            <NavItem to="/admin/reports/vendor" icon={FiFileText}>Laporan Vendor</NavItem>
            <NavItem to="/admin/reports/finance" icon={FiDollarSign}>Keuangan</NavItem>
          </VStack>
        </Box>

        <Spacer />

        <Box py={6} borderTop="1px" borderColor="gray.700" bg="gray.900">
           <VStack align="stretch" gap={0} w="full">
            <NavItem to="/" icon={FiHome}>Kembali ke Toko</NavItem>
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
               Keluar
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
            <Flex justify="space-between" align="center">
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

                {/* Notification Section */}
                <Menu.Root onOpenChange={(open) => open && markAllRead()}>
                    <Menu.Trigger asChild>
                        <Box position="relative" cursor="pointer" mr={4}>
                            <IconButton aria-label="Notifikasi" variant="ghost" size="sm">
                                <Icon as={FiBell} boxSize={5} color="gray.600" />
                            </IconButton>
                            {unreadCount > 0 && (
                                <Badge 
                                    position="absolute" 
                                    top="-2px" 
                                    right="-2px" 
                                    colorPalette="red" 
                                    variant="solid" 
                                    size="xs"
                                    borderRadius="full"
                                    px={1.5}
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </Box>
                    </Menu.Trigger>
                    <Menu.Positioner>
                        <Menu.Content minW="300px" maxH="400px" overflowY="auto">
                             <Menu.Item value="header" disabled closeOnSelect={false} _hover={{ bg: 'transparent' }} cursor="default">
                                <Text fontWeight="bold" fontSize="sm">Notifikasi</Text>
                             </Menu.Item>
                             {notifications.length === 0 ? (
                                 <Menu.Item value="empty" disabled closeOnSelect={false}>
                                     <Text fontSize="sm" color="gray.500" w="full" textAlign="center" py={2}>Tidak ada notifikasi baru</Text>
                                 </Menu.Item>
                             ) : (
                                 notifications.map((notif) => (
                                     <Menu.Item key={notif.id} value={notif.id} onClick={() => handleNotificationClick(notif)}>
                                         <VStack align="start" gap={0} w="full">
                                             <Text fontWeight="medium" fontSize="sm">{notif.title}</Text>
                                             <Text fontSize="xs" color="gray.600">{notif.message}</Text>
                                             <Text fontSize="xs" color="gray.400" alignSelf="end">{notif.time.toLocaleTimeString('id-ID')}</Text>
                                         </VStack>
                                     </Menu.Item>
                                 ))
                             )}
                        </Menu.Content>
                    </Menu.Positioner>
                </Menu.Root>
            </Flex>
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
