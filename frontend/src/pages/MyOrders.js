import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Static config (Amazon / Flipkart style reason lists)
// ---------------------------------------------------------------------------
const CANCEL_REASONS = [
    'Ordered by mistake',
    'Found a better price elsewhere',
    'Item no longer needed',
    'Delivery time is too long',
    'Want to change delivery address',
    'Want to change payment method',
    'Other'
];

const RETURN_REASONS = [
    'Item is defective / not working',
    'Wrong item was delivered',
    'Item is damaged',
    'Size / fit is not right',
    'Item is different from description',
    'No longer needed',
    'Better price available elsewhere',
    'Other'
];

const RETURN_WINDOW_DAYS = 7;
const STATUS_TABS = [
    { key: 'all', label: 'All Orders' },
    { key: 'active', label: 'Active' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'return', label: 'Returns' }
];

// ---------------------------------------------------------------------------
// Invoice builder (printable HTML -> "Save as PDF" via browser print dialog)
// ---------------------------------------------------------------------------
const buildInvoiceHTML = (order, items, company) => {
    const logoUrl = company?.logo
        ? (company.logo.startsWith('http') ? company.logo : `${window.location.origin}${company.logo}`)
        : null;
    const money = (v) => `Rs. ${Number(v || 0).toFixed(2)}`;
    const subtotal = (order.total_amount || 0) - (order.delivery_charge || 0);
    const rows = items.map((it, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${it.product_name}</td>
            <td class="center">${it.quantity}</td>
            <td class="right">${money(it.price)}</td>
            <td class="right">${money(it.price * it.quantity)}</td>
        </tr>
    `).join('');

    const placedOn = order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB') : '-';

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>Invoice ${order.order_number}</title>
        <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, Helvetica, sans-serif; color: #2c2c2c; padding: 40px; max-width: 800px; margin: 0 auto; }
            .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d4a574; padding-bottom: 20px; margin-bottom: 20px; }
            .top h1 { margin: 0 0 4px; font-size: 22px; color: #b89464; }
            .top p { margin: 2px 0; font-size: 12px; color: #777; }
            .tag { text-align: right; }
            .tag h2 { margin: 0; font-size: 20px; letter-spacing: 1px; }
            .grid { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
            .box h4 { margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #999; letter-spacing: .5px; }
            .box p { margin: 2px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f9f7f3; text-align: left; font-size: 12px; text-transform: uppercase; padding: 10px 8px; border-bottom: 2px solid #eee; }
            td { padding: 10px 8px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
            .center { text-align: center; }
            .right { text-align: right; }
            .totals { margin-left: auto; width: 260px; margin-top: 14px; }
            .totals div { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
            .totals .grand { border-top: 2px solid #2c2c2c; margin-top: 6px; padding-top: 10px; font-weight: bold; font-size: 15px; }
            .footer { margin-top: 40px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
            .print-btn { position: fixed; top: 16px; right: 16px; background: linear-gradient(135deg,#d4a574,#8b7355); color: #fff; border: none; padding: 10px 20px; border-radius: 50px; font-weight: 600; cursor: pointer; }
            @media print { .print-btn { display: none; } body { padding: 10px; } }
        </style>
    </head>
    <body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <div class="top">
            <div>
                ${logoUrl ? `<img src="${logoUrl}" alt="${company?.name || 'Logo'}" style="height:48px;object-fit:contain;margin-bottom:8px;display:block;" onerror="this.style.display='none'" />` : ''}
                <h1>${company?.name || 'Store'}</h1>
                <p>${company?.website || ''}</p>
            </div>
            <div class="tag">
                <h2>TAX INVOICE</h2>
                <p>Invoice #: ${order.order_number}</p>
                <p>Date: ${placedOn}</p>
            </div>
        </div>
        <div class="grid">
            <div class="box">
                <h4>Billed To</h4>
                <p><strong>${order.customer_name || ''}</strong></p>
                <p>${order.customer_email || ''}</p>
                <p>${order.customer_phone || ''}</p>
            </div>
            <div class="box">
                <h4>Shipping Address</h4>
                <p>${order.shipping_address || '-'}</p>
            </div>
            <div class="box">
                <h4>Payment</h4>
                <p>${order.payment_method === 'razorpay' ? 'Paid Online (Razorpay)' : 'Cash on Delivery'}</p>
            </div>
        </div>
        <table>
            <thead>
                <tr><th>#</th><th>Item</th><th class="center">Qty</th><th class="right">Price</th><th class="right">Amount</th></tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        <div class="totals">
            <div><span>Subtotal</span><span>${money(subtotal)}</span></div>
            <div><span>Delivery Charge</span><span>${order.delivery_charge ? money(order.delivery_charge) : 'Free'}</span></div>
            <div class="grand"><span>Total</span><span>${money(order.total_amount)}</span></div>
        </div>
        <div class="footer">
            This is a computer-generated invoice and does not require a signature.
        </div>
    </body>
    </html>`;
};

// ---------------------------------------------------------------------------
// Small stepper UI used inside Cancel / Return modals
// ---------------------------------------------------------------------------
const StepDots = ({ total, current }) => (
    <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: total }).map((_, i) => (
            <React.Fragment key={i}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i + 1 < current ? 'bg-green-500 text-white' :
                    i + 1 === current ? 'bg-primary text-white' :
                    'bg-gray-200 text-gray-500'
                }`}>
                    {i + 1 < current ? <i className="fas fa-check"></i> : i + 1}
                </div>
                {i < total - 1 && <div className={`flex-1 h-0.5 ${i + 1 < current ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);

    // Filters
    const [statusTab, setStatusTab] = useState('all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Cancel flow
    const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
    const [cancelStep, setCancelStep] = useState(1);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelComment, setCancelComment] = useState('');
    const [cancelSubmitting, setCancelSubmitting] = useState(false);

    // Return flow
    const [returnOrderTarget, setReturnOrderTarget] = useState(null);
    const [returnStep, setReturnStep] = useState(1);
    const [returnItemId, setReturnItemId] = useState(null);
    const [returnReason, setReturnReason] = useState('');
    const [returnComment, setReturnComment] = useState('');
    const [returnResolution, setReturnResolution] = useState('refund');
    const [returnSubmitting, setReturnSubmitting] = useState(false);

    // ---- date helpers ----
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateMonth = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-GB', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

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

    // ---- badges ----
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

    // ---- eligibility helpers ----
    const isCancellable = (order) =>
        ['pending', 'processing', 'confirmed'].includes(order.order_status);

    const isReturnEligible = (order) => {
        if (order.order_status !== 'delivered') return false;
        if (order.return_requested === 1) return false;
        if (!order.actual_delivery_date) return true; // fall back if not recorded
        const delivered = new Date(order.actual_delivery_date);
        const diffDays = (Date.now() - delivered.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= RETURN_WINDOW_DAYS;
    };

    const returnDeadline = (order) => {
        if (!order.actual_delivery_date) return null;
        const d = new Date(order.actual_delivery_date);
        d.setDate(d.getDate() + RETURN_WINDOW_DAYS);
        return d;
    };

    // ---- filters ----
    const yearOptions = useMemo(() => {
        const years = new Set(
            orders.map(o => o.created_at ? new Date(o.created_at).getFullYear() : null).filter(Boolean)
        );
        return Array.from(years).sort((a, b) => b - a);
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (selectedYear !== 'all') {
                const y = order.created_at ? new Date(order.created_at).getFullYear() : null;
                if (String(y) !== String(selectedYear)) return false;
            }

            if (statusTab === 'delivered' && order.order_status !== 'delivered') return false;
            if (statusTab === 'cancelled' && order.order_status !== 'cancelled') return false;
            if (statusTab === 'return' && order.return_requested !== 1) return false;
            if (statusTab === 'active' && ['delivered', 'cancelled'].includes(order.order_status)) return false;

            if (searchTerm.trim()) {
                const term = searchTerm.trim().toLowerCase();
                const matchesOrderNo = order.order_number?.toLowerCase().includes(term);
                const matchesItem = order.items?.some(it => it.product_name?.toLowerCase().includes(term));
                if (!matchesOrderNo && !matchesItem) return false;
            }

            return true;
        });
    }, [orders, selectedYear, statusTab, searchTerm]);

    // ---- invoice ----
    const downloadInvoice = async (order) => {
        const invoiceWindow = window.open('', '_blank');
        if (!invoiceWindow) {
            toast.error('Please allow pop-ups to download the invoice');
            return;
        }
        invoiceWindow.document.write('<p style="font-family:sans-serif;padding:40px;">Preparing your invoice...</p>');
        setInvoiceLoadingId(order.id);
        try {
            const response = await api.get(`/orders/${order.id}/invoice`);
            const { order: invOrder, items, company } = response.data;
            const html = buildInvoiceHTML(invOrder, items, company);
            invoiceWindow.document.open();
            invoiceWindow.document.write(html);
            invoiceWindow.document.close();
        } catch (error) {
            invoiceWindow.close();
            toast.error(error.response?.data?.error || 'Failed to download invoice');
        } finally {
            setInvoiceLoadingId(null);
        }
    };

    // ---- cancel flow ----
    const openCancelModal = (order) => {
        setCancelOrderTarget(order);
        setCancelStep(1);
        setCancelReason('');
        setCancelComment('');
    };

    const closeCancelModal = () => {
        setCancelOrderTarget(null);
        setCancelStep(1);
    };

    const submitCancellation = async () => {
        if (!cancelOrderTarget) return;
        setCancelSubmitting(true);
        try {
            const reasonText = cancelReason === 'Other' && cancelComment.trim()
                ? cancelComment.trim()
                : cancelReason;
            await api.put(`/orders/${cancelOrderTarget.id}/cancel`, {
                cancellation_reason: reasonText
            });
            setCancelStep(3);
            setOrders(prev => prev.map(o =>
                o.id === cancelOrderTarget.id ? { ...o, order_status: 'cancelled' } : o
            ));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to cancel order');
        } finally {
            setCancelSubmitting(false);
        }
    };

    // ---- return flow ----
    const openReturnModal = (order) => {
        setReturnOrderTarget(order);
        setReturnStep(1);
        setReturnItemId(order.items?.length === 1 ? order.items[0].id : null);
        setReturnReason('');
        setReturnComment('');
        setReturnResolution('refund');
    };

    const closeReturnModal = () => {
        setReturnOrderTarget(null);
        setReturnStep(1);
    };

    const submitReturn = async () => {
        if (!returnOrderTarget) return;
        setReturnSubmitting(true);
        try {
            const reasonText = [
                returnReason === 'Other' && returnComment.trim() ? returnComment.trim() : returnReason,
                returnComment && returnReason !== 'Other' ? `Note: ${returnComment.trim()}` : null,
                `Preferred resolution: ${returnResolution === 'refund' ? 'Refund' : 'Replacement'}`
            ].filter(Boolean).join(' | ');

            await api.post('/orders/request-return', {
                order_id: returnOrderTarget.id,
                reason: reasonText,
                item_id: returnItemId || null
            });
            setReturnStep(4);
            setOrders(prev => prev.map(o =>
                o.id === returnOrderTarget.id ? { ...o, return_requested: 1, return_status: 'pending' } : o
            ));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit return request');
        } finally {
            setReturnSubmitting(false);
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
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
                        <p className="text-gray">Track, manage invoices, cancel or return your orders</p>
                    </div>

                    {/* Toolbar: search + status tabs + year filter (Amazon-style) */}
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-4 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search your orders by product name or order number"
                                    className="w-full pl-10 pr-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray whitespace-nowrap">Orders placed in</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-transparent dark:bg-dark"
                                >
                                    <option value="all">All years</option>
                                    {yearOptions.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {STATUS_TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setStatusTab(tab.key)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        statusTab === tab.key
                                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                                            : 'bg-light dark:bg-dark-light text-gray hover:text-primary'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl shadow-soft">
                            <i className="fas fa-shopping-bag text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                            <p className="text-gray mb-6">You haven't placed any orders yet.</p>
                            <Link to="/products" className="btn">Start Shopping</Link>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl shadow-soft">
                            <i className="fas fa-filter text-5xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No orders match your filters</h3>
                            <p className="text-gray mb-6">Try a different year, tab, or search term.</p>
                            <button
                                onClick={() => { setStatusTab('all'); setSelectedYear('all'); setSearchTerm(''); }}
                                className="btn-outline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredOrders.map(order => {
                                const deadline = returnDeadline(order);
                                return (
                                    <div key={order.id} className="bg-white dark:bg-dark rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all">
                                        {/* Amazon-style order header strip */}
                                        <div className="bg-light dark:bg-dark-light px-4 py-3 border-b border-light-gray dark:border-gray-700">
                                            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                                                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6">
                                                    <div>
                                                        <p className="text-xs text-gray uppercase tracking-wide">Order Placed</p>
                                                        <p className="text-sm font-semibold">{formatDateMonth(order.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray uppercase tracking-wide">Total</p>
                                                        <p className="text-sm font-semibold">₹{order.total_amount}</p>
                                                    </div>
                                                    <div className="hidden sm:block">
                                                        <p className="text-xs text-gray uppercase tracking-wide">Ship To</p>
                                                        <p className="text-sm font-semibold">{order.customer_name || user?.name || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray uppercase tracking-wide">Order #</p>
                                                        <p className="text-sm font-semibold break-all">{order.order_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 sm:gap-3">
                                                    <button
                                                        onClick={() => downloadInvoice(order)}
                                                        disabled={invoiceLoadingId === order.id}
                                                        className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <i className={`fas ${invoiceLoadingId === order.id ? 'fa-spinner fa-spin' : 'fa-file-invoice'}`}></i> Invoice
                                                    </button>
                                                    <Link
                                                        to={`/order-tracking/${order.id}`}
                                                        className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <i className="fas fa-map-marker-alt"></i> Track
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status + items */}
                                        <div className="p-4">
                                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.order_status)}`}>
                                                    <i className={`fas ${getStatusIcon(order.order_status)} mr-1 text-xs`}></i>
                                                    {order.order_status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                                {order.return_requested === 1 && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                        <i className="fas fa-undo-alt mr-1 text-xs"></i>
                                                        RETURN {order.return_status?.toUpperCase() || 'REQUESTED'}
                                                    </span>
                                                )}
                                                {order.order_status === 'delivered' && isReturnEligible(order) && deadline && (
                                                    <span className="text-xs text-gray">
                                                        Return / replace before {formatDate(deadline)}
                                                    </span>
                                                )}
                                            </div>

                                            {order.items && order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-3 border-b border-light-gray dark:border-gray-700 last:border-0">
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <div className="w-14 h-14 bg-accent dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <i className="fas fa-spa text-primary text-lg"></i>
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

                                        {/* Footer / actions */}
                                        <div className="bg-light dark:bg-dark-light p-4">
                                            <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
                                                <div>
                                                    {order.tracking_number && (
                                                        <p className="text-xs text-gray">
                                                            <i className="fas fa-truck mr-1"></i>
                                                            Courier: {order.courier_name || 'Standard'} | Tracking: {order.tracking_number}
                                                        </p>
                                                    )}
                                                    {order.estimated_delivery_date && order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                                                        <p className="text-xs text-gray">
                                                            <i className="far fa-calendar mr-1"></i>
                                                            Est. Delivery: {formatDate(order.estimated_delivery_date)}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray">
                                                    Paid via {order.payment_method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3 pt-3 border-t border-light-gray dark:border-gray-700">
                                                {isReturnEligible(order) && (
                                                    <button
                                                        onClick={() => openReturnModal(order)}
                                                        className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                                                    >
                                                        <i className="fas fa-undo-alt"></i> Return or Replace
                                                    </button>
                                                )}

                                                {isCancellable(order) && (
                                                    <button
                                                        onClick={() => openCancelModal(order)}
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
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ================= CANCEL ORDER MODAL (multi-step) ================= */}
            {cancelOrderTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeCancelModal}>
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-light-gray dark:border-gray-700 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold">Cancel Order</h3>
                            <button onClick={closeCancelModal} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6">
                            {cancelStep < 3 && <StepDots total={2} current={cancelStep} />}

                            {cancelStep === 1 && (
                                <>
                                    <p className="text-sm text-gray mb-4">Order #{cancelOrderTarget.order_number}</p>
                                    <p className="font-medium mb-3">Why do you want to cancel this order?</p>
                                    <div className="space-y-2 mb-6">
                                        {CANCEL_REASONS.map(reason => (
                                            <label key={reason} className="flex items-center gap-3 p-3 border border-light-gray dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary">
                                                <input
                                                    type="radio"
                                                    name="cancel-reason"
                                                    value={reason}
                                                    checked={cancelReason === reason}
                                                    onChange={(e) => setCancelReason(e.target.value)}
                                                    className="accent-primary"
                                                />
                                                <span className="text-sm">{reason}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {cancelReason === 'Other' && (
                                        <textarea
                                            value={cancelComment}
                                            onChange={(e) => setCancelComment(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary mb-4 bg-transparent"
                                            placeholder="Please tell us more..."
                                        ></textarea>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            disabled={!cancelReason}
                                            onClick={() => setCancelStep(2)}
                                            className="btn flex-1 disabled:opacity-50"
                                        >
                                            Continue
                                        </button>
                                        <button onClick={closeCancelModal} className="btn-outline flex-1">
                                            Keep Order
                                        </button>
                                    </div>
                                </>
                            )}

                            {cancelStep === 2 && (
                                <>
                                    <p className="font-medium mb-4">Confirm cancellation</p>
                                    <div className="bg-light dark:bg-dark-light rounded-lg p-4 mb-4 space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-gray">Order #</span><span className="font-medium">{cancelOrderTarget.order_number}</span></div>
                                        <div className="flex justify-between"><span className="text-gray">Reason</span><span className="font-medium">{cancelReason}</span></div>
                                        <div className="flex justify-between"><span className="text-gray">Order Amount</span><span className="font-medium">₹{cancelOrderTarget.total_amount}</span></div>
                                    </div>
                                    <div className={`rounded-lg p-4 mb-6 text-sm ${cancelOrderTarget.payment_status === 'success' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                                        <i className="fas fa-info-circle mr-2"></i>
                                        {cancelOrderTarget.payment_status === 'success'
                                            ? `A refund of ₹${cancelOrderTarget.total_amount} will be initiated to your original payment method within 5-7 business days after cancellation.`
                                            : 'This order was placed with Cash on Delivery, so no refund is required.'}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={submitCancellation}
                                            disabled={cancelSubmitting}
                                            className="btn-danger flex-1 py-3 rounded-full font-semibold flex items-center justify-center gap-2"
                                        >
                                            {cancelSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Cancelling...</> : 'Confirm Cancellation'}
                                        </button>
                                        <button onClick={() => setCancelStep(1)} className="btn-outline flex-1">
                                            Go Back
                                        </button>
                                    </div>
                                </>
                            )}

                            {cancelStep === 3 && (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto mb-4">
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <h4 className="text-lg font-bold mb-2">Order Cancelled</h4>
                                    <p className="text-sm text-gray mb-6">
                                        Order #{cancelOrderTarget.order_number} has been cancelled successfully.
                                        {cancelOrderTarget.payment_status === 'success' && ' Your refund is being processed and will reflect within 5-7 business days.'}
                                    </p>
                                    <button onClick={closeCancelModal} className="btn">Done</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================= RETURN / REPLACE MODAL (multi-step) ================= */}
            {returnOrderTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeReturnModal}>
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-light-gray dark:border-gray-700 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold">Return or Replace Item</h3>
                            <button onClick={closeReturnModal} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <div className="p-6">
                            {returnStep < 4 && <StepDots total={3} current={returnStep} />}

                            {returnStep === 1 && (
                                <>
                                    <p className="text-sm text-gray mb-4">Order #{returnOrderTarget.order_number}</p>
                                    <p className="font-medium mb-3">Select item to return</p>
                                    <div className="space-y-2 mb-6">
                                        {returnOrderTarget.items?.map(item => (
                                            <label key={item.id} className="flex items-center justify-between gap-3 p-3 border border-light-gray dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="return-item"
                                                        checked={returnItemId === item.id}
                                                        onChange={() => setReturnItemId(item.id)}
                                                        className="accent-primary"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{item.product_name}</p>
                                                        <p className="text-xs text-gray">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-primary">₹{item.price * item.quantity}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            disabled={!returnItemId}
                                            onClick={() => setReturnStep(2)}
                                            className="btn flex-1 disabled:opacity-50"
                                        >
                                            Continue
                                        </button>
                                        <button onClick={closeReturnModal} className="btn-outline flex-1">
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}

                            {returnStep === 2 && (
                                <>
                                    <p className="font-medium mb-3">Why are you returning this item?</p>
                                    <div className="space-y-2 mb-4">
                                        {RETURN_REASONS.map(reason => (
                                            <label key={reason} className="flex items-center gap-3 p-3 border border-light-gray dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary">
                                                <input
                                                    type="radio"
                                                    name="return-reason"
                                                    value={reason}
                                                    checked={returnReason === reason}
                                                    onChange={(e) => setReturnReason(e.target.value)}
                                                    className="accent-primary"
                                                />
                                                <span className="text-sm">{reason}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <textarea
                                        value={returnComment}
                                        onChange={(e) => setReturnComment(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary mb-4 bg-transparent"
                                        placeholder={returnReason === 'Other' ? 'Please describe the issue...' : 'Add more details (optional)'}
                                    ></textarea>

                                    <p className="font-medium mb-2">Preferred resolution</p>
                                    <div className="flex gap-3 mb-6">
                                        <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center text-sm font-medium ${returnResolution === 'refund' ? 'border-primary bg-accent/40 dark:bg-primary/10' : 'border-light-gray dark:border-gray-700'}`}>
                                            <input type="radio" className="hidden" checked={returnResolution === 'refund'} onChange={() => setReturnResolution('refund')} />
                                            <i className="fas fa-rupee-sign mr-1"></i> Refund
                                        </label>
                                        <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center text-sm font-medium ${returnResolution === 'replacement' ? 'border-primary bg-accent/40 dark:bg-primary/10' : 'border-light-gray dark:border-gray-700'}`}>
                                            <input type="radio" className="hidden" checked={returnResolution === 'replacement'} onChange={() => setReturnResolution('replacement')} />
                                            <i className="fas fa-sync-alt mr-1"></i> Replacement
                                        </label>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            disabled={!returnReason || (returnReason === 'Other' && !returnComment.trim())}
                                            onClick={() => setReturnStep(3)}
                                            className="btn flex-1 disabled:opacity-50"
                                        >
                                            Continue
                                        </button>
                                        <button onClick={() => setReturnStep(1)} className="btn-outline flex-1">
                                            Go Back
                                        </button>
                                    </div>
                                </>
                            )}

                            {returnStep === 3 && (
                                <>
                                    <p className="font-medium mb-4">Confirm pickup details</p>
                                    <div className="bg-light dark:bg-dark-light rounded-lg p-4 mb-4 space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-gray">Reason</span><span className="font-medium text-right">{returnReason}</span></div>
                                        <div className="flex justify-between"><span className="text-gray">Resolution</span><span className="font-medium">{returnResolution === 'refund' ? 'Refund' : 'Replacement'}</span></div>
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-xs text-gray uppercase tracking-wide mb-1">Pickup Address</p>
                                        <p className="text-sm p-3 bg-light dark:bg-dark-light rounded-lg">{returnOrderTarget.shipping_address}</p>
                                    </div>
                                    <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg p-4 mb-6 text-sm">
                                        <i className="fas fa-truck mr-2"></i>
                                        Our courier partner will pick up the item within 2-3 business days after approval.
                                        {returnResolution === 'refund' && ' Refund will be issued within 5-7 business days after the item passes quality check.'}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={submitReturn}
                                            disabled={returnSubmitting}
                                            className="btn flex-1 flex items-center justify-center gap-2"
                                        >
                                            {returnSubmitting ? <><i className="fas fa-spinner fa-spin"></i> Submitting...</> : 'Submit Return Request'}
                                        </button>
                                        <button onClick={() => setReturnStep(2)} className="btn-outline flex-1">
                                            Go Back
                                        </button>
                                    </div>
                                </>
                            )}

                            {returnStep === 4 && (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto mb-4">
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <h4 className="text-lg font-bold mb-2">Return Request Submitted</h4>
                                    <p className="text-sm text-gray mb-6">
                                        Your {returnResolution === 'refund' ? 'refund' : 'replacement'} request for order #{returnOrderTarget.order_number} has been submitted.
                                        You'll receive updates by email once it's approved and picked up.
                                    </p>
                                    <button onClick={closeReturnModal} className="btn">Done</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyOrders;