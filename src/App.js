import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';

// Layout Components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AdminFooter from './components/Layout/AdminFooter';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Products from './pages/Products';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import VerifyCertificate from './pages/VerifyCertificate';
import Franchise from './pages/Franchise';  

// Protected Pages (Requires Login)
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import Checkout from './pages/Checkout';
import MyLearning from './pages/MyLearning';
import MyCertificates from './pages/MyCertificates';
import CoursePlayer from './pages/CoursePlayer';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';


// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFranchise from './pages/admin/AdminFranchise'; 

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Styles
import './styles/globals.css';

// Layout wrapper to conditionally show footer
const Layout = ({ children }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            {isAdminRoute ? <AdminFooter /> : <Footer />}
        </div>
    );
};

function App() {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <Router>
                            <Layout>
                                <Routes>
                                    {/* ========== PUBLIC ROUTES ========== */}
                                    {/* Main Pages */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/services" element={<Services />} />
                                    <Route path="/products" element={<Products />} />
                                    <Route path="/gallery" element={<Gallery />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/booking" element={<Booking />} />

                                    {/* Auth Pages */}
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />

                                    {/* Shopping */}
                                    <Route path="/cart" element={<Cart />} />

                                    {/* Training & Courses */}
                                    <Route path="/courses" element={<Courses />} />
                                    <Route path="/courses/:slug" element={<CourseDetails />} />

                                    {/* Certificate Verification (Public) */}
                                    <Route path="/verify/:code" element={<VerifyCertificate />} />

                                    {/* Franchise Page (Public) */}
                                    <Route path="/franchise" element={<Franchise />} />  {/* <--- ADD THIS */}

                                    {/* ========== PROTECTED ROUTES (Requires Authentication) ========== */}
                                    {/* User Profile & Account */}
                                    <Route element={<ProtectedRoute />}>
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/my-bookings" element={<MyBookings />} />
                                        <Route path="/my-orders" element={<MyOrders />} />
                                        <Route path="/order-tracking/:id" element={<OrderTracking />} />
                                    </Route>

                                    {/* Shopping & Checkout */}
                                    <Route element={<ProtectedRoute />}>
                                        <Route path="/checkout" element={<Checkout />} />
                                    </Route>

                                    {/* Learning Management System */}
                                    <Route element={<ProtectedRoute />}>
                                        <Route path="/my-learning" element={<MyLearning />} />
                                        <Route path="/my-certificates" element={<MyCertificates />} />
                                        <Route path="/course/learn/:courseId" element={<CoursePlayer />} />
                                    </Route>

                                    {/* ========== ADMIN ROUTES (Requires Admin Role) ========== */}
                                    <Route element={<ProtectedRoute adminOnly />}>
                                        <Route path="/admin/*" element={<AdminDashboard />} />
                                    </Route>

                                    {/* ========== 404 NOT FOUND ROUTE ========== */}
                                    <Route path="*" element={<NotFound />} />
                                </Routes>
                            </Layout>
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#363636',
                                        color: '#fff',
                                    },
                                    success: {
                                        duration: 3000,
                                        iconTheme: {
                                            primary: '#27ae60',
                                            secondary: '#fff',
                                        },
                                    },
                                    error: {
                                        duration: 4000,
                                        iconTheme: {
                                            primary: '#e74c3c',
                                            secondary: '#fff',
                                        },
                                    },
                                }}
                            />
                        </Router>
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
}

// 404 Not Found Component
const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark-light">
            <div className="text-center px-4">
                <div className="text-9xl font-bold text-primary mb-4">404</div>
                <h1 className="text-3xl font-bold mb-2 text-dark dark:text-white">Page Not Found</h1>
                <p className="text-gray mb-8 max-w-md">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>
                <a href="/" className="btn inline-block">
                    <i className="fas fa-home mr-2"></i> Back to Home
                </a>
            </div>
        </div>
    );
};

export default App;