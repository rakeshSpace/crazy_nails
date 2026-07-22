import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        pincode: user?.pincode || ''
    });
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newAddress, setNewAddress] = useState({
        type: 'home',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
    });

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        } else if (activeTab === 'bookings') {
            fetchBookings();
        } else if (activeTab === 'wishlist') {
            fetchWishlist();
        } else if (activeTab === 'addresses') {
            fetchAddresses();
        }
    }, [activeTab]);

    // ===== FETCH FUNCTIONS =====
    const fetchOrders = async () => {
        try {
            setOrderLoading(true);
            const response = await api.get('/orders/my-orders');
            setOrders(response.data || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setOrderLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            setOrderLoading(true);
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setOrderLoading(false);
        }
    };

    const fetchWishlist = async () => {
        try {
            setOrderLoading(true);
            const response = await api.get('/wishlist');
            setWishlist(response.data || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setOrderLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            setOrderLoading(true);
            const response = await api.get('/addresses');
            setAddresses(response.data || []);
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setOrderLoading(false);
        }
    };

    // ===== PROFILE UPDATE =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await updateProfile(formData);
            if (success) {
                toast.success('Profile updated successfully! 🎉');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // ===== PASSWORD CHANGE =====
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed successfully! 🔒');
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    // ===== WISHLIST FUNCTIONS =====
    const removeFromWishlist = async (productId) => {
        try {
            await api.delete(`/wishlist/${productId}`);
            setWishlist(wishlist.filter(item => item.id !== productId));
            toast.success('Removed from wishlist');
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    const addToCart = async (productId) => {
        try {
            await api.post('/cart', { productId, quantity: 1 });
            toast.success('Added to cart! 🛒');
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    // ===== ADDRESS FUNCTIONS =====
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/addresses', newAddress);
            setAddresses([...addresses, response.data]);
            toast.success('Address added successfully! 📍');
            setShowAddressModal(false);
            setNewAddress({ type: 'home', address: '', city: '', state: '', pincode: '', isDefault: false });
        } catch (error) {
            toast.error('Failed to add address');
        } finally {
            setLoading(false);
        }
    };

    const setDefaultAddress = async (addressId) => {
        try {
            await api.put(`/addresses/${addressId}/default`);
            fetchAddresses();
            toast.success('Default address updated');
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const deleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            await api.delete(`/addresses/${addressId}`);
            setAddresses(addresses.filter(addr => addr.id !== addressId));
            toast.success('Address deleted');
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    // ===== LOGOUT =====
    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        }
    };

    // ===== CANCEL ORDER =====
    const cancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            await api.put(`/orders/${orderId}/cancel`);
            fetchOrders();
            toast.success('Order cancelled');
        } catch (error) {
            toast.error('Failed to cancel order');
        }
    };

    // ===== CANCEL BOOKING =====
    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.put(`/bookings/${bookingId}/cancel`);
            fetchBookings();
            toast.success('Booking cancelled');
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    // Sidebar navigation items
    const menuItems = [
        { id: 'profile', icon: 'fa-user', label: 'My Profile' },
        { id: 'orders', icon: 'fa-shopping-bag', label: 'My Orders' },
        { id: 'bookings', icon: 'fa-calendar-check', label: 'My Bookings' },
        { id: 'wishlist', icon: 'fa-heart', label: 'Wishlist' },
        { id: 'addresses', icon: 'fa-map-marker-alt', label: 'Saved Addresses' },
        { id: 'settings', icon: 'fa-cog', label: 'Account Settings' },
    ];

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            'delivered': 'bg-green-100 text-green-700',
            'completed': 'bg-green-100 text-green-700',
            'confirmed': 'bg-blue-100 text-blue-700',
            'pending': 'bg-yellow-100 text-yellow-700',
            'processing': 'bg-yellow-100 text-yellow-700',
            'shipped': 'bg-purple-100 text-purple-700',
            'cancelled': 'bg-red-100 text-red-700',
            'failed': 'bg-red-100 text-red-700'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
    };

    return (
        <>
            <Helmet>
                <title>My Profile | Crazy Nails</title>
                <meta name="description" content="Manage your profile, orders, bookings, and wishlist at Crazy Nails." />
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* ===== SIDEBAR ===== */}
                        <div className="lg:w-72 flex-shrink-0">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft overflow-hidden sticky top-24">
                                {/* User Info Card */}
                                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white/30">
                                        {user?.profile_image ? (
                                            <img 
                                                src={user.profile_image} 
                                                alt={user.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <i className="fas fa-user-circle text-5xl text-primary"></i>
                                        )}
                                    </div>
                                    <h3 className="text-white font-bold text-lg truncate">{user?.name || 'User'}</h3>
                                    <p className="text-white/80 text-sm truncate">{user?.email || 'No email'}</p>
                                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs">
                                        {user?.role === 'admin' ? 'Administrator' : 
                                         user?.role === 'staff' ? 'Staff Member' : 'Customer'}
                                    </span>
                                </div>

                                {/* Navigation Menu */}
                                <nav className="p-3">
                                    {menuItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                                                activeTab === item.id
                                                    ? 'bg-primary/10 text-primary font-semibold'
                                                    : 'hover:bg-light dark:hover:bg-dark-light text-gray-600 dark:text-gray-300'
                                            }`}
                                        >
                                            <i className={`fas ${item.icon} w-5 text-center text-lg`}></i>
                                            <span className="text-sm">{item.label}</span>
                                            {item.id === 'orders' && orders.length > 0 && (
                                                <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">
                                                    {orders.length}
                                                </span>
                                            )}
                                            {item.id === 'bookings' && bookings.length > 0 && (
                                                <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">
                                                    {bookings.length}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </nav>

                                {/* Logout Button */}
                                <div className="p-3 border-t border-light-gray dark:border-gray-700">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all duration-200"
                                    >
                                        <i className="fas fa-sign-out-alt w-5 text-center text-lg"></i>
                                        <span className="text-sm">Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ===== MAIN CONTENT ===== */}
                        <div className="flex-1 min-w-0">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-4 sm:p-6">
                                
                                {/* ===== PROFILE TAB ===== */}
                                {activeTab === 'profile' && (
                                    <>
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                            <h2 className="text-xl font-bold">My Profile</h2>
                                            <span className="text-sm text-gray-500">Member since {new Date(user?.created_at).getFullYear()}</span>
                                        </div>

                                        <form onSubmit={handleSubmit}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block font-medium mb-2 text-sm">Full Name *</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block font-medium mb-2 text-sm">Email Address</label>
                                                    <input
                                                        type="email"
                                                        value={user?.email}
                                                        disabled
                                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                                </div>
                                                
                                                <div>
                                                    <label className="block font-medium mb-2 text-sm">Phone Number *</label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block font-medium mb-2 text-sm">Address</label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block font-medium mb-2 text-sm">City</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block font-medium mb-2 text-sm">State</label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block font-medium mb-2 text-sm">Pincode</label>
                                                    <input
                                                        type="text"
                                                        name="pincode"
                                                        value={formData.pincode}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 pt-4 border-t border-light-gray dark:border-gray-700 flex flex-wrap gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="btn py-2.5 px-8 disabled:opacity-50"
                                                >
                                                    {loading ? (
                                                        <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</>
                                                    ) : (
                                                        'Save Changes'
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({
                                                            name: user?.name || '',
                                                            phone: user?.phone || '',
                                                            address: user?.address || '',
                                                            city: user?.city || '',
                                                            state: user?.state || '',
                                                            pincode: user?.pincode || ''
                                                        });
                                                        toast.success('Reset to original values');
                                                    }}
                                                    className="px-6 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg hover:bg-light dark:hover:bg-dark-light transition-all"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}

                                {/* ===== ORDERS TAB ===== */}
                                {activeTab === 'orders' && (
                                    <>
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                            <h2 className="text-xl font-bold">My Orders</h2>
                                            <span className="text-sm text-gray-500">{orders.length} orders</span>
                                        </div>

                                        {orderLoading ? (
                                            <div className="text-center py-12">
                                                <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
                                                <p className="mt-4 text-gray-500">Loading your orders...</p>
                                            </div>
                                        ) : orders.length === 0 ? (
                                            <div className="text-center py-12">
                                                <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                                                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                                                <p className="text-gray-500 text-sm">Start shopping to see your orders here</p>
                                                <Link to="/products" className="btn mt-4 inline-block">
                                                    Start Shopping
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {orders.map((order) => (
                                                    <div key={order.id} className="border border-light-gray dark:border-gray-700 rounded-xl p-4 hover:shadow-soft transition-all">
                                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <p className="font-semibold">Order #{order.order_number || order.id}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                                                </p>
                                                                <p className="text-sm mt-1">{order.items?.length || 0} items</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                                                                </span>
                                                                <p className="font-bold text-lg mt-1">₹{order.total || order.amount}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 pt-3 border-t border-light-gray dark:border-gray-700 flex flex-wrap gap-3">
                                                            <Link to={`/order-tracking/${order.id}`} className="text-primary text-sm hover:underline">
                                                                <i className="fas fa-eye mr-1"></i> View Details
                                                            </Link>
                                                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                                <button 
                                                                    onClick={() => cancelOrder(order.id)}
                                                                    className="text-red-500 text-sm hover:underline"
                                                                >
                                                                    <i className="fas fa-times mr-1"></i> Cancel Order
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ===== BOOKINGS TAB ===== */}
                                {activeTab === 'bookings' && (
                                    <>
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                            <h2 className="text-xl font-bold">My Bookings</h2>
                                            <span className="text-sm text-gray-500">{bookings.length} bookings</span>
                                        </div>

                                        {orderLoading ? (
                                            <div className="text-center py-12">
                                                <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
                                                <p className="mt-4 text-gray-500">Loading your bookings...</p>
                                            </div>
                                        ) : bookings.length === 0 ? (
                                            <div className="text-center py-12">
                                                <i className="fas fa-calendar-check text-6xl text-gray-300 mb-4"></i>
                                                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                                                <p className="text-gray-500 text-sm">Book your first appointment now</p>
                                                <Link to="/booking" className="btn mt-4 inline-block">
                                                    Book Now
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {bookings.map((booking) => (
                                                    <div key={booking.id} className="border border-light-gray dark:border-gray-700 rounded-xl p-4 hover:shadow-soft transition-all">
                                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <p className="font-semibold">{booking.service_name || 'Service Booking'}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                                                                </p>
                                                                <p className="text-sm mt-1">{booking.staff_name ? `Staff: ${booking.staff_name}` : ''}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Pending'}
                                                                </span>
                                                                <p className="font-bold text-lg mt-1">₹{booking.price || booking.amount}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 pt-3 border-t border-light-gray dark:border-gray-700 flex flex-wrap gap-3">
                                                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                                <button 
                                                                    onClick={() => cancelBooking(booking.id)}
                                                                    className="text-red-500 text-sm hover:underline"
                                                                >
                                                                    <i className="fas fa-times mr-1"></i> Cancel Booking
                                                                </button>
                                                            )}
                                                            {booking.status === 'completed' && (
                                                                <span className="text-green-500 text-sm">
                                                                    <i className="fas fa-check-circle mr-1"></i> Completed
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ===== WISHLIST TAB ===== */}
                                {activeTab === 'wishlist' && (
                                    <>
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                            <h2 className="text-xl font-bold">Wishlist</h2>
                                            <span className="text-sm text-gray-500">{wishlist.length} items</span>
                                        </div>

                                        {orderLoading ? (
                                            <div className="text-center py-12">
                                                <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
                                                <p className="mt-4 text-gray-500">Loading your wishlist...</p>
                                            </div>
                                        ) : wishlist.length === 0 ? (
                                            <div className="text-center py-12">
                                                <i className="fas fa-heart text-6xl text-gray-300 mb-4"></i>
                                                <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                                                <p className="text-gray-500 text-sm">Save your favorite items here</p>
                                                <Link to="/products" className="btn mt-4 inline-block">
                                                    Explore Products
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {wishlist.map((item) => (
                                                    <div key={item.id} className="border border-light-gray dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-soft transition-all group">
                                                        <Link to={`/products/${item.product_id}`} className="block">
                                                            <div className="h-48 bg-light dark:bg-dark-light overflow-hidden">
                                                                {item.image_url || item.product_image ? (
                                                                    <img 
                                                                        src={item.image_url || item.product_image} 
                                                                        alt={item.name || item.product_name}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            e.target.parentElement.innerHTML = '<div className="w-full h-full flex items-center justify-center"><i className="fas fa-box text-4xl text-gray-300"></i></div>';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <i className="fas fa-box text-4xl text-gray-300"></i>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                        <div className="p-4">
                                                            <Link to={`/products/${item.product_id}`}>
                                                                <h4 className="font-semibold truncate hover:text-primary transition-colors">
                                                                    {item.name || item.product_name}
                                                                </h4>
                                                            </Link>
                                                            <p className="text-primary font-bold">₹{item.price || item.product_price}</p>
                                                            <div className="flex gap-2 mt-3">
                                                                <button 
                                                                    onClick={() => addToCart(item.product_id)}
                                                                    className="flex-1 btn text-sm py-1.5"
                                                                >
                                                                    <i className="fas fa-shopping-cart mr-1"></i> Add to Cart
                                                                </button>
                                                                <button 
                                                                    onClick={() => removeFromWishlist(item.id)}
                                                                    className="text-red-500 hover:text-red-700 p-2 border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                                                                    title="Remove from wishlist"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ===== ADDRESSES TAB ===== */}
                                {activeTab === 'addresses' && (
                                    <>
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-light-gray dark:border-gray-700 flex-wrap gap-2">
                                            <h2 className="text-xl font-bold">Saved Addresses</h2>
                                            <button 
                                                onClick={() => setShowAddressModal(true)}
                                                className="btn text-sm py-2 px-4"
                                            >
                                                <i className="fas fa-plus mr-1"></i> Add New
                                            </button>
                                        </div>

                                        {orderLoading ? (
                                            <div className="text-center py-12">
                                                <i className="fas fa-spinner fa-spin text-4xl text-primary"></i>
                                                <p className="mt-4 text-gray-500">Loading addresses...</p>
                                            </div>
                                        ) : addresses.length === 0 ? (
                                            <div className="text-center py-12">
                                                <i className="fas fa-map-marker-alt text-6xl text-gray-300 mb-4"></i>
                                                <h3 className="text-lg font-medium mb-2">No saved addresses</h3>
                                                <p className="text-gray-500 text-sm">Add your first address for faster checkout</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {addresses.map((address) => (
                                                    <div 
                                                        key={address.id} 
                                                        className={`border rounded-xl p-4 transition-all ${
                                                            address.isDefault 
                                                                ? 'border-primary/50 bg-primary/5 dark:bg-primary/10' 
                                                                : 'border-light-gray dark:border-gray-700'
                                                        } hover:shadow-soft`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-semibold capitalize">{address.type || 'Home'}</h4>
                                                                    {address.isDefault && (
                                                                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">Default</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                    {address.address}<br />
                                                                    {address.city}, {address.state}<br />
                                                                    {address.pincode && `Pincode: ${address.pincode}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-light-gray dark:border-gray-700">
                                                            {!address.isDefault && (
                                                                <button 
                                                                    onClick={() => setDefaultAddress(address.id)}
                                                                    className="text-primary text-sm hover:underline"
                                                                >
                                                                    <i className="fas fa-check mr-1"></i> Set Default
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => deleteAddress(address.id)}
                                                                className="text-red-500 text-sm hover:underline"
                                                            >
                                                                <i className="fas fa-trash mr-1"></i> Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* ===== SETTINGS TAB ===== */}
                                {activeTab === 'settings' && (
                                    <>
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                            <h2 className="text-xl font-bold">Account Settings</h2>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Change Password */}
                                            <div className="flex flex-wrap items-center justify-between p-4 border border-light-gray dark:border-gray-700 rounded-xl hover:shadow-soft transition-all">
                                                <div>
                                                    <h4 className="font-medium">Change Password</h4>
                                                    <p className="text-sm text-gray-500">Update your account password</p>
                                                </div>
                                                <button 
                                                    onClick={() => setShowPasswordModal(true)}
                                                    className="text-primary text-sm hover:underline mt-2 sm:mt-0"
                                                >
                                                    <i className="fas fa-key mr-1"></i> Change
                                                </button>
                                            </div>

                                            {/* Email Notifications */}
                                            <div className="flex flex-wrap items-center justify-between p-4 border border-light-gray dark:border-gray-700 rounded-xl hover:shadow-soft transition-all">
                                                <div>
                                                    <h4 className="font-medium">Email Notifications</h4>
                                                    <p className="text-sm text-gray-500">Receive order and booking updates</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer" 
                                                            defaultChecked 
                                                            onChange={(e) => {
                                                                toast.success(e.target.checked ? 'Notifications enabled' : 'Notifications disabled');
                                                            }}
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Account Info */}
                                            <div className="flex flex-wrap items-center justify-between p-4 border border-light-gray dark:border-gray-700 rounded-xl hover:shadow-soft transition-all">
                                                <div>
                                                    <h4 className="font-medium">Account Information</h4>
                                                    <p className="text-sm text-gray-500">View your account details</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        toast.success(`Email: ${user?.email}\nRole: ${user?.role}`);
                                                    }}
                                                    className="text-primary text-sm hover:underline mt-2 sm:mt-0"
                                                >
                                                    <i className="fas fa-info-circle mr-1"></i> View
                                                </button>
                                            </div>

                                            {/* Delete Account */}
                                            <div className="flex flex-wrap items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/10 hover:shadow-soft transition-all">
                                                <div>
                                                    <h4 className="font-medium text-red-600 dark:text-red-400">Delete Account</h4>
                                                    <p className="text-sm text-red-500/70">Permanently delete your account and data</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete your account? This cannot be undone!')) {
                                                            toast.error('Account deletion request submitted');
                                                        }
                                                    }}
                                                    className="text-red-500 text-sm hover:underline font-semibold mt-2 sm:mt-0"
                                                >
                                                    <i className="fas fa-exclamation-triangle mr-1"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CHANGE PASSWORD MODAL ===== */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-light-gray dark:border-gray-700">
                            <h3 className="text-xl font-bold">Change Password</h3>
                            <button 
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium mb-2 text-sm">Current Password *</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2 text-sm">New Password *</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        minLength="6"
                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                                </div>
                                <div>
                                    <label className="block font-medium mb-2 text-sm">Confirm New Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-light-gray dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn py-2.5 px-8 disabled:opacity-50 flex-1"
                                >
                                    {loading ? (
                                        <><i className="fas fa-spinner fa-spin mr-2"></i> Updating...</>
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-6 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg hover:bg-light dark:hover:bg-dark-light transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== ADD ADDRESS MODAL ===== */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-light-gray dark:border-gray-700">
                            <h3 className="text-xl font-bold">Add New Address</h3>
                            <button 
                                onClick={() => setShowAddressModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleAddressSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-medium mb-2 text-sm">Address Type *</label>
                                    <select
                                        name="type"
                                        value={newAddress.type}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium mb-2 text-sm">Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={newAddress.address}
                                        onChange={handleAddressChange}
                                        required
                                        placeholder="Street address, building, etc."
                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2 text-sm">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={newAddress.city}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2 text-sm">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={newAddress.state}
                                        onChange={handleAddressChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2 text-sm">Pincode</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={newAddress.pincode}
                                        onChange={handleAddressChange}
                                        pattern="[0-9]{5,6}"
                                        className="w-full px-4 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        checked={newAddress.isDefault}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        id="defaultAddress"
                                    />
                                    <label htmlFor="defaultAddress" className="text-sm cursor-pointer">Set as default address</label>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-light-gray dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn py-2.5 px-8 disabled:opacity-50 flex-1"
                                >
                                    {loading ? (
                                        <><i className="fas fa-spinner fa-spin mr-2"></i> Adding...</>
                                    ) : (
                                        'Add Address'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(false)}
                                    className="px-6 py-2.5 border border-light-gray dark:border-gray-700 rounded-lg hover:bg-light dark:hover:bg-dark-light transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;