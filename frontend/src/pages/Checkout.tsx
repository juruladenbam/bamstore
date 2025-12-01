import React, { useState }                                                                                  from 'react';
import { Box, Container, Heading, Text, VStack, Input, NativeSelect, Button, RadioGroup, Stack, Separator } from '@chakra-ui/react';
import { useCart }                                                                                          from '../context/CartContext';
import client                                                                                               from '../api/client';
import { useNavigate }                                                                                      from 'react-router-dom';
import { toaster }                                                                                          from '../components/ui/toaster';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
} from '../components/ui/dialog';

const QOBILAHS = [
  "QOBILAH MARIYAH", "QOBILAH BUSYRI", "QOBILAH MUZAMMAH", "QOBILAH SULHAN",
  "QOBILAH SHOLIHATUN", "QOBILAH NURSIYAM", "QOBILAH NI'MAH", "QOBILAH ABD MAJID",
  "QOBILAH SAIDAH", "QOBILAH THOHIR AL ALY", "QOBILAH ABD. ROHIM (NGAGLIK)"
];

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

  const handlePlaceOrderClick = () => {
    const newErrors: Record<string, boolean> = {};
    const errorMessages: string[] = [];

    if (!formData.checkout_name.trim()) {
      newErrors.checkout_name = true;
      errorMessages.push("Name is required");
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = true;
      errorMessages.push("Phone Number is required");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toaster.create({
        title: "Validation Error",
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
          recipient_name: item.recipient_name === 'Myself' ? formData.checkout_name : item.recipient_name
        }))
      };

      const res = await client.post('/checkout', payload);
      clearCart();
      setIsDialogOpen(false);
      toaster.create({
        title: "Order Placed",
        description: "Your order has been placed successfully!",
        type: "success",
      });
      navigate('/order-confirmation', { 
        state: { 
          orderId: res.data.order_id, 
          totalAmount: res.data.total_amount,
          items: items,
          formData: formData
        } 
      });
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        type: "error",
      });
      setIsDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return <Container py={10}><Text>Your cart is empty.</Text></Container>;
  }

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6}>Checkout</Heading>
      
      <VStack gap={6} align="stretch">
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Cart Items</Heading>
          {items.map((item, index) => {
            const unitPrice = item.unit_price;
            
            return (
              <Box key={index} mb={4} p={2} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold">{item.product.name}</Text>
                {item.variants.length > 0 && (
                  <Text fontSize="sm" color="gray.600">
                    Variants: {item.variants.map(v => v.name).join(', ')}
                  </Text>
                )}
                <Text fontSize="sm">For: {item.recipient_name}</Text>
                <Text fontSize="sm">Qty: {item.quantity} x Rp {unitPrice.toLocaleString()}</Text>
                <Button size="xs" colorPalette="red" variant="ghost" onClick={() => removeFromCart(index)}>Remove</Button>
              </Box>
            );
          })}
          <Separator my={4} />
          <Text fontSize="xl" fontWeight="bold" textAlign="right">Total: Rp {total.toLocaleString()}</Text>
        </Box>

        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Your Details</Heading>
          <VStack gap={4}>
            <Box w="full">
              <Text mb={1}>Name <Text as="span" color="red.500">*</Text></Text>
              <Input 
                value={formData.checkout_name} 
                onChange={e => {
                  setFormData({...formData, checkout_name: e.target.value});
                  if (errors.checkout_name) setErrors(prev => ({...prev, checkout_name: false}));
                }} 
                placeholder="Your Name"
                borderColor={errors.checkout_name ? "red.500" : undefined}
              />
            </Box>
            <Box w="full">
              <Text mb={1}>Phone Number <Text as="span" color="red.500">*</Text></Text>
              <Input 
                value={formData.phone_number} 
                onChange={e => {
                  setFormData({...formData, phone_number: e.target.value});
                  if (errors.phone_number) setErrors(prev => ({...prev, phone_number: false}));
                }} 
                placeholder="08..."
                borderColor={errors.phone_number ? "red.500" : undefined}
              />
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
          <Heading size="md" mb={4}>Payment Method</Heading>
          <RadioGroup.Root 
            value={formData.payment_method} 
            onValueChange={e => setFormData({...formData, payment_method: e.value || 'transfer'})}
          >
            <Stack direction="row" gap={4}>
              <RadioGroup.Item value="transfer">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>Bank Transfer</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value="cash">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>Cash</RadioGroup.ItemText>
              </RadioGroup.Item>
            </Stack>
          </RadioGroup.Root>
          
          <Box mt={4} p={3} bg="blue.50" borderRadius="md">
            {formData.payment_method === 'transfer' ? (
              <Text>Please transfer to BCA 1234567890 a.n BAM Store</Text>
            ) : (
              <Text>Please pay at the Secretariat.</Text>
            )}
          </Box>
        </Box>

        <Button colorPalette="teal" size="lg" onClick={handlePlaceOrderClick} loading={loading}>
          Place Order
        </Button>

        <DialogRoot open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Order</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <VStack align="stretch" gap={4}>
                <Text>Please review your order details:</Text>
                
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontWeight="bold" mb={2}>Items ({items.length})</Text>
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
                          <Text fontSize="xs" color="gray.600">For: {item.recipient_name}</Text>
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
                    <Text fontWeight="bold">Total Amount</Text>
                    <Text fontWeight="bold" color="teal.600">Rp {total.toLocaleString()}</Text>
                  </Stack>
                </Box>

                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontWeight="bold">Recipient</Text>
                  <Text fontSize="sm">{formData.checkout_name}</Text>
                  <Text fontSize="sm">{formData.phone_number}</Text>
                  <Text fontSize="sm">{formData.qobilah}</Text>
                </Box>
                <Box bg="gray.50" p={3} borderRadius="md">
                  <Text fontWeight="bold">Payment Method</Text>
                  <Text fontSize="sm" textTransform="capitalize">{formData.payment_method}</Text>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Are you sure all details are correct?
                </Text>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
              <Button colorPalette="teal" onClick={handleConfirmOrder} loading={loading}>
                Confirm Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </VStack>
    </Container>
  );
};

export default Checkout;
