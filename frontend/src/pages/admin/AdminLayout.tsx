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
  IconButton,
  useBreakpointValue
} from '@chakra-ui/react';
import echoInstance                               from '../../echo'; // Import echoInstance
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import client                                     from '../../api/client';
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
  FiChevronLeft,
  FiGrid,
  FiBell,
  FiPieChart,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { toaster }                                from '../../components/ui/toaster';
import type { Notification as ApiNotification }   from '../../types';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  orderId?: number;
  orderNumber?: string;
  read: boolean;
  raw?: ApiNotification; // Keep raw data for full view
}

export interface AdminOutletContext {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileOpen, setMobileOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const fetchNotifications = () => {
      client.get('/admin/notifications').then(response => {
          const backendNotifications = response.data.data;
          const formattedNotifications = backendNotifications.map((n: any) => ({
            id: n.id,
            title: 'Pesanan Baru',
            message: n.data.message,
            time: new Date(n.created_at),
            orderId: n.data.order_id,
            orderNumber: n.data.order_number,
            read: !!n.read_at,
            raw: n
          }));
          setNotifications(formattedNotifications);
          setUnreadCount(formattedNotifications.filter((n: any) => !n.read).length);
      }).catch(err => console.error(err));
  };

  const markAsRead = (id: string) => {
      client.post(`/admin/notifications/${id}/read`).catch(console.error);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
      client.post('/admin/notifications/read-all').catch(console.error);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
  };

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

      fetchNotifications();
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
        
        // Refresh full list to ensure consistency
        fetchNotifications();

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

  // const markAllRead = () => {
  //   client.post('/admin/notifications/read-all').catch(console.error);
  //   setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  //   setUnreadCount(0);
  // };

  const handleNotificationClick = (notif: Notification) => {
      // Mark specific as read logic could go here
      const targetId = notif.orderNumber || notif.orderId;
      if (targetId) {
          navigate(`/admin/orders/${targetId}`, { state: { from: 'notifications', notificationId: notif.id } });
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

    // Define paths that should not be clickable (grouping paths)
    const nonClickablePaths = ['/admin/reports'];
    const isNonClickable = nonClickablePaths.includes(path);

    return (
      <React.Fragment key={path}>
        <Breadcrumb.Item>
          {isLast ? (
             <Breadcrumb.CurrentLink fontWeight="semibold" color="gray.600">{text}</Breadcrumb.CurrentLink>
          ) : isNonClickable ? (
             <Text color="gray.500">{text}</Text>
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

  const NavItem = ({ to, icon, children, badge }: { to: string, icon: any, children: React.ReactNode, badge?: number }) => {
    const isActive = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
    const showText = !isSidebarCollapsed || (isMobile && isMobileOpen);

    return (
      <ChakraLink asChild w="full" _hover={{ textDecoration: 'none' }} display="block">
        <Link to={to} onClick={() => isMobile && setMobileOpen(false)}>
          <HStack 
            gap={3} 
            py={3}
            px={showText ? 6 : 0}
            justify={showText ? "flex-start" : "center"}
            bg={isActive ? 'blue.600' : 'transparent'} 
            color={isActive ? 'white' : 'gray.300'}
            _hover={{ bg: 'blue.700', color: 'white' }}
            transition="all 0.2s"
            w="full"
            borderRightWidth={isActive ? "4px" : "0px"}
            borderRightColor="blue.300"
            title={!showText && typeof children === 'string' ? children : undefined}
          >
            <Icon as={icon} boxSize={5} />
            {showText && <Text fontWeight="medium">{children}</Text>}
            {badge !== undefined && badge > 0 && showText && (
                <Badge colorPalette="red" variant="solid" size="xs" borderRadius="full" ml="auto">
                    {badge}
                </Badge>
            )}
          </HStack>
        </Link>
      </ChakraLink>
    );
  };

  const sidebarWidth = isSidebarCollapsed ? "80px" : "260px";

  return (
    <Flex minH="100vh">
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="full"
          h="full"
          bg="black/50"
          zIndex={15}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Box 
        w={isMobile ? "260px" : sidebarWidth} 
        bg="gray.900" 
        color="white" 
        display="flex" 
        flexDirection="column" 
        position="fixed" 
        h="full" 
        zIndex={20}
        transition="width 0.2s, transform 0.2s"
        transform={{
            base: isMobileOpen ? "translateX(0)" : "translateX(-100%)",
            lg: "translateX(0)"
        }}
      >
        <Box py={6}>
          <Flex justify="space-between" align="center" mb={8} px={isSidebarCollapsed && !isMobile ? 2 : 6}>
             {(!isSidebarCollapsed || isMobile) && <Heading size="md" color="white" letterSpacing="tight">BAM Admin</Heading>}
             
             <IconButton
                aria-label="Collapse Sidebar"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white", bg: "gray.800" }}
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                size="sm"
                display={{ base: "none", lg: "flex" }}
            >
                <Icon as={isSidebarCollapsed ? FiChevronRight : FiChevronLeft} />
            </IconButton>
            
            {isMobile && (
                 <IconButton
                    aria-label="Close Sidebar"
                    variant="ghost"
                    color="gray.400"
                    onClick={() => setMobileOpen(false)}
                    size="sm"
                >
                    <Icon as={FiX} />
                </IconButton>
            )}
          </Flex>
          
          <VStack align="stretch" gap={0} w="full">
            <NavItem to="/admin" icon={FiPieChart}>Dashboard</NavItem>
            {(!isSidebarCollapsed || isMobile) && (
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mt={4} mb={2} px={6}>
              Manajemen
            </Text>
            )}
            <NavItem to="/admin/orders" icon={FiList}>Pesanan</NavItem>
            <NavItem to="/admin/products" icon={FiBox}>Produk</NavItem>
            <NavItem to="/admin/categories" icon={FiGrid}>Kategori</NavItem>
            <NavItem to="/admin/vendors" icon={FiUsers}>Vendor</NavItem>

            {(!isSidebarCollapsed || isMobile) && (
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mt={6} mb={2} px={6}>
              Laporan
            </Text>
            )}
            <NavItem to="/admin/reports/vendor" icon={FiFileText}>Laporan Vendor</NavItem>
            <NavItem to="/admin/reports/finance" icon={FiDollarSign}>Keuangan</NavItem>
            {(!isSidebarCollapsed || isMobile) && (
            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mt={6} mb={2} px={6}>
              Lainnya
            </Text>
            )}
            <NavItem to="/admin/notifications" icon={FiBell} badge={unreadCount}>Notifikasi</NavItem>
            <NavItem to="/admin/settings" icon={FiSettings}>Pengaturan</NavItem>
          </VStack>
        </Box>

        <Spacer />

        <Box py={6} borderTop="1px" borderColor="gray.700" bg="gray.900">
           <VStack align="stretch" gap={0} w="full">
            <NavItem to="/" icon={FiHome}>Kembali ke Toko</NavItem>
            <Button
              w="full"
              variant="ghost"
              justifyContent={(!isSidebarCollapsed || isMobile) ? "flex-start" : "center"}
              color="red.300"
              _hover={{ bg: 'red.900', color: 'red.200' }}
              onClick={handleLogout}
              px={(!isSidebarCollapsed || isMobile) ? 6 : 0}
              h="auto"
              py={3}
              borderRadius={0}
              title={(!isSidebarCollapsed || isMobile) ? undefined : "Keluar"}
            >
               <Icon as={FiLogOut} mr={(!isSidebarCollapsed || isMobile) ? 3 : 0} boxSize={5} />
               {(!isSidebarCollapsed || isMobile) && "Keluar"}
            </Button>
          </VStack>
          
          {/* User Profile Snippet */}
          <HStack mt={6} px={(!isSidebarCollapsed || isMobile) ? 6 : 2} gap={3} align="center" justify={(!isSidebarCollapsed || isMobile) ? "flex-start" : "center"}>
            <Avatar.Root size="sm" bg="blue.500">
                <Avatar.Fallback>AD</Avatar.Fallback>
            </Avatar.Root>
            {(!isSidebarCollapsed || isMobile) && (
                <>
                <Box flex={1}>
                <Text fontSize="sm" fontWeight="bold">Admin</Text>
                <Text fontSize="xs" color="gray.400">Super User</Text>
                </Box>
                <Link to="/admin/settings">
                <Icon as={FiSettings} color="gray.400" cursor="pointer" _hover={{ color: 'white' }} />
                </Link>
                </>
            )}
          </HStack>
        </Box>
      </Box>

      {/* Main Content Wrapper - needs margin left to account for fixed sidebar */}
      <Box flex={1} ml={{ base: 0, lg: sidebarWidth }} transition="margin-left 0.2s" bg="gray.50" display="flex" flexDirection="column" minH="100vh" w="full" overflowX="hidden">
        {/* Header with Breadcrumbs */}
        <Box 
            bg="white" 
            borderBottom="1px" 
            borderColor="gray.200" 
            px={{ base: 4, md: 8 }} 
            py={4} 
            position="fixed" 
            top={0} 
            right={0}
            left={{ base: 0, lg: sidebarWidth }}
            zIndex={5}
            transition="left 0.2s"
        >
            <Flex justify="space-between" align="center">
                <Flex align="center">
                    <IconButton 
                        aria-label="Menu" 
                        variant="ghost" 
                        onClick={() => setMobileOpen(!isMobileOpen)} 
                        display={{ base: "flex", lg: "none" }} 
                        mr={2}
                    >
                        <Icon as={isMobileOpen ? FiX : FiMenu} boxSize={6} />
                    </IconButton>
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
                </Flex>

                {/* Notification Section */}
                <Menu.Root>
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

        {/* Spacer for fixed header */}
        <Box h="73px" />

        {/* Content Area */}
        <Box flex={1} p={{ base: 4, md: 8 }}>
          <Outlet context={{ notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications: fetchNotifications } satisfies AdminOutletContext} />
        </Box>
      </Box>
    </Flex>
  );
};

export default AdminLayout;
