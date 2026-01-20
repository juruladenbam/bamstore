import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Text,
    VStack,
    HStack,
    Textarea,
    Flex,
    Spinner,
    Badge,
} from '@chakra-ui/react';
import { FiLink, FiShare2 } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import {
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    DialogTitle,
    DialogCloseTrigger,
} from './ui/dialog';
import { toaster } from './ui/toaster';
import client from '../api/client';

interface ShareItem {
    recipient_name: string;
    total_quantity?: number;
    // Optional because byVariant uses VariantItem
    product_name?: string;
    variants?: string;
    quantity?: number;
    status: string;
}

interface QobilahGroup {
    name: string;
    total_orders: number;
    total_paid: number;
    total_unpaid: number;
    items: ShareItem[];
}

interface VariantItem {
    recipient_name: string;
    quantity: number;
    status: string;
}

interface VariantGroup {
    sku: string;
    total_quantity: number;
    total_orders: number;
    total_paid: number;
    total_unpaid: number;
    items: VariantItem[];
}

interface ExportData {
    by_qobilah: QobilahGroup[];
    by_variant: VariantGroup[];
    summary: {
        total_orders: number;
        total_paid: number;
        total_unpaid: number;
        total_quantity: number;
        export_date: string;
    };
}

interface ShareActivityDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

type ShareMode = 'qobilah' | 'variant';

const ShareActivityDrawer: React.FC<ShareActivityDrawerProps> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<ShareMode>('qobilah');
    const [data, setData] = useState<ExportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [shareText, setShareText] = useState('');

    const baseUrl = window.location.origin;
    const activityUrl = `${baseUrl}/activity`;

    useEffect(() => {
        if (isOpen) {
            fetchExportData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (data) {
            generateShareText();
        }
    }, [data, mode]);

    const fetchExportData = async () => {
        setLoading(true);
        try {
            const response = await client.get('/order-activity/export');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch export data:', error);
            toaster.create({
                title: 'Gagal memuat data',
                description: 'Terjadi kesalahan saat memuat data pesanan',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const generateShareText = () => {
        if (!data) return;

        if (mode === 'qobilah') {
            setShareText(generateByQobilahText(data));
        } else {
            setShareText(generateByVariantText(data));
        }
    };

    const generateByQobilahText = (data: ExportData): string => {
        const lines: string[] = [
            '[REKAP] *REKAP PESANAN TERBARU*',
            `Link: ${activityUrl}`,
            `Per tanggal: ${data.summary.export_date}`,
            '',
            '========================',
            '',
        ];

        data.by_qobilah.forEach((group) => {
            lines.push(`>> *${group.name}* (${group.total_orders} pesanan)`);

            group.items.forEach((item) => {
                const status = item.status === 'paid' ? 'LUNAS' : 'BELUM';
                const qtyText = item.total_quantity ? ` (${item.total_quantity}x)` : '';
                lines.push(`- ${item.recipient_name}${qtyText} [${status}]`);
            });

            lines.push('');
        });

        lines.push('========================');
        lines.push(`Total: ${data.summary.total_orders} pesanan`);
        lines.push(`Lunas: ${data.summary.total_paid} | Belum Lunas: ${data.summary.total_unpaid}`);

        return lines.join('\n');
    };

    const generateByVariantText = (data: ExportData): string => {
        const lines: string[] = [
            '[REKAP] *REKAP PESANAN BY VARIAN*',
            `Link: ${activityUrl}`,
            `Per tanggal: ${data.summary.export_date}`,
            '',
            '========================',
            '',
        ];

        data.by_variant.forEach((group) => {
            lines.push(`>> *${group.sku}* (${group.total_quantity} pcs)`);
            lines.push('------------------------');

            group.items.forEach((item) => {
                const statusIcon = item.status === 'paid' ? '[LUNAS]' : '[BELUM]';
                lines.push(`- ${item.recipient_name} (${item.quantity}x) ${statusIcon}`);
            });

            lines.push('');
        });

        lines.push('========================');
        lines.push(`Total: ${data.summary.total_quantity} pcs dari ${data.summary.total_orders} pesanan`);
        lines.push(`Lunas: ${data.summary.total_paid} | Belum Lunas: ${data.summary.total_unpaid}`);

        return lines.join('\n');
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(activityUrl);
            toaster.create({
                title: 'Link disalin!',
                description: 'Link halaman aktivitas berhasil disalin ke clipboard',
                type: 'success',
            });
        } catch {
            toaster.create({
                title: 'Gagal menyalin link',
                type: 'error',
            });
        }
    };

    const handleShareWhatsApp = () => {
        const encodedText = encodeURIComponent(shareText);
        const waUrl = `https://wa.me/?text=${encodedText}`;
        window.open(waUrl, '_blank');
    };

    return (
        <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="lg">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <HStack gap={2}>
                            <FiShare2 />
                            <Text>Bagikan Aktivitas Pesanan</Text>
                        </HStack>
                    </DialogTitle>
                    <DialogCloseTrigger />
                </DialogHeader>

                <DialogBody>
                    {loading ? (
                        <Flex justify="center" align="center" py={10}>
                            <Spinner size="lg" />
                        </Flex>
                    ) : (
                        <VStack gap={4} align="stretch">
                            {/* Mode Toggle */}
                            <HStack gap={2}>
                                <Button
                                    size="sm"
                                    variant={mode === 'qobilah' ? 'solid' : 'outline'}
                                    colorPalette={mode === 'qobilah' ? 'blue' : 'gray'}
                                    onClick={() => setMode('qobilah')}
                                >
                                    By Qobilah
                                </Button>
                                <Button
                                    size="sm"
                                    variant={mode === 'variant' ? 'solid' : 'outline'}
                                    colorPalette={mode === 'variant' ? 'blue' : 'gray'}
                                    onClick={() => setMode('variant')}
                                >
                                    By Varian
                                </Button>
                            </HStack>

                            {/* Summary Badges */}
                            {data && (
                                <HStack gap={2} flexWrap="wrap">
                                    <Badge colorPalette="blue">{data.summary.total_orders} Pesanan</Badge>
                                    <Badge colorPalette="green">✅ {data.summary.total_paid} Lunas</Badge>
                                    <Badge colorPalette="yellow">⏳ {data.summary.total_unpaid} Belum Lunas</Badge>
                                </HStack>
                            )}

                            {/* Preview Text */}
                            <Box>
                                <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                                    Preview Teks:
                                </Text>
                                <Textarea
                                    value={shareText}
                                    readOnly
                                    rows={12}
                                    fontFamily="mono"
                                    fontSize="xs"
                                    bg="gray.50"
                                    resize="vertical"
                                />
                            </Box>
                        </VStack>
                    )}
                </DialogBody>

                <DialogFooter>
                    <HStack gap={3} width="100%" justify="flex-end">
                        <Button
                            variant="outline"
                            onClick={handleCopyLink}
                            disabled={loading}
                        >
                            <FiLink />
                            <Text ml={2}>Salin Link</Text>
                        </Button>
                        <Button
                            colorPalette="green"
                            onClick={handleShareWhatsApp}
                            disabled={loading || !shareText}
                        >
                            <FaWhatsapp />
                            <Text ml={2}>Bagikan via WhatsApp</Text>
                        </Button>
                    </HStack>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};

export default ShareActivityDrawer;
