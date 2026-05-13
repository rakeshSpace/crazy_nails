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

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            loadLocalCart();
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            setCartItems(response.data);
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
                await api.post('/cart', { product_id: productId, quantity });
                fetchCart();
                toast.success('Added to cart');
            } catch (error) {
                toast.error('Failed to add to cart');
            }
        } else {
            const localCart = [...cartItems];
            const existingItem = localCart.find(item => item.product_id === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                localCart.push({ product_id: productId, quantity, name: 'Product', price: 0 });
            }
            saveLocalCart(localCart);
            toast.success('Added to cart');
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
                toast.error('Failed to update cart');
            }
        } else {
            const updatedCart = cartItems.filter(item => item.id !== cartItemId);
            if (quantity > 0) {
                const item = cartItems.find(item => item.id === cartItemId);
                if (item) {
                    item.quantity = quantity;
                    updatedCart.push(item);
                }
            }
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
                toast.error('Failed to remove');
            }
        } else {
            const updatedCart = cartItems.filter(item => item.id !== cartItemId);
            saveLocalCart(updatedCart);
            toast.success('Removed from cart');
        }
    };

    const getCartTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const getItemCount = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    const clearCart = () => {
        if (isAuthenticated) {
            // Clear from backend
            Promise.all(cartItems.map(item => api.delete(`/cart/${item.id}`)))
                .then(() => fetchCart());
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