import React, { useState, useEffect } from 'react';
import {
  Button,
  Text,
  VStack,
  HStack,
  RadioGroup,
  Stack,
  Input,
  Box,
  Badge,
} from '@chakra-ui/react';
import { FiPrinter } from 'react-icons/fi';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
} from '../../ui/dialog';
import PrintContainer from './PrintContainer';
import type { Order } from '../../../types';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrders: Order[];
  allOrders: Order[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

type PrintMode = 'all' | 'selected' | 'current';

const PrintDialog: React.FC<PrintDialogProps> = ({
  isOpen,
  onClose,
  selectedOrders,
  allOrders,
  dateRange,
  onDateRangeChange,
}) => {
  const [printMode, setPrintMode] = useState<PrintMode>('all');
  const [isPrinting, setIsPrinting] = useState(false);

  // Reset print mode when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Use requestAnimationFrame to avoid synchronous setState warning
      requestAnimationFrame(() => {
        setPrintMode(selectedOrders.length > 0 ? 'selected' : 'all');
        setIsPrinting(false);
      });
    }
  }, [isOpen, selectedOrders.length]);

  const getOrdersToPrint = (): Order[] => {
    switch (printMode) {
      case 'selected':
        return selectedOrders;
      case 'all':
        return allOrders;
      default:
        return allOrders;
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
  };

  const handlePrintComplete = () => {
    setIsPrinting(false);
  };

  const ordersToPrint = getOrdersToPrint();
  const canPrintSelected = selectedOrders.length > 0;

  return (
    <>
      <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
        <DialogContent maxW="600px">
          <DialogHeader>
            <DialogTitle>Cetak Pesanan</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack align="stretch" gap={4}>
              {/* Date Range Filter */}
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="bold" mb={3}>
                  Filter Tanggal
                </Text>
                <HStack gap={4}>
                  <VStack align="start" flex={1}>
                    <Text fontSize="sm">Dari Tanggal:</Text>
                    <Input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) =>
                        onDateRangeChange({
                          ...dateRange,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </VStack>
                  <VStack align="start" flex={1}>
                    <Text fontSize="sm">Sampai Tanggal:</Text>
                    <Input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) =>
                        onDateRangeChange({
                          ...dateRange,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </VStack>
                </HStack>
              </Box>

              {/* Print Mode Selection */}
              <Box>
                <Text fontWeight="bold" mb={3}>
                  Pilihan Cetak
                </Text>
                <RadioGroup.Root
                  value={printMode}
                  onValueChange={(e) => setPrintMode(e.value as PrintMode)}
                >
                  <Stack direction="column" gap={3}>
                    <RadioGroup.Item value="all">
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemControl />
                      <RadioGroup.ItemText>
                        <HStack>
                          <span>Cetak Semua Pesanan</span>
                          <Badge colorPalette="blue">{allOrders.length}</Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" ml={6}>
                          Semua pesanan dalam rentang tanggal yang dipilih
                        </Text>
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>

                    <RadioGroup.Item value="selected" disabled={!canPrintSelected}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemControl />
                      <RadioGroup.ItemText>
                        <HStack>
                          <span
                            style={{
                              opacity: canPrintSelected ? 1 : 0.5,
                            }}
                          >
                            Cetak Pesanan Terpilih
                          </span>
                          <Badge
                            colorPalette={canPrintSelected ? 'green' : 'gray'}
                          >
                            {selectedOrders.length}
                          </Badge>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" ml={6}>
                          {canPrintSelected
                            ? 'Hanya pesanan yang dipilih di tabel'
                            : 'Pilih pesanan di tabel terlebih dahulu'}
                        </Text>
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>
                  </Stack>
                </RadioGroup.Root>
              </Box>

              {/* Summary */}
              <Box
                p={3}
                bg="blue.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor="blue.500"
              >
                <Text fontWeight="bold" fontSize="sm">
                  Ringkasan:
                </Text>
                <Text fontSize="sm">
                  {ordersToPrint.length} pesanan akan dicetak
                </Text>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Tiap halaman A4 menampung 2 pesanan
                </Text>
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Batal</Button>
            </DialogActionTrigger>
            <Button
              colorPalette="blue"
              onClick={handlePrint}
              loading={isPrinting}
              disabled={ordersToPrint.length === 0}
            >
              <FiPrinter />
              Cetak
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Print Container with iframe */}
      {isPrinting && ordersToPrint.length > 0 && (
        <PrintContainer
          orders={ordersToPrint}
          title={`Daftar Pesanan (${dateRange.startDate} s/d ${dateRange.endDate})`}
          onPrintComplete={handlePrintComplete}
        />
      )}
    </>
  );
};

export default PrintDialog;
