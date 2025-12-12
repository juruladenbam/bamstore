import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  Text,
  HStack,
  IconButton,
  Textarea,
  Card,
  Stack,
  Separator
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import { toaster } from '../../components/ui/toaster';
import client from '../../api/client';

interface PaymentMethod {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  description: string;
}

const Settings: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [cashPaymentDescription, setCashPaymentDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await client.get('/settings');
      if (response.data.payment_methods) {
        setPaymentMethods(response.data.payment_methods);
      }
      if (response.data.cash_payment_description) {
        setCashPaymentDescription(response.data.cash_payment_description);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toaster.create({
        title: 'Gagal mengambil pengaturan',
        type: 'error',
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await client.post('/admin/settings', {
        payment_methods: paymentMethods,
        cash_payment_description: cashPaymentDescription
      });
      toaster.create({
        title: 'Pengaturan berhasil disimpan',
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toaster.create({
        title: 'Gagal menyimpan pengaturan',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = () => {
    setPaymentMethods([
      ...paymentMethods,
      { bankName: '', accountNumber: '', accountHolder: '', description: '' }
    ]);
  };

  const removePaymentMethod = (index: number) => {
    const newMethods = [...paymentMethods];
    newMethods.splice(index, 1);
    setPaymentMethods(newMethods);
  };

  const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: string) => {
    const newMethods = [...paymentMethods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setPaymentMethods(newMethods);
  };

  return (
    <Box>
      <Heading mb={6}>Pengaturan Toko</Heading>

      <Card.Root>
        <Card.Body>
          <Stack gap={4}>
            <Heading size="md">Metode Pembayaran</Heading>
            
            <Box>
              <Text fontWeight="bold" mb={2}>Pembayaran Tunai</Text>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Instruksi untuk pembayaran tunai (misal: Bayar di tempat / Sekretariat).
              </Text>
              <Textarea 
                value={cashPaymentDescription}
                onChange={(e) => setCashPaymentDescription(e.target.value)}
                placeholder="Contoh: Silakan bayar di Sekretariat."
                rows={3}
              />
            </Box>

            <Separator />

            <Text color="gray.500">
              Kelola rekening bank yang akan ditampilkan kepada pelanggan saat checkout.
            </Text>

            <VStack align="stretch" gap={6}>
              {paymentMethods.map((method, index) => (
                <Box key={index} p={4} borderWidth="1px" borderRadius="md" position="relative">
                  <IconButton
                    aria-label="Hapus"
                    colorPalette="red"
                    variant="ghost"
                    size="sm"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={() => removePaymentMethod(index)}
                  >
                      <FiTrash2 />
                  </IconButton>
                  
                  <VStack gap={4}>
                    <Box w="full">
                      <Text mb={1} fontWeight="medium">Nama Bank</Text>
                      <Input 
                        value={method.bankName} 
                        onChange={(e) => updatePaymentMethod(index, 'bankName', e.target.value)}
                        placeholder="Contoh: BCA"
                      />
                    </Box>
                    
                    <HStack gap={4} w="full">
                      <Box w="full">
                        <Text mb={1} fontWeight="medium">Nomor Rekening</Text>
                        <Input 
                          value={method.accountNumber} 
                          onChange={(e) => updatePaymentMethod(index, 'accountNumber', e.target.value)}
                          placeholder="1234567890"
                        />
                      </Box>
                      <Box w="full">
                        <Text mb={1} fontWeight="medium">Atas Nama</Text>
                        <Input 
                          value={method.accountHolder} 
                          onChange={(e) => updatePaymentMethod(index, 'accountHolder', e.target.value)}
                          placeholder="Nama Pemilik Rekening"
                        />
                      </Box>
                    </HStack>

                    <Box w="full">
                      <Text mb={1} fontWeight="medium">Deskripsi / Catatan</Text>
                      <Textarea 
                        value={method.description} 
                        onChange={(e) => updatePaymentMethod(index, 'description', e.target.value)}
                        placeholder="Instruksi transfer..."
                      />
                    </Box>
                  </VStack>
                </Box>
              ))}

              <Button variant="outline" onClick={addPaymentMethod}>
                <FiPlus /> Tambah Rekening Bank
              </Button>
            </VStack>
          </Stack>
        </Card.Body>
        <Card.Footer justifyContent="flex-end">
            <Button colorPalette="blue" onClick={handleSave} loading={loading}>
                <FiSave /> Simpan Perubahan
            </Button>
        </Card.Footer>
      </Card.Root>
    </Box>
  );
};

export default Settings;
