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
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [trackingUpdates, setTrackingUpdates] = useState([]);
    const [returnReason, setReturnReason] = useState('');
    const [showReturnModal, setShowReturnModal] = useState(false);

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
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            delivered: 'bg-green-500 text-white dark:bg-green-600',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: 'fa-clock',
            processing: 'fa-cogs',
            confirmed: 'fa-check-circle',
            shipped: 'fa-truck',
            out_for_delivery: 'fa-motorcycle',
            delivered: 'fa-home',
            cancelled: 'fa-times-circle'
        };
        return icons[status] || 'fa-box';
    };

    const viewTracking = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/tracking`);
            setTrackingUpdates(response.data);
            const order = orders.find(o => o.id === orderId);
            setSelectedOrder(order);
            setShowTrackingModal(true);
        } catch (error) {
            toast.error('Failed to load tracking details');
        }
    };

    const requestReturn = async (orderId) => {
        if (!returnReason.trim()) {
            toast.error('Please provide a reason for return');
            return;
        }
        
        try {
            await api.post('/orders/request-return', {
                order_id: orderId,
                reason: returnReason
            });
            toast.success('Return request submitted successfully');
            setShowReturnModal(false);
            setReturnReason('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit return request');
        }
    };

    const downloadInvoice = async (order) => {
        try {
            // In production, generate PDF invoice
            toast.success('Invoice download started');
        } catch (error) {
            toast.error('Failed to download invoice');
        }
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
                <meta name="description" content="View your order history, track shipments, and manage returns" />
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                        <p className="text-gray">Track and manage your orders</p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl shadow-soft">
                            <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                            <p className="text-gray mb-6">You haven't placed any orders yet.</p>
                            <Link to="/products" className="btn">Start Shopping</Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white dark:bg-dark rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all">
                                    {/* Order Header */}
                                    <div className="bg-light dark:bg-dark-light p-4 flex flex-wrap justify-between items-center border-b border-light-gray dark:border-gray-700">
                                        <div>
                                            <p className="text-sm text-gray">Order #{order.order_number}</p>
                                            <p className="text-xs text-gray">
                                                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.order_status)}`}>
                                                <i className={`fas ${getStatusIcon(order.order_status)} mr-1 text-xs`}></i>
                                                {order.order_status?.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(order.payment_status)}`}>
                                                <i className="fas fa-credit-card mr-1 text-xs"></i>
                                                {order.payment_status?.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4">
                                        {order.items && order.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-3 border-b border-light-gray dark:border-gray-700 last:border-0">
                                                <div className="flex gap-3">
                                                    <div className="w-12 h-12 bg-accent dark:bg-primary/20 rounded-lg flex items-center justify-center">
                                                        <i className="fas fa-spa text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.product_name}</p>
                                                        <p className="text-sm text-gray">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-primary">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="bg-light dark:bg-dark-light p-4">
                                        <div className="flex flex-wrap justify-between items-center gap-4">
                                            <div>
                                                <div className="flex items-center gap-4 mb-2">
                                                    {order.delivery_charge === 0 && (
                                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                            <i className="fas fa-gift mr-1"></i> Free Delivery
                                                        </span>
                                                    )}
                                                    {order.estimated_delivery_date && (
                                                        <span className="text-xs text-gray">
                                                            <i className="far fa-calendar mr-1"></i>
                                                            Est. Delivery: {new Date(order.estimated_delivery_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                {order.tracking_number && (
                                                    <p className="text-xs text-gray">
                                                        <i className="fas fa-truck mr-1"></i>
                                                        Courier: {order.courier_name || 'Standard'} | Tracking: {order.tracking_number}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold">Total: ₹{order.total_amount}</p>
                                                <p className="text-xs text-gray">
                                                    Paid via {order.payment_method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-light-gray dark:border-gray-700">
                                            <button
                                                onClick={() => viewTracking(order.id)}
                                                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                                            >
                                                <i className="fas fa-map-marker-alt"></i> Track Order
                                            </button>
                                            
                                            {order.order_status === 'delivered' && (
                                                <>
                                                    <button
                                                        onClick={() => downloadInvoice(order)}
                                                        className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <i className="fas fa-download"></i> Invoice
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowReturnModal(true);
                                                        }}
                                                        className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <i className="fas fa-undo-alt"></i> Return
                                                    </button>
                                                </>
                                            )}
                                            
                                            {order.order_status === 'pending' && (
                                                <button
                                                    onClick={() => {
                                                        toast.error('Contact support to cancel order');
                                                    }}
                                                    className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
                                                >
                                                    <i className="fas fa-times-circle"></i> Cancel Order
                                                </button>
                                            )}
                                            
                                            <Link
                                                to="/products"
                                                className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                                            >
                                                <i className="fas fa-shopping-cart"></i> Buy Again
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Tracking Timeline Modal */}
            {showTrackingModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTrackingModal(false)}>
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-light-gray dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Order Tracking</h3>
                            <button onClick={() => setShowTrackingModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray">Order #{selectedOrder.order_number}</p>
                                <p className="font-semibold">Current Status: {selectedOrder.order_status?.toUpperCase()}</p>
                            </div>
                            
                            <div className="relative">
                                {trackingUpdates.length === 0 ? (
                                    <div className="text-center py-8">
                                        <i className="fas fa-truck text-4xl text-gray-300 mb-3"></i>
                                        <p className="text-gray">No tracking updates available yet</p>
                                    </div>
                                ) : (
                                    trackingUpdates.map((update, index) => (
                                        <div key={update.id} className="flex gap-4 mb-6 relative">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    index === 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                                                }`}>
                                                    <i className={`fas ${getStatusIcon(update.status)}`}></i>
                                                </div>
                                                {index < trackingUpdates.length - 1 && (
                                                    <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <div className="font-semibold capitalize">
                                                    {update.status?.replace('_', ' ')}
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
                                    ))
                                )}
                            </div>

                            {selectedOrder.tracking_number && (
                                <div className="mt-4 p-4 bg-light dark:bg-dark-light rounded-lg">
                                    <p className="text-sm font-medium mb-2">Delivery Information</p>
                                    <p className="text-xs text-gray">Courier: {selectedOrder.courier_name || 'Standard Shipping'}</p>
                                    <p className="text-xs text-gray">Tracking Number: {selectedOrder.tracking_number}</p>
                                    {selectedOrder.estimated_delivery_date && (
                                        <p className="text-xs text-gray mt-1">
                                            Estimated Delivery: {new Date(selectedOrder.estimated_delivery_date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Return Request Modal */}
            {showReturnModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReturnModal(false)}>
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-light-gray dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Request Return</h3>
                            <button onClick={() => setShowReturnModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray mb-4">
                                Order #{selectedOrder.order_number}
                            </p>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Reason for Return</label>
                                <textarea
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Please provide detailed reason for return..."
                                ></textarea>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => requestReturn(selectedOrder.id)} className="btn flex-1">
                                    Submit Request
                                </button>
                                <button onClick={() => setShowReturnModal(false)} className="btn-outline flex-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyOrders;