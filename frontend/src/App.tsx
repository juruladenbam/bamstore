import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProductList from './pages/admin/AdminProductList';
import ProductForm from './pages/admin/ProductForm';
import AdminCategoryList from './pages/admin/AdminCategoryList';
import CategoryForm from './pages/admin/CategoryForm';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import { Box, Flex, Heading, Link as ChakraLink, Text } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <CartProvider>
      <Toaster />
      <Box minH="100vh" bg="gray.50">
        {!isAdmin && (
          <Box bg="teal.600" color="white" py={4} px={8}>
            <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
              <Heading size="lg">
                <Link to="/">BAM Store</Link>
              </Heading>
              <Flex gap={4}>
                <ChakraLink asChild color="white">
                  <Link to="/">Products</Link>
                </ChakraLink>
                <ChakraLink asChild color="white">
                  <Link to="/checkout">Cart</Link>
                </ChakraLink>
              </Flex>
            </Flex>
          </Box>
        )}

        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminProductList />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="categories" element={<AdminCategoryList />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id/edit" element={<CategoryForm />} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
          </Route>
        </Routes>

        {!isAdmin && (
          <Box py={6} textAlign="center" color="gray.500">
            <Text>&copy; 2025 BAM Store</Text>
          </Box>
        )}
      </Box>
    </CartProvider>
  );
}

export default App;
