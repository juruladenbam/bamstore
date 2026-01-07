import React, { useEffect, useState }                                                 from 'react';
import { useParams, useNavigate }                                                     from 'react-router-dom';
import { Box, Container, Heading, Text, Image, Badge, Button, VStack, HStack, Input, NumberInput, IconButton } from '@chakra-ui/react';
import { LuMinus, LuPlus }                                                            from 'react-icons/lu';
import client                                                                         from '../api/client';
import { STORAGE_URL }                                                                from '../config';
import { useCart }                                                                    from '../context/CartContext';
import type { Product, ProductVariant }                                               from '../types';
import { toaster }                                                                    from '../components/ui/toaster';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "../components/ui/dialog"

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>([]);
  const [recipientType, setRecipientType] = useState<'myself' | 'others'>('myself');
  
  const [recipients, setRecipients] = useState<{name: string}[]>([{name: ''}]);
  
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [errors, setErrors] = useState<{ recipientNames?: boolean[], missingVariants?: string[] }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Auto-complete state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeRecipientIndex, setActiveRecipientIndex] = useState<number | null>(null);
  const searchTimeout = React.useRef<any>(null);

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { name: value };
    setRecipients(newRecipients);
    
    // Clear error if exists
    if (errors.recipientNames?.[index]) {
        setErrors(prev => {
            const newNameErrors = [...(prev.recipientNames || [])];
            newNameErrors[index] = false;
            return { ...prev, recipientNames: newNameErrors };
        });
    }

    // Search logic
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (value.length > 2) {
        searchTimeout.current = setTimeout(() => {
            client.get(`/members/search?query=${value}`)
                .then(res => {
                    if (res.data && res.data.length > 0) {
                        setSearchResults(res.data);
                        setActiveRecipientIndex(index);
                    } else {
                        setActiveRecipientIndex(null);
                    }
                })
                .catch(err => console.error(err));
        }, 300);
    } else {
        setActiveRecipientIndex(null);
    }
  };

  const selectRecipient = (index: number, member: any) => {
      const newRecipients = [...recipients];
      newRecipients[index] = { name: member.name };
      setRecipients(newRecipients);
      setActiveRecipientIndex(null);
  };

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
    return <Container py={10}><Text>Memuat...</Text></Container>;
  }

  // Helper to find matching SKU
  const getMatchingSku = () => {
    if (!product || !product.skus) return null;
    
    // If no variants defined on product, look for a default SKU (empty variant_ids)
    if ((product.variants || []).length === 0) {
      return product.skus.find(s => s.variant_ids.length === 0) || null;
    }

    // If we have variants, we need to match all selected variants
    // First, check if we have selected all required types
    const variantTypes = new Set((product.variants || []).map(v => v.type || 'General'));
    // If user hasn't selected all types yet, we can't match a specific SKU
    const selectedTypes = new Set(selectedVariants.map(v => v.type || 'General'));
    if (selectedTypes.size !== variantTypes.size) return null;

    const selectedIds = selectedVariants.map(v => v.id).sort((a, b) => a - b);
    
    return product.skus.find(s => {
      const rawSkuIds = s.variant_ids || [];
      const skuIds = [...rawSkuIds].sort((a, b) => Number(a) - Number(b));
      
      if (skuIds.length !== selectedIds.length) return false;
      return skuIds.every((val, index) => Number(val) === Number(selectedIds[index]));
    }) || null;
  };

  const matchingSku = getMatchingSku();

  // Calculate Price
  let currentPrice = Number(product.base_price);
  if (matchingSku && Number(matchingSku.price) > 0) {
    currentPrice = Number(matchingSku.price);
  } else {
    const variantsTotal = selectedVariants.reduce((sum, v) => sum + Number(v.price_adjustment), 0);
    currentPrice += variantsTotal;
  }

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

  const handleQuantityChange = (details: { value: string; valueAsNumber: number }) => {
    const newQty = details.valueAsNumber || 1;
    setQuantity(newQty);
    setRecipients(prev => {
      const newRecipients = [...prev];
      if (newQty > prev.length) {
        for (let i = prev.length; i < newQty; i++) newRecipients.push({name: ''});
      } else if (newQty < prev.length) {
        newRecipients.length = newQty;
      }
      return newRecipients;
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
      errorMessages.push(`Silakan pilih: ${missingTypes.join(', ')}`);
      hasError = true;
    }

    // Validate Recipient Names
    if (recipientType === 'others') {
      const nameErrors = recipients.map(r => !r.name.trim());
      if (nameErrors.some(e => e)) {
        newErrors.recipientNames = nameErrors;
        errorMessages.push("Harap isi semua nama penerima");
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      toaster.create({
        title: "Kesalahan Validasi",
        description: errorMessages.join("\n"),
        type: "error",
      });
      return;
    }

    // Validate Stock/Quota
    const matchingSku = getMatchingSku();
    if (matchingSku) {
      if (matchingSku.stock < quantity) {
        toaster.create({
          title: "Stok Tidak Cukup",
          description: `Hanya tersedia ${matchingSku.stock} item.`,
          type: "error",
        });
        return;
      }
    } else if ((product?.variants || []).length > 0) {
       // If we are here, it means we passed the missingTypes check (so all types are selected),
       // but we couldn't find a matching SKU. This means the combination doesn't exist.
       toaster.create({
          title: "Tidak Tersedia",
          description: "Kombinasi pilihan ini saat ini tidak tersedia.",
          type: "error",
        });
       return;
    }

    if (recipientType === 'myself') {
      addToCart({
        product,
        variants: selectedVariants,
        quantity,
        recipient_name: 'Myself',
        unit_price: currentPrice,
        sku_id: matchingSku?.id
      });
    } else {
      // Add each recipient as a separate item (no grouping for now to keep details)
      recipients.forEach(recipient => {
        addToCart({
          product,
          variants: selectedVariants,
          quantity: 1,
          recipient_name: recipient.name,
          unit_price: currentPrice,
          sku_id: matchingSku?.id
        });
      });
    }

    toaster.create({
      title: "Ditambahkan ke Keranjang",
      description: `${product?.name} telah ditambahkan ke keranjang.`,
      type: "success",
    });
    setIsDialogOpen(true);
  };

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 10 }} px={{ base: 4, md: 8 }}>
      <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ditambahkan ke Keranjang</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack align="start" gap={2}>
              <Text fontWeight="bold">{product.name}</Text>
              {selectedVariants.length > 0 && (
                <Text fontSize="sm" color="gray.600">
                  Varian: {selectedVariants.map(v => v.name).join(', ')}
                </Text>
              )}
              <Text fontSize="sm">
                Jumlah: {quantity}
              </Text>
              <Text fontWeight="bold" color="teal.600">
                Total: Rp {(currentPrice * quantity).toLocaleString()}
              </Text>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Tambah Produk Lain</Button>
            <Button colorPalette="teal" onClick={() => navigate('/checkout')}>Lanjut ke Pembayaran</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <Box 
        bg="white"
        borderRadius="lg"
        p={{ base: 0, md: 6 }}
        shadow={{ base: "none", md: "sm" }}
      >
        {/* Top Section: Images & Details */}
        <HStack align="start" flexDirection={{ base: "column", md: "row" }} gap={{ base: 6, md: 10 }} mb={10}>
            
            {/* Column 1: Images */}
            <Box w={{ base: "full", md: "50%" }}>
                <Image 
                    src={currentImageSrc} 
                    alt={product.name} 
                    borderRadius="md"
                    width="100%" 
                    height={{ base: "350px", md: "500px" }} 
                    objectFit="contain" 
                    bg="gray.50"
                    mb={4}
                />
                {images.length > 1 && (
                    <HStack overflowX="auto" gap={2} py={1}>
                    {images.map((img, idx) => (
                        <Box 
                        key={img.id} 
                        borderWidth={idx === currentImageIndex ? '2px' : '1px'} 
                        borderColor={idx === currentImageIndex ? 'teal.500' : 'gray.200'}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => setCurrentImageIndex(idx)}
                        flexShrink={0}
                        w="80px"
                        h="80px"
                        overflow="hidden"
                        >
                        <Image 
                            src={img.image_path.startsWith('http') ? img.image_path : `${STORAGE_URL}/${img.image_path}`} 
                            width="100%" 
                            height="100%" 
                            objectFit="cover" 
                        />
                        </Box>
                    ))}
                    </HStack>
                )}
            </Box>

            {/* Column 2: Product Details & Options */}
            <VStack align="start" gap={6} w={{ base: "full", md: "50%" }}>
                <Box>
                    <Badge colorPalette={product.status === 'ready' ? 'green' : 'blue'} mb={2}>
                        {product.status === 'ready' ? 'STOK SIAP' : 'PRE-ORDER'}
                    </Badge>
                    <Heading size="2xl" mb={2}>{product.name}</Heading>
                    <Text fontSize="3xl" fontWeight="bold" color="teal.600">
                        Rp {currentPrice.toLocaleString()}
                    </Text>
                    {matchingSku && (
                        <Text fontSize="sm" color={matchingSku.stock > 0 ? "green.600" : "red.600"} fontWeight="medium" mt={1}>
                        {product.status === 'pre_order' ? 'Kuota Tersedia: ' : 'Stok: '} 
                        {matchingSku.stock}
                        </Text>
                    )}
                </Box>

                <Box w="full" borderTopWidth="1px" borderBottomWidth="1px" borderColor="gray.100" py={6}>
                    <VStack align="start" gap={6}>
                         {/* Variants */}
                        {Object.entries(
                        (product.variants || []).reduce((acc, v) => {
                            const type = v.type || 'General';
                            if (!acc[type]) acc[type] = [];
                            acc[type].push(v);
                            return acc;
                        }, {} as Record<string, ProductVariant[]>)
                        ).map(([type, variants]) => (
                        <Box key={type} w="full">
                            <Text 
                            fontSize="sm" 
                            fontWeight="semibold" 
                            mb={2} 
                            color={errors.missingVariants?.includes(type) ? "red.500" : "gray.600"}
                            >
                            {type} {errors.missingVariants?.includes(type) && "(Wajib)"}
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
                                    {v.name}
                                </Button>
                                );
                            })}
                            </HStack>
                        </Box>
                        ))}

                         {/* Recipient Selection */}
                        <Box w="full">
                            <Text mb={2} fontWeight="bold">Untuk Siapa?</Text>
                            <HStack mb={3}>
                                <Button
                                    variant={recipientType === 'myself' ? 'solid' : 'outline'}
                                    onClick={() => setRecipientType('myself')}
                                    size="sm"
                                    colorPalette="teal"
                                >
                                    Untuk Saya
                                </Button>
                                <Button
                                    variant={recipientType === 'others' ? 'solid' : 'outline'}
                                    onClick={() => setRecipientType('others')}
                                    size="sm"
                                    colorPalette="teal"
                                >
                                    Untuk Orang Lain
                                </Button>
                            </HStack>
                            
                            {recipientType === 'others' && (
                            <VStack gap={4} align="stretch" mt={2}>
                                {recipients.map((recipient, index) => (
                                <Box key={index} borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
                                    <Text fontWeight="bold" mb={2} fontSize="sm">Penerima #{index + 1}</Text>
                                    <VStack gap={2}>
                                        <Box w="full" position="relative">
                                            <Input
                                            placeholder="Cari Nama Anggota..."
                                            value={recipient.name} 
                                            onChange={(e) => handleRecipientChange(index, e.target.value)}
                                            onBlur={() => setTimeout(() => setActiveRecipientIndex(null), 200)}
                                            borderColor={errors.recipientNames?.[index] ? "red.500" : "white"}
                                            bg="white"
                                            autoComplete="off"
                                            />
                                            {activeRecipientIndex === index && searchResults.length > 0 && (
                                            <Box 
                                                position="absolute" 
                                                top="100%" 
                                                left={0} 
                                                right={0} 
                                                zIndex={10} 
                                                bg="white" 
                                                borderWidth="1px" 
                                                borderRadius="md" 
                                                boxShadow="md" 
                                                maxH="200px" 
                                                overflowY="auto"
                                            >
                                                {searchResults.map((member, idx) => (
                                                <Box 
                                                    key={idx} 
                                                    p={2} 
                                                    _hover={{ bg: "gray.100", cursor: "pointer" }}
                                                    onMouseDown={() => selectRecipient(index, member)}
                                                >
                                                    <Text fontWeight="bold" fontSize="sm">{member.name}</Text>
                                                    <Text fontSize="xs" color="gray.600">
                                                        {member.phone_number ? `${member.phone_number} - ` : ''}{member.qobilah || ''}
                                                    </Text>
                                                </Box>
                                                ))}
                                            </Box>
                                            )}
                                        </Box>
                                    </VStack>
                                </Box>
                                ))}
                            </VStack>
                            )}
                        </Box>
                    </VStack>
                </Box>

                {/* Action Row */}
                <HStack w="full" gap={4}>
                    <NumberInput.Root
                        size="lg" 
                        maxW="150px" 
                        min={1} 
                        value={quantity.toString()} 
                        onValueChange={handleQuantityChange}
                        unstyled
                        spinOnPress={false}
                    >
                        <HStack gap={2}>
                            <NumberInput.DecrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                    <LuMinus />
                                </IconButton>
                            </NumberInput.DecrementTrigger>
                            <NumberInput.ValueText textAlign="center" fontSize="lg" minW="3ch" />
                            <NumberInput.IncrementTrigger asChild>
                                <IconButton variant="outline" size="sm">
                                    <LuPlus />
                                </IconButton>
                            </NumberInput.IncrementTrigger>
                        </HStack>
                    </NumberInput.Root>
                    <Button colorPalette="teal" size="lg" flex={1} onClick={handleAddToCart}>
                        Tambah ke Keranjang
                    </Button>
                </HStack>
            </VStack>
        </HStack>

        {/* Bottom Section: Description */}
        <Box borderTopWidth="1px" pt={8} borderColor="gray.200">
             <Heading size="lg" mb={4}>Deskripsi Produk</Heading>
             <Text whiteSpace="pre-line" color="gray.700" lineHeight="tall">
                {product.description}
             </Text>
        </Box>

      </Box>
    </Container>
  );
};

export default ProductDetail;
