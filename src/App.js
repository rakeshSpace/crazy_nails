import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';

// Layout Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Products from './pages/Products';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import Cart from './pages/Cart';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Styles
import './styles/globals.css';

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <Router>
                            <div className="min-h-screen flex flex-col">
                                <Header />
                                <main className="flex-grow">
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/services" element={<Services />} />
                                        <Route path="/products" element={<Products />} />
                                        <Route path="/gallery" element={<Gallery />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/booking" element={<Booking />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/cart" element={<Cart />} />

                                        {/* Protected Routes */}
                                        <Route element={<ProtectedRoute />}>
                                            <Route path="/profile" element={<Profile />} />
                                            <Route path="/my-bookings" element={<MyBookings />} />
                                        </Route>

                                        {/* Admin Routes */}
                                        <Route element={<ProtectedRoute adminOnly />}>
                                            <Route path="/admin/*" element={<AdminDashboard />} />
                                        </Route>
                                    </Routes>
                                </main>
                                <Footer />
                            </div>
                            <Toaster position="top-right" />
                        </Router>
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
}

export default App;