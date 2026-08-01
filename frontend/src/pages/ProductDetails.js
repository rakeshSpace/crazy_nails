import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { isAuthenticated, user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingDistribution, setRatingDistribution] = useState({});
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewImage, setReviewImage] = useState(null);
    const [reviewImagePreview, setReviewImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: '',
        user_name: '',
        user_email: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const imageContainerRef = useRef(null);
    const zoomRef = useRef(null);
    const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

    const IMAGE_BASE_URL = 'http://localhost:5000';

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

    const formatRating = (rating) => {
        if (rating === undefined || rating === null) return '0.0';
        const num = typeof rating === 'number' ? rating : Number(rating);
        if (isNaN(num)) return '0.0';
        return num.toFixed(1);
    };

    const getSafeRating = (rating) => {
        if (rating === undefined || rating === null) return 0;
        const num = typeof rating === 'number' ? rating : Number(rating);
        if (isNaN(num)) return 0;
        return Math.round(num);
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (product?.id) {
            fetchReviews();
            fetchProductImages();
        }
    }, [product?.id, reviewRefreshKey]);

    useEffect(() => {
        if (isAuthenticated && user) {
            setReviewForm(prev => ({
                ...prev,
                user_name: user.name || '',
                user_email: user.email || ''
            }));
        }
    }, [isAuthenticated, user]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            setProduct(response.data);
            setSelectedImage(getImageUrl(response.data.image_url));

            if (response.data.category) {
                const relatedRes = await api.get(`/products?category=${response.data.category}&limit=4`);
                const filtered = relatedRes.data.filter(p => p.id !== response.data.id);
                setRelatedProducts(filtered.slice(0, 4));
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            toast.error('Product not found');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductImages = async () => {
        try {
            const response = await api.get(`/products/${id}/images`);
            setImages(response.data);
        } catch (error) {
            console.error('Failed to fetch images:', error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await api.get(`/products/${id}/reviews`);
            setReviews(response.data.reviews || []);
            const avgRating = response.data.averageRating || 0;
            setAverageRating(typeof avgRating === 'number' ? avgRating : Number(avgRating));
            setTotalReviews(response.data.totalReviews || 0);
            const distribution = {};
            if (response.data.ratingDistribution && Array.isArray(response.data.ratingDistribution)) {
                response.data.ratingDistribution.forEach(item => {
                    distribution[item.rating] = item.count;
                });
            }
            setRatingDistribution(distribution);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            setReviews([]);
            setAverageRating(0);
            setTotalReviews(0);
            setRatingDistribution({});
        }
    };

    const handleReviewImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            setReviewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setReviewImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please login to submit a review');
            navigate('/login');
            return;
        }

        setSubmittingReview(true);
        try {
            const formData = new FormData();
            formData.append('rating', reviewForm.rating);
            formData.append('title', reviewForm.title);
            formData.append('comment', reviewForm.comment);
            formData.append('user_name', reviewForm.user_name);
            formData.append('user_email', reviewForm.user_email);
            if (reviewImage) {
                formData.append('review_image', reviewImage);
            }

            await api.post(`/products/${id}/reviews`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Review submitted! It will appear after approval.');
            setShowReviewForm(false);
            setReviewForm({
                rating: 5,
                title: '',
                comment: '',
                user_name: user?.name || '',
                user_email: user?.email || ''
            });
            setReviewImage(null);
            setReviewImagePreview(null);
            setReviewRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Review submit error:', error);
            toast.error(error.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        for (let i = 0; i < quantity; i++) {
            await addToCart(product.id, 1);
        }
        toast.success(`${quantity} x ${product.name} added to cart!`);
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/cart');
    };

    const handleMouseMove = (e) => {
        if (!zoomRef.current || !imageContainerRef.current) return;
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        zoomRef.current.style.backgroundPosition = `${x}% ${y}%`;
    };

    const calculateDiscount = () => {
        if (!product?.original_price || product.original_price <= product.price) return null;
        return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    };

    const isOfferActive = () => {
        if (!product?.is_on_offer) return false;
        if (!product?.offer_end_date) return true;
        return new Date(product.offer_end_date) >= new Date();
    };

    const renderStars = (rating, size = 'text-sm') => {
        let safeRating = rating;
        if (typeof rating !== 'number') {
            safeRating = Number(rating);
            if (isNaN(safeRating)) safeRating = 0;
        }
        return (
            <div className={`flex gap-0.5 ${size}`}>
                {[1, 2, 3, 4, 5].map(star => (
                    <i
                        key={star}
                        className={`fas fa-star ${star <= safeRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    ></i>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                    <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                    <Link to="/products" className="btn">Back to Products</Link>
                </div>
            </div>
        );
    }

    const discount = calculateDiscount();
    const hasOffer = isOfferActive();
    const daysLeft = hasOffer && product.offer_end_date ?
        Math.ceil((new Date(product.offer_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    const allImages = [getImageUrl(product.image_url), ...images.map(img => getImageUrl(img.image_url))].filter(Boolean);

    return (
        <>
            <Helmet>
                <title>{product.name} | Crazy Nails & Lashes</title>
                <meta name="description" content={product.description?.substring(0, 160)} />
            </Helmet>

            <div className="min-h-screen bg-light dark:bg-dark-light pt-24 sm:pt-28 pb-12 sm:pb-16">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Breadcrumb - Fully Responsive */}
                    <div className="mb-4 sm:mb-6 text-xs sm:text-sm">
                        <Link to="/" className="text-gray hover:text-primary">Home</Link>
                        <span className="text-gray mx-1 sm:mx-2">/</span>
                        <Link to="/products" className="text-gray hover:text-primary">Products</Link>
                        <span className="text-gray mx-1 sm:mx-2">/</span>
                        <span className="text-primary truncate">{product.name}</span>
                    </div>

                    {/* Product Main Section - Fully Responsive */}
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-large overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
                            {/* Product Images with Zoom - Fully Responsive */}
                            <div>
                                <div
                                    ref={imageContainerRef}
                                    onMouseMove={handleMouseMove}
                                    className="relative bg-light dark:bg-dark-light rounded-2xl overflow-hidden h-64 sm:h-80 md:h-96 flex items-center justify-center cursor-zoom-in"
                                >
                                    <div
                                        ref={zoomRef}
                                        className="w-full h-full bg-no-repeat bg-cover"
                                        style={{
                                            backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
                                            backgroundSize: '200%'
                                        }}
                                    >
                                        {selectedImage ? (
                                            <img
                                                src={selectedImage}
                                                alt={product.name}
                                                className="w-full h-full object-contain opacity-0"
                                            />
                                        ) : (
                                            <i className="fas fa-spa text-4xl sm:text-6xl text-primary"></i>
                                        )}
                                    </div>
                                </div>

                                {/* Thumbnail Images - Fully Responsive */}
                                {allImages.length > 0 && (
                                    <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-2">
                                        {allImages.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-14 h-14 sm:w-20 sm:h-20 rounded-lg overflow-hidden cursor-pointer border-2 flex-shrink-0 ${selectedImage === img ? 'border-primary' : 'border-transparent'} hover:border-primary transition-all`}
                                                onClick={() => setSelectedImage(img)}
                                            >
                                                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Info - Fully Responsive */}
                            <div>
                                {/* Badges - Fully Responsive */}
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                    {product.badge && !hasOffer && (
                                        <span className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                                            {product.badge}
                                        </span>
                                    )}
                                    {hasOffer && discount && (
                                        <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                                            {discount}% OFF
                                        </span>
                                    )}
                                    {hasOffer && product.offer_badge && (
                                        <span className="bg-green-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                                            {product.offer_badge}
                                        </span>
                                    )}
                                    {product.is_featured === 1 && (
                                        <span className="bg-yellow-500 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                                            <i className="fas fa-star mr-0.5 sm:mr-1"></i> Featured
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">{product.name}</h1>

                                {/* Rating Summary - Fully Responsive */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    {renderStars(getSafeRating(averageRating), 'text-sm sm:text-base')}
                                    <span className="text-xs sm:text-sm text-primary font-semibold">{formatRating(averageRating)}</span>
                                    <Link
                                        to="#reviews"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab('reviews');
                                            document.getElementById('reviews-tab')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-xs sm:text-sm text-gray hover:text-primary"
                                    >
                                        {totalReviews} ratings
                                    </Link>
                                </div>

                                {/* Price - Fully Responsive */}
                                <div className="mb-3 sm:mb-4">
                                    {hasOffer && product.original_price ? (
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <span className="text-2xl sm:text-3xl font-bold text-primary">₹{product.price}</span>
                                            <span className="text-gray line-through text-base sm:text-lg">₹{product.original_price}</span>
                                            <span className="text-green-600 text-xs sm:text-sm">You save ₹{product.original_price - product.price}</span>
                                        </div>
                                    ) : (
                                        <span className="text-2xl sm:text-3xl font-bold text-primary">₹{product.price}</span>
                                    )}
                                </div>

                                {/* EMI & Delivery Info - Fully Responsive */}
                                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-light dark:bg-dark-light rounded-lg">
                                    <p className="text-xs sm:text-sm">
                                        <i className="fas fa-credit-card text-primary mr-1 sm:mr-2"></i>
                                        No Cost EMI available on orders above ₹3000
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray mt-0.5 sm:mt-1">
                                        <i className="fas fa-truck mr-0.5 sm:mr-1"></i> Free delivery on orders above ₹2000
                                    </p>
                                </div>

                                {/* Offer Timer - Fully Responsive */}
                                {hasOffer && product.offer_end_date && daysLeft > 0 && (
                                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-red-600 dark:text-red-400">
                                            <i className="fas fa-hourglass-half"></i>
                                            <span className="font-semibold">Limited Time Offer!</span>
                                            <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                                        </div>
                                    </div>
                                )}

                                {/* Stock Status - Fully Responsive */}
                                <div className="mb-3 sm:mb-4">
                                    {product.stock_quantity > 0 ? (
                                        <p className="text-green-600 text-xs sm:text-sm">
                                            <i className="fas fa-check-circle mr-0.5 sm:mr-1"></i> In Stock ({product.stock_quantity} items available)
                                        </p>
                                    ) : (
                                        <p className="text-red-500 text-xs sm:text-sm">
                                            <i className="fas fa-times-circle mr-0.5 sm:mr-1"></i> Out of Stock
                                        </p>
                                    )}
                                </div>

                                {/* Quantity Selector - Fully Responsive */}
                                {product.stock_quantity > 0 && (
                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        <span className="font-medium text-sm sm:text-base">Quantity:</span>
                                        <div className="flex items-center border border-light-gray dark:border-gray-700 rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange('decrease')}
                                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-light dark:hover:bg-dark-light transition-colors"
                                            >
                                                <i className="fas fa-minus text-gray text-xs sm:text-sm"></i>
                                            </button>
                                            <span className="w-10 sm:w-12 text-center font-semibold text-sm sm:text-base">{quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange('increase')}
                                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-light dark:hover:bg-dark-light transition-colors"
                                                disabled={quantity >= product.stock_quantity}
                                            >
                                                <i className="fas fa-plus text-gray text-xs sm:text-sm"></i>
                                            </button>
                                        </div>
                                        <span className="text-[10px] sm:text-sm text-gray">Max {product.stock_quantity} items</span>
                                    </div>
                                )}

                                {/* Action Buttons - Fully Responsive */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock_quantity === 0}
                                        className="flex-1 btn py-2.5 sm:py-3 text-sm sm:text-lg font-semibold disabled:opacity-50 text-center"
                                    >
                                        <i className="fas fa-shopping-cart mr-1 sm:mr-2"></i> Add to Cart
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (isInWishlist(product.id)) {
                                                removeFromWishlist(product.id);
                                            } else {
                                                addToWishlist(product.id);
                                            }
                                        }}
                                        className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-primary rounded-lg flex items-center justify-center gap-1 sm:gap-2 text-primary hover:bg-primary hover:text-white transition-all text-sm sm:text-base"
                                    >
                                        <i className={`fas fa-heart ${isInWishlist(product.id) ? 'text-red-500' : ''}`}></i>
                                        <span className="hidden xs:inline">{isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
                                        <span className="xs:hidden">{isInWishlist(product.id) ? 'Remove' : 'Add'}</span>
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.stock_quantity === 0}
                                        className="flex-1 btn-outline py-2.5 sm:py-3 text-sm sm:text-lg font-semibold disabled:opacity-50 text-center"
                                    >
                                        <i className="fas fa-bolt mr-1 sm:mr-2"></i> Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section - Fully Responsive */}
                    <div className="mt-6 sm:mt-8 bg-white dark:bg-dark rounded-2xl shadow-large overflow-hidden">
                        <div className="border-b border-light-gray dark:border-gray-700 overflow-x-auto">
                            <div className="flex flex-nowrap gap-0 px-3 sm:px-6 min-w-max">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'description' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-info-circle mr-1 sm:mr-2"></i> Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('specifications')}
                                    className={`px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'specifications' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-list mr-1 sm:mr-2"></i> Specifications
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`px-3 sm:px-6 py-2.5 sm:py-3 font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-star mr-1 sm:mr-2"></i> Reviews ({totalReviews})
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {/* Description Tab */}
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    <p className="text-gray text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{product.description}</p>
                                </div>
                            )}

                            {/* Specifications Tab */}
                            {activeTab === 'specifications' && (
                                <div className="max-w-3xl overflow-x-auto">
                                    <table className="w-full border-collapse text-xs sm:text-sm">
                                        <tbody>
                                            <tr className="border-b border-light-gray dark:border-gray-700">
                                                <td className="py-2 sm:py-3 w-1/3 text-gray font-medium">Product Name</td>
                                                <td className="py-2 sm:py-3 w-2/3 text-dark dark:text-white">{product.name}</td>
                                            </tr>
                                            <tr className="border-b border-light-gray dark:border-gray-700">
                                                <td className="py-2 sm:py-3 text-gray font-medium">Category</td>
                                                <td className="py-2 sm:py-3 text-dark dark:text-white capitalize">{product.category?.replace('-', ' ')}</td>
                                            </tr>
                                            <tr className="border-b border-light-gray dark:border-gray-700">
                                                <td className="py-2 sm:py-3 text-gray font-medium">Price</td>
                                                <td className="py-2 sm:py-3 text-dark dark:text-white">₹{product.price}</td>
                                            </tr>
                                            <tr className="border-b border-light-gray dark:border-gray-700">
                                                <td className="py-2 sm:py-3 text-gray font-medium">Stock Status</td>
                                                <td className="py-2 sm:py-3">
                                                    <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}>
                                                        {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} items)` : 'Out of Stock'}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr className="border-b border-light-gray dark:border-gray-700">
                                                <td className="py-2 sm:py-3 text-gray font-medium">Rating</td>
                                                <td className="py-2 sm:py-3">
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(product.rating || 0)}
                                                        <span className="text-dark dark:text-white">{product.rating || 0} / 5</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="border-b border-light-gray dark:border-gray-700">
                                                <td className="py-2 sm:py-3 text-gray font-medium">SKU</td>
                                                <td className="py-2 sm:py-3 text-dark dark:text-white">{product.sku || `CNP${String(product.id).padStart(6, '0')}`}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Reviews Tab - Fully Responsive */}
                            {activeTab === 'reviews' && (
                                <div id="reviews-tab">
                                    {/* Rating Summary - Fully Responsive */}
                                    <div className="bg-light dark:bg-dark-light rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                            <div className="text-center md:text-left">
                                                <div className="text-3xl sm:text-5xl font-bold text-primary">{formatRating(averageRating)}</div>
                                                <div className="mt-1 sm:mt-2">{renderStars(getSafeRating(averageRating), 'text-base sm:text-lg')}</div>
                                                <div className="text-xs sm:text-sm text-gray mt-1">{totalReviews} global ratings</div>
                                            </div>
                                            <div>
                                                {[5, 4, 3, 2, 1].map(star => {
                                                    const count = ratingDistribution[star] || 0;
                                                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                                    return (
                                                        <div key={star} className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                                            <span className="text-xs sm:text-sm w-6 sm:w-8">{star}★</span>
                                                            <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                            </div>
                                                            <span className="text-xs sm:text-sm text-gray w-8 sm:w-12">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Write Review Button */}
                                    {!showReviewForm ? (
                                        <button
                                            onClick={() => setShowReviewForm(true)}
                                            className="btn w-full sm:w-auto text-sm sm:text-base mb-6 sm:mb-8"
                                        >
                                            <i className="fas fa-pen mr-2"></i> Write a customer review
                                        </button>
                                    ) : (
                                        <div className="bg-light dark:bg-dark-light rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                                            <h3 className="text-base sm:text-lg font-bold mb-4">Write a Review</h3>
                                            <form onSubmit={handleReviewSubmit}>
                                                <div className="mb-4">
                                                    <label className="block font-medium mb-2 text-sm sm:text-base">Overall Rating *</label>
                                                    <div className="flex gap-1 sm:gap-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                                className="text-xl sm:text-2xl focus:outline-none"
                                                            >
                                                                <i className={`fas fa-star ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block font-medium mb-2 text-sm sm:text-base">Add a headline</label>
                                                    <input
                                                        type="text"
                                                        value={reviewForm.title}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:border-primary text-sm sm:text-base"
                                                        placeholder="What's most important to know?"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block font-medium mb-2 text-sm sm:text-base">Write your review *</label>
                                                    <textarea
                                                        value={reviewForm.comment}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                        rows="4"
                                                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:border-primary text-sm sm:text-base"
                                                        placeholder="What did you like or dislike? What did you use this product for?"
                                                        required
                                                    ></textarea>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block font-medium mb-2 text-sm sm:text-base">
                                                        <i className="fas fa-camera mr-2 text-primary"></i>
                                                        Add Photos (Optional)
                                                    </label>
                                                    <div className="border-2 border-dashed border-light-gray dark:border-gray-700 rounded-lg p-3 sm:p-4 text-center hover:border-primary transition-colors">
                                                        {reviewImagePreview ? (
                                                            <div className="relative inline-block">
                                                                <img
                                                                    src={reviewImagePreview}
                                                                    alt="Review preview"
                                                                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg mx-auto"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setReviewImage(null);
                                                                        setReviewImagePreview(null);
                                                                    }}
                                                                    className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full text-white flex items-center justify-center text-[10px] sm:text-xs hover:scale-110 transition-transform"
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-cloud-upload-alt text-2xl sm:text-3xl text-gray-400 mb-1 sm:mb-2"></i>
                                                                <p className="text-xs sm:text-sm text-gray">Click to upload product photos</p>
                                                                <p className="text-[10px] sm:text-xs text-gray">Show the product in your review (Max 5MB)</p>
                                                            </>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleReviewImageChange}
                                                            className="hidden"
                                                            id="review-image"
                                                            disabled={uploadingImage}
                                                        />
                                                        {!reviewImagePreview && (
                                                            <label htmlFor="review-image" className="mt-1 sm:mt-2 inline-block text-primary text-xs sm:text-sm cursor-pointer hover:underline">
                                                                Choose Image
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                                                    <div>
                                                        <label className="block font-medium mb-2 text-sm sm:text-base">Your Name</label>
                                                        <input
                                                            type="text"
                                                            value={reviewForm.user_name}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:border-primary text-sm sm:text-base"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block font-medium mb-2 text-sm sm:text-base">Your Email</label>
                                                        <input
                                                            type="email"
                                                            value={reviewForm.user_email}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, user_email: e.target.value })}
                                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:border-primary text-sm sm:text-base"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                                    <button type="submit" disabled={submittingReview} className="btn text-sm sm:text-base">
                                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                    </button>
                                                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-outline text-sm sm:text-base">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Reviews List - Fully Responsive */}
                                    <div className="space-y-4 sm:space-y-6">
                                        {reviews.length === 0 ? (
                                            <div className="text-center py-6 sm:py-8">
                                                <i className="fas fa-comments text-3xl sm:text-4xl text-gray-300 mb-2 sm:mb-3"></i>
                                                <p className="text-gray text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
                                            </div>
                                        ) : (
                                            reviews.map(review => {
                                                const hasValidImage = review.image_url &&
                                                    typeof review.image_url === 'string' &&
                                                    review.image_url.trim() !== '' &&
                                                    review.image_url !== 'NULL' &&
                                                    review.image_url !== 'null';
                                                const fullImageUrl = hasValidImage ? `http://localhost:5000${review.image_url}` : null;

                                                return (
                                                    <div key={review.id} className="border-b border-light-gray dark:border-gray-700 pb-4 sm:pb-6 last:border-0">
                                                        <div className="mb-1 sm:mb-2">
                                                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                                                <span className="font-semibold text-dark dark:text-white text-sm sm:text-base">{review.user_name}</span>
                                                                {review.is_verified_purchase === 1 && (
                                                                    <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                                                                        Verified Purchase
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {renderStars(review.rating)}
                                                            {review.title && (
                                                                <h4 className="font-semibold mt-1 sm:mt-2 text-dark dark:text-white text-sm sm:text-base">{review.title}</h4>
                                                            )}
                                                        </div>

                                                        <p className="text-gray text-sm sm:text-base mt-1 sm:mt-2">{review.comment}</p>

                                                        {hasValidImage && fullImageUrl && (
                                                            <div className="mt-2 sm:mt-3">
                                                                <img
                                                                    src={fullImageUrl}
                                                                    alt="Review attachment"
                                                                    className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity border border-light-gray shadow-sm hover:shadow-md"
                                                                    onClick={() => window.open(fullImageUrl, '_blank')}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                                                            <span className="text-[10px] sm:text-xs text-gray">{formatDateForDisplay(review.created_at)}</span>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await api.post(`/products/reviews/${review.id}/helpful`);
                                                                        toast.success('Thanks for your feedback!');
                                                                        setReviewRefreshKey(prev => prev + 1);
                                                                    } catch (error) {
                                                                        console.error('Failed to mark helpful:', error);
                                                                    }
                                                                }}
                                                                className="text-[10px] sm:text-xs text-primary hover:underline"
                                                            >
                                                                <i className="fas fa-thumbs-up mr-0.5 sm:mr-1"></i> Helpful ({review.helpful_count || 0})
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Features - Fully Responsive */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
                        <div className="bg-white dark:bg-dark rounded-xl p-2 sm:p-3 text-center">
                            <i className="fas fa-truck text-base sm:text-xl text-primary mb-0.5 sm:mb-1"></i>
                            <p className="font-medium text-xs sm:text-sm">Free Shipping</p>
                            <p className="text-[10px] sm:text-xs text-gray">On orders above ₹2000</p>
                        </div>
                        <div className="bg-white dark:bg-dark rounded-xl p-2 sm:p-3 text-center">
                            <i className="fas fa-undo-alt text-base sm:text-xl text-primary mb-0.5 sm:mb-1"></i>
                            <p className="font-medium text-xs sm:text-sm">Easy Returns</p>
                            <p className="text-[10px] sm:text-xs text-gray">7-day return policy</p>
                        </div>
                        <div className="bg-white dark:bg-dark rounded-xl p-2 sm:p-3 text-center">
                            <i className="fas fa-shield-alt text-base sm:text-xl text-primary mb-0.5 sm:mb-1"></i>
                            <p className="font-medium text-xs sm:text-sm">Quality Guaranteed</p>
                            <p className="text-[10px] sm:text-xs text-gray">100% authentic</p>
                        </div>
                        <div className="bg-white dark:bg-dark rounded-xl p-2 sm:p-3 text-center">
                            <i className="fas fa-headset text-base sm:text-xl text-primary mb-0.5 sm:mb-1"></i>
                            <p className="font-medium text-xs sm:text-sm">24/7 Support</p>
                            <p className="text-[10px] sm:text-xs text-gray">Expert assistance</p>
                        </div>
                    </div>

                    {/* Related Products - Fully Responsive */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-8 sm:mt-12">
                            <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-4">Customers who viewed this item also viewed</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                {relatedProducts.map(related => (
                                    <div key={related.id} className="bg-white dark:bg-dark rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all group">
                                        <Link to={`/products/${related.id}`}>
                                            <div className="h-32 sm:h-40 overflow-hidden bg-light flex items-center justify-center p-2 sm:p-4">
                                                {related.image_url ? (
                                                    <img
                                                        src={getImageUrl(related.image_url)}
                                                        alt={related.name}
                                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = '<i class="fas fa-spa text-2xl sm:text-4xl text-primary"></i>';
                                                        }}
                                                    />
                                                ) : (
                                                    <i className="fas fa-spa text-2xl sm:text-4xl text-primary"></i>
                                                )}
                                            </div>
                                            <div className="p-2 sm:p-3">
                                                <h4 className="font-medium text-xs sm:text-sm line-clamp-2 mb-0.5 sm:mb-1">{related.name}</h4>
                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                                    <span className="text-primary font-bold text-sm sm:text-base">₹{related.price}</span>
                                                    {related.original_price && related.original_price > related.price && (
                                                        <span className="text-gray text-[10px] sm:text-xs line-through">₹{related.original_price}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductDetails;