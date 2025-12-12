import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  SimpleGrid, 
  Text, 
  Table, 
  Badge, 
  HStack, 
  Input, 
  Button,
  Card
} from '@chakra-ui/react';
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
  
  // Default to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const fetchData = () => {
    setLoading(true);
    client.get('/admin/reports/finance', {
      params: { start_date: startDate, end_date: endDate }
    })
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        toaster.create({ title: "Gagal memuat laporan", type: "error" });
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  if (loading && !data) return <Container py={10}><Text>Memuat...</Text></Container>;

  return (
    <Container maxW="container.xl" py={10}>
      <HStack justify="space-between" mb={6} wrap="wrap" gap={4}>
        <Heading>Laporan Keuangan</Heading>
        <HStack>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            w="auto"
          />
          <Text>-</Text>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            w="auto"
          />
          <Button onClick={handleFilter} colorPalette="blue">Filter</Button>
        </HStack>
      </HStack>

      {data && (
        <>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
            <StatCard
              label="Penjualan Kotor"
              value={data.summary.gross_sales}
              color="teal.600"
              helpText="Total dari Pesanan Dibayar"
            />
            <StatCard
              label="Total HPP"
              value={data.summary.total_cogs}
              color="red.500"
              helpText="Estimasi Harga Pokok Penjualan"
            />
            <StatCard
              label="Laba Kotor"
              value={data.summary.gross_profit}
              color="green.600"
              helpText="Penjualan - HPP"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={10}>
            <StatCard
              label="Total Pembayaran Vendor"
              value={data.summary.total_vendor_payments}
              color="orange.500"
              helpText="Arus Kas Keluar ke Vendor"
            />
            <StatCard
              label="Arus Kas Bersih"
              value={data.summary.net_cash_flow}
              color={data.summary.net_cash_flow >= 0 ? "blue.600" : "red.600"}
              helpText="Penjualan - Pembayaran Vendor"
            />
          </SimpleGrid>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Rincian Transaksi</Heading>
            </Card.Header>
            <Card.Body>
              <Table.Root size="sm" striped>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Tanggal</Table.ColumnHeader>
                    <Table.ColumnHeader>Tipe</Table.ColumnHeader>
                    <Table.ColumnHeader>Kategori</Table.ColumnHeader>
                    <Table.ColumnHeader>Deskripsi</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Jumlah</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.transactions.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={6} textAlign="center">Tidak ada transaksi pada periode ini.</Table.Cell>
                    </Table.Row>
                  ) : (
                    data.transactions.map((trx: any) => (
                      <Table.Row key={trx.id}>
                        <Table.Cell>{new Date(trx.date).toLocaleDateString('id-ID')} {new Date(trx.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={trx.type === 'income' ? 'green' : 'red'}>
                            {trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>{trx.category}</Table.Cell>
                        <Table.Cell>{trx.description}</Table.Cell>
                        <Table.Cell textAlign="right" fontWeight="medium" color={trx.type === 'income' ? 'green.600' : 'red.600'}>
                          {trx.type === 'income' ? '+' : '-'} Rp {Number(trx.amount).toLocaleString()}
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant="outline">{trx.status}</Badge>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            </Card.Body>
          </Card.Root>
        </>
      )}
    </Container>
  );
};

export default FinancialReport;
