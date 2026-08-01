// frontend/src/contexts/CartContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Base URL for images
    const IMAGE_BASE_URL = 'http://localhost:5000';

    // Helper function to get image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        if (imageUrl.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${imageUrl}`;
        }
        return `${IMAGE_BASE_URL}/uploads/products/${imageUrl}`;
    };

    useEffect(() => {
        if (isAuthenticated) {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (localCart.length > 0) {
                mergeGuestCart(localCart);
            } else {
                fetchCart();
            }
        } else {
            loadLocalCart();
        }
    }, [isAuthenticated]);

    const mergeGuestCart = async (localItems) => {
        try {
            for (const item of localItems) {
                await api.post('/cart', {
                    product_id: item.product_id,
                    quantity: item.quantity
                });
            }
            localStorage.removeItem('cart');
            fetchCart();
        } catch (error) {
            console.error('Merge cart error:', error);
            // Fallback: just clear local and fetch
            localStorage.removeItem('cart');
            fetchCart();
        }
    };

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            // Ensure each item has all required fields
            const itemsWithDetails = response.data.map(item => ({
                ...item,
                image_url: getImageUrl(item.image_url)
            }));
            setCartItems(itemsWithDetails);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    const loadLocalCart = () => {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(localCart);
    };

    const saveLocalCart = (items) => {
        localStorage.setItem('cart', JSON.stringify(items));
        setCartItems(items);
    };

    const addToCart = async (productId, quantity = 1) => {
        if (isAuthenticated) {
            try {
                // First, get product details including image_url
                const productResponse = await api.get(`/products/${productId}`);
                const product = productResponse.data;

                // Add to cart via API with complete product details
                await api.post('/cart', {
                    product_id: productId,
                    quantity,
                    name: product.name,
                    price: product.price,
                    image_url: product.image_url  // ✅ Include image_url
                });

                fetchCart();
                toast.success(`${product.name} added to cart`);
            } catch (error) {
                console.error('Failed to add to cart:', error);
                toast.error('Failed to add to cart');
            }
        } else {
            const localCart = [...cartItems];
            const existingItem = localCart.find(item => item.product_id === productId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                try {
                    const productResponse = await api.get(`/products/${productId}`);
                    const product = productResponse.data;
                    localCart.push({
                        id: Date.now(),
                        product_id: productId,
                        quantity,
                        name: product.name,
                        price: product.price,
                        image_url: product.image_url  // ✅ Include image_url
                    });
                } catch (error) {
                    console.error('Failed to fetch product:', error);
                    localCart.push({
                        id: Date.now(),
                        product_id: productId,
                        quantity,
                        name: 'Product',
                        price: 0,
                        image_url: null
                    });
                }
            }
            saveLocalCart(localCart);
            // toast.success('Added to cart');
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        if (isAuthenticated) {
            try {
                if (quantity <= 0) {
                    await api.delete(`/cart/${cartItemId}`);
                } else {
                    await api.put(`/cart/${cartItemId}`, { quantity });
                }
                fetchCart();
            } catch (error) {
                console.error('Failed to update cart:', error);
                toast.error('Failed to update cart');
            }
        } else {
            const updatedCart = cartItems.map(item => {
                if (item.id === cartItemId) {
                    return { ...item, quantity };
                }
                return item;
            }).filter(item => item.quantity > 0);
            saveLocalCart(updatedCart);
        }
    };

    const removeFromCart = async (cartItemId) => {
        if (isAuthenticated) {
            try {
                await api.delete(`/cart/${cartItemId}`);
                fetchCart();
                toast.success('Removed from cart');
            } catch (error) {
                console.error('Failed to remove:', error);
                toast.error('Failed to remove');
            }
        } else {
            const updatedCart = cartItems.filter(item => item.id !== cartItemId);
            saveLocalCart(updatedCart);
            toast.success('Removed from cart');
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
    };

    const getItemCount = () => {
        return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    };

    const clearCart = () => {
        if (isAuthenticated) {
            // Clear from backend
            Promise.all(cartItems.map(item => api.delete(`/cart/${item.id}`)))
                .then(() => fetchCart())
                .catch(error => console.error('Failed to clear cart:', error));
        } else {
            saveLocalCart([]);
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            loading,
            addToCart,
            updateQuantity,
            removeFromCart,
            getCartTotal,
            getItemCount,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};