// frontend/src/pages/Cart.js

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

    // Base URL for images - SAME as Products.js
    const IMAGE_BASE_URL = 'http://localhost:5000';

    // Function to get correct image URL - SAME as Products.js
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            return null;
        }
        
        // If it's already a full URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // If it starts with /uploads
        if (imageUrl.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${imageUrl}`;
        }
        
        // If it's just a filename
        return `${IMAGE_BASE_URL}/uploads/products/${imageUrl}`;
    };

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
        
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        
        navigate('/checkout');
    };

    const subtotal = getCartTotal();
    const shipping = subtotal > 2000 ? 0 : 100;
    const total = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <>
                <Helmet>
                    <title>Shopping Cart | Crazy Nails & Lashes</title>
                </Helmet>
                
                <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                    <div className="container mx-auto px-4 max-w-4xl">
                        {/* Premium Empty State */}
                        <div className="relative overflow-hidden bg-white dark:bg-dark rounded-3xl shadow-large">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                            
                            <div className="relative p-8 text-center">
                                <div className="w-28 h-28 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20">
                                    <i className="fas fa-shopping-bag text-4xl text-white"></i>
                                </div>
                                <h1 className="text-4xl font-bold mb-3 text-dark dark:text-white">Your Cart is Empty</h1>
                                <p className="text-gray text-lg max-w-md mx-auto mb-8">Discover our premium beauty collection and find your perfect match</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <i className="fas fa-spa text-white text-lg"></i>
                                        </div>
                                        <p className="font-semibold text-dark dark:text-white">Premium Products</p>
                                        <p className="text-xs text-gray">Highest quality beauty</p>
                                    </div>
                                    <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <i className="fas fa-truck text-white text-lg"></i>
                                        </div>
                                        <p className="font-semibold text-dark dark:text-white">Free Shipping</p>
                                        <p className="text-xs text-gray">On orders above ₹2000</p>
                                    </div>
                                    <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                                            <i className="fas fa-shield-alt text-white text-lg"></i>
                                        </div>
                                        <p className="font-semibold text-dark dark:text-white">Secure Shopping</p>
                                        <p className="text-xs text-gray">100% safe checkout</p>
                                    </div>
                                </div>
                                
                                <Link to="/products" className="btn px-10 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all">
                                    <i className="fas fa-arrow-left mr-2"></i> Explore Collection
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Shopping Cart | Crazy Nails & Lashes</title>
                <meta name="description" content="Review your items, update quantities, and proceed to checkout securely." />
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Elegant Header */}
                    <div className="flex flex-wrap items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <i className="fas fa-shopping-cart text-white text-2xl"></i>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-dark dark:text-white">Your Cart</h1>
                                <p className="text-gray flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full inline-block"></span>
                                    {getItemCount()} {getItemCount() === 1 ? 'quantity' : 'quantities'} in your cart
                                </p>
                            </div>
                        </div>
                        <Link to="/products" className="text-primary hover:text-primary-dark transition-colors text-sm flex items-center gap-2 group">
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            Continue Shopping
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items*/}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-dark rounded-3xl shadow-soft overflow-hidden">
                                {/* Column Headers with Branding */}
                                <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-light-gray dark:border-gray-700">
                                    <div className="col-span-6 font-semibold text-dark dark:text-white flex items-center gap-2">
                                        <i className="fas fa-box text-primary"></i> Product Details
                                    </div>
                                    <div className="col-span-2 text-center font-semibold text-dark dark:text-white">Price</div>
                                    <div className="col-span-2 text-center font-semibold text-dark dark:text-white">Quantity</div>
                                    <div className="col-span-2 text-right font-semibold text-dark dark:text-white">Total</div>
                                </div>
                                
                                {cartItems.map((item, index) => {
                                    const imageUrl = getImageUrl(item.image_url);
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`border-b border-light-gray dark:border-gray-700 p-5 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group ${
                                                index === cartItems.length - 1 ? 'border-b-0' : ''
                                            }`}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                                {/* Product Info with Premium Design */}
                                                <div className="md:col-span-6 flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-24 h-24 bg-gradient-light dark:bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/10 group-hover:border-primary/30 transition-all">
                                                            {imageUrl ? (
                                                                <img 
                                                                    src={imageUrl} 
                                                                    alt={item.name} 
                                                                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentElement.innerHTML = '<i class="fas fa-spa text-3xl text-primary"></i>';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <i className="fas fa-spa text-3xl text-primary"></i>
                                                            )}
                                                        </div>
                                                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                                                            {item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-dark dark:text-white group-hover:text-primary transition-colors truncate">
                                                            {item.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-red-400 hover:text-red-500 text-xs transition-all flex items-center gap-1 mt-1 group/remove"
                                                        >
                                                            <i className="fas fa-trash-alt text-xs group-hover/remove:scale-110 transition-transform"></i>
                                                            <span className="underline-offset-2 group-hover/remove:underline">Remove</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Price */}
                                                <div className="md:col-span-2 text-center">
                                                    <span className="text-primary font-bold text-lg">₹{item.price}</span>
                                                </div>
                                                
                                                {/* Quantity with Premium Controls */}
                                                <div className="md:col-span-2">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                            className="w-10 h-10 rounded-2xl border-2 border-light-gray dark:border-gray-700 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all text-dark dark:text-white group/btn"
                                                        >
                                                            <i className="fas fa-minus text-xs group-hover/btn:scale-110 transition-transform"></i>
                                                        </button>
                                                        <span className="w-10 text-center font-bold text-dark dark:text-white text-xl">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                            className="w-10 h-10 rounded-2xl border-2 border-light-gray dark:border-gray-700 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all text-dark dark:text-white group/btn"
                                                        >
                                                            <i className="fas fa-plus text-xs group-hover/btn:scale-110 transition-transform"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {/* Total */}
                                                <div className="md:col-span-2 text-right">
                                                    <span className="text-primary font-bold text-xl">₹{item.price * item.quantity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Cart Actions with Elegant Design */}
                                <div className="p-5 bg-gradient-to-r from-primary/5 to-secondary/5 flex flex-wrap justify-between items-center gap-3">
                                    <button 
                                        onClick={clearCart} 
                                        className="text-red-400 hover:text-red-500 text-sm transition-all flex items-center gap-2 group"
                                    >
                                        <i className="fas fa-trash-alt group-hover:scale-110 transition-transform"></i>
                                        <span>Clear Cart</span>
                                    </button>
                                    <div className="flex items-center gap-2 text-sm text-gray">
                                        <i className="fas fa-gift text-primary animate-pulse"></i>
                                        <span>Add <span className="text-primary font-semibold">₹{2000 - subtotal}</span> more for <span className="text-primary font-semibold">FREE Shipping</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Order Summary - Luxury Card */}
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
                                    {/* Items List with Elegant Scroll */}
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
                                    
                                    {/* Price Breakdown with Elegant Lines */}
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
                                    
                                    {/* Grand Total with Highlight */}
                                    <div className="flex justify-between mb-4 pt-3 border-t-2 border-primary/30 bg-primary/5 -mx-5 px-5 py-4 rounded-xl">
                                        <span className="text-lg font-bold text-dark dark:text-white">Total</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-primary">₹{total}</span>
                                            <p className="text-xs text-gray">Including all taxes</p>
                                        </div>
                                    </div>
                                    
                                    {/* Free Shipping Progress with Animation */}
                                    {subtotal < 2000 && (
                                        <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-gray">Free Shipping Progress</span>
                                                <span className="text-primary font-semibold">₹{2000 - subtotal} more</span>
                                            </div>
                                            <div className="w-full h-2 bg-white dark:bg-dark-light rounded-full overflow-hidden shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${Math.min((subtotal / 2000) * 100, 100)}%` }}
                                                >
                                                    <div className="w-full h-full bg-gradient-to-r from-primary to-secondary animate-pulse"></div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray mt-2 flex items-center gap-1">
                                                <i className="fas fa-truck text-primary"></i>
                                                {subtotal > 1000 ? 'Almost there!' : 'Add more items to unlock free shipping'}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Checkout Button with Premium Design */}
                                    <button
                                        onClick={handleCheckout}
                                        disabled={checkoutLoading}
                                        className="w-full btn py-4 text-lg font-semibold disabled:opacity-50 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
                                    >
                                        {checkoutLoading ? (
                                            <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</>
                                        ) : (
                                            <>
                                                <span className="group-hover:scale-105 inline-block transition-transform">
                                                    <i className="fas fa-lock mr-2"></i> Proceed to Checkout
                                                </span>
                                            </>
                                        )}
                                    </button>
                                    
                                    {/* Trust Badges with Icons */}
                                    <div className="mt-5 grid grid-cols-3 gap-2">
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

export default Cart;