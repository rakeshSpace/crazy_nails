// frontend/src/pages/admin/AdminCourseReviews.js

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminCourseReviews = () => {
    const [pendingReviews, setPendingReviews] = useState([]);
    const [approvedReviews, setApprovedReviews] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseReviews, setCourseReviews] = useState([]);

    useEffect(() => {
        fetchAllReviews();
    }, []);

    const fetchAllReviews = async () => {
        try {
            setLoading(true);
            const pendingRes = await api.get('/courses/reviews/pending');
            setPendingReviews(pendingRes.data);
            
            const approvedRes = await api.get('/courses/reviews/approved');
            setApprovedReviews(approvedRes.data || []);
            
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
            await api.put(`/courses/reviews/${reviewId}/approve`);
            toast.success('Review approved successfully');
            fetchAllReviews();
        } catch (error) {
            console.error('Approve error:', error);
            toast.error(error.response?.data?.error || 'Failed to approve review');
        }
    };

    const deleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await api.delete(`/courses/reviews/${reviewId}`);
                toast.success('Review deleted successfully');
                fetchAllReviews();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete review');
            }
        }
    };

    const viewCourseReviews = async (courseId, courseName) => {
        try {
            const response = await api.get(`/courses/${courseId}/reviews/admin`);
            setCourseReviews(response.data);
            setSelectedCourse({ id: courseId, name: courseName });
            setShowCourseModal(true);
        } catch (error) {
            console.error('Failed to fetch course reviews:', error);
            toast.error('Failed to load course reviews');
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
        { title: 'Pending Course Reviews', value: pendingReviews.length, icon: 'fa-clock', color: 'bg-yellow-500' },
        { title: 'Approved Course Reviews', value: approvedReviews.length, icon: 'fa-check-circle', color: 'bg-green-500' },
        { title: 'Total Course Reviews', value: allReviews.length, icon: 'fa-star', color: 'bg-blue-500' },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                            <p className="text-gray">No pending course reviews.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingReviews.map(review => (
                                <div key={review.id} className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            <div className="mb-3">
                                                <button
                                                    onClick={() => viewCourseReviews(review.course_id, review.course_name)}
                                                    className="text-primary hover:underline font-semibold text-sm"
                                                >
                                                    <i className="fas fa-graduation-cap mr-1"></i> {review.course_name}
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-semibold text-dark dark:text-white">
                                                    {review.user_name || review.reviewer_name || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-gray">
                                                    <i className="far fa-calendar mr-1"></i> {formatDate(review.created_at)}
                                                </span>
                                            </div>
                                            
                                            <div className="mb-2">
                                                {renderStars(review.rating)}
                                            </div>
                                            
                                            {review.title && (
                                                <h4 className="font-semibold text-dark dark:text-white mb-1">
                                                    {review.title}
                                                </h4>
                                            )}
                                            
                                            <p className="text-gray mb-3">{review.comment}</p>
                                        </div>
                                        
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

            {/* Approved & All Tabs similar structure */}
            {activeTab === 'approved' && (
                <div>
                    {approvedReviews.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl">
                            <i className="fas fa-star text-6xl text-gray-300 mb-4"></i>
                            <p className="text-gray">No approved course reviews yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {approvedReviews.map(review => (
                                <div key={review.id} className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft">
                                    <div className="flex justify-between items-start flex-wrap gap-4">
                                        <div className="flex-1">
                                            <div className="mb-3">
                                                <button
                                                    onClick={() => viewCourseReviews(review.course_id, review.course_name)}
                                                    className="text-primary hover:underline font-semibold text-sm"
                                                >
                                                    <i className="fas fa-graduation-cap mr-1"></i> {review.course_name}
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <span className="font-semibold">{review.user_name}</span>
                                                <span className="text-xs text-gray">{formatDate(review.created_at)}</span>
                                            </div>
                                            
                                            {renderStars(review.rating)}
                                            {review.title && <h4 className="font-semibold mt-1">{review.title}</h4>}
                                            <p className="text-gray mt-2">{review.comment}</p>
                                        </div>
                                        
                                        <button
                                            onClick={() => deleteReview(review.id)}
                                            className="btn-outline btn-small border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                        >
                                            <i className="fas fa-trash mr-1"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Course Reviews Modal */}
            {showCourseModal && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                Reviews for {selectedCourse.name}
                            </h3>
                            <button onClick={() => setShowCourseModal(false)} className="text-gray-500">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            {courseReviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <i className="fas fa-star text-4xl text-gray-300 mb-3"></i>
                                    <p className="text-gray">No reviews for this course yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {courseReviews.map(review => (
                                        <div key={review.id} className="border-b pb-4 last:border-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{review.user_name}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            review.is_approved === 1 
                                                                ? 'bg-green-100 text-green-700' 
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {review.is_approved === 1 ? 'Approved' : 'Pending'}
                                                        </span>
                                                    </div>
                                                    {renderStars(review.rating)}
                                                    {review.title && <h4 className="font-semibold mt-1">{review.title}</h4>}
                                                </div>
                                                <span className="text-xs text-gray">{formatDate(review.created_at)}</span>
                                            </div>
                                            <p className="text-gray mt-2">{review.comment}</p>
                                            <div className="flex gap-2 mt-3">
                                                {review.is_approved === 0 && (
                                                    <button
                                                        onClick={() => {
                                                            approveReview(review.id);
                                                            setShowCourseModal(false);
                                                        }}
                                                        className="btn btn-small bg-green-500 text-white"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        deleteReview(review.id);
                                                        setShowCourseModal(false);
                                                    }}
                                                    className="btn-outline btn-small border-red-500 text-red-500"
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

export default AdminCourseReviews;