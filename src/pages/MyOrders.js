import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-green-100 text-green-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-500 text-white',
            cancelled: 'bg-red-100 text-red-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            success: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Orders | Crazy Nails & Lashes</title>
                <meta name="description" content="View your order history and track order status" />
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                        <p className="text-gray">Track and manage your orders</p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl">
                            <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                            <p className="text-gray mb-6">You haven't placed any orders yet.</p>
                            <Link to="/products" className="btn">Start Shopping</Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white dark:bg-dark rounded-2xl shadow-soft overflow-hidden">
                                    {/* Order Header */}
                                    <div className="bg-light dark:bg-dark-light p-4 flex flex-wrap justify-between items-center border-b border-light-gray dark:border-gray-700">
                                        <div>
                                            <p className="text-sm text-gray">Order #{order.order_number}</p>
                                            <p className="text-xs text-gray">
                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(order.payment_status)}`}>
                                                {order.payment_status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4">
                                        {order.items && order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-3 border-b border-light-gray dark:border-gray-700 last:border-0">
                                                <div>
                                                    <p className="font-medium">{item.product_name}</p>
                                                    <p className="text-sm text-gray">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-primary">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="bg-light dark:bg-dark-light p-4 flex flex-wrap justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray">
                                                <i className="fas fa-truck mr-1"></i> 
                                                {order.order_status === 'delivered' ? 'Delivered' : 'Processing'}
                                            </p>
                                            {order.tracking_number && (
                                                <p className="text-xs text-gray mt-1">
                                                    Tracking: {order.tracking_number}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold">Total: ₹{order.total_amount}</p>
                                            <p className="text-xs text-gray">
                                                Paid via {order.payment_method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default MyOrders;