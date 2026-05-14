import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const OrderTracking = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const [orderRes, updatesRes] = await Promise.all([
                api.get(`/orders/${id}`),
                api.get(`/orders/${id}/tracking`)
            ]);
            setOrder(orderRes.data.order);
            setUpdates(updatesRes.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            'order_placed': 'fa-shopping-cart',
            'confirmed': 'fa-check-circle',
            'processing': 'fa-cogs',
            'shipped': 'fa-truck',
            'out_for_delivery': 'fa-motorcycle',
            'delivered': 'fa-home',
            'cancelled': 'fa-times-circle'
        };
        return icons[status] || 'fa-clock';
    };

    const getStatusColor = (status) => {
        const colors = {
            'order_placed': 'text-blue-500',
            'confirmed': 'text-green-500',
            'processing': 'text-yellow-500',
            'shipped': 'text-purple-500',
            'out_for_delivery': 'text-orange-500',
            'delivered': 'text-green-600',
            'cancelled': 'text-red-500'
        };
        return colors[status] || 'text-gray-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
                    <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                    <Link to="/my-orders" className="btn">Back to Orders</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Track Order #{order.order_number} | Crazy Nails & Lashes</title>
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-6">
                        <Link to="/my-orders" className="text-primary hover:underline">
                            <i className="fas fa-arrow-left mr-2"></i> Back to Orders
                        </Link>
                    </div>

                    {/* Order Header */}
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-6 mb-6">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                                <p className="text-gray">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                                    order.order_status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {order.order_status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-6 mb-6">
                        <h2 className="text-xl font-bold mb-6">Order Timeline</h2>
                        <div className="relative">
                            {updates.map((update, index) => (
                                <div key={update.id} className="flex gap-4 mb-6 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(update.status)} bg-opacity-10 bg-current`}>
                                            <i className={`fas ${getStatusIcon(update.status)}`}></i>
                                        </div>
                                        {index < updates.length - 1 && (
                                            <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="font-semibold capitalize">
                                            {update.status.replace('_', ' ')}
                                        </div>
                                        <div className="text-sm text-gray">{update.remarks}</div>
                                        {update.location && (
                                            <div className="text-xs text-gray mt-1">
                                                <i className="fas fa-map-marker-alt mr-1"></i> {update.location}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray mt-1">
                                            {new Date(update.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    {order.tracking_number && (
                        <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray text-sm">Courier Partner</p>
                                    <p className="font-semibold">{order.courier_name || 'To be assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-gray text-sm">Tracking Number</p>
                                    <p className="font-semibold">{order.tracking_number || 'Not available'}</p>
                                </div>
                                <div>
                                    <p className="text-gray text-sm">Estimated Delivery</p>
                                    <p className="font-semibold">
                                        {order.estimated_delivery_date 
                                            ? new Date(order.estimated_delivery_date).toLocaleDateString()
                                            : 'To be updated'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray text-sm">Actual Delivery</p>
                                    <p className="font-semibold">
                                        {order.actual_delivery_date 
                                            ? new Date(order.actual_delivery_date).toLocaleDateString()
                                            : 'Not delivered yet'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Order Items</h2>
                        <div className="space-y-3">
                            {order.items?.map(item => (
                                <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0">
                                    <div>
                                        <p className="font-semibold">{item.product_name}</p>
                                        <p className="text-sm text-gray">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-primary">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between mb-2">
                                <span>Subtotal</span>
                                <span>₹{order.total_amount - order.delivery_charge}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Delivery Charge</span>
                                <span>{order.delivery_charge === 0 ? 'Free' : `₹${order.delivery_charge}`}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                                <span>Total</span>
                                <span className="text-primary">₹{order.total_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-6">
                        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                        <p className="text-gray">{order.shipping_address}</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default OrderTracking;