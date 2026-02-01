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
  NativeSelect,
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

  // Default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const firstDay = thirtyDaysAgo.toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');

  const fetchData = () => {
    setLoading(true);
    client.get('/admin/reports/finance', {
      params: {
        start_date: startDate,
        end_date: endDate,
        payment_method: filterPaymentMethod
      }
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
        <HStack wrap="wrap" gap={2} w={{ base: "full", md: "auto" }}>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            w={{ base: "full", md: "auto" }}
          />
          <Text display={{ base: "none", md: "block" }}>-</Text>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            w={{ base: "full", md: "auto" }}
          />
          <Button onClick={handleFilter} colorPalette="blue" w={{ base: "full", md: "auto" }}>Filter</Button>
          <Box w={{ base: "full", md: "200px" }}>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={filterPaymentMethod}
                onChange={(e) => setFilterPaymentMethod(e.target.value)}
              >
                <option value="">Semua Metode</option>
                <option value="cash">CASH</option>
                <option value="transfer">TRANSFER</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>
        </HStack>
      </HStack>

      {data && (
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={8}>
            <StatCard
              label="Penjualan Kotor"
              value={data.summary.gross_sales}
              color="gray.600"
              helpText="Total nilai barang terjual"
            />
            <StatCard
              label="Total Diskon"
              value={data.summary.total_discount}
              color="red.500"
              helpText="Potongan dari kupon"
            />
            <StatCard
              label="Penjualan Bersih"
              value={data.summary.net_sales}
              color="teal.600"
              helpText="Uang riil yang diterima"
            />
            <StatCard
              label="Laba Kotor"
              value={data.summary.gross_profit}
              color="green.600"
              helpText="Penjualan Bersih - HPP"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
            <StatCard
              label="Penjualan Tunai (Cash)"
              value={data.summary.cash_sales}
              color="blue.500"
              helpText="Total pembayaran tunai"
            />
            <StatCard
              label="Penjualan Transfer"
              value={data.summary.transfer_sales}
              color="purple.500"
              helpText="Total pembayaran melalui transfer"
            />
            <StatCard
              label="Total Arus Kas Masuk"
              value={data.summary.net_sales}
              color="teal.600"
              helpText="Cash + Transfer"
            />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={10}>
            <StatCard
              label="Total HPP (COGS)"
              value={data.summary.total_cogs}
              color="orange.400"
              helpText="Estimasi Harga Modal"
            />
            <StatCard
              label="Total Pembayaran Vendor"
              value={data.summary.total_vendor_payments}
              color="orange.600"
              helpText="Arus Kas Keluar ke Vendor"
            />
            <StatCard
              label="Arus Kas Bersih"
              value={data.summary.net_cash_flow}
              color={data.summary.net_cash_flow >= 0 ? "blue.600" : "red.600"}
              helpText="Total Masuk - Total Keluar"
            />
          </SimpleGrid>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Rincian Transaksi</Heading>
            </Card.Header>
            <Card.Body>
              <Box overflowX="auto">
                <Table.Root size="sm" striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Tanggal</Table.ColumnHeader>
                      <Table.ColumnHeader>Tipe</Table.ColumnHeader>
                      <Table.ColumnHeader>Kategori</Table.ColumnHeader>
                      <Table.ColumnHeader>Deskripsi</Table.ColumnHeader>
                      <Table.ColumnHeader>Metode</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Gross</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Diskon</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Net (Received)</Table.ColumnHeader>
                      <Table.ColumnHeader>Status</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {data.transactions.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={9} textAlign="center">Tidak ada transaksi pada periode ini.</Table.Cell>
                      </Table.Row>
                    ) : (
                      <>
                        {/* Row Total (Top) */}
                        <Table.Row bg="gray.100" fontWeight="bold">
                          <Table.Cell colSpan={5}>TOTAL (PERIODE INI)</Table.Cell>
                          <Table.Cell textAlign="right">Rp {Number(data.summary.gross_sales).toLocaleString()}</Table.Cell>
                          <Table.Cell textAlign="right" color="red.500">-Rp {Number(data.summary.total_discount).toLocaleString()}</Table.Cell>
                          <Table.Cell textAlign="right" color={data.summary.net_cash_flow >= 0 ? "blue.600" : "red.600"}>
                            Rp {Number(data.summary.net_cash_flow).toLocaleString()}
                          </Table.Cell>
                          <Table.Cell></Table.Cell>
                        </Table.Row>

                        {data.transactions.map((trx: any) => (
                          <Table.Row key={trx.id}>
                            <Table.Cell whiteSpace="nowrap">{new Date(trx.date).toLocaleDateString('id-ID')} {new Date(trx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Table.Cell>
                            <Table.Cell>
                              <Badge colorPalette={trx.type === 'income' ? 'green' : 'red'}>
                                {trx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>{trx.category}</Table.Cell>
                            <Table.Cell maxW="300px">
                              <Text fontSize="sm" fontWeight="medium">{trx.description.split(': ')[0]}</Text>
                              {trx.description.includes(': ') && (
                                <Text fontSize="xs" color="gray.500">
                                  {trx.description.split(': ')[1]}
                                </Text>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {trx.payment_method ? (
                                <Badge variant="subtle" colorPalette={trx.payment_method === 'cash' ? 'blue' : 'purple'}>
                                  {trx.payment_method.toUpperCase()}
                                </Badge>
                              ) : '-'}
                            </Table.Cell>
                            <Table.Cell textAlign="right">
                              {trx.type === 'income' ? `Rp ${Number(trx.gross_amount).toLocaleString()}` : '-'}
                            </Table.Cell>
                            <Table.Cell textAlign="right" color="red.500">
                              {trx.type === 'income' && trx.discount_amount > 0 ? `-Rp ${Number(trx.discount_amount).toLocaleString()}` : '-'}
                            </Table.Cell>
                            <Table.Cell textAlign="right" fontWeight="bold" color={trx.type === 'income' ? 'green.600' : 'red.600'}>
                              {trx.type === 'income' ? '+' : '-'} Rp {Number(trx.amount).toLocaleString()}
                            </Table.Cell>
                            <Table.Cell>
                              <Badge variant="outline">{trx.status}</Badge>
                            </Table.Cell>
                          </Table.Row>
                        ))}

                        {/* Row Total (Bottom) */}
                        <Table.Row bg="gray.100" fontWeight="bold">
                          <Table.Cell colSpan={5}>TOTAL (PERIODE INI)</Table.Cell>
                          <Table.Cell textAlign="right">Rp {Number(data.summary.gross_sales).toLocaleString()}</Table.Cell>
                          <Table.Cell textAlign="right" color="red.500">-Rp {Number(data.summary.total_discount).toLocaleString()}</Table.Cell>
                          <Table.Cell textAlign="right" color={data.summary.net_cash_flow >= 0 ? "blue.600" : "red.600"}>
                            Rp {Number(data.summary.net_cash_flow).toLocaleString()}
                          </Table.Cell>
                          <Table.Cell></Table.Cell>
                        </Table.Row>
                      </>
                    )}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card.Body>
          </Card.Root>
        </>
      )}
    </Container>
  );
};

export default FinancialReport;
