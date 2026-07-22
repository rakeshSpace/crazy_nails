import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { user } = useAuth();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        payment_method: 'razorpay',
        notes: ''
    });

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
        if (user) {
            setFormData(prev => ({
                ...prev,
                full_name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [cartItems, navigate, user]);

    const subtotal = getCartTotal();
    const shipping = subtotal > 2000 ? 0 : 100;
    const total = subtotal + shipping;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async (orderData, razorpayOrder) => {
        const options = {
            key: 'rzp_test_SotNYgu7LVeM0h',
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: 'Crazy Nails',
            description: `Order #${orderData.orderNumber}`,
            image: '/logo192.png',
            order_id: razorpayOrder.id,
            handler: async function(response) {
                try {
                    const verifyRes = await api.post('/orders/verify-payment', {
                        order_id: orderData.orderId,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    });
                    
                    if (verifyRes.data.success) {
                        toast.success('Payment successful! Order placed.');
                        clearCart();
                        navigate('/my-orders');
                    }
                } catch (error) {
                    toast.error('Payment verification failed');
                }
            },
            prefill: {
                name: formData.full_name,
                email: formData.email,
                contact: formData.phone
            },
            notes: {
                address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
            },
            theme: {
                color: '#d4a574'
            },
            modal: {
                ondismiss: function() {
                    setLoading(false);
                    toast.error('Payment cancelled');
                }
            }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.payment_method === 'razorpay') {
            if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
                toast.error('Please enter complete shipping address');
                return;
            }
        }
        
        setLoading(true);
        
        try {
            const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
            
            const orderResponse = await api.post('/orders/create', {
                shipping_address: shippingAddress,
                payment_method: formData.payment_method,
                notes: formData.notes
            });
            
            const orderData = orderResponse.data;
            
            if (formData.payment_method === 'razorpay') {
                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    toast.error('Failed to load payment gateway. Please try again.');
                    setLoading(false);
                    return;
                }
                await handleRazorpayPayment(orderData, orderData.razorpayOrder);
            } else {
                toast.success('Order placed successfully! You will pay on delivery.');
                clearCart();
                navigate('/my-orders');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.error || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return null;
    }

    return (
        <>
            <Helmet>
                <title>Checkout | Crazy Nails</title>
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Elegant Header */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <i className="fas fa-credit-card text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-dark dark:text-white">Checkout</h1>
                            <p className="text-gray flex items-center gap-2">
                                <span className="w-2 h-2 bg-primary rounded-full inline-block"></span>
                                Complete your order securely
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form*/}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-dark rounded-3xl shadow-soft overflow-hidden">
                                {/* Form Header */}
                                <div className="relative bg-gradient-to-r from-primary/5 to-secondary/5 p-6 border-b border-light-gray dark:border-gray-700 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
                                    <div className="relative">
                                        <h2 className="text-2xl font-bold text-dark dark:text-white flex items-center gap-3">
                                            <span className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                                <i className="fas fa-map-marker-alt text-white"></i>
                                            </span>
                                            Shipping Information
                                        </h2>
                                        <p className="text-gray text-sm mt-1 ml-14">Enter your delivery details below</p>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <form onSubmit={handleSubmit}>
                                        {/* User Info - Premium Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                                            <div>
                                                <label className="block font-medium mb-2 text-sm text-dark dark:text-white flex items-center gap-2">
                                                    <i className="fas fa-user text-primary"></i> Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3.5 border-2 border-light-gray dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all text-dark dark:text-white disabled:opacity-70"
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2 text-sm text-dark dark:text-white flex items-center gap-2">
                                                    <i className="fas fa-envelope text-primary"></i> Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3.5 border-2 border-light-gray dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all text-dark dark:text-white disabled:opacity-70"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mb-5">
                                            <label className="block font-medium mb-2 text-sm text-dark dark:text-white flex items-center gap-2">
                                                <i className="fas fa-phone text-primary"></i> Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3.5 border-2 border-light-gray dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all text-dark dark:text-white disabled:opacity-70"
                                                disabled
                                            />
                                        </div>
                                        
                                        <div className="mb-5">
                                            <label className="block font-medium mb-2 text-sm text-dark dark:text-white flex items-center gap-2">
                                                <i className="fas fa-home text-primary"></i> Address *
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                required
                                                rows="2"
                                                className="w-full px-4 py-3.5 border-2 border-light-gray dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all text-dark dark:text-white resize-none"
                                                placeholder="House number, Street, Area"
                                            ></textarea>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                            <div>
                                                <label className="block font-medium mb-2 text-sm text-dark dark:text-white">City *</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3.5 border-2 border-light-gray dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all text-dark dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2 text-sm text-dark dark:text-white">State *</label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.state}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3.5 border-2 border-light-gray dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all text-dark dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2 text-sm text-dark dark:text-white">Pincode *</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3.5 border-2 border-light-gray dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all text-dark dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Payment Method*/}
                                        <div className="mb-5">
                                            <label className="block font-medium mb-3 text-sm text-dark dark:text-white flex items-center gap-2">
                                                <i className="fas fa-credit-card text-primary"></i> Payment Method
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <label className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                                                    formData.payment_method === 'razorpay' 
                                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                                                        : 'border-light-gray dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="razorpay"
                                                        checked={formData.payment_method === 'razorpay'}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-dark dark:text-white">Online Payment</span>
                                                            <div className="flex gap-1">
                                                                <i className="fab fa-cc-visa text-gray-400 text-xl"></i>
                                                                <i className="fab fa-cc-mastercard text-gray-400 text-xl"></i>
                                                                <i className="fab fa-google-pay text-gray-400 text-xl"></i>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray mt-1">Card, UPI, NetBanking</p>
                                                        {formData.payment_method === 'razorpay' && (
                                                            <span className="inline-block mt-2 text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                                                                <i className="fas fa-check-circle mr-1"></i> Selected
                                                            </span>
                                                        )}
                                                    </div>
                                                </label>
                                                <label className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                                                    formData.payment_method === 'cod' 
                                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                                                        : 'border-light-gray dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5'
                                                }`}>
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="cod"
                                                        checked={formData.payment_method === 'cod'}
                                                        onChange={handleChange}
                                                        className="w-5 h-5 text-primary mt-1 flex-shrink-0"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-dark dark:text-white">Cash on Delivery</span>
                                                            <i className="fas fa-money-bill-wave text-gray-400 text-xl"></i>
                                                        </div>
                                                        <p className="text-xs text-gray mt-1">Pay when you receive</p>
                                                        {formData.payment_method === 'cod' && (
                                                            <span className="inline-block mt-2 text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                                                                <i className="fas fa-check-circle mr-1"></i> Selected
                                                            </span>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-0">
                                            <label className="block font-medium mb-2 text-sm text-dark dark:text-white flex items-center gap-2">
                                                <i className="fas fa-pencil-alt text-primary"></i> Order Notes
                                            </label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full px-4 py-3.5 border-2 border-light-gray dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-dark-light transition-all text-dark dark:text-white resize-none"
                                                placeholder="Any special instructions for delivery"
                                            ></textarea>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        {/* Order Summary*/}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-dark rounded-3xl shadow-soft overflow-hidden sticky top-28">
                                {/* Premium Header with Gradient */}
                                <div className="relative bg-gradient-to-r from-primary to-secondary p-6 text-center overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                                    <div className="relative">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                            <i className="fas fa-receipt text-white text-2xl"></i>
                                        </div>
                                        <h3 className="text-white font-bold text-xl">Order Summary</h3>
                                        <p className="text-white/80 text-sm">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    {/* Items List */}
                                    <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-light-gray dark:border-gray-700 last:border-0">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <i className="fas fa-spa text-primary text-xs"></i>
                                                    </div>
                                                    <span className="text-gray truncate">{item.name}</span>
                                                    <span className="text-gray-400 text-xs flex-shrink-0">×{item.quantity}</span>
                                                </div>
                                                <span className="font-semibold text-dark dark:text-white flex-shrink-0 ml-2">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Price Breakdown */}
                                    <div className="space-y-2 mb-4 pt-3 border-t-2 border-light-gray dark:border-gray-700">
                                        <div className="flex justify-between">
                                            <span className="text-gray">Subtotal</span>
                                            <span className="font-semibold text-dark dark:text-white">₹{subtotal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray">Shipping</span>
                                            <span className={`font-semibold ${shipping === 0 ? 'text-green-500' : 'text-dark dark:text-white'}`}>
                                                {shipping === 0 ? (
                                                    <span className="flex items-center gap-1">
                                                        <i className="fas fa-check-circle text-green-500"></i> FREE
                                                    </span>
                                                ) : (
                                                    `₹${shipping}`
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray">Tax</span>
                                            <span className="font-semibold text-dark dark:text-white">₹0</span>
                                        </div>
                                    </div>
                                    
                                    {/* Grand Total */}
                                    <div className="flex justify-between mb-4 pt-3 border-t-2 border-primary/30 bg-primary/5 -mx-5 px-5 py-4 rounded-xl">
                                        <span className="text-lg font-bold text-dark dark:text-white">Total</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-primary">₹{total}</span>
                                            <p className="text-xs text-gray">Including all taxes</p>
                                        </div>
                                    </div>
                                    
                                    {/* Free Shipping Indicator */}
                                    {subtotal < 2000 && (
                                        <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 text-center">
                                            <p className="text-xs text-gray flex items-center justify-center gap-2">
                                                <i className="fas fa-truck text-primary"></i>
                                                Add <span className="text-primary font-semibold">₹{2000 - subtotal}</span> more for FREE shipping!
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Place Order Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full btn py-4 text-lg font-semibold disabled:opacity-50 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
                                    >
                                        {loading ? (
                                            <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</>
                                        ) : (
                                            <>
                                                <span className="group-hover:scale-105 inline-block transition-transform">
                                                    <i className="fas fa-check-circle mr-2"></i> Place Order • ₹{total}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                    
                                    {/* Trust Badges */}
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 bg-light dark:bg-dark-light rounded-xl hover:bg-primary/5 transition-all group">
                                            <i className="fas fa-shield-alt text-primary text-lg group-hover:scale-110 transition-transform"></i>
                                            <p className="text-[10px] text-gray mt-1">Secure</p>
                                        </div>
                                        <div className="text-center p-2 bg-light dark:bg-dark-light rounded-xl hover:bg-primary/5 transition-all group">
                                            <i className="fas fa-undo text-primary text-lg group-hover:scale-110 transition-transform"></i>
                                            <p className="text-[10px] text-gray mt-1">7 Days Returns</p>
                                        </div>
                                        <div className="text-center p-2 bg-light dark:bg-dark-light rounded-xl hover:bg-primary/5 transition-all group">
                                            <i className="fas fa-headset text-primary text-lg group-hover:scale-110 transition-transform"></i>
                                            <p className="text-[10px] text-gray mt-1">24/7 Support</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Checkout;