import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, SimpleGrid, Text, Image, Badge, Button, VStack } from '@chakra-ui/react';
import { Link, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import { STORAGE_URL } from '../config';
import type { Product } from '../types';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    setLoading(true);
    const url = searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : '/products';
    
    client.get(url)
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchQuery]);

  if (loading) {
    return <Container py={10}><Text>Memuat...</Text></Container>;
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>
        {searchQuery ? `Hasil Pencarian untuk "${searchQuery}"` : 'Produk'}
      </Heading>
      {products.length === 0 ? (
        <Text>Tidak ada produk.</Text>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={{ base: 3, md: 6 }}>
          {products.map(product => {
            const imageUrl = product.images && product.images.length > 0 
              ? (product.images[0].image_path.startsWith('http') ? product.images[0].image_path : `${STORAGE_URL}/${product.images[0].image_path}`)
              : (product.image_url || 'https://via.placeholder.com/300');

            return (
              <Box 
                key={product.id} 
                as={Link}
                to={`/products/${product.slug || product.id}`}
                borderWidth="1px" 
                borderRadius="lg" 
                overflow="hidden" 
                p={{ base: 2, md: 4 }}
                display="block"
                _hover={{ shadow: 'md', borderColor: 'teal.500', transform: 'translateY(-2px)' }}
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
                <VStack align="start" gap={{ base: 1, md: 2 }}>
                  <Badge 
                    colorPalette={product.status === 'ready' ? 'green' : 'blue'} 
                    size={{ base: "sm", md: "md" }}
                  >
                    {product.status === 'ready' ? 'SIAP' : 'PRE-ORDER'}
                  </Badge>
                  <Heading size={{ base: "sm", md: "md" }} lineClamp={2} minH={{ base: "2.5em", md: "auto" }}>
                    {product.name}
                  </Heading>
                  <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                    Rp {Number(product.base_price).toLocaleString()}
                  </Text>
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default ProductList;
