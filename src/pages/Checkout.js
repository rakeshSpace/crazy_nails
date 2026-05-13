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
            key: 'rzp_test_SopdXdHuNv7R6x', // Replace with your Razorpay Test Key
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: 'Crazy Nails & Lashes',
            description: `Order #${orderData.orderNumber}`,
            image: '/logo192.png',
            order_id: razorpayOrder.id,
            handler: async function(response) {
                // Verify payment
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
        
        // Validate address for online payment
        if (formData.payment_method === 'razorpay') {
            if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
                toast.error('Please enter complete shipping address');
                return;
            }
        }
        
        setLoading(true);
        
        try {
            const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
            
            // Create order
            const orderResponse = await api.post('/orders/create', {
                shipping_address: shippingAddress,
                payment_method: formData.payment_method,
                notes: formData.notes
            });
            
            const orderData = orderResponse.data;
            
            if (formData.payment_method === 'razorpay') {
                // Load Razorpay script and initiate payment
                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    toast.error('Failed to load payment gateway. Please try again.');
                    setLoading(false);
                    return;
                }
                await handleRazorpayPayment(orderData, orderData.razorpayOrder);
            } else {
                // COD order
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
                <title>Checkout | Crazy Nails & Lashes</title>
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-3xl font-bold mb-8">Checkout</h1>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-6">
                                <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block font-medium mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-2">Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                            disabled
                                        />
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Address *</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            rows="2"
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                            placeholder="House number, Street, Area"
                                        ></textarea>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <label className="block font-medium mb-2">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-2">State *</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-2">Pincode *</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Payment Method</label>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary">
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="razorpay"
                                                    checked={formData.payment_method === 'razorpay'}
                                                    onChange={handleChange}
                                                    className="w-4 h-4"
                                                />
                                                <div>
                                                    <span className="font-medium">Credit/Debit Card, UPI, NetBanking</span>
                                                    <p className="text-sm text-gray">Pay securely via Razorpay</p>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary">
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value="cod"
                                                    checked={formData.payment_method === 'cod'}
                                                    onChange={handleChange}
                                                    className="w-4 h-4"
                                                />
                                                <div>
                                                    <span className="font-medium">Cash on Delivery</span>
                                                    <p className="text-sm text-gray">Pay when you receive the order</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <label className="block font-medium mb-2">Order Notes (Optional)</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                            placeholder="Any special instructions for delivery"
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-6 sticky top-28">
                                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                                
                                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="space-y-2 mb-4 pt-4 border-t">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between mb-6 pt-4 border-t">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-xl font-bold text-primary">₹{total}</span>
                                </div>
                                
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full btn py-3 text-lg font-semibold disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</>
                                    ) : (
                                        `Place Order • ₹${total}`
                                    )}
                                </button>
                                
                                <div className="mt-4 text-center">
                                    <p className="text-gray text-xs">
                                        <i className="fas fa-shield-alt text-primary mr-1"></i> 
                                        Your payment is secure with SSL encryption
                                    </p>
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