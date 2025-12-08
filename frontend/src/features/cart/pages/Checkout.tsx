import React, { useState }                                                                                  from 'react';
import { Box, Container, Heading, Text, VStack, Input, NativeSelect, Button, RadioGroup, Stack, Separator } from '@chakra-ui/react';
import { useCart }                                                                                          from '../context/CartContext';
import client                                                                                               from '../../../api/client';
import { useNavigate }                                                                                      from 'react-router-dom';
import { toaster }                                                                                          from '../../../components/ui/toaster';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
} from '../../../components/ui/dialog';

import { QOBILAHS } from '../../../constants';

const Checkout: React.FC = () => {
  const { items, total, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    checkout_name: '',
    phone_number: '',
    qobilah: QOBILAHS[0],
    payment_method: 'transfer'
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Auto-complete state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<{field: 'name' | 'phone' | null}>({field: null});
  const searchTimeout = React.useRef<any>(null);

  const handleSearch = (value: string, field: 'name' | 'phone') => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length > 2) {
      searchTimeout.current = setTimeout(() => {
        client.get(`/members/search?query=${value}`)
          .then(res => {
            if (res.data && res.data.length > 0) {
              setSearchResults(res.data);
              setShowSuggestions({field});
            } else {
              setShowSuggestions({field: null});
            }
          })
          .catch(err => console.error(err));
      }, 300);
    } else {
      setShowSuggestions({field: null});
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({...prev, phone_number: value}));
    if (errors.phone_number) setErrors(prev => ({...prev, phone_number: false}));
    handleSearch(value, 'phone');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({...prev, checkout_name: value}));
    if (errors.checkout_name) setErrors(prev => ({...prev, checkout_name: false}));
    handleSearch(value, 'name');
  };

  const selectMember = (member: any) => {
    setFormData(prev => ({
      ...prev,
      checkout_name: member.name,
      phone_number: member.phone_number || '',
      qobilah: member.qobilah || QOBILAHS[0]
    }));
    setShowSuggestions({field: null});
  };

  const handlePlaceOrderClick = () => {
    const newErrors: Record<string, boolean> = {};
    const errorMessages: string[] = [];

    if (!formData.checkout_name.trim()) {
      newErrors.checkout_name = true;
      errorMessages.push("Nama harus diisi");
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = true;
      errorMessages.push("Nomor Telepon harus diisi");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toaster.create({
        title: "Kesalahan Validasi",
        description: errorMessages.join("\n"),
        type: "error",
      });
      return;
    }

    setIsDialogOpen(true);
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        items: items.map(item => ({
          product_id: item.product.id,
          sku_id: item.sku_id,
          variant_ids: item.variants.map(v => v.id),
          quantity: item.quantity,
          recipient_name: item.recipient_name === 'Myself' ? formData.checkout_name : item.recipient_name,
          recipient_phone: (item.recipient_name === 'Myself' || item.recipient_name === formData.checkout_name) ? formData.phone_number : (item.recipient_phone || null),
          recipient_qobilah: (item.recipient_name === 'Myself' || item.recipient_name === formData.checkout_name) ? formData.qobilah : (item.recipient_qobilah || null),
        }))
      };

      const res = await client.post('/checkout', payload);
      clearCart();
      setIsDialogOpen(false);
      toaster.create({
        title: "Pesanan Berhasil",
        description: "Pesanan Anda telah berhasil dibuat!",
        type: "success",
      });
      navigate('/order-confirmation', { 
        state: { 
          orderId: res.data.order_id, 
          orderNumber: res.data.order_number,
          totalAmount: res.data.total_amount,
          items: items,
          formData: formData
        } 
      });
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Pesanan Gagal",
        description: "Gagal membuat pesanan. Silakan coba lagi.",
        type: "error",
      });
      setIsDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return <Container py={10}><Text>Keranjang Anda kosong.</Text></Container>;
  }

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6}>Pembayaran</Heading>
      
      <VStack gap={6} align="stretch">
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Item Keranjang</Heading>
          {items.map((item, index) => {
            const unitPrice = item.unit_price;
            
            return (
              <Box key={index} mb={4} p={2} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold">{item.product.name}</Text>
                {item.variants.length > 0 && (
                  <Text fontSize="sm" color="gray.600">
                    Varian: {item.variants.map(v => v.name).join(', ')}
                  </Text>
                )}
                <Text fontSize="sm">Untuk: {item.recipient_name}</Text>
                <Text fontSize="sm">Jml: {item.quantity} x Rp {unitPrice.toLocaleString()}</Text>
                <Button size="xs" colorPalette="red" variant="ghost" onClick={() => removeFromCart(index)}>Hapus</Button>
              </Box>
            );
          })}
          <Separator my={4} />
          <Text fontSize="xl" fontWeight="bold" textAlign="right">Total: Rp {total.toLocaleString()}</Text>
        </Box>

        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Detail Anda</Heading>
          <VStack gap={4}>
            <Box w="full" position="relative">
              <Text mb={1}>Nama <Text as="span" color="red.500">*</Text></Text>
              <Input
                value={formData.checkout_name}
                onChange={handleNameChange}
                onBlur={() => setTimeout(() => setShowSuggestions({field: null}), 200)}
                placeholder="Nama Anda"
                borderColor={errors.checkout_name ? "red.500" : undefined}
                autoComplete="off"
              />
              {showSuggestions.field === 'name' && searchResults.length > 0 && (
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
                      onClick={() => selectMember(member)}
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
            <Box w="full" position="relative">
              <Text mb={1}>Nomor Telepon <Text as="span" color="red.500">*</Text></Text>
              <Input 
                value={formData.phone_number} 
                onChange={handlePhoneChange}
                onBlur={() => setTimeout(() => setShowSuggestions({field: null}), 200)}
                placeholder="08..."
                borderColor={errors.phone_number ? "red.500" : undefined}
                autoComplete="off"
              />
              {showSuggestions.field === 'phone' && searchResults.length > 0 && (
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
                      onClick={() => selectMember(member)}
                    >
                      <Text fontWeight="bold" fontSize="sm">{member.phone_number || 'Tidak ada nomor'}</Text>
                      <Text fontSize="xs" color="gray.600">
                        {member.name} - {member.qobilah || ''}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Box w="full">
              <Text mb={1}>Qobilah</Text>
              <NativeSelect.Root>
                <NativeSelect.Field 
                  value={formData.qobilah} 
                  onChange={e => setFormData({...formData, qobilah: e.target.value})}
                >
                  {QOBILAHS.map(q => <option key={q} value={q}>{q}</option>)}
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Box>
          </VStack>
        </Box>

        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Metode Pembayaran</Heading>
          <RadioGroup.Root 
            value={formData.payment_method} 
            onValueChange={e => setFormData({...formData, payment_method: e.value || 'transfer'})}
          >
            <Stack direction="row" gap={4}>
              <RadioGroup.Item value="transfer">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>Transfer Bank</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value="cash">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>Tunai</RadioGroup.ItemText>
              </RadioGroup.Item>
            </Stack>
          </RadioGroup.Root>
          
          <Box mt={4} p={3} bg="blue.50" borderRadius="md">
            {formData.payment_method === 'transfer' ? (
              <Text>Silakan transfer ke BCA 1234567890 a.n BAM Store</Text>
            ) : (
              <Text>Silakan bayar di Sekretariat.</Text>
            )}
          </Box>
        </Box>

        <Button colorPalette="teal" size="lg" onClick={handlePlaceOrderClick} loading={loading}>
          Pesan Sekarang
        </Button>

        <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Pesanan</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <VStack align="stretch" gap={4}>
                <Text>Silakan periksa detail pesanan Anda:</Text>
                
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>Item ({items.length})</Text>
                  <VStack align="stretch" gap={2} mb={3}>
                    {items.map((item, index) => {
                      const unitPrice = item.unit_price;
                      const itemTotal = unitPrice * item.quantity;

                      return (
                        <Box key={index} p={2} bg="white" borderRadius="sm" borderWidth="1px">
                          <Text fontWeight="semibold" fontSize="sm">{item.product.name}</Text>
                          {item.variants.length > 0 && (
                            <Text fontSize="xs" color="gray.600">
                              {item.variants.map(v => v.name).join(', ')}
                            </Text>
                          )}
                          <Text fontSize="xs" color="gray.600">Untuk: {item.recipient_name}</Text>
                          <Stack direction="row" justify="space-between" mt={1}>
                            <Text fontSize="xs">{item.quantity} x Rp {unitPrice.toLocaleString()}</Text>
                            <Text fontSize="xs" fontWeight="bold">Rp {itemTotal.toLocaleString()}</Text>
                          </Stack>
                        </Box>
                      );
                    })}
                  </VStack>
                  <Separator mb={2} borderColor="gray.300" />
                  <Stack direction="row" justify="space-between">
                    <Text fontWeight="bold">Total Pembayaran</Text>
                    <Text fontWeight="bold" color="teal.600">Rp {total.toLocaleString()}</Text>
                  </Stack>
                </Box>

                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontWeight="bold">Penerima</Text>
                  <Text fontSize="sm">{formData.checkout_name}</Text>
                  <Text fontSize="sm">{formData.phone_number}</Text>
                  <Text fontSize="sm">{formData.qobilah}</Text>
                </Box>
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontWeight="bold">Metode Pembayaran</Text>
                  <Text fontSize="sm" textTransform="capitalize">{formData.payment_method === 'transfer' ? 'Transfer Bank' : 'Tunai'}</Text>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Apakah semua detail sudah benar?
                </Text>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Batal</Button>
              </DialogActionTrigger>
              <Button colorPalette="teal" onClick={handleConfirmOrder} loading={loading}>
                Konfirmasi Pesanan
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </VStack>
    </Container>
  );
};

export default Checkout;
