import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

// Admin Components
import AdminStats from './AdminStats';
import AdminServices from './AdminServices';
import AdminProducts from './AdminProducts';
import AdminBookings from './AdminBookings';
import AdminOrders from './AdminOrders';
import AdminGallery from './AdminGallery';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';

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
        { path: '/admin/services', name: 'Services', icon: 'fa-spa', mobileIcon: 'fa-spa' },
        { path: '/admin/products', name: 'Products', icon: 'fa-box', mobileIcon: 'fa-box' },
        { path: '/admin/bookings', name: 'Bookings', icon: 'fa-calendar', mobileIcon: 'fa-calendar-alt' },
        { path: '/admin/orders', name: 'Orders', icon: 'fa-truck', mobileIcon: 'fa-shopping-cart' },
        { path: '/admin/gallery', name: 'Gallery', icon: 'fa-images', mobileIcon: 'fa-image' },
        { path: '/admin/users', name: 'Users', icon: 'fa-users', mobileIcon: 'fa-user' },
        { path: '/admin/settings', name: 'Settings', icon: 'fa-cog', mobileIcon: 'fa-sliders-h' }
    ];

    useEffect(() => {
        fetchAllStats();
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const fetchAllStats = async () => {
        try {
            setLoading(true);
            
            const [bookingsRes, ordersRes, productsRes, usersRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/orders/admin/all'),
                api.get('/products'),
                api.get('/auth/users')
            ]);
            
            const bookings = bookingsRes.data;
            const orders = ordersRes.data;
            const products = productsRes.data;
            const users = usersRes.data;
            
            const totalRevenue = orders.reduce((sum, o) => sum + (o.payment_status === 'success' ? o.total_amount : 0), 0);
            
            const monthlyRevenueMap = {};
            orders.forEach(order => {
                if (order.payment_status === 'success') {
                    const month = new Date(order.created_at).toLocaleString('default', { month: 'short' });
                    monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + order.total_amount;
                }
            });
            const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({ month, revenue }));
            
            const statusMap = {};
            orders.forEach(order => {
                statusMap[order.order_status] = (statusMap[order.order_status] || 0) + 1;
            });
            const orderStatusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
            
            const recentOrders = orders.slice(0, 5);
            
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
                        <aside className={`lg:w-64 bg-white dark:bg-dark rounded-2xl shadow-soft p-4 h-fit sticky top-24 transition-all duration-300 ${
                            mobileMenuOpen ? 'block' : 'hidden lg:block'
                        }`}>
                            {/* Desktop Profile */}
                            <div className="hidden lg:block text-center mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i className="fas fa-crown text-white text-2xl"></i>
                                </div>
                                <h3 className="font-semibold">{user?.name || 'Admin'}</h3>
                                <p className="text-primary text-sm">Administrator</p>
                            </div>
                            
                            {/* Navigation */}
                            <nav className="space-y-1">
                                {navItems.map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                            location.pathname === item.path
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
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="bookings" element={<AdminBookings />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="gallery" element={<AdminGallery />} />
                                    <Route path="users" element={<AdminUsers />} />
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