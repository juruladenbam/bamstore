import React, { useEffect, useState }                                                            from 'react';
import { useNavigate, useParams }                                                                from 'react-router-dom';
import { Box, Heading, Input, Button, VStack, HStack, Text, Textarea, NativeSelect }             from '@chakra-ui/react';
import client                                                                                    from '../../../api/client';
import { STORAGE_URL }                                                                           from '../../../config';
import type { Category, ProductVariant, ProductSku, Vendor }                                     from '../../../types';
import { toaster }                                                                               from '../../../components/ui/toaster';

const formatNumber = (num: number | string) => {
  if (num === '' || num === null || num === undefined) return '';
  if (num === '-') return '-';
  
  const str = num.toString();
  const isNegative = str.startsWith('-');
  const clean = str.replace(/\D/g, '');
  
  if (clean === '') return isNegative ? '-' : '';
  
  const formatted = Number(clean).toLocaleString('id-ID');
  return isNegative ? '-' + formatted : formatted;
};

const parseNumber = (str: string) => {
  if (!str) return 0;
  if (str === '-') return 0;
  const clean = str.replace(/[^0-9-]/g, '');
  return Number(clean);
};

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bulkStock, setBulkStock] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ id: number; image_path: string }[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);
  const [productType, setProductType] = useState<'simple' | 'variable'>('simple');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '' as string | number,
    stock: '' as string | number,
    simple_sku: '', // SKU for simple products
    status: 'ready',
    category_id: '',
    vendor_id: '',
    variants: [] as { id?: number; name: string; type: string; price_adjustment: string | number }[],
    skus: [] as { id?: number; variant_indices: number[]; price: string | number; stock: number; sku?: string }[]
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  useEffect(() => {
    client.get('/categories').then(res => setCategories(res.data));
    client.get('/admin/vendors').then(res => setVendors(res.data));
    
    if (isEdit) {
      client.get(`/admin/products/${id}`).then(res => {
        const p = res.data;
        setExistingImages(p.images || []);
        const variants = p.variants?.map((v: ProductVariant) => ({
          id: v.id,
          name: v.name,
          type: v.type || 'General',
          price_adjustment: formatNumber(Math.floor(Number(v.price_adjustment))),
        })) || [];

        // Map SKUs
        const skus = p.skus?.map((s: ProductSku) => {
          // Find indices of variants in the variants array
          const indices = s.variant_ids.map((vid: number) => variants.findIndex((v: ProductVariant) => v.id === vid)).filter((i: number) => i !== -1);
          return {
            id: s.id,
            variant_indices: indices,
            price: formatNumber(Math.floor(Number(s.price))),
            stock: s.stock,
            sku: s.sku
          };
        }) || [];

        // Determine global stock and SKU if no variants
        let globalStock = '';
        let simpleSku = '';
        if (variants.length === 0 && skus.length > 0) {
          globalStock = skus[0].stock.toString();
          simpleSku = skus[0].sku || '';
        }

        setProductType(variants.length > 0 ? 'variable' : 'simple');

        setFormData({
          name: p.name,
          description: p.description || '',
          base_price: formatNumber(Math.floor(Number(p.base_price))),
          stock: globalStock,
          simple_sku: simpleSku,
          status: p.status,
          category_id: p.category_id.toString(),
          vendor_id: p.vendor_id ? p.vendor_id.toString() : '',
          variants,
          skus
        });
      });
    }
  }, [id, isEdit]);

  const handleProductTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'simple' | 'variable';
    setProductType(type);
    
    if (type === 'simple') {
      // Clear variants when switching to simple
      setFormData(prev => ({ ...prev, variants: [], skus: [] }));
    } else {
      // Clear global stock/sku when switching to variable
      setFormData(prev => ({ ...prev, stock: '', simple_sku: '' }));
    }
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: '', type: 'General', price_adjustment: '' }]
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const calculateSkuPrice = (indices: number[]) => {
    const variantsPrice = indices.reduce((acc, index) => {
      const v = formData.variants[index];
      return acc + (v ? parseNumber(v.price_adjustment.toString()) : 0);
    }, 0);
    return parseNumber(formData.base_price.toString()) + variantsPrice;
  };

  const generateSkus = () => {
    // Group variants by type
    const variantsByType: { [key: string]: number[] } = {};
    formData.variants.forEach((v, index) => {
      const type = v.type || 'General';
      if (!variantsByType[type]) variantsByType[type] = [];
      variantsByType[type].push(index);
    });

    const types = Object.keys(variantsByType);
    if (types.length === 0) return;

    // Cartesian product helper
    const cartesian = (args: number[][]): number[][] => {
      const r: number[][] = [];
      const max = args.length - 1;
      function helper(arr: number[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
          const a = arr.slice(0);
          a.push(args[i][j]);
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const combinations = cartesian(types.map(t => variantsByType[t]));
    
    const newSkus = combinations.map(indices => {
      // Check if this combination already exists (Exact Match)
      const existingSku = formData.skus.find(s => {
        if (s.variant_indices.length !== indices.length) return false;
        // Sort both arrays to compare regardless of order
        const sortedA = [...s.variant_indices].sort();
        const sortedB = [...indices].sort();
        return sortedA.every((val, idx) => val === sortedB[idx]);
      });

      if (existingSku) {
        return existingSku;
      }

      // Try to find a parent SKU to inherit from (Subset Match)
      // This preserves stock when adding a new variant type (e.g. adding Size to Color)
      const parentSku = formData.skus.find(s => {
        if (s.variant_indices.length >= indices.length) return false;
        return s.variant_indices.every(idx => indices.includes(idx));
      });

      let initialStock = 0;
      let initialPrice: string | number = 0;

      if (parentSku) {
        initialStock = parentSku.stock;
        initialPrice = parentSku.price;
      }

      // If bulk stock is explicitly set by user, it takes precedence for new SKUs
      if (bulkStock) {
        initialStock = parseInt(bulkStock) || 0;
      }

      return {
        variant_indices: indices,
        price: initialPrice,
        stock: initialStock
      };
    });

    setFormData({ ...formData, skus: newSkus });
  };

  const handleSkuChange = (index: number, field: string, value: string | number) => {
    const newSkus = [...formData.skus];
    newSkus[index] = { ...newSkus[index], [field]: value };
    setFormData({ ...formData, skus: newSkus });
  };

  const removeSku = (index: number) => {
    const newSkus = formData.skus.filter((_, i) => i !== index);
    setFormData({ ...formData, skus: newSkus });
  };

  const addSku = () => {
    setFormData({
      ...formData,
      skus: [...formData.skus, { variant_indices: [], price: 0, stock: bulkStock ? parseInt(bulkStock) || 0 : 0 }]
    });
  };

  const handleSkuVariantChange = (skuIndex: number, type: string, variantIndex: number) => {
    const newSkus = [...formData.skus];
    const currentIndices = newSkus[skuIndex].variant_indices;
    
    // Remove existing index for this type
    const filteredIndices = currentIndices.filter(i => {
      const v = formData.variants[i];
      return (v?.type || 'General') !== type;
    });
    
    // Add new index
    newSkus[skuIndex].variant_indices = [...filteredIndices, variantIndex];
    setFormData({ ...formData, skus: newSkus });
  };

  const applyBulkStock = () => {
    const val = parseInt(bulkStock) || 0;
    const newSkus = formData.skus.map(s => ({ ...s, stock: val }));
    setFormData({ ...formData, skus: newSkus });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const errorMessages: string[] = [];

      selectedFiles.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errorMessages.push(`File "${file.name}" is not an image.`);
          return;
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
          errorMessages.push(`Image "${file.name}" exceeds the 2MB size limit.`);
          return;
        }

        validFiles.push(file);
      });

      if (errorMessages.length > 0) {
        toaster.create({
          title: "Kesalahan Validasi Gambar",
          description: errorMessages.join("\n"),
          type: "error",
        });
      }

      if (validFiles.length > 0) {
        setImages(prev => [...prev, ...validFiles]);
      }
      
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (id: number) => {
    setExistingImages(existingImages.filter(img => img.id !== id));
    setDeletedImages([...deletedImages, id]);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, boolean> = {};
    const errorMessages: string[] = [];

    if (!formData.name.trim()) {
      newErrors.name = true;
      errorMessages.push("Nama wajib diisi");
    }
    if (!formData.category_id) {
      newErrors.category_id = true;
      errorMessages.push("Kategori wajib diisi");
    }
    if (!formData.base_price) {
      newErrors.base_price = true;
      errorMessages.push("Harga Dasar wajib diisi");
    }

    if (productType === 'simple') {
      if (formData.stock === '' || formData.stock === null) {
        newErrors.stock = true;
        errorMessages.push("Stok wajib diisi untuk produk sederhana");
      }
    } else {
      if (formData.variants.length === 0) {
        newErrors.variants = true;
        errorMessages.push("Minimal satu varian wajib diisi untuk produk variabel");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toaster.create({
        title: "Kesalahan Validasi",
        description: errorMessages.join("\n"),
        type: "error",
      });
      return;
    }

    try {
      // Prepare SKUs payload
      let skusPayload: { id?: number; variant_indices: number[]; price: number; stock: number; sku?: string }[] = formData.skus.map(s => {
        // Always send variant_indices for simplicity, backend now supports it for update too
        // But we also need to send ID if it exists for update
        return {
          id: s.id,
          variant_indices: s.variant_indices,
          price: parseNumber(s.price.toString()),
          stock: Number(s.stock)
        };
      });

      // If no variants, create a default SKU using the global stock
      if (formData.variants.length === 0) {
        // If editing, try to find the existing default SKU (one with no variants)
        const existingDefaultSku = formData.skus.find(s => s.variant_indices.length === 0);
        
        skusPayload = [{
          id: existingDefaultSku?.id,
          variant_indices: [],
          price: 0, // Use base price
          stock: Number(formData.stock) || 0,
          sku: formData.simple_sku // Pass the custom SKU
        }];
      }

      const payload = {
        ...formData,
        category_id: Number(formData.category_id),
        vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
        base_price: parseNumber(formData.base_price.toString()),
        variants: formData.variants.map(v => ({
          ...v,
          type: v.type || 'General',
          price_adjustment: parseNumber(v.price_adjustment.toString()),
        })),
        skus: skusPayload
      };

      const formDataObj = new FormData();
      formDataObj.append('payload', JSON.stringify(payload));
      
      images.forEach((file) => {
        formDataObj.append('images[]', file);
      });
      
      deletedImages.forEach((id) => {
        formDataObj.append('deleted_images[]', id.toString());
      });

      if (isEdit) {
        formDataObj.append('_method', 'PUT');
        await client.post(`/admin/products/${id}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await client.post('/admin/products', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toaster.create({
        title: "Berhasil",
        description: `Produk berhasil ${isEdit ? 'diperbarui' : 'dibuat'}.`,
        type: "success",
      });
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      let description = "Gagal menyimpan produk.";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;

      if (err.response && err.response.data) {
        if (err.response.data.message) {
          description = err.response.data.message;
        }

        // Handle raw database errors (e.g. duplicate SKU)
        if (err.response.data.error && typeof err.response.data.error === 'string') {
          if (err.response.data.error.includes('UNIQUE constraint failed: product_skus.sku')) {
            description = "SKU sudah digunakan. Gunakan SKU yang unik.";
          }
        }

        if (err.response.data.errors) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawErrors = Object.values(err.response.data.errors as any).flat() as string[];
          
          const formattedErrors = rawErrors.map(msg => {
            let newMsg = msg;

            // Transform common backend validation messages to be more human-readable
            newMsg = newMsg.replace(/The images\.(\d+)(?: field)? must be an image\.?/g, (_, index) => `File #${parseInt(index) + 1} is not a valid image.`);
            newMsg = newMsg.replace(/The images\.(\d+)(?: field)? must be a file of type: (.*?)\.?/g, (_, index, types) => `File #${parseInt(index) + 1} must be one of these types: ${types}.`);
            newMsg = newMsg.replace(/The images\.(\d+)(?: field)? may not be greater than (.*?) kilobytes\.?/g, (_, index) => `File #${parseInt(index) + 1} is too large (max 2MB).`);

            if (newMsg.includes('images field is required')) {
              newMsg = "Please upload at least one image.";
            } else if (newMsg.includes('has already been taken')) {
              newMsg = newMsg.replace(/The (.*?) has already been taken\.?/, (_, field) => {
                const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
                return `${fieldName} is already in use.`;
              });
            } else if (newMsg.startsWith('The ') && newMsg.includes(' field')) {
              // Fallback for other fields
              newMsg = newMsg.replace(/^The (.*?) field/, '$1').replace(/\.\d+/, '');
              newMsg = newMsg.charAt(0).toUpperCase() + newMsg.slice(1);
            }
            
            return newMsg;
          });

          const fieldErrors = formattedErrors.join("\n");
          if (fieldErrors) {
            description = fieldErrors; // Use the detailed errors as the main description
          }
        }
      }

      toaster.create({
        title: "Kesalahan",
        description: description,
        type: "error",
      });
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <Heading mb={6}>{isEdit ? 'Ubah Produk' : 'Produk Baru'}</Heading>
      
      <VStack gap={4} align="stretch">
        <Box>
          <Text mb={1}>Nama <Text as="span" color="red.500">*</Text></Text>
          <Input 
            value={formData.name} 
            onChange={e => {
              setFormData({...formData, name: e.target.value});
              if (errors.name) setErrors(prev => ({...prev, name: false}));
            }} 
            borderColor={errors.name ? "red.500" : undefined}
          />
        </Box>

        <HStack gap={4} align="start">
          <Box flex={1}>
            <Text mb={1}>Kategori <Text as="span" color="red.500">*</Text></Text>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Pilih Kategori" 
                value={formData.category_id} 
                onChange={e => {
                  setFormData({...formData, category_id: e.target.value});
                  if (errors.category_id) setErrors(prev => ({...prev, category_id: false}));
                }}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>
          <Box flex={1}>
            <Text mb={1}>Vendor (Opsional)</Text>
            <NativeSelect.Root>
              <NativeSelect.Field
                placeholder="Pilih Vendor" 
                value={formData.vendor_id} 
                onChange={e => setFormData({...formData, vendor_id: e.target.value})}
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Box>
        </HStack>
        <Box>
          <Text mb={1}>Tipe Produk</Text>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={productType}
              onChange={handleProductTypeChange}
            >
              <option value="simple">Produk Sederhana (Tanpa Varian)</option>
              <option value="variable">Produk Variabel (Ukuran, Warna, dll.)</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Box>

        <Box>
          <Text mb={1}>Status</Text>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="ready">Stok Tersedia</option>
              <option value="pre_order">Pre-Order</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Box>

        <Box>
          <Text mb={1}>Harga Dasar <Text as="span" color="red.500">*</Text></Text>
          <Input 
            value={formData.base_price} 
            onChange={e => {
              setFormData({...formData, base_price: formatNumber(e.target.value)});
              if (errors.base_price) setErrors(prev => ({...prev, base_price: false}));
            }} 
            borderColor={errors.base_price ? "red.500" : undefined}
          />
        </Box>

        {productType === 'simple' && (
          <HStack gap={4} align="start">
            <Box flex={1}>
              <Text mb={1}>{formData.status === 'pre_order' ? 'Kuota' : 'Stok'} <Text as="span" color="red.500">*</Text></Text>
              <Input
                type="number"
                value={formData.stock}
                onChange={e => {
                  setFormData({...formData, stock: e.target.value});
                  if (errors.stock) setErrors(prev => ({...prev, stock: false}));
                }}
                placeholder={formData.status === 'pre_order' ? "Kuota Tersedia" : "Stok Tersedia"}
                borderColor={errors.stock ? "red.500" : undefined}
              />
            </Box>
            <Box flex={1}>
              <Text mb={1}>SKU (Opsional)</Text>
              <Input
                value={formData.simple_sku}
                onChange={e => setFormData({...formData, simple_sku: e.target.value})}
                placeholder="contoh: PROD-001"
              />
            </Box>
          </HStack>
        )}

        <Box>
          <Text mb={1}>Deskripsi</Text>
          <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </Box>

        <Box borderWidth="1px" p={4} borderRadius="md">
          <Heading size="sm" mb={4}>Gambar</Heading>
          <Input type="file" multiple accept="image/*" onChange={handleImageChange} mb={4} />
          
          <HStack wrap="wrap" gap={4}>
            {existingImages.map((img) => (
              <Box key={img.id} position="relative" width="100px" height="100px">
                <img src={`${STORAGE_URL}/${img.image_path}`} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                <Button 
                  size="xs" 
                  colorPalette="red" 
                  position="absolute" 
                  top="-8px" 
                  right="-8px" 
                  onClick={() => removeExistingImage(img.id)}
                  borderRadius="full"
                >X</Button>
              </Box>
            ))}
            {images.map((file, index) => (
              <Box key={index} position="relative" width="100px" height="100px">
                <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                <Button 
                  size="xs" 
                  colorPalette="red" 
                  position="absolute" 
                  top="-8px" 
                  right="-8px" 
                  onClick={() => removeImage(index)}
                  borderRadius="full"
                >X</Button>
              </Box>
            ))}
          </HStack>
        </Box>

        {productType === 'variable' && (
          <Box borderWidth="1px" p={4} borderRadius="md">
            <HStack justify="space-between" mb={4}>
              <Heading size="sm">Varian</Heading>
              <Button size="xs" onClick={addVariant}>Tambah Varian</Button>
            </HStack>
            
            <VStack gap={3}>
              {formData.variants.map((variant, index) => (
                <HStack key={index} w="full" align="end">
                  <Box flex={1}>
                    <Text fontSize="xs">Tipe</Text>
                    <Input value={variant.type} onChange={e => handleVariantChange(index, 'type', e.target.value)} placeholder="Ukuran/Warna" />
                  </Box>
                  <Box flex={2}>
                    <Text fontSize="xs">Nama</Text>
                    <Input value={variant.name} onChange={e => handleVariantChange(index, 'name', e.target.value)} placeholder="S, M, Merah..." />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="xs">Penyesuaian Harga</Text>
                    <Input value={variant.price_adjustment} onChange={e => handleVariantChange(index, 'price_adjustment', formatNumber(e.target.value))} />
                  </Box>
                  <Button size="sm" colorPalette="red" variant="ghost" onClick={() => removeVariant(index)}>X</Button>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        {productType === 'variable' && (
          <Box borderWidth="1px" p={4} borderRadius="md">
            <HStack justify="space-between" mb={4}>
              <Heading size="sm">Inventaris / SKU</Heading>
              <HStack>
                <Button size="xs" onClick={addSku}>Tambah SKU</Button>
                <Button size="xs" onClick={generateSkus}>Generate Semua</Button>
              </HStack>
            </HStack>

            <HStack mb={4} align="end" gap={4}>
               <Box>
                  <Text fontSize="xs" mb={1}>Stok Massal (Opsional)</Text>
                  <Input
                    size="sm"
                    width="150px"
                    placeholder="contoh: 100"
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value)}
                  />
               </Box>
               <Button size="sm" variant="outline" onClick={applyBulkStock}>Terapkan ke SKU yang Ada</Button>
            </HStack>

            <Text fontSize="sm" color="gray.500" mb={4}>
              Generate SKU untuk mengelola Stok (untuk Siap) atau Kuota (untuk Pre-Order) untuk setiap kombinasi.
            </Text>
            
            <VStack gap={3}>
              {formData.skus.map((sku, index) => {
                // Group variants by type to show dropdowns
                const variantsByType: { [key: string]: number[] } = {};
                formData.variants.forEach((v, i) => {
                  const type = v.type || 'General';
                  if (!variantsByType[type]) variantsByType[type] = [];
                  variantsByType[type].push(i);
                });

                return (
                  <HStack key={index} w="full" align="end" borderWidth="1px" p={2} borderRadius="md" wrap="wrap">
                    <Box flex={3} minW="200px">
                      <Text fontSize="xs" fontWeight="bold" mb={1}>Kombinasi</Text>
                      <HStack wrap="wrap">
                        {Object.keys(variantsByType).map(type => {
                          const selectedIndex = sku.variant_indices.find(i => {
                            const v = formData.variants[i];
                            return (v?.type || 'General') === type;
                          });

                          return (
                            <Box key={type}>
                              <Text fontSize="xs" color="gray.500">{type}</Text>
                              <NativeSelect.Root size="sm">
                                <NativeSelect.Field
                                  placeholder="Pilih..." 
                                  value={selectedIndex !== undefined ? selectedIndex : ''}
                                  onChange={e => handleSkuVariantChange(index, type, Number(e.target.value))}
                                >
                                  {variantsByType[type].map(vIndex => (
                                    <option key={vIndex} value={vIndex}>{formData.variants[vIndex].name}</option>
                                  ))}
                                </NativeSelect.Field>
                              </NativeSelect.Root>
                            </Box>
                          );
                        })}
                      </HStack>
                    </Box>
                    <Box flex={1} minW="100px">
                      <Text fontSize="xs">Harga (Override)</Text>
                      <Input 
                        value={parseNumber(sku.price.toString()) > 0 ? sku.price : formatNumber(calculateSkuPrice(sku.variant_indices))} 
                        onChange={e => handleSkuChange(index, 'price', formatNumber(e.target.value))} 
                      />
                    </Box>
                    <Box flex={1} minW="100px">
                      <Text fontSize="xs">{formData.status === 'pre_order' ? 'Kuota' : 'Stok'}</Text>
                      <Input type="number" value={sku.stock} onChange={e => handleSkuChange(index, 'stock', e.target.value)} />
                    </Box>
                    <Button size="sm" colorPalette="red" variant="ghost" onClick={() => removeSku(index)}>X</Button>
                  </HStack>
                );
              })}
            </VStack>
          </Box>
        )}

        <Button colorPalette="teal" onClick={handleSubmit}>Simpan Produk</Button>
      </VStack>
    </Box>
  );
};

export default ProductForm;
