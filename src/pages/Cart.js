import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, getCartTotal, getItemCount, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            toast.error('Please login to proceed with checkout');
            navigate('/login', { state: { from: { pathname: '/cart' } } });
            return;
        }
        
        setCheckoutLoading(true);
        // Simulate checkout process
        setTimeout(() => {
            toast.success('Order placed successfully!');
            clearCart();
            navigate('/my-orders');
            setCheckoutLoading(false);
        }, 1500);
    };

    const subtotal = getCartTotal();
    const shipping = subtotal > 2000 ? 0 : 100;
    const total = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <>
                <Helmet>
                    <title>Shopping Cart | Crazy Nails</title>
                </Helmet>
                
                <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <div className="bg-white dark:bg-dark rounded-2xl shadow-large p-12">
                            <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
                            <p className="text-gray mb-8">Looks like you haven't added any items to your cart yet.</p>
                            <Link to="/products" className="btn">Continue Shopping</Link>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Shopping Cart | Crazy Nails</title>
                <meta name="description" content="Review your items, update quantities, and proceed to checkout securely." />
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-3xl font-bold mb-8">Shopping Cart ({getItemCount()} items)</h1>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft overflow-hidden">
                                <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-light dark:bg-dark-light font-semibold text-dark dark:text-white">
                                    <div className="col-span-6">Product</div>
                                    <div className="col-span-2 text-center">Price</div>
                                    <div className="col-span-2 text-center">Quantity</div>
                                    <div className="col-span-2 text-right">Total</div>
                                </div>
                                
                                {cartItems.map(item => (
                                    <div key={item.id} className="border-t border-light-gray dark:border-gray-700 p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            <div className="md:col-span-6 flex items-center gap-4">
                                                <div className="w-16 h-16 bg-accent dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <i className="fas fa-spa text-2xl text-primary"></i>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-500 text-sm hover:underline mt-1"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 text-center">
                                                <span className="text-primary font-semibold">₹{item.price}</span>
                                            </div>
                                            <div className="md:col-span-2">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 rounded-full border border-light-gray dark:border-gray-700 flex items-center justify-center hover:border-primary transition-colors"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 rounded-full border border-light-gray dark:border-gray-700 flex items-center justify-center hover:border-primary transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 text-right">
                                                <span className="text-primary font-bold">₹{item.price * item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="p-4 bg-light dark:bg-dark-light flex justify-between">
                                    <Link to="/products" className="text-primary hover:underline">
                                        <i className="fas fa-arrow-left mr-2"></i> Continue Shopping
                                    </Link>
                                    <button onClick={clearCart} className="text-red-500 hover:underline">
                                        Clear Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-6 sticky top-28">
                                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                                
                                <div className="space-y-3 mb-4 pb-4 border-b border-light-gray dark:border-gray-700">
                                    <div className="flex justify-between">
                                        <span className="text-gray">Subtotal ({getItemCount()} items)</span>
                                        <span className="font-semibold">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray">Shipping</span>
                                        <span className="font-semibold">
                                            {shipping === 0 ? 'Free' : `₹${shipping}`}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between mb-6">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-xl font-bold text-primary">₹{total}</span>
                                </div>
                                
                                {subtotal < 2000 && (
                                    <p className="text-sm text-primary mb-4">
                                        <i className="fas fa-truck mr-1"></i> Add ₹{2000 - subtotal} more for free shipping!
                                    </p>
                                )}
                                
                                <button
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading}
                                    className="w-full btn py-3 text-lg font-semibold disabled:opacity-50"
                                >
                                    {checkoutLoading ? (
                                        <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</>
                                    ) : (
                                        'Proceed to Checkout'
                                    )}
                                </button>
                                
                                <div className="mt-4 text-center">
                                    <p className="text-gray text-xs">
                                        <i className="fas fa-lock text-primary mr-1"></i> Secure checkout with SSL encryption
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

export default Cart;