import React, { useEffect, useState } from 'react';
import { Box, SimpleGrid, Stat, Heading, Table, Card, Text, Stack, Badge } from '@chakra-ui/react';
import client from '../../api/client';
import { toaster } from '../../components/ui/toaster';

interface DashboardData {
    stats: {
        total_revenue: number;
        total_orders: number;
        total_products: number;
        total_customers: number;
    };
    recent_orders: any[];
    sales_chart: { date: string; total: number }[];
    order_status: { status: string; count: number }[];
}

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get('/admin/dashboard')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toaster.create({
                    title: "Error",
                    description: "Failed to load dashboard data",
                    type: "error",
                });
                setLoading(false);
            });
    }, []);

    if (loading) return <Box p={5}>Loading...</Box>;
    if (!data) return <Box p={5}>No data available</Box>;

    return (
        <Box>
            <Heading mb={5}>Dashboard Overview</Heading>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={5} mb={10}>
                <StatCard label="Total Revenue" value={`Rp ${parseInt(data.stats.total_revenue.toString()).toLocaleString()}`} />
                <StatCard label="Total Orders" value={data.stats.total_orders} />
                <StatCard label="Total Products" value={data.stats.total_products} />
                <StatCard label="Total Customers" value={data.stats.total_customers} />
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
                <Card.Root>
                    <Card.Header>
                        <Heading size="md">Recent Orders</Heading>
                    </Card.Header>
                    <Card.Body>
                        <Table.Root size="sm">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Order #</Table.ColumnHeader>
                                    <Table.ColumnHeader>Customer</Table.ColumnHeader>
                                    <Table.ColumnHeader>Total</Table.ColumnHeader>
                                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {data.recent_orders.map((order: any) => (
                                    <Table.Row key={order.id}>
                                        <Table.Cell>{order.order_number}</Table.Cell>
                                        <Table.Cell>{order.checkout_name || order.phone_number}</Table.Cell>
                                        <Table.Cell>Rp {parseInt(order.grand_total || order.total_amount).toLocaleString()}</Table.Cell>
                                        <Table.Cell>
                                            <Badge colorPalette={getStatusColor(order.status)}>{order.status}</Badge>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Card.Body>
                </Card.Root>

                <Card.Root>
                    <Card.Header>
                        <Heading size="md">Order Status Distribution</Heading>
                    </Card.Header>
                    <Card.Body>
                        <Stack gap={4}>
                            {data.order_status.map((status: any) => (
                                <Box key={status.status}>
                                    <Text mb={1} textTransform="capitalize">{status.status}</Text>
                                    <Box w="100%" bg="gray.100" h="2" borderRadius="full">
                                        <Box
                                            bg="blue.500"
                                            h="2"
                                            borderRadius="full"
                                            width={`${(status.count / data.stats.total_orders) * 100}%`}
                                        />
                                    </Box>
                                    <Text fontSize="xs" color="gray.500" mt={1}>{status.count} orders</Text>
                                </Box>
                            ))}
                        </Stack>
                    </Card.Body>
                </Card.Root>
            </SimpleGrid>
        </Box>
    );
};

const StatCard = ({ label, value }: { label: string, value: any }) => (
    <Card.Root>
        <Card.Body>
            <Stat.Root>
                <Stat.Label>{label}</Stat.Label>
                <Stat.ValueText>{value}</Stat.ValueText>
            </Stat.Root>
        </Card.Body>
    </Card.Root>
);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'green';
        case 'pending': return 'yellow';
        case 'cancelled': return 'red';
        case 'processing': return 'blue';
        default: return 'gray';
    }
};

export default Dashboard;
