import { Routes, Route }                                from 'react-router-dom';
import { CartProvider }                                 from './features/cart/context/CartContext';
import Navbar                                           from './components/Navbar';
import Home                                             from './features/home/pages/Home';
import ProductList                                      from './features/products/pages/ProductList';
import ProductDetail                                    from './features/products/pages/ProductDetail';
import Checkout                                         from './features/cart/pages/Checkout';
import OrderActivity                                    from './features/orders/pages/OrderActivity';
import OrderHistory                                     from './features/orders/pages/OrderHistory';
import OrderConfirmation                                from './features/orders/pages/OrderConfirmation';
import AdminLayout                                      from './features/admin/pages/AdminLayout';
import AdminProductList                                 from './features/products/pages/AdminProductList';
import ProductForm                                      from './features/products/pages/ProductForm';
import AdminCategoryList                                from './features/categories/pages/AdminCategoryList';
import CategoryForm                                     from './features/categories/pages/CategoryForm';
import AdminOrderList                                   from './features/orders/pages/AdminOrderList';
import AdminOrderDetail                                 from './features/orders/pages/AdminOrderDetail';
import AdminVendorList                                  from './features/vendors/pages/AdminVendorList';
import VendorForm                                       from './features/vendors/pages/VendorForm';
import AdminVendorDetail                                from './features/vendors/pages/AdminVendorDetail';
import VendorReport                                     from './features/reports/pages/VendorReport';
import FinancialReport                                  from './features/reports/pages/FinancialReport';
import Login                                            from './features/auth/pages/Login';
import { Box, Text }                                    from '@chakra-ui/react';
import { useLocation }                                  from 'react-router-dom';
import { Toaster }                                      from './components/ui/toaster';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <CartProvider>
      <Toaster />
      <Box minH="100vh" bg="gray.50" pb={{ base: "60px", md: 0 }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/activity" element={<OrderActivity />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          
          <Route path="/admin/login" element={<Login />} />

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
            <Route path="vendors" element={<AdminVendorList />} />
            <Route path="vendors/new" element={<VendorForm />} />
            <Route path="vendors/:id/edit" element={<VendorForm />} />
            <Route path="vendors/:id/payments" element={<AdminVendorDetail />} />
            <Route path="reports/vendor" element={<VendorReport />} />
            <Route path="reports/finance" element={<FinancialReport />} />
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
