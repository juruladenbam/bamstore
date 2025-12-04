import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, Button, HStack } from '@chakra-ui/react';
import html2canvas from 'html2canvas';
import { toaster } from '../components/ui/toaster';
import type { CartItem } from '../types';

interface OrderConfirmationState {
  orderId: number;
  orderNumber?: string;
  totalAmount: number;
  items: CartItem[];
  formData: {
    checkout_name: string;
    phone_number: string;
    qobilah: string;
    payment_method: string;
  };
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const state = location.state as OrderConfirmationState | undefined;
  const printRef = useRef<HTMLDivElement>(null);

  if (!state) {
    return (
      <Container py={10}>
        <Heading>Order Not Found</Heading>
        <Button asChild mt={4} colorPalette="teal">
          <Link to="/">Back to Home</Link>
        </Button>
      </Container>
    );
  }

  const { orderId, orderNumber, totalAmount, items, formData } = state;

  const handleDownload = async () => {
    if (!printRef.current) return;
    
    try {
      const canvas = await html2canvas(printRef.current);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Order-${orderNumber || orderId}.png`;
      link.click();
      toaster.create({ title: "Image Downloaded", type: "success" });
    } catch (error) {
      console.error(error);
      toaster.create({ title: "Download Failed", type: "error" });
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack gap={6}>
        <Heading color="teal.600">Order Placed Successfully!</Heading>
        <Text>Thank you for your order. Please save this confirmation.</Text>

        <Box 
          ref={printRef} 
          bg="#ffffff" 
          p={8} 
          borderRadius="lg" 
          w="full" 
          borderWidth="1px"
          borderColor="#e2e8f0"
        >
          <VStack align="stretch" gap={4}>
            <Heading size="md" textAlign="center" mb={2} color="#000000">BAM Store Order {orderNumber || '#' + orderId}</Heading>
            
            <Box color="#000000">
              <Text fontWeight="bold">Recipient Details</Text>
              <Text>{formData.checkout_name}</Text>
              <Text>{formData.phone_number}</Text>
              <Text>{formData.qobilah}</Text>
            </Box>

            <Box borderBottomWidth="1px" borderColor="#e2e8f0" />

            <Box color="#000000">
              <Text fontWeight="bold" mb={2}>Items</Text>
              {items.map((item, index) => (
                <Box key={index} mb={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="medium">{item.product.name}</Text>
                    <Text>Rp {(item.unit_price * item.quantity).toLocaleString()}</Text>
                  </HStack>
                  <Text fontSize="sm" color="#4a5568">
                    {item.quantity} x Rp {item.unit_price.toLocaleString()}
                    {item.variants.length > 0 && ` (${item.variants.map(v => v.name).join(', ')})`}
                  </Text>
                  <Text fontSize="xs" color="#718096">For: {item.recipient_name}</Text>
                </Box>
              ))}
            </Box>

            <Box borderBottomWidth="1px" borderColor="#e2e8f0" />

            <HStack justify="space-between">
              <Heading size="sm" color="#000000">Total Amount</Heading>
              <Heading size="sm" color="#2c7a7b">Rp {totalAmount.toLocaleString()}</Heading>
            </HStack>

            <Box bg="#f7fafc" p={3} borderRadius="md" mt={2} color="#000000">
              <Text fontWeight="bold" fontSize="sm">Payment Method: {formData.payment_method === 'transfer' ? 'Bank Transfer' : 'Cash'}</Text>
              {formData.payment_method === 'transfer' ? (
                <Text fontSize="sm">BCA 1234567890 a.n BAM Store</Text>
              ) : (
                <Text fontSize="sm">Pay at Secretariat</Text>
              )}
            </Box>
            
            <Text fontSize="xs" textAlign="center" color="#a0aec0" mt={4}>
              Generated on {new Date().toLocaleDateString()}
            </Text>
          </VStack>
        </Box>

        <HStack>
          <Button onClick={handleDownload} colorPalette="blue">Download as Image</Button>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
};

export default OrderConfirmation;
