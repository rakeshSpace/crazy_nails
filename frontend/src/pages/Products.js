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

    // Base URL for images - make sure this matches your backend
    const IMAGE_BASE_URL = 'http://localhost:5000';

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

    // Function to get correct image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) {
            console.log('No image URL provided');
            return null;
        }
        
        console.log('Processing image URL:', imageUrl);
        
        // If it's already a full URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            console.log('Full URL detected:', imageUrl);
            return imageUrl;
        }
        
        // If it starts with /uploads
        if (imageUrl.startsWith('/uploads')) {
            const fullUrl = `${IMAGE_BASE_URL}${imageUrl}`;
            console.log('Local path with /uploads converted to:', fullUrl);
            return fullUrl;
        }
        
        // If it's just a filename
        const fullUrl = `${IMAGE_BASE_URL}/uploads/products/${imageUrl}`;
        console.log('Filename converted to:', fullUrl);
        return fullUrl;
    };

    const fetchProducts = async () => {
        try {
            console.log('Fetching products...');
            const response = await api.get('/products');
            console.log('API Response:', response.data);
            
            // Log each product's image URL
            response.data.forEach(product => {
                console.log(`Product ${product.id} - "${product.name}" - image_url:`, product.image_url);
            });
            
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];
        
        if (activeCategory !== 'all') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }
        
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

    const calculateDiscount = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price) return null;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    const isOfferActive = (item) => {
        if (!item.is_on_offer) return false;
        if (!item.offer_end_date) return true;
        return new Date(item.offer_end_date) >= new Date();
    };

    const getSavings = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price) return 0;
        return originalPrice - price;
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
                <title>Shop Products | Crazy Nails</title>
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
            <section className="py-6 bg-white dark:bg-dark border border-light-gray dark:border-gray-700 sticky top-20 z-30">
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
                            {filteredProducts.map(product => {
                                const discount = calculateDiscount(product.original_price, product.price);
                                const hasOffer = isOfferActive(product);
                                const savings = getSavings(product.original_price, product.price);
                                const daysLeft = hasOffer && product.offer_end_date ?
                                    Math.ceil((new Date(product.offer_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                                const imageUrl = getImageUrl(product.image_url);
                                
                                console.log(`Rendering product ${product.id}:`, {
                                    name: product.name,
                                    raw_image_url: product.image_url,
                                    final_image_url: imageUrl
                                });

                                return (
                                    <div key={product.id} className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-light-gray dark:border-gray-700 group relative">
                                        {/* Discount Badge */}
                                        {hasOffer && discount && (
                                            <div className="absolute top-3 left-3 z-10">
                                                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                    <i className="fas fa-tag text-white text-xs"></i>
                                                    <span>{discount}% OFF</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Offer Badge */}
                                        {hasOffer && product.offer_badge && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                    <i className="fas fa-gift text-white text-xs"></i>
                                                    <span>{product.offer_badge}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="relative h-56 bg-gradient-light dark:bg-primary/20 flex items-center justify-center overflow-hidden">
                                            {product.badge && !hasOffer && (
                                                <span className="absolute top-3 right-3 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                                                    {product.badge}
                                                </span>
                                            )}
                                            {imageUrl ? (
                                                <img 
                                                    src={imageUrl} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        console.error(`Failed to load image for product ${product.id}: ${imageUrl}`);
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><i class="fas fa-spa text-5xl text-primary"></i></div>';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <i className="fas fa-spa text-5xl text-primary group-hover:scale-110 transition-transform duration-500"></i>
                                                </div>
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
                                                {hasOffer && product.original_price ? (
                                                    <div>
                                                        <div className="text-primary font-bold text-xl">₹{product.price}</div>
                                                        <div className="text-gray text-sm line-through">₹{product.original_price}</div>
                                                        {savings > 0 && (
                                                            <div className="text-xs text-green-600 mt-1">Save ₹{savings}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-primary font-bold text-xl">₹{product.price}</div>
                                                )}
                                            </div>
                                            {hasOffer && product.offer_end_date && daysLeft > 0 && daysLeft <= 7 && (
                                                <div className="mb-3 p-1 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                                                    <span className="text-xs text-red-600 dark:text-red-400">⏰ {daysLeft} days left</span>
                                                </div>
                                            )}
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
                                );
                            })}
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
                        <a href="tel:8264304266" className="btn btn-call">
                            <i className="fas fa-phone-alt mr-2"></i> Call for Assistance
                        </a>
                        <Link to="/booking?service=Product Consultation" className="btn-book">
                            <i className="fas fa-calendar-alt mr-2"></i> Book Consultation
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Products;