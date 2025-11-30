import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, SimpleGrid, Text, Image, Badge, Button, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { STORAGE_URL } from '../config';
import type { Product } from '../types';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Container py={10}><Text>Loading...</Text></Container>;
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>Products</Heading>
      <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} gap={6}>
        {products.map(product => {
          const imageUrl = product.images && product.images.length > 0 
            ? (product.images[0].image_path.startsWith('http') ? product.images[0].image_path : `${STORAGE_URL}/${product.images[0].image_path}`)
            : (product.image_url || 'https://via.placeholder.com/300');

          return (
            <Box key={product.id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
              <Image src={imageUrl} alt={product.name} mb={4} height="200px" width="100%" objectFit="cover" />
              <VStack align="start" gap={2}>
                <Badge colorPalette={product.status === 'ready' ? 'green' : 'blue'}>
                  {product.status === 'ready' ? 'READY STOCK' : 'PRE-ORDER'}
                </Badge>
                <Heading size="md">{product.name}</Heading>
                <Text fontWeight="bold">Rp {Number(product.base_price).toLocaleString()}</Text>
                <Button asChild width="full" colorPalette="teal">
                  <Link to={`/products/${product.id}`}>View Details</Link>
                </Button>
              </VStack>
            </Box>
          );
        })}
      </SimpleGrid>
    </Container>
  );
};

export default ProductList;
