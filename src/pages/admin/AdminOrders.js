import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [trackingData, setTrackingData] = useState({
        tracking_number: '',
        courier_name: '',
        remarks: ''
    });
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
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
        if (!trackingData.tracking_number) {
            toast.error('Please enter tracking number');
            return;
        }
        
        try {
            await api.put(`/orders/${orderId}/status`, {
                order_status: 'shipped',
                ...trackingData
            });
            toast.success('Tracking information updated');
            setShowTrackingModal(false);
            setTrackingData({ tracking_number: '', courier_name: '', remarks: '' });
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update tracking');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'confirmed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'out_for_delivery': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Generate invoice
    const generateInvoice = (order) => {
        const invoiceWindow = window.open('', '_blank');
        invoiceWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${order.order_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 24px; color: #d4a574; margin-bottom: 10px; }
                    .title { font-size: 28px; margin-bottom: 20px; }
                    .order-info { margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                    .order-info table { width: 100%; }
                    .order-info td { padding: 5px; }
                    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .items-table th { background: #f5f5f5; }
                    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">✨ Crazy Nails & Lashes ✨</div>
                    <div class="title">TAX INVOICE</div>
                </div>
                
                <div class="order-info">
                    <table>
                        <tr><td><strong>Order Number:</strong></td><td>${order.order_number}</td></tr>
                        <tr><td><strong>Order Date:</strong></td><td>${new Date(order.created_at).toLocaleString()}</td></tr>
                        <tr><td><strong>Customer Name:</strong></td><td>${order.customer_name}</td></tr>
                        <tr><td><strong>Customer Email:</strong></td><td>${order.customer_email}</td></tr>
                        <tr><td><strong>Customer Phone:</strong></td><td>${order.customer_phone}</td></tr>
                        <tr><td><strong>Shipping Address:</strong></td><td>${order.shipping_address}</td></tr>
                        <tr><td><strong>Payment Method:</strong></td><td>${order.payment_method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}</td></tr>
                    </table>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr><th>Item</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                        ${order.items?.map(item => `
                            <tr><td>${item.product_name}</td><td>${item.quantity}</td><td>₹${item.price}</td><td>₹${item.price * item.quantity}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="total">
                    <p>Subtotal: ₹${order.total_amount - (order.delivery_charge || 0)}</p>
                    <p>Delivery Charge: ${order.delivery_charge === 0 ? 'Free' : `₹${order.delivery_charge}`}</p>
                    <p><strong>Grand Total: ₹${order.total_amount}</strong></p>
                </div>
                
                <div class="footer">
                    <p>Thank you for shopping with Crazy Nails & Lashes!</p>
                    <p>For any queries, contact us at: ${order.customer_email}</p>
                </div>
            </body>
            </html>
        `);
        invoiceWindow.document.close();
        invoiceWindow.print();
    };

    // Status filter component
    const StatusFilter = () => (
        <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'processing', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filterStatus === status
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-light dark:text-gray-300'
                    }`}
                >
                    {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
                </button>
            ))}
        </div>
    );

    // Filter data based on status
    const filteredOrders = filterStatus === 'all' 
        ? orders 
        : orders.filter(order => order.order_status === filterStatus);

    // Table columns
    const columns = [
        {
            name: 'Order ID',
            selector: row => row.order_number,
            sortable: true,
            width: '150px',
            cell: row => (
                <span className="font-mono text-sm font-medium text-primary">{row.order_number}</span>
            ),
        },
        {
            name: 'Customer',
            selector: row => row.customer_name,
            sortable: true,
            cell: row => (
                <div>
                    <p className="font-medium text-dark dark:text-white">{row.customer_name}</p>
                    <p className="text-xs text-gray-500">{row.customer_phone}</p>
                </div>
            ),
        },
        {
            name: 'Date',
            selector: row => new Date(row.created_at).toLocaleDateString(),
            sortable: true,
            width: '120px',
            cell: row => (
                <div className="text-sm">
                    {new Date(row.created_at).toLocaleDateString()}
                    <p className="text-xs text-gray-500">{new Date(row.created_at).toLocaleTimeString()}</p>
                </div>
            ),
        },
        {
            name: 'Items',
            selector: row => row.items?.length || 0,
            sortable: true,
            width: '80px',
            cell: row => (
                <span className="text-sm">{row.items?.length || 0} items</span>
            ),
        },
        {
            name: 'Amount',
            selector: row => row.total_amount,
            sortable: true,
            width: '120px',
            cell: row => (
                <div>
                    <span className="font-semibold text-primary">₹{row.total_amount}</span>
                    {row.delivery_charge === 0 && (
                        <p className="text-xs text-green-600">Free Delivery</p>
                    )}
                </div>
            ),
        },
        {
            name: 'Payment',
            selector: row => row.payment_status,
            sortable: true,
            width: '100px',
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    row.payment_status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    row.payment_status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                    {row.payment_status === 'success' ? 'Paid' : row.payment_status}
                </span>
            ),
        },
        {
            name: 'Status',
            selector: row => row.order_status,
            sortable: true,
            width: '140px',
            cell: row => (
                <select
                    value={row.order_status}
                    onChange={(e) => updateOrderStatus(row.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(row.order_status)} cursor-pointer`}
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
            name: 'Tracking',
            selector: row => row.tracking_number,
            width: '120px',
            cell: row => (
                row.tracking_number ? (
                    <div>
                        <span className="text-xs text-green-600 dark:text-green-400">
                            <i className="fas fa-check-circle mr-1"></i> {row.tracking_number}
                        </span>
                        {row.courier_name && (
                            <p className="text-xs text-gray-500">{row.courier_name}</p>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setSelectedOrder(row);
                            setShowTrackingModal(true);
                        }}
                        className="text-primary hover:text-primary-dark text-xs font-medium"
                    >
                        <i className="fas fa-plus mr-1"></i> Add Tracking
                    </button>
                )
            ),
        },
        {
            name: 'Actions',
            width: '120px',
            cell: row => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedOrder(row);
                            setShowDetailsModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-600"
                        title="View Details"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        onClick={() => generateInvoice(row)}
                        className="text-gray-500 hover:text-gray-600"
                        title="Download Invoice"
                    >
                        <i className="fas fa-download"></i>
                    </button>
                    {!row.tracking_number && row.order_status === 'confirmed' && (
                        <button
                            onClick={() => {
                                setSelectedOrder(row);
                                setShowTrackingModal(true);
                            }}
                            className="text-green-500 hover:text-green-600"
                            title="Add Tracking"
                        >
                            <i className="fas fa-truck"></i>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    // Stats cards
    const statsCards = [
        { title: 'Total Orders', value: orders.length, icon: 'fa-shopping-bag', color: 'bg-blue-500' },
        { title: 'Pending', value: orders.filter(o => o.order_status === 'pending').length, icon: 'fa-clock', color: 'bg-yellow-500' },
        { title: 'Processing', value: orders.filter(o => o.order_status === 'processing').length, icon: 'fa-cogs', color: 'bg-purple-500' },
        { title: 'Shipped', value: orders.filter(o => o.order_status === 'shipped').length, icon: 'fa-truck', color: 'bg-indigo-500' },
        { title: 'Delivered', value: orders.filter(o => o.order_status === 'delivered').length, icon: 'fa-check-circle', color: 'bg-green-500' },
        { title: 'Total Revenue', value: `₹${orders.reduce((sum, o) => sum + (o.payment_status === 'success' ? o.total_amount : 0), 0).toLocaleString()}`, icon: 'fa-rupee-sign', color: 'bg-primary' },
    ];

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft hover:shadow-medium transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray text-xs mb-1">{card.title}</p>
                                <p className="text-xl font-bold">{card.value}</p>
                            </div>
                            <div className={`w-10 h-10 ${card.color} bg-opacity-20 rounded-xl flex items-center justify-center`}>
                                <i className={`fas ${card.icon} text-xl text-${card.color.replace('bg-', '')}`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Filter */}
            <div className="mb-4">
                <StatusFilter />
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredOrders}
                title="All Orders"
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={10}
                exportable={true}
                exportFileName="orders_export"
                noDataMessage="No orders found"
                onRowClick={(row) => console.log('Row clicked:', row.order_number)}
                selectable={true}
                onSelectionChange={(selected) => console.log('Selected rows:', selected)}
            />

            {/* Tracking Modal */}
            {showTrackingModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full animate-fade-in">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Add Tracking Details</h3>
                            <button onClick={() => setShowTrackingModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 p-3 bg-light dark:bg-dark-light rounded-lg">
                                <p className="text-sm text-gray">Order ID</p>
                                <p className="font-semibold">{selectedOrder.order_number}</p>
                                <p className="text-sm text-gray mt-2">Customer</p>
                                <p className="font-medium">{selectedOrder.customer_name}</p>
                            </div>
                            
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
                                    <option value="XpressBees">XpressBees</option>
                                    <option value="Amazon Shipping">Amazon Shipping</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Tracking Number *</label>
                                <input
                                    type="text"
                                    value={trackingData.tracking_number}
                                    onChange={(e) => setTrackingData({ ...trackingData, tracking_number: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter tracking number"
                                    required
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
                                    <i className="fas fa-save mr-2"></i> Save Tracking
                                </button>
                                <button onClick={() => setShowTrackingModal(false)} className="btn-outline flex-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-fade-in">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Order Details</h3>
                            <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray">Order Number</p>
                                    <p className="font-semibold">{selectedOrder.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray">Order Date</p>
                                    <p className="font-semibold">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray">Payment Method</p>
                                    <p className="font-semibold capitalize">{selectedOrder.payment_method}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray">Payment Status</p>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        selectedOrder.payment_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {selectedOrder.payment_status}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="bg-light dark:bg-dark-light rounded-lg p-4">
                                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                                    <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                                    <p><strong>Address:</strong> {selectedOrder.shipping_address}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3">Order Items</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-light dark:bg-dark-light">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Product</th>
                                                <th className="px-4 py-2 text-center">Quantity</th>
                                                <th className="px-4 py-2 text-right">Price</th>
                                                <th className="px-4 py-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map((item, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-4 py-2">{item.product_name}</td>
                                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right">₹{item.price}</td>
                                                    <td className="px-4 py-2 text-right font-semibold">₹{item.price * item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-2 text-right font-semibold">Subtotal:</td>
                                                <td className="px-4 py-2 text-right">₹{selectedOrder.total_amount - (selectedOrder.delivery_charge || 0)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" className="px-4 py-2 text-right font-semibold">Delivery Charge:</td>
                                                <td className="px-4 py-2 text-right">{selectedOrder.delivery_charge === 0 ? 'Free' : `₹${selectedOrder.delivery_charge}`}</td>
                                            </tr>
                                            <tr className="border-t">
                                                <td colSpan="3" className="px-4 py-2 text-right font-bold">Grand Total:</td>
                                                <td className="px-4 py-2 text-right font-bold text-primary">₹{selectedOrder.total_amount}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Tracking Info */}
                            {selectedOrder.tracking_number && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3">Tracking Information</h4>
                                    <div className="bg-light dark:bg-dark-light rounded-lg p-4">
                                        <p><strong>Courier:</strong> {selectedOrder.courier_name || 'Standard Shipping'}</p>
                                        <p><strong>Tracking Number:</strong> {selectedOrder.tracking_number}</p>
                                        {selectedOrder.estimated_delivery_date && (
                                            <p><strong>Estimated Delivery:</strong> {new Date(selectedOrder.estimated_delivery_date).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => generateInvoice(selectedOrder)} className="btn flex-1">
                                    <i className="fas fa-download mr-2"></i> Download Invoice
                                </button>
                                <button onClick={() => setShowDetailsModal(false)} className="btn-outline flex-1">
                                    Close
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