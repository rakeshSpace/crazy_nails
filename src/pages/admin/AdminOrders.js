import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [trackingData, setTrackingData] = useState({
        tracking_number: '',
        courier_name: '',
        tracking_id: '',
        remarks: ''
    });

    const statuses = [
        'all', 'pending', 'processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, filterStatus, searchTerm]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/admin/all');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];
        
        if (filterStatus !== 'all') {
            filtered = filtered.filter(o => o.order_status === filterStatus);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(o => 
                o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredOrders(filtered);
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { order_status: status });
            toast.success(`Order status updated to ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const updateTracking = async (orderId) => {
        try {
            await api.put(`/orders/${orderId}/status`, {
                order_status: 'shipped',
                ...trackingData
            });
            toast.success('Tracking information updated');
            setShowTrackingModal(false);
            setTrackingData({ tracking_number: '', courier_name: '', tracking_id: '', remarks: '' });
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update tracking');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'confirmed': 'bg-green-100 text-green-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'out_for_delivery': 'bg-orange-100 text-orange-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getDeliveryChargeStatus = (order) => {
        if (order.delivery_charge === 0) {
            return <span className="text-green-600 text-xs">Free Delivery</span>;
        }
        return <span className="text-orange-600 text-xs">₹{order.delivery_charge}</span>;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Orders</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'All Orders' : status.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-dark-light rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{orders.length}</p>
                    <p className="text-sm text-gray">Total Orders</p>
                </div>
                <div className="bg-white dark:bg-dark-light rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                        {orders.filter(o => o.order_status === 'pending').length}
                    </p>
                    <p className="text-sm text-gray">Pending</p>
                </div>
                <div className="bg-white dark:bg-dark-light rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                        {orders.filter(o => o.order_status === 'shipped').length}
                    </p>
                    <p className="text-sm text-gray">Shipped</p>
                </div>
                <div className="bg-white dark:bg-dark-light rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                        {orders.filter(o => o.order_status === 'delivered').length}
                    </p>
                    <p className="text-sm text-gray">Delivered</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-dark rounded-xl overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-light dark:bg-dark">
                            <tr>
                                <th className="px-4 py-3 text-left">Order ID</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Amount</th>
                                <th className="px-4 py-3 text-left">Delivery</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="border-t border-light-gray dark:border-gray-700">
                                    <td className="px-4 py-3 font-mono text-sm">{order.order_number}</td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium">{order.customer_name}</p>
                                            <p className="text-xs text-gray">{order.customer_phone}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-semibold">₹{order.total_amount}</td>
                                    <td className="px-4 py-3">{getDeliveryChargeStatus(order)}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={order.order_status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(order.order_status)}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="out_for_delivery">Out for Delivery</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowTrackingModal(true);
                                                }}
                                                className="text-primary hover:text-primary-dark text-sm"
                                            >
                                                <i className="fas fa-truck"></i> Add Tracking
                                            </button>
                                            <button
                                                onClick={() => window.open(`/order-tracking/${order.id}`, '_blank')}
                                                className="text-blue-500 hover:text-blue-600 text-sm"
                                            >
                                                <i className="fas fa-eye"></i> View
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                    <i className="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
                    <p className="text-gray">No orders found</p>
                </div>
            )}

            {/* Tracking Modal */}
            {showTrackingModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Add Tracking Details</h3>
                            <p className="text-sm text-gray mb-4">Order: {selectedOrder.order_number}</p>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Courier Name</label>
                                <select
                                    value={trackingData.courier_name}
                                    onChange={(e) => setTrackingData({ ...trackingData, courier_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select Courier</option>
                                    <option value="DTDC">DTDC</option>
                                    <option value="BlueDart">BlueDart</option>
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="SpeedPost">SpeedPost</option>
                                    <option value="Amazon Shipping">Amazon Shipping</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    value={trackingData.tracking_number}
                                    onChange={(e) => setTrackingData({ ...trackingData, tracking_number: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter tracking number"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Remarks (Optional)</label>
                                <textarea
                                    value={trackingData.remarks}
                                    onChange={(e) => setTrackingData({ ...trackingData, remarks: e.target.value })}
                                    rows="2"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Additional notes"
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-3">
                                <button onClick={() => updateTracking(selectedOrder.id)} className="btn flex-1">
                                    Save Tracking
                                </button>
                                <button onClick={() => setShowTrackingModal(false)} className="btn-outline flex-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;