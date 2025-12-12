import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  HStack,
  Input,
  Button,
  Text,
  Checkbox,
  Select,
  Flex,
  IconButton,
  createListCollection
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiSearch, FiTrash2 } from 'react-icons/fi';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T; // Unique ID field (e.g., 'id')
  title?: string;
  searchPlaceholder?: string;
  onBulkDelete?: (ids: any[]) => void;
  renderBulkActions?: (selectedIds: any[]) => React.ReactNode;
  isLoading?: boolean;
}

const pageSizeCollection = createListCollection({
  items: [
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "50", value: "50" },
  ],
});

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  title,
  searchPlaceholder = "Search...",
  onBulkDelete,
  renderBulkActions,
  isLoading = false
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [data, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Selection logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedData.map(item => item[keyField]);
      // Add only ones not already selected
      const newSelected = [...new Set([...selectedRows, ...allIds])];
      setSelectedRows(newSelected);
    } else {
      // Deselect current page items
      const pageIds = paginatedData.map(item => item[keyField]);
      setSelectedRows(selectedRows.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: any, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every(item => selectedRows.includes(item[keyField]));

  if (isLoading) {
    return <Box p={5}>Loading...</Box>;
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={4}>
        <HStack>
            {title && <Text fontSize="xl" fontWeight="bold" mr={4}>{title}</Text>}
            <Box position="relative" maxW="300px">
            <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                }}
                pl={10}
            />
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
                <FiSearch />
            </Box>
            </Box>
        </HStack>

        <HStack>
          {selectedRows.length > 0 && (
            <>
              <Text fontSize="sm" color="gray.500">{selectedRows.length} selected</Text>
              {onBulkDelete && (
                <Button 
                    size="sm" 
                    colorPalette="red" 
                    variant="solid" 
                    onClick={() => onBulkDelete(selectedRows)}
                >
                  <FiTrash2 /> Delete
                </Button>
              )}
              {renderBulkActions && renderBulkActions(selectedRows)}
            </>
          )}
        </HStack>
      </Flex>

      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden" borderWidth="1px">
        <Table.Root>
          <Table.Header bg="gray.50">
            <Table.Row>
              <Table.ColumnHeader w="50px">
                <Checkbox.Root 
                    checked={isAllSelected} 
                    // indeterminate={isIndeterminate} // Chakra UI v3 Checkbox might handle indeterminate differently or via ref, keeping simple for now
                    onCheckedChange={(e) => handleSelectAll(!!e.checked)}
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                        <Checkbox.Indicator />
                    </Checkbox.Control>
                </Checkbox.Root>
              </Table.ColumnHeader>
              {columns.map((col, idx) => (
                <Table.ColumnHeader key={idx}>{col.header}</Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <Table.Row key={String(item[keyField])} _hover={{ bg: 'gray.50' }}>
                  <Table.Cell>
                    <Checkbox.Root 
                        checked={selectedRows.includes(item[keyField])} 
                        onCheckedChange={(e) => handleSelectRow(item[keyField], !!e.checked)}
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                            <Checkbox.Indicator />
                        </Checkbox.Control>
                    </Checkbox.Root>
                  </Table.Cell>
                  {columns.map((col, idx) => (
                    <Table.Cell key={idx}>
                      {col.cell ? col.cell(item) : (col.accessorKey ? item[col.accessorKey] : null)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={columns.length + 1} textAlign="center" py={8} color="gray.500">
                  No data found
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
        
        {/* Pagination */}
        <Flex justify="space-between" align="center" p={4} borderTopWidth="1px">
            <HStack>
                <Text fontSize="sm" color="gray.600">
                    Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </Text>
                <Select.Root 
                    size="sm" 
                    width="80px" 
                    collection={pageSizeCollection}
                    value={[String(itemsPerPage)]}
                    onValueChange={(e) => {
                        setItemsPerPage(Number(e.value[0]));
                        setCurrentPage(1);
                    }}
                >
                    <Select.Trigger>
                        <Select.ValueText placeholder="Rows" />
                    </Select.Trigger>
                    <Select.Positioner>
                        <Select.Content>
                            {pageSizeCollection.items.map(item => (
                                <Select.Item key={item.value} item={item}>
                                    {item.label}
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Positioner>
                </Select.Root>
            </HStack>

            <HStack gap={2}>
                <IconButton 
                    aria-label="Previous page" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <FiChevronLeft />
                </IconButton>
                <Text fontSize="sm" fontWeight="medium">
                    Page {currentPage} of {totalPages || 1}
                </Text>
                <IconButton 
                    aria-label="Next page" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    <FiChevronRight />
                </IconButton>
            </HStack>
        </Flex>
      </Box>
    </Box>
  );
}

export default DataTable;
