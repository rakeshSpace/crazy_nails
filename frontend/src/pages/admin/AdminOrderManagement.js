// frontend/src/pages/admin/AdminOrderManagement.js

import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState('');
    const [actionData, setActionData] = useState({});
    const [returnRequests, setReturnRequests] = useState([]);
    const [showReturnModal, setShowReturnModal] = useState(false);

    useEffect(() => {
        fetchOrders();
        fetchReturnRequests();
    }, []);

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

    const fetchReturnRequests = async () => {
        try {
            const response = await api.get('/orders/admin/return-requests');
            setReturnRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch return requests:', error);
        }
    };

    const updateOrderStatus = async (orderId, status, trackingData = {}) => {
        try {
            await api.put(`/orders/admin/${orderId}/status`, { order_status: status, ...trackingData });
            toast.success(`Order status updated to ${status}`);
            fetchOrders();
            setShowActionModal(false);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const cancelOrder = async (orderId, reason) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await api.put(`/orders/admin/${orderId}/cancel`, { cancellation_reason: reason });
                toast.success('Order cancelled successfully');
                fetchOrders();
            } catch (error) {
                toast.error('Failed to cancel order');
            }
        }
    };

    const processReturn = async (orderId, action, refundAmount) => {
        try {
            await api.put(`/orders/admin/${orderId}/process-return`, { 
                action, 
                refund_amount: refundAmount 
            });
            toast.success(`Return ${action}ed successfully`);
            fetchOrders();
            fetchReturnRequests();
            setShowReturnModal(false);
        } catch (error) {
            toast.error('Failed to process return');
        }
    };

    const updateTracking = async (orderId) => {
        if (!actionData.tracking_number) {
            toast.error('Please enter tracking number');
            return;
        }
        try {
            await api.put(`/orders/admin/${orderId}/tracking`, actionData);
            toast.success('Tracking information updated');
            setShowActionModal(false);
            setActionData({});
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update tracking');
        }
    };

    const addDeliveryUpdate = async (orderId) => {
        try {
            await api.post(`/orders/admin/${orderId}/delivery-update`, actionData);
            toast.success('Delivery update added');
            setShowActionModal(false);
            setActionData({});
            fetchOrders();
        } catch (error) {
            toast.error('Failed to add delivery update');
        }
    };

    const generateInvoice = async (orderId) => {
        try {
            const response = await api.get(`/orders/admin/${orderId}/invoice`);
            window.open(response.data.invoice_url, '_blank');
            toast.success('Invoice generated');
        } catch (error) {
            toast.error('Failed to generate invoice');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'confirmed': 'bg-green-100 text-green-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'out_for_delivery': 'bg-orange-100 text-orange-800',
            'delivered': 'bg-green-500 text-white',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getReturnStatusBadge = (status) => {
        const badges = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800',
            'completed': 'bg-blue-100 text-blue-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const columns = [
        { name: 'Order ID', selector: row => row.order_number, sortable: true },
        { name: 'Customer', selector: row => row.customer_name, sortable: true },
        { name: 'Date', selector: row => new Date(row.created_at).toLocaleDateString('en-GB'), sortable: true },
        { name: 'Amount', selector: row => `₹${row.total_amount}`, sortable: true },
        {
            name: 'Status',
            cell: row => (
                <select
                    value={row.order_status}
                    onChange={(e) => updateOrderStatus(row.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.order_status)}`}
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            ),
        },
        {
            name: 'Return',
            cell: row => (
                row.return_requested === 1 ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getReturnStatusBadge(row.return_status)}`}>
                        {row.return_status?.toUpperCase() || 'REQUESTED'}
                    </span>
                ) : '-'
            ),
        },
        {
            name: 'Actions',
            width: '200px',
            cell: row => (
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => {
                            setSelectedOrder(row);
                            setActionType('tracking');
                            setActionData({});
                            setShowActionModal(true);
                        }}
                        className="text-blue-500 text-xs"
                        title="Add Tracking"
                    >
                        <i className="fas fa-truck"></i> Track
                    </button>
                    <button
                        onClick={() => generateInvoice(row.id)}
                        className="text-green-500 text-xs"
                        title="Download Invoice"
                    >
                        <i className="fas fa-download"></i> Invoice
                    </button>
                    {row.return_requested === 1 && row.return_status === 'pending' && (
                        <button
                            onClick={() => {
                                setSelectedOrder(row);
                                setShowReturnModal(true);
                            }}
                            className="text-orange-500 text-xs"
                        >
                            <i className="fas fa-exchange-alt"></i> Process Return
                        </button>
                    )}
                    {row.order_status !== 'delivered' && row.order_status !== 'cancelled' && (
                        <button
                            onClick={() => cancelOrder(row.id, prompt('Cancellation reason:'))}
                            className="text-red-500 text-xs"
                        >
                            <i className="fas fa-times-circle"></i> Cancel
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const returnColumns = [
        { name: 'Order ID', selector: row => row.order_number },
        { name: 'Customer', selector: row => row.customer_name },
        { name: 'Amount', selector: row => `₹${row.total_amount}` },
        { name: 'Reason', selector: row => row.return_reason },
        { name: 'Status', selector: row => row.return_status },
        {
            name: 'Actions',
            cell: row => (
                <div className="flex gap-2">
                    <button
                        onClick={() => processReturn(row.id, 'approve', row.total_amount)}
                        className="btn btn-small bg-green-500 text-white"
                    >
                        Approve & Refund
                    </button>
                    <button
                        onClick={() => processReturn(row.id, 'reject')}
                        className="btn-outline btn-small border-red-500 text-red-500"
                    >
                        Reject
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => fetchOrders()}
                    className="px-4 py-2 text-primary border-b-2 border-primary"
                >
                    All Orders ({orders.length})
                </button>
                <button
                    onClick={() => fetchReturnRequests()}
                    className="px-4 py-2 text-gray"
                >
                    Return Requests ({returnRequests.length})
                </button>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                title="Order Management"
                progressPending={loading}
                searchable={true}
                pagination={true}
                exportable={true}
            />

            {/* Tracking Modal */}
            {showActionModal && selectedOrder && actionType === 'tracking' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full">
                        <div className="p-4 border-b flex justify-between">
                            <h3 className="text-xl font-bold">Update Tracking</h3>
                            <button onClick={() => setShowActionModal(false)}>✕</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Order #{selectedOrder.order_number}</label>
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Courier Name</label>
                                <select
                                    value={actionData.courier_name || ''}
                                    onChange={(e) => setActionData({ ...actionData, courier_name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="">Select Courier</option>
                                    <option value="DTDC">DTDC</option>
                                    <option value="BlueDart">BlueDart</option>
                                    <option value="Delhivery">Delhivery</option>
                                    <option value="SpeedPost">SpeedPost</option>
                                    <option value="XpressBees">XpressBees</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Tracking Number</label>
                                <input
                                    type="text"
                                    value={actionData.tracking_number || ''}
                                    onChange={(e) => setActionData({ ...actionData, tracking_number: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Enter tracking number"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Estimated Delivery Date</label>
                                <input
                                    type="date"
                                    value={actionData.estimated_delivery_date || ''}
                                    onChange={(e) => setActionData({ ...actionData, estimated_delivery_date: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => updateTracking(selectedOrder.id)} className="btn flex-1">
                                    Save Tracking
                                </button>
                                <button onClick={() => setShowActionModal(false)} className="btn-outline flex-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Processing Modal */}
            {showReturnModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full">
                        <div className="p-4 border-b flex justify-between">
                            <h3 className="text-xl font-bold">Process Return Request</h3>
                            <button onClick={() => setShowReturnModal(false)}>✕</button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <p><strong>Order:</strong> #{selectedOrder.order_number}</p>
                                <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                                <p><strong>Amount:</strong> ₹{selectedOrder.total_amount}</p>
                                <p><strong>Return Reason:</strong> {selectedOrder.return_reason}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => processReturn(selectedOrder.id, 'approve', selectedOrder.total_amount)}
                                    className="btn flex-1 bg-green-500"
                                >
                                    Approve & Refund
                                </button>
                                <button
                                    onClick={() => processReturn(selectedOrder.id, 'reject')}
                                    className="btn-outline flex-1 border-red-500 text-red-500"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderManagement;