import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, VStack, HStack, Text, Input, Button, Image, Badge,
    Spinner, NumberInput, IconButton
} from '@chakra-ui/react';
import { LuMinus, LuPlus, LuSearch } from 'react-icons/lu';
import client from '../../api/client';
import { STORAGE_URL } from '../../config';
import type { Product, ProductVariant } from '../../types';
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogFooter,
    DialogActionTrigger,
} from '../../components/ui/dialog';

interface ProductSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (data: {
        product_id: number;
        variant_ids: number[];
        quantity: number;
        recipient_name: string;
    }) => Promise<void>;
}

const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
    isOpen,
    onClose,
    onAddItem,
}) => {
    const [step, setStep] = useState<'search' | 'configure'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Configuration state
    const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [recipientName, setRecipientName] = useState('');
    const [stockInfo, setStockInfo] = useState<{ available: boolean; stock: number | null; message: string } | null>(null);
    const [checkingStock, setCheckingStock] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Member search for recipient
    const [memberResults, setMemberResults] = useState<any[]>([]);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);

    // Fetch products on search
    const searchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await client.get('/products', {
                params: { search: searchQuery }
            });
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (isOpen && step === 'search') {
            searchProducts();
        }
    }, [isOpen, step, searchProducts]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setStep('search');
            setSearchQuery('');
            setSelectedProduct(null);
            setSelectedVariants([]);
            setQuantity(1);
            setRecipientName('');
            setStockInfo(null);
            setError(null);
        }
    }, [isOpen]);

    // Check stock when variant or quantity changes
    const checkStock = useCallback(async () => {
        if (!selectedProduct) return;

        setCheckingStock(true);
        try {
            const res = await client.post('/admin/orders/check-stock', {
                product_id: selectedProduct.id,
                variant_ids: selectedVariants.map(v => v.id),
                quantity: quantity,
            });
            setStockInfo(res.data);
            if (!res.data.available) {
                setError(res.data.message);
            } else {
                setError(null);
            }
        } catch (err: any) {
            console.error(err);
            setError('Gagal mengecek stok');
        } finally {
            setCheckingStock(false);
        }
    }, [selectedProduct, selectedVariants, quantity]);

    useEffect(() => {
        if (selectedProduct && step === 'configure') {
            const debounce = setTimeout(checkStock, 300);
            return () => clearTimeout(debounce);
        }
    }, [selectedProduct, selectedVariants, quantity, step, checkStock]);

    // Search members for recipient
    const searchMembers = useCallback(async (query: string) => {
        if (query.length < 2) {
            setMemberResults([]);
            return;
        }
        try {
            const res = await client.get('/members/search', { params: { query } });
            setMemberResults(res.data || []);
            setShowMemberDropdown(true);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const handleRecipientChange = (value: string) => {
        setRecipientName(value);
        const debounce = setTimeout(() => searchMembers(value), 300);
        return () => clearTimeout(debounce);
    };

    const selectMember = (member: any) => {
        setRecipientName(member.name);
        setShowMemberDropdown(false);
        setMemberResults([]);
    };

    // Select product and go to configure step
    const selectProduct = (product: Product) => {
        setSelectedProduct(product);
        setSelectedVariants([]);
        setQuantity(1);
        setStep('configure');
    };

    // Handle variant toggle
    const handleVariantToggle = (variant: ProductVariant) => {
        const type = variant.type || 'General';
        setSelectedVariants(prev => {
            const filtered = prev.filter(v => (v.type || 'General') !== type);
            const wasSelected = prev.some(v => v.id === variant.id);
            return wasSelected ? filtered : [...filtered, variant];
        });
    };

    // Calculate price
    const getPrice = () => {
        if (!selectedProduct) return 0;

        // Find matching SKU
        const variantIds = selectedVariants.map(v => v.id).sort((a, b) => a - b);
        const matchingSku = selectedProduct.skus?.find(s => {
            const skuVariantIds = [...(s.variant_ids || [])].sort((a, b) => a - b);
            if (skuVariantIds.length !== variantIds.length) return false;
            return skuVariantIds.every((val, index) => Number(val) === Number(variantIds[index]));
        });

        if (matchingSku && Number(matchingSku.price) > 0) {
            return Number(matchingSku.price);
        }

        const variantsTotal = selectedVariants.reduce((sum, v) => sum + Number(v.price_adjustment), 0);
        return Number(selectedProduct.base_price) + variantsTotal;
    };

    // Validate before submit
    const canSubmit = () => {
        if (!selectedProduct) return false;
        if (!recipientName.trim()) return false;
        if (stockInfo && !stockInfo.available) return false;

        // Check if all variant types are selected
        const variantTypes = new Set((selectedProduct.variants || []).map(v => v.type || 'General'));
        const selectedTypes = new Set(selectedVariants.map(v => v.type || 'General'));
        if (variantTypes.size !== selectedTypes.size) return false;

        return true;
    };

    // Submit
    const handleSubmit = async () => {
        if (!selectedProduct || !canSubmit()) return;

        setSubmitting(true);
        try {
            await onAddItem({
                product_id: selectedProduct.id,
                variant_ids: selectedVariants.map(v => v.id),
                quantity: quantity,
                recipient_name: recipientName.trim(),
            });
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal menambahkan item');
        } finally {
            setSubmitting(false);
        }
    };

    const getImageUrl = (product: Product) => {
        const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
        if (primaryImage) {
            return primaryImage.image_path.startsWith('http')
                ? primaryImage.image_path
                : `${STORAGE_URL}/${primaryImage.image_path}`;
        }
        return product.image_url || 'https://via.placeholder.com/80';
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
            <DialogContent maxH="80vh" overflow="hidden" display="flex" flexDirection="column">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'search' ? 'Pilih Produk' : `Konfigurasi: ${selectedProduct?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <DialogBody flex={1} overflowY="auto">
                    {step === 'search' ? (
                        <VStack align="stretch" gap={4}>
                            {/* Search Input */}
                            <HStack>
                                <Input
                                    placeholder="Cari produk..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                                />
                                <IconButton aria-label="Search" onClick={searchProducts}>
                                    <LuSearch />
                                </IconButton>
                            </HStack>

                            {/* Product List */}
                            {loading ? (
                                <Box textAlign="center" py={8}>
                                    <Spinner size="lg" />
                                </Box>
                            ) : products.length === 0 ? (
                                <Text color="gray.500" textAlign="center" py={8}>
                                    Tidak ada produk ditemukan
                                </Text>
                            ) : (
                                <VStack align="stretch" gap={2}>
                                    {products.map(product => (
                                        <Box
                                            key={product.id}
                                            p={3}
                                            borderWidth="1px"
                                            borderRadius="md"
                                            cursor="pointer"
                                            _hover={{ bg: 'gray.50' }}
                                            onClick={() => selectProduct(product)}
                                        >
                                            <HStack gap={3}>
                                                <Image
                                                    src={getImageUrl(product)}
                                                    alt={product.name}
                                                    boxSize="60px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                />
                                                <VStack align="start" flex={1} gap={0}>
                                                    <Text fontWeight="bold">{product.name}</Text>
                                                    <HStack gap={2}>
                                                        <Text fontSize="sm" color="teal.600" fontWeight="medium">
                                                            Rp {Number(product.base_price).toLocaleString()}
                                                        </Text>
                                                        <Badge size="sm" colorPalette={product.status === 'ready' ? 'green' : 'blue'}>
                                                            {product.status === 'ready' ? 'Ready' : 'PO'}
                                                        </Badge>
                                                    </HStack>
                                                </VStack>
                                            </HStack>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </VStack>
                    ) : (
                        <VStack align="stretch" gap={4}>
                            {/* Back button */}
                            <Button variant="ghost" size="sm" alignSelf="start" onClick={() => setStep('search')}>
                                ← Pilih Produk Lain
                            </Button>

                            {/* Product Info */}
                            <HStack gap={4} p={3} bg="gray.50" borderRadius="md">
                                <Image
                                    src={getImageUrl(selectedProduct!)}
                                    alt={selectedProduct?.name}
                                    boxSize="80px"
                                    objectFit="cover"
                                    borderRadius="md"
                                />
                                <VStack align="start" gap={1}>
                                    <Text fontWeight="bold">{selectedProduct?.name}</Text>
                                    <Text fontSize="lg" color="teal.600" fontWeight="medium">
                                        Rp {getPrice().toLocaleString()}
                                    </Text>
                                    {stockInfo && (
                                        <Text fontSize="sm" color={stockInfo.available ? 'green.600' : 'red.600'}>
                                            {stockInfo.stock !== null ? `Stok: ${stockInfo.stock}` : stockInfo.message}
                                        </Text>
                                    )}
                                </VStack>
                            </HStack>

                            {/* Variant Selection */}
                            {Object.entries(
                                (selectedProduct?.variants || []).reduce((acc, v) => {
                                    const type = v.type || 'General';
                                    if (!acc[type]) acc[type] = [];
                                    acc[type].push(v);
                                    return acc;
                                }, {} as Record<string, ProductVariant[]>)
                            ).map(([type, variants]) => (
                                <Box key={type}>
                                    <Text fontSize="sm" fontWeight="semibold" mb={2}>{type}</Text>
                                    <HStack wrap="wrap" gap={2}>
                                        {variants.map(v => {
                                            const isSelected = selectedVariants.some(sv => sv.id === v.id);
                                            return (
                                                <Button
                                                    key={v.id}
                                                    size="sm"
                                                    variant={isSelected ? 'solid' : 'outline'}
                                                    colorPalette={isSelected ? 'teal' : 'gray'}
                                                    onClick={() => handleVariantToggle(v)}
                                                >
                                                    {v.name}
                                                    {Number(v.price_adjustment) > 0 && (
                                                        <Text as="span" fontSize="xs" ml={1}>
                                                            (+{Number(v.price_adjustment).toLocaleString()})
                                                        </Text>
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </HStack>
                                </Box>
                            ))}

                            {/* Quantity */}
                            <Box>
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Jumlah</Text>
                                <NumberInput.Root
                                    size="md"
                                    maxW="150px"
                                    min={1}
                                    value={quantity.toString()}
                                    onValueChange={(d) => setQuantity(d.valueAsNumber || 1)}
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
                            </Box>

                            {/* Recipient Name */}
                            <Box position="relative">
                                <Text fontSize="sm" fontWeight="semibold" mb={2}>Nama Penerima</Text>
                                <Input
                                    placeholder="Cari nama anggota..."
                                    value={recipientName}
                                    onChange={(e) => handleRecipientChange(e.target.value)}
                                    onBlur={() => setTimeout(() => setShowMemberDropdown(false), 200)}
                                    onFocus={() => memberResults.length > 0 && setShowMemberDropdown(true)}
                                />
                                {showMemberDropdown && memberResults.length > 0 && (
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
                                        maxH="150px"
                                        overflowY="auto"
                                        mt={1}
                                    >
                                        {memberResults.map((member, idx) => (
                                            <Box
                                                key={idx}
                                                p={2}
                                                _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                                                onMouseDown={() => selectMember(member)}
                                            >
                                                <Text fontWeight="medium" fontSize="sm">{member.name}</Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {member.qobilah || ''}
                                                </Text>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {/* Error */}
                            {error && (
                                <Text color="red.500" fontSize="sm">{error}</Text>
                            )}

                            {/* Summary */}
                            <Box p={3} bg="teal.50" borderRadius="md">
                                <HStack justify="space-between">
                                    <Text fontWeight="medium">Total:</Text>
                                    <Text fontWeight="bold" fontSize="lg" color="teal.600">
                                        Rp {(getPrice() * quantity).toLocaleString()}
                                    </Text>
                                </HStack>
                            </Box>
                        </VStack>
                    )}
                </DialogBody>

                <DialogFooter>
                    <DialogActionTrigger asChild>
                        <Button variant="outline">Batal</Button>
                    </DialogActionTrigger>
                    {step === 'configure' && (
                        <Button
                            colorPalette="teal"
                            onClick={handleSubmit}
                            loading={submitting}
                            disabled={!canSubmit() || checkingStock}
                        >
                            Tambah Item
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};

export default ProductSelectorModal;
