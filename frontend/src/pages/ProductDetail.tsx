import React, { useEffect, useState }                                                 from 'react';
import { useParams, useNavigate }                                                     from 'react-router-dom';
import { Box, Container, Heading, Text, Image, Badge, Button, VStack, HStack, Input } from '@chakra-ui/react';
import client                                                                         from '../api/client';
import { STORAGE_URL }                                                                from '../config';
import { useCart }                                                                    from '../context/CartContext';
import type { Product, ProductVariant }                                               from '../types';
import { toaster }                                                                    from '../components/ui/toaster';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>([]);
  const [recipientType, setRecipientType] = useState<'myself' | 'others'>('myself');
  const [recipientNames, setRecipientNames] = useState<string[]>(['']);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [errors, setErrors] = useState<{ recipientNames?: boolean[], missingVariants?: string[] }>({});

  useEffect(() => {
    client.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading || !product) {
    return <Container py={10}><Text>Loading...</Text></Container>;
  }

  const variantsTotal = selectedVariants.reduce((sum, v) => sum + Number(v.price_adjustment), 0);
  const currentPrice = Number(product.base_price) + variantsTotal;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : (product.image_url ? [{ id: 0, image_path: product.image_url, is_primary: true, sort_order: 0, product_id: product.id }] : []);
    
  const currentImageSrc = images.length > 0 
    ? (images[currentImageIndex].image_path.startsWith('http') ? images[currentImageIndex].image_path : `${STORAGE_URL}/${images[currentImageIndex].image_path}`)
    : 'https://via.placeholder.com/500';

  const handleVariantToggle = (variant: ProductVariant) => {
    // Logic: Only allow one variant per Type (e.g. only one Size, only one Color)
    const type = variant.type || 'General';
    
    setSelectedVariants(prev => {
      // Remove any existing variant of the same type
      const filtered = prev.filter(v => (v.type || 'General') !== type);
      
      // If the clicked variant was already selected, we just removed it (toggle off).
      // If it wasn't selected, we add it.
      const wasSelected = prev.some(v => v.id === variant.id);
      
      const newSelection = wasSelected ? filtered : [...filtered, variant];
      
      // Clear error for this type if it exists
      if (errors.missingVariants?.includes(type)) {
         setErrors(prevErrors => ({
           ...prevErrors,
           missingVariants: prevErrors.missingVariants?.filter(t => t !== type)
         }));
      }
      
      return newSelection;
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQty = parseInt(e.target.value) || 1;
    setQuantity(newQty);
    setRecipientNames(prev => {
      const newNames = [...prev];
      if (newQty > prev.length) {
        for (let i = prev.length; i < newQty; i++) newNames.push('');
      } else if (newQty < prev.length) {
        newNames.length = newQty;
      }
      return newNames;
    });
  };

  const handleAddToCart = () => {
    const newErrors: { recipientNames?: boolean[], missingVariants?: string[] } = {};
    const errorMessages: string[] = [];
    let hasError = false;

    // Validate Variants
    const variantTypes = new Set((product?.variants || []).map(v => v.type || 'General'));
    const missingTypes: string[] = [];
    
    variantTypes.forEach(type => {
      const hasSelection = selectedVariants.some(v => (v.type || 'General') === type);
      if (!hasSelection) {
        missingTypes.push(type);
      }
    });

    if (missingTypes.length > 0) {
      newErrors.missingVariants = missingTypes;
      errorMessages.push(`Please select: ${missingTypes.join(', ')}`);
      hasError = true;
    }

    // Validate Recipient Names
    if (recipientType === 'others') {
      const nameErrors = recipientNames.map(n => !n.trim());
      if (nameErrors.some(e => e)) {
        newErrors.recipientNames = nameErrors;
        errorMessages.push("Please fill in all recipient names");
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      toaster.create({
        title: "Validation Error",
        description: errorMessages.join("\n"),
        type: "error",
      });
      return;
    }

    if (recipientType === 'myself') {
      addToCart({
        product,
        variants: selectedVariants,
        quantity,
        recipient_name: 'Myself'
      });
    } else {
      // Group by name to avoid separate lines for same person
      const grouped: Record<string, number> = {};
      recipientNames.forEach(name => {
        const n = name.trim();
        grouped[n] = (grouped[n] || 0) + 1;
      });

      Object.entries(grouped).forEach(([name, qty]) => {
        addToCart({
          product,
          variants: selectedVariants,
          quantity: qty,
          recipient_name: name
        });
      });
    }

    toaster.create({
      title: "Added to Cart",
      description: `${product?.name} added to your cart.`,
      type: "success",
    });
    navigate('/checkout');
  };

  return (
    <Container maxW="container.md" py={10}>
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={6}>
        <Box mb={6}>
          <Image 
            src={currentImageSrc} 
            alt={product.name} 
            borderRadius="md" 
            width="100%" 
            height="400px" 
            objectFit="contain" 
          />
          {images.length > 1 && (
            <HStack mt={2} overflowX="auto" py={2}>
              {images.map((img, idx) => (
                <Box 
                  key={img.id} 
                  borderWidth={idx === currentImageIndex ? '2px' : '1px'} 
                  borderColor={idx === currentImageIndex ? 'teal.500' : 'gray.200'}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => setCurrentImageIndex(idx)}
                  flexShrink={0}
                >
                  <Image 
                    src={img.image_path.startsWith('http') ? img.image_path : `${STORAGE_URL}/${img.image_path}`} 
                    width="80px" 
                    height="80px" 
                    objectFit="cover" 
                    borderRadius="sm"
                  />
                </Box>
              ))}
            </HStack>
          )}
        </Box>
        
        <VStack align="start" gap={4}>
          <Badge colorPalette={product.status === 'ready' ? 'green' : 'blue'}>
            {product.status === 'ready' ? 'READY STOCK' : 'PRE-ORDER'}
          </Badge>
          <Heading size="xl">{product.name}</Heading>
          <Text fontSize="2xl" fontWeight="bold" color="teal.600">
            Rp {currentPrice.toLocaleString()}
          </Text>
          <Text>{product.description}</Text>

          <Box w="full">
            <Text mb={2} fontWeight="bold">Variants</Text>
            {Object.entries(
              (product.variants || []).reduce((acc, v) => {
                const type = v.type || 'General';
                if (!acc[type]) acc[type] = [];
                acc[type].push(v);
                return acc;
              }, {} as Record<string, ProductVariant[]>)
            ).map(([type, variants]) => (
              <Box key={type} mb={4}>
                <Text 
                  fontSize="sm" 
                  fontWeight="semibold" 
                  mb={2} 
                  color={errors.missingVariants?.includes(type) ? "red.500" : "gray.600"}
                >
                  {type} {errors.missingVariants?.includes(type) && "(Required)"}
                </Text>
                <HStack wrap="wrap" gap={2}>
                  {variants.map(v => {
                    const isSelected = selectedVariants.some(sv => sv.id === v.id);
                    return (
                      <Button 
                        key={v.id} 
                        size="sm" 
                        variant={isSelected ? "solid" : "outline"}
                        colorPalette={isSelected ? "teal" : "gray"}
                        borderColor={errors.missingVariants?.includes(type) && !isSelected ? "red.500" : undefined}
                        onClick={() => handleVariantToggle(v)}
                      >
                        {v.name} ({v.price_adjustment > 0 ? '+' : ''}{Number(v.price_adjustment).toLocaleString()})
                      </Button>
                    );
                  })}
                </HStack>
              </Box>
            ))}
          </Box>

          <Box w="full">
            <Text mb={2} fontWeight="bold">Quantity</Text>
            <Input 
              type="number" 
              min={1} 
              value={quantity} 
              onChange={handleQuantityChange} 
            />
          </Box>

          <Box w="full">
            <Text mb={2} fontWeight="bold">For Whom?</Text>
            <HStack mb={2}>
              <Button 
                variant={recipientType === 'myself' ? 'solid' : 'outline'} 
                onClick={() => setRecipientType('myself')}
                size="sm"
              >
                Myself
              </Button>
              <Button 
                variant={recipientType === 'others' ? 'solid' : 'outline'} 
                onClick={() => setRecipientType('others')}
                size="sm"
              >
                Others
              </Button>
            </HStack>
            
            {recipientType === 'others' && (
              <VStack gap={2} align="stretch">
                {recipientNames.map((name, index) => (
                  <Input 
                    key={index}
                    placeholder={`Recipient Name #${index + 1}`}
                    value={name} 
                    onChange={(e) => {
                      const newNames = [...recipientNames];
                      newNames[index] = e.target.value;
                      setRecipientNames(newNames);
                      if (errors.recipientNames?.[index]) {
                        setErrors(prev => {
                          const newNameErrors = [...(prev.recipientNames || [])];
                          newNameErrors[index] = false;
                          return { ...prev, recipientNames: newNameErrors };
                        });
                      }
                    }} 
                    borderColor={errors.recipientNames?.[index] ? "red.500" : undefined}
                  />
                ))}
              </VStack>
            )}
          </Box>

          <Button colorPalette="teal" size="lg" width="full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default ProductDetail;
