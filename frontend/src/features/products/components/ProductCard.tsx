import React from 'react';
import { Box, Image, Badge, VStack, Heading, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { STORAGE_URL } from '../../../config';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product.images && product.images.length > 0 
    ? (product.images[0].image_path.startsWith('http') ? product.images[0].image_path : `${STORAGE_URL}/${product.images[0].image_path}`)
    : (product.image_url || 'https://via.placeholder.com/300');

  return (
    <Link 
      to={`/products/${product.slug || product.id}`}
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        p={{ base: 2, md: 4 }}
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
    </Link>
  );
};
