import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const { wishlistItems, loading, removeFromWishlist, fetchWishlist } = useWishlist();

    useEffect(() => {
        fetchWishlist();
    }, []);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/uploads')) return `http://localhost:5000${imageUrl}`;
        return `http://localhost:5000/uploads/products/${imageUrl}`;
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
                <title>My Wishlist | Crazy Nails</title>
                <meta name="description" content="View and manage your wishlist items." />
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <i className="fas fa-heart text-white text-2xl"></i>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-dark dark:text-white">My Wishlist</h1>
                            <p className="text-gray">{wishlistItems.length} items saved</p>
                        </div>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="bg-white dark:bg-dark rounded-2xl shadow-soft p-12 text-center">
                            <i className="fas fa-heart text-6xl text-gray-300 mb-4"></i>
                            <h2 className="text-2xl font-bold mb-3">Your wishlist is empty</h2>
                            <p className="text-gray mb-6">Start adding your favorite products to your wishlist!</p>
                            <Link to="/products" className="btn">Browse Products</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {wishlistItems.map(item => (
                                <div key={item.product_id} className="bg-white dark:bg-dark rounded-2xl shadow-soft overflow-hidden hover:shadow-xl transition-all group relative">
                                    <Link to={`/products/${item.product_id}`}>
                                        <div className="h-48 overflow-hidden bg-light flex items-center justify-center">
                                            {item.image_url ? (
                                                <img 
                                                    src={getImageUrl(item.image_url)} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <i className="fas fa-spa text-5xl text-primary"></i>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                                            <p className="text-primary font-bold text-xl mt-1">₹{item.price}</p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            removeFromWishlist(item.product_id);
                                            toast.success(`Removed ${item.name} from wishlist`);
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Wishlist;