import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, SimpleGrid, Text, Image, Button, VStack, HStack, Icon, Flex, Badge } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { STORAGE_URL } from '../config';
import type { Product, Category } from '../types';
import { FaArrowRight } from 'react-icons/fa';

interface ActivityItem {
  id: number;
  recipient_name: string;
  product_name: string;
  variants: string;
  quantity: number;
  date: string;
  status: string;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, activityRes] = await Promise.all([
          client.get('/products'),
          client.get('/categories'),
          client.get('/order-activity')
        ]);
        setProducts(productsRes.data.slice(0, 4));
        setCategories(categoriesRes.data);

        let recentActivities = activityRes.data.slice(0, 6);
        if (recentActivities.length > 1 && recentActivities.length % 2 !== 0) {
          recentActivities = recentActivities.slice(0, -1);
        }
        setActivities(recentActivities);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Container py={10}><Text>Memuat...</Text></Container>;

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bg="teal.600" 
        color="white" 
        py={20} 
        px={4} 
        textAlign="center"
        display={{ base: 'none', md: 'block' }}
      >
        <Container maxW="container.xl">
          <Heading size="3xl" mb={6} fontWeight="extrabold">Selamat Datang di BAM Store</Heading>
          <Text fontSize="2xl" mb={10} opacity={0.9}>Toko serba ada untuk semua kebutuhan Anda.</Text>
          <Button 
            asChild 
            size="xl" 
            colorPalette="yellow" 
            variant="solid" 
            rounded="full"
            px={10}
            fontWeight="bold"
            _hover={{ transform: 'scale(1.05)' }}
            transition="all 0.2s"
          >
            <Link to="/products">Belanja Sekarang <Icon as={FaArrowRight} ml={2} /></Link>
          </Button>
        </Container>
      </Box>

      <Container maxW="container.xl" py={{ base: 4, md: 10 }}>
        
        {/* Recent Activity */}
        <HStack justify="space-between" mb={4}>
            <Heading size="xl">Aktivitas Terbaru</Heading>
            <Button asChild variant="ghost" colorPalette="teal">
                <Link to="/activity">Lihat Semua <Icon as={FaArrowRight} /></Link>
            </Button>
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 2 }} gap={3} mb={10}>
            {activities.map(item => (
                <Box key={item.id} p={3} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
                    <VStack align="stretch" gap={2}>
                        <Flex justify="space-between" align="center">
                            <Text fontWeight="bold" fontSize="sm" lineClamp={1}>{item.recipient_name}</Text>
                            <Badge colorPalette={item.status === 'paid' ? 'green' : 'yellow'} size="xs">{item.status}</Badge>
                        </Flex>
                        <Text fontSize="xs" color="gray.600" lineClamp={2} minH="2.4em">
                            {item.product_name} {item.variants && `(${item.variants})`}
                        </Text>
                        <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color="gray.400">{item.date}</Text>
                            <Text fontSize="xs" fontWeight="medium">x{item.quantity}</Text>
                        </Flex>
                    </VStack>
                </Box>
            ))}
             {activities.length === 0 && <Text color="gray.500">Tidak ada aktivitas terbaru.</Text>}
        </SimpleGrid>

        {/* Categories */}
        <Heading size="xl" mb={6}>Kategori</Heading>
        
        {/* Mobile: Horizontal Scroll */}
        <Box display={{ base: 'block', md: 'none' }} mb={8} mx={-4} px={4}>
            <HStack overflowX="auto" gap={3} pb={2} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                {categories.map(category => (
                    <Button 
                        key={category.id} 
                        asChild 
                        variant="surface" 
                        colorPalette="teal"
                        size="sm" 
                        rounded="full"
                        flexShrink={0}
                    >
                    <Link to={`/products?search=${category.name}`}>
                        {category.name}
                    </Link>
                    </Button>
                ))}
            </HStack>
        </Box>

        {/* Desktop: Grid */}
        <SimpleGrid columns={4} gap={4} mb={10} display={{ base: 'none', md: 'grid' }}>
          {categories.map(category => (
            <Button key={category.id} asChild variant="outline" size="lg" height="auto" py={4}>
               <Link to={`/products?search=${category.name}`}>
                 {category.name}
               </Link>
            </Button>
          ))}
        </SimpleGrid>

        {/* Featured Products */}
        <HStack justify="space-between" mb={6}>
            <Heading size="xl">Produk Terbaru</Heading>
            <Button asChild variant="ghost" colorPalette="teal">
                <Link to="/products">Lihat Semua <Icon as={FaArrowRight} /></Link>
            </Button>
        </HStack>
        
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 6 }}>
          {products.map(product => {
             const imageUrl = product.images && product.images.length > 0 
            ? (product.images[0].image_path.startsWith('http') ? product.images[0].image_path : `${STORAGE_URL}/${product.images[0].image_path}`)
            : (product.image_url || 'https://via.placeholder.com/300');
            
            return (
                <Link 
                    key={product.id}
                    to={`/products/${product.slug || product.id}`}
                    style={{ display: 'block', textDecoration: 'none' }}
                >
                <Box 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    overflow="hidden" 
                    p={{ base: 2, md: 4 }}
                    _hover={{ shadow: 'md', borderColor: 'teal.500', transform: 'scale(1.02)' }}
                    transition="all 0.2s"
                >
                    <Image 
                        src={imageUrl} 
                        alt={product.name} 
                        mb={{ base: 2, md: 4 }} 
                        height={{ base: "150px", md: "200px" }} 
                        width="100%" 
                        objectFit="cover" 
                    />
                    <Heading size={{ base: "sm", md: "md" }} mb={2} lineClamp={1}>{product.name}</Heading>
                    <Text fontWeight="bold" color="teal.600">Rp {Number(product.base_price).toLocaleString()}</Text>
                </Box>
                </Link>
            )
          })}
        </SimpleGrid>

      </Container>
    </Box>
  );
};

export default Home;
