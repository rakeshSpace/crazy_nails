import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
          const [wishlistItems, setWishlistItems] = useState([]);
          const [loading, setLoading] = useState(false);
          const { isAuthenticated } = useAuth();

          useEffect(() => {
                    if (isAuthenticated) {
                              const local = JSON.parse(localStorage.getItem('wishlist') || '[]');
                              if (local.length > 0) {
                                        mergeGuestWishlist(local);
                              } else {
                                        fetchWishlist();
                              }
                    } else {
                              loadLocalWishlist();
                    }
          }, [isAuthenticated]);

          const loadLocalWishlist = () => {
                    const local = JSON.parse(localStorage.getItem('wishlist') || '[]');
                    setWishlistItems(local);
          };

          const saveLocalWishlist = (items) => {
                    localStorage.setItem('wishlist', JSON.stringify(items));
                    setWishlistItems(items);
          };

          const fetchWishlist = async () => {
                    try {
                              setLoading(true);
                              const res = await api.get('/wishlist');
                              setWishlistItems(res.data);
                    } catch (error) {
                              console.error('Failed to fetch wishlist:', error);
                    } finally {
                              setLoading(false);
                    }
          };

          const mergeGuestWishlist = async (localItems) => {
                    try {
                              const productIds = localItems.map(item => item.product_id);
                              await api.post('/wishlist/merge', { items: productIds });
                              localStorage.removeItem('wishlist');
                              await fetchWishlist();
                    } catch (error) {
                              console.error('Merge wishlist error:', error);
                              // Fallback: just clear local and fetch
                              localStorage.removeItem('wishlist');
                              fetchWishlist();
                    }
          };

          const isInWishlist = (productId) => {
                    return wishlistItems.some(item => item.product_id === productId);
          };

          const addToWishlist = async (productId) => {
                    if (isInWishlist(productId)) {
                              toast.info('Already in wishlist');
                              return;
                    }

                    if (isAuthenticated) {
                              try {
                                        await api.post('/wishlist', { product_id: productId });
                                        await fetchWishlist();
                                        toast.success('Added to wishlist');
                              } catch (error) {
                                        toast.error('Failed to add to wishlist');
                              }
                    } else {
                              // Guest
                              try {
                                        const productRes = await api.get(`/products/${productId}`);
                                        const product = productRes.data;
                                        const local = [...wishlistItems, {
                                                  product_id: productId,
                                                  name: product.name,
                                                  price: product.price,
                                                  image_url: product.image_url
                                        }];
                                        saveLocalWishlist(local);
                                        toast.success('Added to wishlist');
                              } catch {
                                        // Fallback: store only id
                                        const local = [...wishlistItems, { product_id: productId }];
                                        saveLocalWishlist(local);
                                        toast.success('Added to wishlist');
                              }
                    }
          };

          const removeFromWishlist = async (productId) => {
                    if (isAuthenticated) {
                              try {
                                        await api.delete(`/wishlist/${productId}`);
                                        await fetchWishlist();
                                        toast.success('Removed from wishlist');
                              } catch (error) {
                                        toast.error('Failed to remove');
                              }
                    } else {
                              const local = wishlistItems.filter(item => item.product_id !== productId);
                              saveLocalWishlist(local);
                              toast.success('Removed from wishlist');
                    }
          };

          return (
                    <WishlistContext.Provider value={{
                              wishlistItems,
                              loading,
                              isInWishlist,
                              addToWishlist,
                              removeFromWishlist,
                              fetchWishlist
                    }}>
                              {children}
                    </WishlistContext.Provider>
          );
};