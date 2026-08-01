import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('featured');
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showNewArrivals, setShowNewArrivals] = useState(false);
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

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
    }, [products, activeCategory, sortBy, priceRange, showNewArrivals]);

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

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
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

        if (priceRange.min !== '' && !isNaN(priceRange.min)) {
            filtered = filtered.filter(p => p.price >= Number(priceRange.min));
        }
        if (priceRange.max !== '' && !isNaN(priceRange.max)) {
            filtered = filtered.filter(p => p.price <= Number(priceRange.max));
        }

        if (showNewArrivals) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filtered = filtered.filter(p => {
                const createdAt = new Date(p.created_at);
                return createdAt >= thirtyDaysAgo;
            });
        }

        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'popular':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                filtered.sort((a, b) => (b.is_featured || 0) - (a.is_featured || 0));
        }

        setFilteredProducts(filtered);
    };

    const handleCategorySelect = (categoryId) => {
        setActiveCategory(categoryId);
        setIsFilterOpen(false);
    };

    const handlePriceRangeApply = () => {
        setIsFilterOpen(false);
    };

    const handleClearFilters = () => {
        setActiveCategory('all');
        setPriceRange({ min: '', max: '' });
        setShowNewArrivals(false);
        setSortBy('featured');
        setIsFilterOpen(false);
    };

    const getSelectedCategoryName = () => {
        const cat = categories.find(c => c.id === activeCategory);
        return cat?.name || 'All Products';
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

    const getActiveFilterCount = () => {
        let count = 0;
        if (activeCategory !== 'all') count++;
        if (priceRange.min !== '' || priceRange.max !== '') count++;
        if (showNewArrivals) count++;
        if (sortBy !== 'featured') count++;
        return count;
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
                <meta name="description" content="Shop premium beauty products including nail care, lash care, skincare, and professional tools." />
            </Helmet>

            {/* ===== PAGE HEADER - Smaller on Mobile ===== */}
            <section className="page-header bg-gradient-to-r from-dark to-dark-light text-white text-center relative overflow-hidden"
                style={{
                    paddingTop: 'clamp(35px, 7vh, 120px)',
                    paddingBottom: 'clamp(25px, 5vh, 80px)',
                    marginTop: 'clamp(50px, 10vh, 80px)'
                }}
            >
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="font-bold mb-1 sm:mb-3 lg:mb-4 text-white"
                        style={{
                            fontSize: 'clamp(1.2rem, 3.5vw, 3rem)'
                        }}
                    >
                        Our Beauty Products
                    </h1>
                    <p className="text-white/90 max-w-2xl mx-auto px-2"
                        style={{
                            fontSize: 'clamp(0.7rem, 1.6vw, 1.125rem)'
                        }}
                    >
                        Premium beauty products for your home care routine
                    </p>
                </div>
            </section>

            {/* ===== FILTERS NAVIGATION ===== */}
            <section className="py-1.5 sm:py-3 lg:py-4 bg-white dark:bg-dark border border-light-gray dark:border-gray-700 sticky top-0 sm:top-16 lg:top-20 z-30">
                <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between gap-1.5 sm:gap-3 lg:gap-4">
                        
                        {/* ===== MOBILE ONLY - Filter Button ===== */}
                        <div className="md:hidden flex items-center justify-between w-full">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium transition-all flex-shrink-0"
                            >
                                <i className="fas fa-sliders-h text-[10px]"></i>
                                <span>Filter</span>
                                {getActiveFilterCount() > 0 && (
                                    <span className="bg-primary text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                                        {getActiveFilterCount()}
                                    </span>
                                )}
                                <i className={`fas fa-chevron-${isFilterOpen ? 'up' : 'down'} text-[7px] ml-0.5 transition-transform`}></i>
                            </button>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 truncate flex-1 text-center px-1">
                                {getSelectedCategoryName()}
                            </span>
                            <span className="text-[8px] text-gray-400 flex-shrink-0">
                                {filteredProducts.length}
                            </span>
                        </div>

                        {/* ===== DESKTOP & TABLET - Categories ===== */}
                        <div className="hidden md:flex flex-wrap gap-1.5 lg:gap-2 overflow-x-auto pb-1">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
                                        activeCategory === cat.id
                                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                                            : 'bg-white dark:bg-dark-light text-dark dark:text-white border border-light-gray dark:border-gray-700 hover:border-primary'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* ===== DESKTOP & TABLET - Sort ===== */}
                        <div className="hidden md:flex items-center gap-2 lg:gap-3">
                            <label className="text-dark dark:text-white text-xs lg:text-sm">Sort:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 lg:px-4 py-1.5 lg:py-2 border border-light-gray dark:border-gray-700 rounded-lg bg-white dark:bg-dark-light text-dark dark:text-white text-xs lg:text-sm focus:outline-none focus:border-primary"
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

            {/* ===== MOBILE FILTER SIDEBAR - NO GAP (Flush with header) ===== */}
            {isFilterOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-[55] md:hidden"
                        onClick={() => setIsFilterOpen(false)}
                    ></div>
                    <div 
                        className="fixed left-0 w-[270px] max-w-[72vw] bg-white dark:bg-dark shadow-2xl z-[60] overflow-y-auto transform transition-transform duration-300 ease-in-out md:hidden"
                        style={{
                            top: 'clamp(68px, 10vh, 80px)', /* ← HEADER KE JUST NECCHE */
                            height: 'calc(100vh - clamp(68px, 10vh, 80px))',
                            borderRadius: '0 16px 16px 0'
                        }}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-dark z-10 px-3.5 py-2.5 border-b border-light-gray dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-dark dark:text-white">Filter Products</h3>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-6 h-6 rounded-full bg-light dark:bg-dark-light flex items-center justify-center text-gray-500 hover:bg-primary/10 hover:text-primary transition-all text-xs"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-3">
                            {/* Categories */}
                            <div className="mb-4">
                                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</h4>
                                <div className="space-y-0.5">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(cat.id)}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between text-[11px] ${
                                                activeCategory === cat.id
                                                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-semibold'
                                                    : 'hover:bg-light dark:hover:bg-dark-light text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <span>{cat.name}</span>
                                            {activeCategory === cat.id && (
                                                <i className="fas fa-check-circle text-primary text-[9px]"></i>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-4">
                                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <label className="text-[8px] text-gray-400">Min</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                            className="w-full px-2 py-1 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light text-[10px]"
                                        />
                                    </div>
                                    <span className="text-gray-400 text-[10px]">-</span>
                                    <div className="flex-1">
                                        <label className="text-[8px] text-gray-400">Max</label>
                                        <input
                                            type="number"
                                            placeholder="Any"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                            className="w-full px-2 py-1 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light text-[10px]"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handlePriceRangeApply}
                                    className="w-full mt-1.5 bg-primary text-white text-[9px] py-1 rounded-lg font-medium"
                                >
                                    Apply Price Filter
                                </button>
                            </div>

                            {/* New Arrivals */}
                            <div className="mb-4">
                                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">New Arrivals</h4>
                                <button
                                    onClick={() => setShowNewArrivals(!showNewArrivals)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between text-[11px] ${
                                        showNewArrivals
                                            ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-semibold'
                                            : 'hover:bg-light dark:hover:bg-dark-light text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <span>Show New Arrivals</span>
                                    {showNewArrivals && (
                                        <i className="fas fa-check-circle text-primary text-[9px]"></i>
                                    )}
                                </button>
                            </div>

                            {/* Sort Options */}
                            <div className="mb-4">
                                <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</h4>
                                <div className="space-y-0.5">
                                    {[
                                        { id: 'featured', label: 'Featured' },
                                        { id: 'price-low', label: 'Price: Low to High' },
                                        { id: 'price-high', label: 'Price: High to Low' },
                                        { id: 'newest', label: 'Newest First' },
                                        { id: 'popular', label: 'Most Popular' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSortBy(option.id);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between text-[11px] ${
                                                sortBy === option.id
                                                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-semibold'
                                                    : 'hover:bg-light dark:hover:bg-dark-light text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <span>{option.label}</span>
                                            {sortBy === option.id && (
                                                <i className="fas fa-check-circle text-primary text-[9px]"></i>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clear All */}
                            <button
                                onClick={handleClearFilters}
                                className="w-full mt-2 py-1.5 border border-red-400 text-red-500 text-[10px] rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ===== PRODUCTS GRID - Same as before ===== */}
            <section className="py-3 sm:py-4 lg:py-8 bg-white dark:bg-dark">
                <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 lg:py-16">
                            <i className="fas fa-box-open text-3xl sm:text-4xl lg:text-6xl text-gray-300 mb-2 sm:mb-3 lg:mb-4"></i>
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 sm:mb-2">No products found</h3>
                            <p className="text-gray text-xs sm:text-sm lg:text-base">Try changing your filter criteria</p>
                            <button
                                onClick={handleClearFilters}
                                className="btn mt-3 text-xs sm:text-sm py-1.5 sm:py-2 px-4 sm:px-6"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP GRID */}
                            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                                {filteredProducts.map(product => {
                                    const discount = calculateDiscount(product.original_price, product.price);
                                    const hasOffer = isOfferActive(product);
                                    const savings = getSavings(product.original_price, product.price);
                                    const imageUrl = getImageUrl(product.image_url);

                                    return (
                                        <div key={product.id} className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-light-gray dark:border-gray-700 group relative">
                                            {hasOffer && discount && (
                                                <div className="absolute top-3 left-3 z-10">
                                                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                        <i className="fas fa-tag text-white text-xs"></i>
                                                        <span>{discount}% OFF</span>
                                                    </div>
                                                </div>
                                            )}
                                            {hasOffer && product.offer_badge && (
                                                <div className="absolute top-3 right-3 z-10">
                                                    <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                        <i className="fas fa-gift text-white text-xs"></i>
                                                        <span className="truncate max-w-[80px]">{product.offer_badge}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isInWishlist(product.id)) {
                                                        removeFromWishlist(product.id);
                                                    } else {
                                                        addToWishlist(product.id);
                                                    }
                                                }}
                                                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-dark/90 shadow-lg flex items-center justify-center transition-all hover:scale-110"
                                            >
                                                <i className={`fas fa-heart ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}></i>
                                            </button>
                                            <div className="relative h-56 bg-gradient-light dark:bg-primary/20 flex items-center justify-center overflow-hidden">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => {
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
                                                                <div className="text-xs text-green-600 mt-0.5">Save ₹{savings}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-primary font-bold text-xl">₹{product.price}</div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => addToCart(product.id)}
                                                        className="flex-1 btn py-2 text-sm"
                                                    >
                                                        <i className="fas fa-cart-plus mr-1"></i> Add to Cart
                                                    </button>
                                                    <Link
                                                        to={`/products/${product.id}`}
                                                        className="px-3 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all text-sm"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* MOBILE GRID */}
                            <div className="md:hidden">
                                <div className="grid grid-cols-2 gap-1.5">
                                    {filteredProducts.map(product => {
                                        const discount = calculateDiscount(product.original_price, product.price);
                                        const hasOffer = isOfferActive(product);
                                        const savings = getSavings(product.original_price, product.price);
                                        const imageUrl = getImageUrl(product.image_url);

                                        return (
                                            <div key={product.id} className="bg-white dark:bg-dark-light rounded-lg overflow-hidden shadow-soft border border-light-gray dark:border-gray-700 group relative h-full flex flex-col">
                                                {hasOffer && discount && (
                                                    <div className="absolute top-1 left-1 z-10">
                                                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[6px] font-bold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5">
                                                            <i className="fas fa-tag text-white text-[5px]"></i>
                                                            <span>{discount}%</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {hasOffer && product.offer_badge && (
                                                    <div className="absolute top-1 right-1 z-10">
                                                        <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-[5px] font-bold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5">
                                                            <i className="fas fa-gift text-white text-[4px]"></i>
                                                            <span className="truncate max-w-[20px]">{product.offer_badge}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isInWishlist(product.id)) {
                                                            removeFromWishlist(product.id);
                                                        } else {
                                                            addToWishlist(product.id);
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 z-20 w-5 h-5 rounded-full bg-white/90 dark:bg-dark/90 shadow-lg flex items-center justify-center transition-all hover:scale-110"
                                                >
                                                    <i className={`fas fa-heart text-[7px] ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}></i>
                                                </button>
                                                <div className="relative h-24 sm:h-28 bg-gradient-light dark:bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const parent = e.target.parentElement;
                                                                if (parent) {
                                                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><i class="fas fa-spa text-lg text-primary"></i></div>';
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <i className="fas fa-spa text-lg text-primary group-hover:scale-110 transition-transform duration-500"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-1.5 flex flex-col flex-1">
                                                    <h4 className="text-[9px] font-semibold line-clamp-2 leading-tight flex-1">
                                                        {product.name}
                                                    </h4>
                                                    <div className="flex items-center gap-0.5 mt-0.5">
                                                        <div className="flex gap-0.5">
                                                            {[...Array(5)].map((_, i) => (
                                                                <i key={i} className={`fas fa-star text-[5px] ${i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                                            ))}
                                                        </div>
                                                        <span className="text-[4px] text-gray">({product.rating || 4.5})</span>
                                                    </div>
                                                    <div className="mt-0.5">
                                                        {hasOffer && product.original_price ? (
                                                            <div>
                                                                <div className="text-primary font-bold text-[10px]">₹{product.price}</div>
                                                                <div className="text-gray text-[6px] line-through">₹{product.original_price}</div>
                                                                {savings > 0 && (
                                                                    <div className="text-[5px] text-green-600">Save ₹{savings}</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-primary font-bold text-[10px]">₹{product.price}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 mt-1">
                                                        <button
                                                            onClick={() => addToCart(product.id)}
                                                            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white px-1.5 py-0.5 rounded-full text-[6px] font-semibold hover:shadow-medium transition-all"
                                                        >
                                                            <i className="fas fa-cart-plus mr-0.5 text-[5px]"></i> Add
                                                        </button>
                                                        <Link
                                                            to={`/products/${product.id}`}
                                                            className="px-1.5 py-0.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all text-[6px] font-semibold"
                                                        >
                                                            <i className="fas fa-eye text-[5px]"></i>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </>
    );
};

export default Products;