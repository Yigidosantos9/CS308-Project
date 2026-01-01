import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';

// Layout
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/cart/Cart';
import Wishlist from './pages/wishlist/Wishlist';
import Checkout from './pages/checkout/Checkout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/Profile';
import PMDashboard from './pages/admin/PMDashboard';
import SalesManagerDashboard from './pages/admin/SalesManagerDashboard';
import SupportChat from './pages/support/SupportChat';

function App() {
  return (
    <ShopProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="checkout" element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="pm-dashboard" element={
              <PrivateRoute>
                <PMDashboard />
              </PrivateRoute>
            } />
            <Route path="sales-dashboard" element={
              <PrivateRoute>
                <SalesManagerDashboard />
              </PrivateRoute>
            } />
            <Route path="support" element={<SupportChat />} />
          </Route>
        </Routes>
      </Router>
    </ShopProvider>
  );
}

export default App;
