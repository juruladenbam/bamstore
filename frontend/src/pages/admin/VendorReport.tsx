import React, { useEffect, useState }                                                            from 'react';
import { Box, Container, Heading, Table, Button, HStack, NativeSelect, Text, VStack } from '@chakra-ui/react';
import client                                                                                    from '../../api/client';
import { toaster }                                                                               from '../../components/ui/toaster';

// --- Helper Functions ---

const SIZE_ORDER = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', 'ALL SIZE'];

const sortSizes = (a: string, b: string) => {
    const idxA = SIZE_ORDER.indexOf(a.toUpperCase());
    const idxB = SIZE_ORDER.indexOf(b.toUpperCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
};

// --- Components ---

interface ProductReportTableProps {
    productName: string;
    vendorName: string;
    data: any[];
}

const ProductReportTable: React.FC<ProductReportTableProps> = ({ productName, vendorName, data }) => {
    // 1. Analyze Dimensions
    const allVariantTypes = new Set<string>();
    data.forEach(item => {
        item.variants.forEach((v: any) => allVariantTypes.add(v.type));
    });
    const dimensions = Array.from(allVariantTypes);

    // If no variants, simple table
    if (dimensions.length === 0) {
        const total = data.reduce((sum, item) => sum + item.total_quantity, 0);
        return (
            <Box mb={8} breakInside="avoid">
                <Heading size="sm" mb={2}>{productName} ({vendorName})</Heading>
                <Table.Root size="sm" variant="outline">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Produk</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="right">Total Jumlah</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell>{productName}</Table.Cell>
                            <Table.Cell textAlign="right" fontWeight="bold">{total}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </Box>
        );
    }

    // 2. Determine Row and Column Dimensions
    // Prefer "Size" or "Ukuran" for rows
    let rowDim = dimensions.find(d => d.toLowerCase().includes('size') || d.toLowerCase().includes('ukuran'));
    if (!rowDim) {
        // If no size, pick the last dimension as row (arbitrary but consistent)
        rowDim = dimensions[dimensions.length - 1];
    }
    const colDims = dimensions.filter(d => d !== rowDim);

    // 3. Extract Unique Values
    const rowValues = new Set<string>();
    const colCombinations = new Map<string, any>(); // Key: "Val1|Val2", Value: { parts: ['Val1', 'Val2'] }

    data.forEach(item => {
        // Find row value
        const rowVar = item.variants.find((v: any) => v.type === rowDim);
        const rowVal = rowVar ? rowVar.name : 'N/A';
        rowValues.add(rowVal);

        // Find col combination
        const colParts = colDims.map(dim => {
            const v = item.variants.find((varItem: any) => varItem.type === dim);
            return v ? v.name : 'N/A';
        });
        const colKey = colParts.join('|');
        if (!colCombinations.has(colKey)) {
            colCombinations.set(colKey, { parts: colParts, key: colKey });
        }
    });

    const sortedRowValues = Array.from(rowValues).sort(sortSizes);
    
    // Sort columns: This is tricky. We sort by the first part, then second...
    const sortedColKeys = Array.from(colCombinations.keys()).sort((a, b) => {
        const partsA = colCombinations.get(a)!.parts;
        const partsB = colCombinations.get(b)!.parts;
        for (let i = 0; i < partsA.length; i++) {
            if (partsA[i] !== partsB[i]) return partsA[i].localeCompare(partsB[i]);
        }
        return 0;
    });

    // 4. Build Lookup Map for Quantities
    const quantityMap = new Map<string, number>(); // Key: "RowVal|ColKey"
    data.forEach(item => {
        const rowVar = item.variants.find((v: any) => v.type === rowDim);
        const rowVal = rowVar ? rowVar.name : 'N/A';
        
        const colParts = colDims.map(dim => {
            const v = item.variants.find((varItem: any) => varItem.type === dim);
            return v ? v.name : 'N/A';
        });
        const colKey = colParts.join('|');
        
        const key = `${rowVal}|${colKey}`;
        quantityMap.set(key, (quantityMap.get(key) || 0) + item.total_quantity);
    });

    // 5. Calculate Totals
    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number> = {};
    let grandTotal = 0;

    sortedRowValues.forEach(r => {
        rowTotals[r] = 0;
        sortedColKeys.forEach(c => {
            const qty = quantityMap.get(`${r}|${c}`) || 0;
            rowTotals[r] += qty;
            colTotals[c] = (colTotals[c] || 0) + qty;
            grandTotal += qty;
        });
    });

    // 6. Render Matrix
    return (
        <Box mb={8} breakInside="avoid">
            <Heading size="sm" mb={2}>{productName} ({vendorName})</Heading>
            <Box overflowX="auto">
                <Table.Root size="sm" variant="outline" borderWidth="1px">
                    <Table.Header>
                        {/* Dynamic Headers for Column Dimensions */}
                        {colDims.length > 0 ? (
                            <>
                                {/* If we have nested columns, we might want to group them visually. 
                                    For simplicity in this generic version, we'll just stack headers or use a combined string if complex.
                                    But let's try to do at least one level of grouping if possible.
                                */}
                                <Table.Row>
                                    <Table.ColumnHeader rowSpan={colDims.length + 1} bg="gray.50" width="150px">
                                        {rowDim}
                                    </Table.ColumnHeader>
                                    {/* Render Column Headers - Simplified: Just list combinations */}
                                    {sortedColKeys.map(colKey => (
                                        <Table.ColumnHeader key={colKey} textAlign="center" bg="gray.50">
                                            {colCombinations.get(colKey)!.parts.join(' - ')}
                                        </Table.ColumnHeader>
                                    ))}
                                    <Table.ColumnHeader rowSpan={colDims.length + 1} textAlign="center" bg="gray.100" fontWeight="bold">
                                        Total
                                    </Table.ColumnHeader>
                                </Table.Row>
                            </>
                        ) : (
                            <Table.Row>
                                <Table.ColumnHeader bg="gray.50">{rowDim}</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="center" bg="gray.100" fontWeight="bold">Total</Table.ColumnHeader>
                            </Table.Row>
                        )}
                    </Table.Header>
                    <Table.Body>
                        {sortedRowValues.map(rowVal => (
                            <Table.Row key={rowVal}>
                                <Table.Cell fontWeight="medium">{rowVal}</Table.Cell>
                                {colDims.length > 0 ? (
                                    sortedColKeys.map(colKey => {
                                        const qty = quantityMap.get(`${rowVal}|${colKey}`);
                                        return (
                                            <Table.Cell key={colKey} textAlign="center">
                                                {qty || '-'}
                                            </Table.Cell>
                                        );
                                    })
                                ) : null}
                                <Table.Cell textAlign="center" fontWeight="bold" bg="gray.50">
                                    {rowTotals[rowVal]}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                        {/* Footer Row for Column Totals */}
                        <Table.Row bg="gray.100" fontWeight="bold">
                            <Table.Cell>Total</Table.Cell>
                            {colDims.length > 0 ? (
                                sortedColKeys.map(colKey => (
                                    <Table.Cell key={colKey} textAlign="center">
                                        {colTotals[colKey] || 0}
                                    </Table.Cell>
                                ))
                            ) : null}
                            <Table.Cell textAlign="center">{grandTotal}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </Box>
        </Box>
    );
};

const VendorReport: React.FC = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
    fetchReport();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedVendor]);

  const fetchVendors = () => {
    client.get('/admin/vendors')
      .then(res => setVendors(res.data))
      .catch(err => console.error(err));
  };

  const fetchReport = () => {
    setLoading(true);
    const url = selectedVendor ? `/admin/reports/recap?vendor_id=${selectedVendor}` : '/admin/reports/recap';
    client.get(url)
      .then(res => {
        setReportData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        toaster.create({ title: "Gagal memuat laporan", type: "error" });
      });
  };

  const handlePrint = () => {
    window.print();
  };

  // Group data by Product
  const groupedByProduct = reportData.reduce((acc, item) => {
      if (!acc[item.product_id]) {
          acc[item.product_id] = {
              productName: item.product_name,
              vendorName: item.vendor_name,
              items: []
          };
      }
      acc[item.product_id].items.push(item);
      return acc;
  }, {} as Record<string, { productName: string, vendorName: string, items: any[] }>);

  return (
    <>
      <Container maxW="container.xl" py={10} id="printable-area">
        <HStack justify="space-between" mb={6} className="no-print">
          <Heading>Laporan Rekapitulasi Vendor</Heading>
          <Button onClick={handlePrint} colorPalette="blue">Cetak / PDF</Button>
        </HStack>

        <Box mb={6} className="no-print" maxW="300px">
          <NativeSelect.Root>
              <NativeSelect.Field value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}>
                  <option value="">Semua Vendor</option>
                  {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
              </NativeSelect.Field>
          </NativeSelect.Root>
        </Box>

        <VStack align="stretch" gap={8}>
          {Object.values(groupedByProduct).map((group: any) => (
              <ProductReportTable 
                  key={group.productName} 
                  productName={group.productName} 
                  vendorName={group.vendorName} 
                  data={group.items} 
              />
          ))}
          
          {reportData.length === 0 && !loading && (
              <Text textAlign="center" color="gray.500">Tidak ada data</Text>
          )}
        </VStack>
      </Container>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white;
            max-width: none !important;
            z-index: 9999;
          }
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </>
  );
};

export default VendorReport;
