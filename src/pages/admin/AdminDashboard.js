import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

// Admin Components
import AdminStats from './AdminStats';
import AdminHeroSlider from './AdminHeroSlider';
import AdminTestimonials from './AdminTestimonials';
import AdminServices from './AdminServices';
import AdminProducts from './AdminProducts';
import AdminBookings from './AdminBookings';
import AdminOrders from './AdminOrders';
import AdminGallery from './AdminGallery';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import AdminFranchise from './AdminFranchise';
import AdminTransformations from './AdminTransformations';
import AdminOffers from './AdminOffers';
import AdminBulkOffers from './AdminBulkOffers';

const AdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: [],
        orderStatusData: [],
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    const navItems = [
        { path: '/admin', name: 'Dashboard', icon: 'fa-chart-line', mobileIcon: 'fa-tachometer-alt' },
        { path: '/admin/hero', name: 'Hero Slider', icon: 'fa-images' },
        { path: '/admin/testimonials', name: 'Testimonials', icon: 'fa-comments', mobileIcon: 'fa-comments' },
        { path: '/admin/offers', name: 'Offers', icon: 'fa-tag', mobileIcon: 'fa-tag' },
        { path: '/admin/bulk-offers', name: 'Bulk Offers', icon: 'fa-layer-group', mobileIcon: 'fa-layer-group' },
        { path: '/admin/services', name: 'Services', icon: 'fa-spa', mobileIcon: 'fa-spa' },
        { path: '/admin/products', name: 'Products', icon: 'fa-box', mobileIcon: 'fa-box' },
        { path: '/admin/bookings', name: 'Bookings', icon: 'fa-calendar', mobileIcon: 'fa-calendar-alt' },
        { path: '/admin/orders', name: 'Orders', icon: 'fa-truck', mobileIcon: 'fa-shopping-cart' },
        { path: '/admin/gallery', name: 'Gallery', icon: 'fa-images', mobileIcon: 'fa-image' },
        { path: '/admin/users', name: 'Users', icon: 'fa-users', mobileIcon: 'fa-user' },
        { path: '/admin/franchise', name: 'Franchise', icon: 'fa-store', mobileIcon: 'fa-store' },
        { path: '/admin/transformations', name: 'Transformations', icon: 'fa-sync', mobileIcon: 'fa-sync-alt' },
        { path: '/admin/settings', name: 'Settings', icon: 'fa-cog', mobileIcon: 'fa-sliders-h' }

    ];

    useEffect(() => {
        fetchAllStats();
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const fetchAllStats = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel with error handling for each
            let bookings = [];
            let orders = [];
            let products = [];
            let users = [];

            try {
                const bookingsRes = await api.get('/bookings');
                bookings = bookingsRes.data;
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            }

            try {
                const ordersRes = await api.get('/orders/admin/all');
                orders = ordersRes.data;
                console.log('Orders fetched:', orders.length);
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            }

            try {
                const productsRes = await api.get('/products');
                products = productsRes.data;
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }

            try {
                const usersRes = await api.get('/auth/users');
                users = usersRes.data;
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }

            // Calculate total revenue from successful payments
            const totalRevenue = orders.reduce((sum, o) => {
                if (o.payment_status === 'success' || o.payment_status === 'completed') {
                    return sum + (parseFloat(o.total_amount) || 0);
                }
                return sum;
            }, 0);

            // Prepare monthly revenue data (last 12 months)
            const monthlyRevenueMap = {};
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Initialize all months with 0
            months.forEach(month => {
                monthlyRevenueMap[month] = 0;
            });

            orders.forEach(order => {
                if (order.payment_status === 'success' || order.payment_status === 'completed') {
                    const date = new Date(order.created_at);
                    const month = months[date.getMonth()];
                    monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + (parseFloat(order.total_amount) || 0);
                }
            });

            const monthlyRevenue = months.map(month => ({
                month: month,
                revenue: monthlyRevenueMap[month] || 0
            }));

            // Prepare order status distribution
            const statusMap = {
                pending: 0,
                processing: 0,
                confirmed: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0
            };

            orders.forEach(order => {
                const status = order.order_status;
                if (statusMap.hasOwnProperty(status)) {
                    statusMap[status]++;
                }
            });

            const orderStatusData = Object.entries(statusMap)
                .filter(([_, value]) => value > 0)
                .map(([name, value]) => ({ name, value }));

            // Get recent orders (last 5)
            const recentOrders = [...orders].sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            ).slice(0, 5);

            console.log('Processed stats:', {
                totalRevenue,
                monthlyRevenue,
                orderStatusData,
                recentOrdersCount: recentOrders.length
            });

            setStats({
                totalBookings: bookings.length,
                pendingBookings: bookings.filter(b => b.status === 'pending').length,
                totalOrders: orders.length,
                totalProducts: products.length,
                totalUsers: users.length,
                totalRevenue: totalRevenue,
                monthlyRevenue: monthlyRevenue,
                orderStatusData: orderStatusData,
                recentOrders: recentOrders
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | Crazy Nails & Lashes</title>
            </Helmet>

            <div className="min-h-screen bg-light dark:bg-dark-light pt-20 pb-4">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Mobile Menu Button */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="w-full bg-white dark:bg-dark rounded-xl p-3 flex items-center justify-between shadow-soft"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                                    <i className="fas fa-user-shield text-white"></i>
                                </div>
                                <div>
                                    <p className="font-semibold text-left">{user?.name || 'Admin'}</p>
                                    <p className="text-xs text-gray">Administrator</p>
                                </div>
                            </div>
                            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar - Desktop */}
                        <aside className={`lg:w-64 bg-white dark:bg-dark rounded-2xl shadow-soft p-4 h-fit sticky top-24 transition-all duration-300 ${mobileMenuOpen ? 'block' : 'hidden lg:block'
                            }`}>
                            <div className="hidden lg:block text-center mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                <div className="flex justify-center">
                                    <img
                                        src="/logo.png"
                                        alt="Crazy Nails Logo"
                                        className="h-16 w-auto object-contain"
                                    />
                                </div>
                                <h3 className="font-semibold">{user?.name || 'Admin'}</h3>
                                <p className="text-primary text-sm">Administrator</p>
                            </div>

                            <nav className="space-y-1">
                                {navItems.map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                                            : 'text-dark dark:text-white hover:bg-light dark:hover:bg-dark-light'
                                            }`}
                                    >
                                        <i className={`fas ${item.icon} w-5`}></i>
                                        <span>{item.name}</span>
                                        {location.pathname === item.path && (
                                            <i className="fas fa-chevron-right ml-auto text-xs"></i>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 min-w-0">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-4 md:p-6">
                                <Routes>
                                    <Route index element={<AdminStats stats={stats} loading={loading} />} />
                                    <Route path="services" element={<AdminServices />} />
                                    <Route path="hero" element={<AdminHeroSlider />} />
                                    <Route path="testimonials" element={<AdminTestimonials />} />
                                    <Route path="offers" element={<AdminOffers />} />
                                    <Route path="bulk-offers" element={<AdminBulkOffers />} />
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="bookings" element={<AdminBookings />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="gallery" element={<AdminGallery />} />
                                    <Route path="users" element={<AdminUsers />} />
                                    <Route path="franchise" element={<AdminFranchise />} />
                                    <Route path="transformations" element={<AdminTransformations />} />
                                    <Route path="settings" element={<AdminSettings />} />
                                </Routes>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;