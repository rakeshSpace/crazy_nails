// frontend/src/components/InvoiceModal.js

import React from 'react';

const InvoiceModal = ({ order, items, onClose }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString()}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Implement PDF download using html2pdf or similar
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-dark rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">Invoice #{order.order_number}</h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="btn btn-small">
                            <i className="fas fa-print mr-2"></i> Print
                        </button>
                        <button onClick={handleDownload} className="btn btn-small">
                            <i className="fas fa-download mr-2"></i> Download
                        </button>
                        <button onClick={onClose} className="text-gray-500">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                
                <div className="p-8" id="invoice-content">
                    {/* Invoice Header */}
                    <div className="text-center mb-8">
                        <div className="text-3xl font-bold text-primary">✨ Crazy Nails & Lashes ✨</div>
                        <div className="text-2xl font-bold mt-2">TAX INVOICE</div>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-light dark:bg-dark-light rounded-lg">
                        <div>
                            <p className="text-gray text-sm">Order Number</p>
                            <p className="font-semibold">{order.order_number}</p>
                        </div>
                        <div>
                            <p className="text-gray text-sm">Order Date</p>
                            <p className="font-semibold">{formatDateTime(order.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-gray text-sm">Customer Name</p>
                            <p className="font-semibold">{order.customer_name}</p>
                        </div>
                        <div>
                            <p className="text-gray text-sm">Payment Method</p>
                            <p className="font-semibold capitalize">{order.payment_method}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-8">
                        <h4 className="font-semibold mb-2">Customer Information</h4>
                        <div className="bg-light dark:bg-dark-light rounded-lg p-4">
                            <p><strong>Name:</strong> {order.customer_name}</p>
                            <p><strong>Email:</strong> {order.customer_email}</p>
                            <p><strong>Phone:</strong> {order.customer_phone}</p>
                            <p><strong>Address:</strong> {order.shipping_address}</p>
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="mb-8">
                        <h4 className="font-semibold mb-2">Order Items</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-light dark:bg-dark-light">
                                        <th className="px-4 py-2 text-left">Item</th>
                                        <th className="px-4 py-2 text-center">Quantity</th>
                                        <th className="px-4 py-2 text-right">Price</th>
                                        <th className="px-4 py-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="px-4 py-2">{item.product_name}</td>
                                            <td className="px-4 py-2 text-center">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">₹{item.price}</td>
                                            <td className="px-4 py-2 text-right">₹{item.price * item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t">
                                        <td colSpan="3" className="px-4 py-2 text-right font-semibold">Subtotal:</td>
                                        <td className="px-4 py-2 text-right">₹{order.total_amount - (order.delivery_charge || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="px-4 py-2 text-right font-semibold">Delivery Charge:</td>
                                        <td className="px-4 py-2 text-right">{order.delivery_charge === 0 ? 'Free' : `₹${order.delivery_charge}`}</td>
                                    </tr>
                                    <tr className="border-t">
                                        <td colSpan="3" className="px-4 py-2 text-right font-bold">Grand Total:</td>
                                        <td className="px-4 py-2 text-right font-bold text-primary">₹{order.total_amount}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-8 border-t">
                        <p>Thank you for shopping with Crazy Nails & Lashes!</p>
                        <p className="text-sm text-gray mt-2">For any queries, contact us at: {order.customer_email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;