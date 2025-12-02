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
        toaster.create({ title: "Failed to load report", type: "error" });
      });
  }, []);

  if (loading) return <Container py={10}><Text>Loading...</Text></Container>;
  if (!data) return <Container py={10}><Text>No data available.</Text></Container>;

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={6}>Financial Overview</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
        <StatCard 
          label="Gross Sales" 
          value={data.gross_sales} 
          color="teal.600" 
          helpText="Total from Paid Orders"
        />
        <StatCard 
          label="Total COGS" 
          value={data.total_cogs} 
          color="red.500" 
          helpText="Estimated Cost of Goods Sold"
        />
        <StatCard 
          label="Gross Profit" 
          value={data.gross_profit} 
          color="green.600" 
          helpText="Sales - COGS"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <StatCard 
          label="Total Vendor Payments" 
          value={data.total_vendor_payments} 
          color="orange.500" 
          helpText="Actual Cash Outflow to Vendors"
        />
        <StatCard 
          label="Net Cash Flow" 
          value={data.net_cash_flow} 
          color={data.net_cash_flow >= 0 ? "blue.600" : "red.600"} 
          helpText="Sales - Vendor Payments"
        />
      </SimpleGrid>
    </Container>
  );
};

export default FinancialReport;
