
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import UserRoute from './components/UserRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import { FAQs, Terms, PrivacyPolicy, ShippingPolicy } from './pages/StaticPages';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <Routes>
                  {/* Public Routes - Home is Topmost for priority loading */}
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/shipping" element={<ShippingPolicy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/access-denied" element={<AccessDenied />} />

                  {/* Protected User Routes */}
                  <Route element={<UserRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/account-settings" element={<AccountSettings />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                  </Route>

                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<AdminRoute />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminDashboard />} />
                    <Route index element={<Navigate to="dashboard" replace />} />
                  </Route>

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
