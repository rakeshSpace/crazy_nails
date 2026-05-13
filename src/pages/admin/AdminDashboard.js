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
import AdminGallery from './AdminGallery';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [stats, setStats] = useState({});

    const navItems = [
        { path: '/admin', name: 'Dashboard', icon: 'fa-chart-line' },
        { path: '/admin/services', name: 'Services', icon: 'fa-spa' },
        { path: '/admin/products', name: 'Products', icon: 'fa-box' },
        { path: '/admin/bookings', name: 'Bookings', icon: 'fa-calendar' },
        { path: '/admin/gallery', name: 'Gallery', icon: 'fa-images' },
        { path: '/admin/users', name: 'Users', icon: 'fa-users' },
        { path: '/admin/settings', name: 'Settings', icon: 'fa-cog' }
    ];

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [bookingsRes, ordersRes, usersRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/orders'),
                api.get('/auth/users')
            ]);
            setStats({
                totalBookings: bookingsRes.data.length,
                pendingBookings: bookingsRes.data.filter(b => b.status === 'pending').length,
                totalOrders: ordersRes.data.length,
                totalUsers: usersRes.data.length
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard | Crazy Nails & Lashes</title>
            </Helmet>

            <div className="min-h-screen bg-light dark:bg-dark-light pt-24">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <aside className="lg:w-64 bg-white dark:bg-dark rounded-2xl shadow-soft p-4 h-fit sticky top-24">
                            <div className="text-center mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                                    <i className="fas fa-crown text-white text-2xl"></i>
                                </div>
                                <h3 className="font-semibold">{user?.name}</h3>
                                <p className="text-primary text-sm">Administrator</p>
                            </div>
                            
                            <nav className="space-y-1">
                                {navItems.map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                            location.pathname === item.path
                                                ? 'bg-gradient-to-r from-primary to-secondary text-white'
                                                : 'text-dark dark:text-white hover:bg-light dark:hover:bg-dark-light'
                                        }`}
                                    >
                                        <i className={`fas ${item.icon} w-5`}></i>
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </nav>
                        </aside>
                        
                        {/* Main Content */}
                        <main className="flex-1">
                            <Routes>
                                <Route index element={<AdminStats stats={stats} />} />
                                <Route path="services" element={<AdminServices />} />
                                <Route path="products" element={<AdminProducts />} />
                                <Route path="bookings" element={<AdminBookings />} />
                                <Route path="gallery" element={<AdminGallery />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="settings" element={<AdminSettings />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;