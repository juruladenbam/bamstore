import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import client from '../../api/client';
import { toaster } from '../../components/ui/toaster';

const StatCard = ({ label, value, color = "gray.600", helpText }: any) => (
  <Box borderWidth="1px" borderRadius="lg" p={6} bg="white" boxShadow="sm">
    <Text fontSize="sm" color="gray.500" mb={2}>{label}</Text>
    <Heading size="lg" color={color}>Rp {Number(value).toLocaleString()}</Heading>
    {helpText && <Text fontSize="xs" color="gray.400" mt={2}>{helpText}</Text>}
  </Box>
);

const FinancialReport: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/admin/reports/finance')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        toaster.create({ title: "Gagal memuat laporan", type: "error" });
      });
  }, []);

  if (loading) return <Container py={10}><Text>Memuat...</Text></Container>;
  if (!data) return <Container py={10}><Text>Tidak ada data.</Text></Container>;

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>Ikhtisar Keuangan</Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
        <StatCard
          label="Penjualan Kotor"
          value={data.gross_sales}
          color="teal.600"
          helpText="Total dari Pesanan Dibayar"
        />
        <StatCard
          label="Total HPP"
          value={data.total_cogs}
          color="red.500"
          helpText="Estimasi Harga Pokok Penjualan"
        />
        <StatCard
          label="Laba Kotor"
          value={data.gross_profit}
          color="green.600"
          helpText="Penjualan - HPP"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <StatCard
          label="Total Pembayaran Vendor"
          value={data.total_vendor_payments}
          color="orange.500"
          helpText="Arus Kas Keluar ke Vendor"
        />
        <StatCard
          label="Arus Kas Bersih"
          value={data.net_cash_flow}
          color={data.net_cash_flow >= 0 ? "blue.600" : "red.600"}
          helpText="Penjualan - Pembayaran Vendor"
        />
      </SimpleGrid>
    </Container>
  );
};

export default FinancialReport;
