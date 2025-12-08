import React from 'react';
import { Container, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';

const ProductList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { products, loading } = useProducts(searchQuery);

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
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default ProductList;
