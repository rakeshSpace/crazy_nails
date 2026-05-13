import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('featured');
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'nail-care', name: 'Nail Care' },
        { id: 'lash-care', name: 'Lash Care' },
        { id: 'skincare', name: 'Skincare' },
        { id: 'hair-removal', name: 'Hair Removal' },
        { id: 'tools', name: 'Tools & Kits' }
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, activeCategory, sortBy]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];
        
        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }
        
        // Sort products
        switch(sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                filtered.sort((a, b) => b.id - a.id);
                break;
            case 'popular':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            default:
                filtered.sort((a, b) => b.is_featured - a.is_featured);
        }
        
        setFilteredProducts(filtered);
    };

    const infoCards = [
        { icon: 'fa-shipping-fast', title: 'Free Shipping', description: 'Free delivery on orders above ₹2000' },
        { icon: 'fa-shield-alt', title: 'Quality Guaranteed', description: 'All products are premium quality' },
        { icon: 'fa-undo', title: 'Easy Returns', description: '7-day return policy for unused items' },
        { icon: 'fa-headset', title: 'Expert Support', description: 'Product usage guidance available' }
    ];

    const handleAddToCart = async (product) => {
        await addToCart(product.id, 1);
        toast.success(`${product.name} added to cart!`);
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
                <title>Shop Products | Crazy Nails & Lashes</title>
                <meta name="description" content="Shop premium beauty products including nail care, lash care, skincare, and professional tools. Free shipping on orders above ₹2000." />
            </Helmet>

            {/* Page Header */}
            <section className="page-header bg-gradient-to-r from-dark to-dark-light text-white py-28 text-center mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Our Beauty Products</h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">Premium beauty products for your home care routine. All products are available for purchase.</p>
                </div>
            </section>

            {/* Filters */}
            <section className="py-6 bg-white dark:bg-dark border-b border-light-gray dark:border-gray-700 sticky top-20 z-30">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all ${
                                        activeCategory === cat.id
                                            ? 'bg-gradient-to-r from-primary to-secondary text-white'
                                            : 'bg-white dark:bg-dark-light text-dark dark:text-white border border-light-gray dark:border-gray-700 hover:border-primary'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="text-dark dark:text-white">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg bg-white dark:bg-dark-light text-dark dark:text-white focus:outline-none focus:border-primary"
                            >
                                <option value="featured">Featured</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No products found</h3>
                            <p className="text-gray">Try changing your filter criteria</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all hover:-translate-y-2 border border-light-gray dark:border-gray-700 group">
                                    <div className="relative h-56 bg-gradient-light dark:bg-primary/20 flex items-center justify-center overflow-hidden">
                                        {product.badge && (
                                            <span className="absolute top-3 right-3 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                                                {product.badge}
                                            </span>
                                        )}
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <i className="fas fa-spa text-5xl text-primary group-hover:scale-110 transition-transform duration-500"></i>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h4 className="text-lg font-semibold mb-2 line-clamp-1">{product.name}</h4>
                                        <p className="text-gray text-sm mb-3 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fas fa-star text-xs ${i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray">({product.rating || 4.5})</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-primary font-bold text-xl">₹{product.price}</div>
                                            {product.original_price && (
                                                <div className="text-gray text-sm line-through">₹{product.original_price}</div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="flex-1 btn py-2 text-sm"
                                            >
                                                <i className="fas fa-cart-plus mr-1"></i> Add to Cart
                                            </button>
                                            <Link
                                                to={`/products/${product.id}`}
                                                className="px-3 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pt-8 border-t border-light-gray dark:border-gray-700">
                        {infoCards.map((card, index) => (
                            <div key={index} className="text-center p-6 bg-light dark:bg-dark-light rounded-xl hover:shadow-soft transition-all hover:-translate-y-1">
                                <div className="w-14 h-14 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className={`fas ${card.icon} text-2xl text-primary`}></i>
                                </div>
                                <h4 className="text-lg font-semibold mb-2">{card.title}</h4>
                                <p className="text-gray text-sm mb-0">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Inquiry Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Need Help Choosing Products?</h2>
                    <p className="text-white/90 text-lg mb-8">Our beauty experts can help you select the right products for your needs. Contact us for personalized recommendations.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="tel:8264304266" className="btn bg-white text-primary hover:bg-accent">
                            <i className="fas fa-phone-alt mr-2"></i> Call for Assistance
                        </a>
                        <Link to="/booking?service=Product Consultation" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
                            <i className="fas fa-calendar-alt mr-2"></i> Book Consultation
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Products;