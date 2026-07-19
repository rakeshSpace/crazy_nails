// frontend/src/pages/admin/AdminReviews.js

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminReviews = () => {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [approvedReviews, setApprovedReviews] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [productReviews, setProductReviews] = useState([]);

    useEffect(() => {
        fetchAllReviews();
    }, []);

    const fetchAllReviews = async () => {
        try {
            setLoading(true);
            // Fetch pending reviews
            const pendingRes = await api.get('/products/reviews/pending');
            setPendingReviews(pendingRes.data);
            
            // Fetch all approved reviews (you may need to create this endpoint)
            const approvedRes = await api.get('/products/reviews/approved');
            setApprovedReviews(approvedRes.data || []);
            
            // For now, combine both
            setAllReviews([...pendingRes.data, ...(approvedRes.data || [])]);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const approveReview = async (reviewId) => {
        try {
            await api.put(`/products/reviews/${reviewId}/approve`);
            toast.success('Review approved successfully');
            fetchAllReviews();
        } catch (error) {
            console.error('Approve error:', error);
            toast.error(error.response?.data?.error || 'Failed to approve review');
        }
    };

    const deleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            try {
                await api.delete(`/products/reviews/${reviewId}`);
                toast.success('Review deleted successfully');
                fetchAllReviews();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete review');
            }
        }
    };

    const viewProductReviews = async (productId, productName) => {
        try {
            const response = await api.get(`/products/${productId}/reviews/admin`);
            setProductReviews(response.data);
            setSelectedProduct({ id: productId, name: productName });
            setShowProductModal(true);
        } catch (error) {
            console.error('Failed to fetch product reviews:', error);
            toast.error('Failed to load product reviews');
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <i 
                        key={star} 
                        className={`fas fa-star text-xs ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    ></i>
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const statsCards = [
        { title: 'Pending Reviews', value: pendingReviews.length, icon: 'fa-clock', color: 'bg-yellow-500' },
        { title: 'Approved Reviews', value: approvedReviews.length, icon: 'fa-check-circle', color: 'bg-green-500' },
        { title: 'Total Reviews', value: allReviews.length, icon: 'fa-star', color: 'bg-blue-500' },
        { title: 'Avg Rating', value: '4.5', icon: 'fa-chart-line', color: 'bg-purple-500' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray text-sm mb-1">{card.title}</p>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </div>
                            <div className={`w-10 h-10 ${card.color} bg-opacity-20 rounded-xl flex items-center justify-center`}>
                                <i className={`fas ${card.icon} text-xl text-${card.color.replace('bg-', '')}`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-light-gray dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'pending'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray hover:text-primary'
                    }`}
                >
                    <i className="fas fa-clock mr-2"></i>
                    Pending Reviews ({pendingReviews.length})
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'approved'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray hover:text-primary'
                    }`}
                >
                    <i className="fas fa-check-circle mr-2"></i>
                    Approved Reviews ({approvedReviews.length})
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray hover:text-primary'
                    }`}
                >
                    <i className="fas fa-list mr-2"></i>
                    All Reviews ({allReviews.length})
                </button>
            </div>

            {/* Pending Reviews Tab */}
            {activeTab === 'pending' && (
                <div>
                    {pendingReviews.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl">
                            <i className="fas fa-check-circle text-6xl text-green-300 mb-4"></i>
                            <p className="text-gray">No pending reviews. All reviews are approved!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingReviews.map(review => (
                                <div key={review.id} className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            {/* Product Info */}
                                            <div className="mb-3">
                                                <button
                                                    onClick={() => viewProductReviews(review.product_id, review.product_name)}
                                                    className="text-primary hover:underline font-semibold text-sm"
                                                >
                                                    <i className="fas fa-box mr-1"></i> {review.product_name}
                                                </button>
                                            </div>
                                            
                                            {/* Review Header */}
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-semibold text-dark dark:text-white">
                                                    {review.user_name || review.reviewer_name || 'Anonymous'}
                                                </span>
                                                {review.is_verified_purchase === 1 && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                        <i className="fas fa-check-circle mr-1"></i> Verified Purchase
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray">
                                                    <i className="far fa-calendar mr-1"></i> {formatDate(review.created_at)}
                                                </span>
                                            </div>
                                            
                                            {/* Rating */}
                                            <div className="mb-2">
                                                {renderStars(review.rating)}
                                            </div>
                                            
                                            {/* Review Title */}
                                            {review.title && (
                                                <h4 className="font-semibold text-dark dark:text-white mb-1">
                                                    {review.title}
                                                </h4>
                                            )}
                                            
                                            {/* Review Comment */}
                                            <p className="text-gray mb-3">{review.comment}</p>
                                            
                                            {/* Helpful Count */}
                                            <p className="text-xs text-gray">
                                                <i className="fas fa-thumbs-up mr-1"></i> {review.helpful_count || 0} people found this helpful
                                            </p>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => approveReview(review.id)}
                                                className="btn btn-small bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                <i className="fas fa-check mr-1"></i> Approve
                                            </button>
                                            <button
                                                onClick={() => deleteReview(review.id)}
                                                className="btn-outline btn-small border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                            >
                                                <i className="fas fa-trash mr-1"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Approved Reviews Tab */}
            {activeTab === 'approved' && (
                <div>
                    {approvedReviews.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl">
                            <i className="fas fa-star text-6xl text-gray-300 mb-4"></i>
                            <p className="text-gray">No approved reviews yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {approvedReviews.map(review => (
                                <div key={review.id} className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            {/* Product Info */}
                                            <div className="mb-3">
                                                <button
                                                    onClick={() => viewProductReviews(review.product_id, review.product_name)}
                                                    className="text-primary hover:underline font-semibold text-sm"
                                                >
                                                    <i className="fas fa-box mr-1"></i> {review.product_name}
                                                </button>
                                            </div>
                                            
                                            {/* Review Header */}
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-semibold text-dark dark:text-white">
                                                    {review.user_name || review.reviewer_name || 'Anonymous'}
                                                </span>
                                                {review.is_verified_purchase === 1 && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                        <i className="fas fa-check-circle mr-1"></i> Verified Purchase
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray">
                                                    <i className="far fa-calendar mr-1"></i> {formatDate(review.created_at)}
                                                </span>
                                            </div>
                                            
                                            {/* Rating */}
                                            <div className="mb-2">
                                                {renderStars(review.rating)}
                                            </div>
                                            
                                            {/* Review Title */}
                                            {review.title && (
                                                <h4 className="font-semibold text-dark dark:text-white mb-1">
                                                    {review.title}
                                                </h4>
                                            )}
                                            
                                            {/* Review Comment */}
                                            <p className="text-gray mb-3">{review.comment}</p>
                                            
                                            {/* Helpful Count */}
                                            <p className="text-xs text-gray">
                                                <i className="fas fa-thumbs-up mr-1"></i> {review.helpful_count || 0} people found this helpful
                                            </p>
                                        </div>
                                        
                                        {/* Action Buttons - Only Delete for approved */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => deleteReview(review.id)}
                                                className="btn-outline btn-small border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                            >
                                                <i className="fas fa-trash mr-1"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* All Reviews Tab */}
            {activeTab === 'all' && (
                <div>
                    {allReviews.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl">
                            <i className="fas fa-comments text-6xl text-gray-300 mb-4"></i>
                            <p className="text-gray">No reviews found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allReviews.map(review => (
                                <div key={review.id} className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            {/* Product Info */}
                                            <div className="mb-3">
                                                <button
                                                    onClick={() => viewProductReviews(review.product_id, review.product_name)}
                                                    className="text-primary hover:underline font-semibold text-sm"
                                                >
                                                    <i className="fas fa-box mr-1"></i> {review.product_name}
                                                </button>
                                            </div>
                                            
                                            {/* Review Header */}
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-semibold text-dark dark:text-white">
                                                    {review.user_name || review.reviewer_name || 'Anonymous'}
                                                </span>
                                                {review.is_verified_purchase === 1 && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                        <i className="fas fa-check-circle mr-1"></i> Verified Purchase
                                                    </span>
                                                )}
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    review.is_approved === 1 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {review.is_approved === 1 ? 'Approved' : 'Pending'}
                                                </span>
                                                <span className="text-xs text-gray">
                                                    <i className="far fa-calendar mr-1"></i> {formatDate(review.created_at)}
                                                </span>
                                            </div>
                                            
                                            {/* Rating */}
                                            <div className="mb-2">
                                                {renderStars(review.rating)}
                                            </div>
                                            
                                            {/* Review Title */}
                                            {review.title && (
                                                <h4 className="font-semibold text-dark dark:text-white mb-1">
                                                    {review.title}
                                                </h4>
                                            )}
                                            
                                            {/* Review Comment */}
                                            <p className="text-gray mb-3">{review.comment}</p>
                                            
                                            {/* Helpful Count */}
                                            <p className="text-xs text-gray">
                                                <i className="fas fa-thumbs-up mr-1"></i> {review.helpful_count || 0} people found this helpful
                                            </p>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {review.is_approved === 0 && (
                                                <button
                                                    onClick={() => approveReview(review.id)}
                                                    className="btn btn-small bg-green-500 hover:bg-green-600 text-white"
                                                >
                                                    <i className="fas fa-check mr-1"></i> Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteReview(review.id)}
                                                className="btn-outline btn-small border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                            >
                                                <i className="fas fa-trash mr-1"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Product Reviews Modal */}
            {showProductModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                Reviews for {selectedProduct.name}
                            </h3>
                            <button 
                                onClick={() => setShowProductModal(false)} 
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            {productReviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <i className="fas fa-star text-4xl text-gray-300 mb-3"></i>
                                    <p className="text-gray">No reviews for this product yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {productReviews.map(review => (
                                        <div key={review.id} className="border-b border-light-gray dark:border-gray-700 pb-4 last:border-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{review.user_name}</span>
                                                        {review.is_verified_purchase === 1 && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                Verified
                                                            </span>
                                                        )}
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            review.is_approved === 1 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {review.is_approved === 1 ? 'Approved' : 'Pending'}
                                                        </span>
                                                    </div>
                                                    {renderStars(review.rating)}
                                                    {review.title && (
                                                        <h4 className="font-semibold mt-1">{review.title}</h4>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray">{formatDate(review.created_at)}</span>
                                            </div>
                                            <p className="text-gray mt-2">{review.comment}</p>
                                            <div className="flex gap-2 mt-3">
                                                {review.is_approved === 0 && (
                                                    <button
                                                        onClick={() => {
                                                            approveReview(review.id);
                                                            setShowProductModal(false);
                                                        }}
                                                        className="btn btn-small bg-green-500 hover:bg-green-600 text-white"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        deleteReview(review.id);
                                                        setShowProductModal(false);
                                                    }}
                                                    className="btn-outline btn-small border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReviews;