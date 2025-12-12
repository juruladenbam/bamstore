import { Routes, Route }                                from 'react-router-dom';
import { CartProvider }                                 from './context/CartContext';
import Navbar                                           from './components/Navbar';
import Home                                             from './pages/Home';
import ProductList                                      from './pages/ProductList';
import ProductDetail                                    from './pages/ProductDetail';
import Checkout                                         from './pages/Checkout';
import OrderActivity                                    from './pages/OrderActivity';
import OrderHistory                                     from './pages/OrderHistory';
import OrderConfirmation                                from './pages/OrderConfirmation';
import AdminLayout                                      from './pages/admin/AdminLayout';
import AdminProductList                                 from './pages/admin/AdminProductList';
import Dashboard                                        from './pages/admin/Dashboard';
import ProductForm                                      from './pages/admin/ProductForm';
import AdminCategoryList                                from './pages/admin/AdminCategoryList';
import CategoryForm                                     from './pages/admin/CategoryForm';
import AdminOrderList                                   from './pages/admin/AdminOrderList';
import AdminOrderDetail                                 from './pages/admin/AdminOrderDetail';
import AdminVendorList                                  from './pages/admin/AdminVendorList';
import VendorForm                                       from './pages/admin/VendorForm';
import AdminVendorDetail                                from './pages/admin/AdminVendorDetail';
import VendorReport                                     from './pages/admin/VendorReport';
import FinancialReport                                  from './pages/admin/FinancialReport';
import Settings                                         from './pages/admin/Settings';
import Notifications                                    from './pages/admin/Notifications';
import Login                                            from './pages/admin/Login';
import { Box, Text }                                    from '@chakra-ui/react';
import { useLocation }                                  from 'react-router-dom';
import { Toaster }                                      from './components/ui/toaster';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <CartProvider>
      <Toaster />
      <Box minH="100vh" bg="gray.50" pb={isAdmin ? 0 : { base: "60px", md: 0 }}>
        {!isAdmin && <Navbar />}
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
            <Route index element={<Dashboard />} />
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
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
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
