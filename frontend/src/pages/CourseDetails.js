// frontend/src/pages/CourseDetails.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const CourseDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [ratingDistribution, setRatingDistribution] = useState({});
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: '',
        user_name: '',
        user_email: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

    // Helper functions
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Helper function to safely format rating
    const formatRating = (rating) => {
        if (rating === undefined || rating === null) return '0.0';
        const num = typeof rating === 'number' ? rating : Number(rating);
        if (isNaN(num)) return '0.0';
        return num.toFixed(1);
    };

    // Helper function to safely get integer rating
    const getSafeRating = (rating) => {
        if (rating === undefined || rating === null) return 0;
        const num = typeof rating === 'number' ? rating : Number(rating);
        if (isNaN(num)) return 0;
        return Math.round(num);
    };

    const calculateDiscount = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price) return null;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    const isOfferActive = () => {
        if (!course?.is_on_offer) return false;
        if (!course?.offer_end_date) return true;
        return new Date(course.offer_end_date) >= new Date();
    };

    // Load Razorpay script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        fetchCourse();
        window.scrollTo(0, 0);
    }, [slug]);

    // Fetch reviews when course is loaded or refresh key changes
    useEffect(() => {
        if (course?.id) {
            fetchReviews();
        }
    }, [course?.id, reviewRefreshKey]);

    useEffect(() => {
        if (isAuthenticated && user) {
            setReviewForm(prev => ({
                ...prev,
                user_name: user.name || '',
                user_email: user.email || ''
            }));
        }
    }, [isAuthenticated, user]);

    const fetchCourse = async () => {
        try {
            const response = await api.get(`/courses/slug/${slug}`);
            setCourse(response.data);
        } catch (error) {
            console.error('Failed to fetch course:', error);
            toast.error('Course not found');
            navigate('/courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        if (!course?.id) return;
        try {
            console.log('Fetching reviews for course:', course.id);
            const response = await api.get(`/courses/${course.id}/reviews`);
            console.log('Full Reviews Response:', response.data);

            setReviews(response.data.reviews || []);

            // Ensure averageRating is a number
            const avgRating = response.data.averageRating || 0;
            setAverageRating(typeof avgRating === 'number' ? avgRating : Number(avgRating));
            setTotalReviews(response.data.totalReviews || 0);

            // ✅ FIXED: Convert distribution to object
            const distribution = {};
            if (response.data.ratingDistribution && Array.isArray(response.data.ratingDistribution)) {
                response.data.ratingDistribution.forEach(item => {
                    distribution[item.rating] = item.count;
                });
            }
            console.log('Rating Distribution:', distribution); // Debug log
            setRatingDistribution(distribution);

        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            setReviews([]);
            setAverageRating(0);
            setTotalReviews(0);
            setRatingDistribution({});
        }
    };

    // Handle Razorpay payment
    const handleRazorpayPayment = async (orderData) => {
        const options = {
            key: 'rzp_test_SotNYgu7LVeM0h',
            amount: orderData.amount,
            currency: 'INR',
            name: 'Crazy Nails',
            description: `Enrollment for ${course.title}`,
            image: '/logo192.png',
            order_id: orderData.id,
            handler: async function (response) {
                try {
                    const enrollRes = await api.post('/courses/enroll-with-payment', {
                        course_id: course.id,
                        payment_id: response.razorpay_payment_id,
                        order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature
                    });

                    if (enrollRes.data.enrolled) {
                        toast.success('Payment successful! Enrolled in course.');
                        fetchCourse();
                        navigate(`/course/learn/${course.id}`);
                    }
                } catch (error) {
                    console.error('Enrollment after payment error:', error);
                    toast.error('Payment successful but enrollment failed. Please contact support.');
                }
            },
            prefill: {
                name: user?.name || '',
                email: user?.email || '',
                contact: user?.phone || ''
            },
            notes: {
                course_id: course.id,
                course_name: course.title
            },
            theme: {
                color: '#d4a574'
            },
            modal: {
                ondismiss: function () {
                    setEnrolling(false);
                    toast.error('Payment cancelled');
                }
            }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll');
            navigate('/login', { state: { from: { pathname: `/courses/${slug}` } } });
            return;
        }

        setEnrolling(true);

        try {
            if (course.price === 0 || course.price <= 0) {
                const response = await api.post('/courses/enroll', { course_id: course.id });
                toast.success('Successfully enrolled in course!');
                fetchCourse();
                navigate(`/course/learn/${course.id}`);
            } else {
                const orderResponse = await api.post('/payments/create-order', {
                    amount: course.price,
                    course_id: course.id,
                    course_name: course.title
                });

                const isScriptLoaded = await loadRazorpayScript();
                if (!isScriptLoaded) {
                    toast.error('Failed to load payment gateway. Please try again.');
                    setEnrolling(false);
                    return;
                }

                await handleRazorpayPayment(orderResponse.data);
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            if (error.response?.status === 400) {
                toast.error(error.response?.data?.error || 'Already enrolled in this course');
            } else if (error.response?.status === 401) {
                toast.error('Please login to enroll');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.error || 'Failed to enroll. Please try again.');
            }
            setEnrolling(false);
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
            await api.post(`/courses/${course.id}/reviews`, reviewForm);
            toast.success('Review submitted! It will appear after approval.');
            setShowReviewForm(false);
            setReviewForm({
                rating: 5,
                title: '',
                comment: '',
                user_name: user?.name || '',
                user_email: user?.email || ''
            });
            setReviewRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Review submit error:', error);
            toast.error(error.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
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

    if (!course) return null;

    const hasOffer = isOfferActive();
    const discount = calculateDiscount(course.original_price, course.price);
    const savings = hasOffer && course.original_price ? course.original_price - course.price : 0;
    const daysLeft = hasOffer && course.offer_end_date ?
        Math.ceil((new Date(course.offer_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <>
            <Helmet>
                <title>{course.title} | Crazy Nails Training</title>
                <meta name="description" content={course.meta_description || course.description?.substring(0, 160)} />
            </Helmet>

            {/* Course Header */}
            <section className="bg-gradient-to-r from-dark to-dark-light text-white py-20 mt-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 bg-primary rounded-full text-sm">
                                    {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                                </span>
                                {hasOffer && discount && (
                                    <span className="px-3 py-1 bg-red-500 rounded-full text-sm">
                                        {discount}% OFF
                                    </span>
                                )}
                                {hasOffer && course.offer_badge && (
                                    <span className="px-3 py-1 bg-green-500 rounded-full text-sm">
                                        {course.offer_badge}
                                    </span>
                                )}
                                {course.is_featured === 1 && !hasOffer && (
                                    <span className="px-3 py-1 bg-yellow-500 rounded-full text-sm">
                                        <i className="fas fa-star mr-1"></i> Featured
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-lg opacity-90 mb-6">{course.description}</p>

                            {/* Rating Summary - FIXED */}
                            <div className="flex items-center gap-3 mb-6">
                                {renderStars(getSafeRating(averageRating), 'text-lg')}
                                <span className="text-white/80 text-sm">{formatRating(averageRating)} ({totalReviews} reviews)</span>
                            </div>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <i className="far fa-clock"></i>
                                    <span>{course.duration_hours} hours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-certificate"></i>
                                    <span>Certificate Included</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-globe"></i>
                                    <span>Online/Offline</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-users"></i>
                                    <span>{course.total_enrollments || 0}+ students enrolled</span>
                                </div>
                            </div>

                            {!course.isEnrolled ? (
                                <div className="flex flex-col gap-3">
                                    <div>
                                        {hasOffer && course.original_price ? (
                                            <>
                                                <span className="text-3xl font-bold">₹{course.price}</span>
                                                <span className="text-white/60 line-through text-lg ml-3">₹{course.original_price}</span>
                                                {savings > 0 && (
                                                    <span className="block text-sm text-green-400 mt-1">
                                                        <i className="fas fa-save mr-1"></i> You save ₹{savings}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-3xl font-bold">₹{course.price}</span>
                                        )}
                                    </div>
                                    {hasOffer && course.offer_end_date && daysLeft > 0 && (
                                        <div className="text-sm text-orange-300">
                                            <i className="fas fa-hourglass-half mr-1"></i> Offer ends in {daysLeft} days
                                        </div>
                                    )}
                                    <div className="text-sm text-white/70">
                                        <i className="fas fa-credit-card mr-1"></i> No Cost EMI available | Easy Installments
                                    </div>
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="btn btn-large mt-2"
                                    >
                                        {enrolling ? (
                                            <><i className="fas fa-spinner fa-spin mr-2"></i> Processing...</>
                                        ) : (
                                            'Enroll Now'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                                    <p className="text-green-400">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        You are enrolled in this course!
                                    </p>
                                    <Link to={`/course/learn/${course.id}`} className="btn mt-3 inline-block">
                                        Continue Learning <i className="fas fa-arrow-right ml-2"></i>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Course Thumbnail */}
                        <div className="bg-white/10 rounded-2xl overflow-hidden">
                            {course.thumbnail ? (
                                <img
                                    src={`http://localhost:5000${course.thumbnail}`}
                                    alt={course.title}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/600x400?text=Course+Thumbnail';
                                    }}
                                />
                            ) : (
                                <div className="h-80 flex items-center justify-center">
                                    <i className="fas fa-graduation-cap text-6xl text-white/50"></i>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-large overflow-hidden">
                        <div className="border-b border-light-gray dark:border-gray-700">
                            <div className="flex flex-wrap gap-0 px-6">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-info-circle mr-2"></i> Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('curriculum')}
                                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'curriculum' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-book-open mr-2"></i> Curriculum
                                </button>
                                <button
                                    onClick={() => setActiveTab('requirements')}
                                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'requirements' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-clipboard-list mr-2"></i> Requirements
                                </button>
                                <button
                                    onClick={() => setActiveTab('outcomes')}
                                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'outcomes' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-trophy mr-2"></i> What You'll Learn
                                </button>
                                <button
                                    onClick={() => setActiveTab('faqs')}
                                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'faqs' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-question-circle mr-2"></i> FAQs
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                >
                                    <i className="fas fa-star mr-2"></i> Reviews ({totalReviews})
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="prose max-w-none">
                                    <p className="text-gray leading-relaxed whitespace-pre-wrap">{course.description}</p>
                                </div>
                            )}

                            {/* Curriculum Tab */}
                            {activeTab === 'curriculum' && (
                                <div className="space-y-4">
                                    {course.modules?.map((module, index) => (
                                        <div key={module.id} className="border border-light-gray dark:border-gray-700 rounded-xl p-4 hover:shadow-soft transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                                            {index + 1}
                                                        </span>
                                                        <h3 className="font-bold text-lg">{module.title}</h3>
                                                    </div>
                                                    {module.description && (
                                                        <p className="text-gray text-sm ml-11 mb-2">{module.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 ml-11 text-sm text-gray">
                                                        <span><i className="far fa-clock mr-1"></i> {module.duration_minutes} minutes</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!course.modules || course.modules.length === 0) && (
                                        <div className="text-center py-8">
                                            <i className="fas fa-book-open text-4xl text-gray-300 mb-3"></i>
                                            <p className="text-gray">Curriculum will be updated soon.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Requirements Tab */}
                            {activeTab === 'requirements' && (
                                <div>
                                    {course.requirements?.length > 0 ? (
                                        <ul className="space-y-3">
                                            {course.requirements.map((req, index) => (
                                                <li key={req.id} className="flex items-start gap-3">
                                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                                    <span className="text-gray">{req.requirement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8">
                                            <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-3"></i>
                                            <p className="text-gray">Requirements will be updated soon.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Outcomes Tab */}
                            {activeTab === 'outcomes' && (
                                <div>
                                    {course.outcomes?.length > 0 ? (
                                        <ul className="space-y-3">
                                            {course.outcomes.map((outcome, index) => (
                                                <li key={outcome.id} className="flex items-start gap-3">
                                                    <i className="fas fa-star text-primary mt-1"></i>
                                                    <span className="text-gray">{outcome.outcome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8">
                                            <i className="fas fa-trophy text-4xl text-gray-300 mb-3"></i>
                                            <p className="text-gray">Learning outcomes will be updated soon.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* FAQs Tab */}
                            {activeTab === 'faqs' && (
                                <div className="space-y-4">
                                    {course.faqs?.length > 0 ? (
                                        course.faqs.map((faq, index) => (
                                            <div key={faq.id} className="border-b border-light-gray dark:border-gray-700 pb-4 last:border-0">
                                                <h4 className="font-semibold text-lg mb-2 flex items-start gap-2">
                                                    <span className="text-primary">Q{index + 1}.</span>
                                                    {faq.question}
                                                </h4>
                                                <p className="text-gray ml-6">{faq.answer}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <i className="fas fa-question-circle text-4xl text-gray-300 mb-3"></i>
                                            <p className="text-gray">FAQs will be updated soon.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Reviews Tab - Amazon/ProductDetails Style */}
                            {activeTab === 'reviews' && (
                                <div id="reviews-tab">
                                    {/* Rating Summary - Amazon Style WITH PROGRESS BARS */}
                                    <div className="bg-light dark:bg-dark-light rounded-xl p-6 mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Left Side - Average Rating Display */}
                                            <div className="text-center md:text-left">
                                                <div className="text-5xl font-bold text-primary">{formatRating(averageRating)}</div>
                                                <div className="mt-2">{renderStars(getSafeRating(averageRating), 'text-lg')}</div>
                                                <div className="text-sm text-gray mt-1">{totalReviews} global ratings</div>
                                            </div>

                                            {/* Right Side - Rating Distribution with Progress Bars */}
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map(star => {
                                                    const count = ratingDistribution[star] || 0;
                                                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                                    return (
                                                        <div key={star} className="flex items-center gap-3">
                                                            <span className="text-sm w-8">{star}★</span>
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm text-gray w-12">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Debug: Show rating distribution (remove after testing) */}
                                    <div className="text-xs text-gray-500 mb-4 hidden">
                                        Debug - Rating Dist: {JSON.stringify(ratingDistribution)}
                                    </div>

                                    {/* Write Review Button */}
                                    {!showReviewForm ? (
                                        <button
                                            onClick={() => setShowReviewForm(true)}
                                            className="btn mb-8"
                                        >
                                            <i className="fas fa-pen mr-2"></i> Write a course review
                                        </button>
                                    ) : (
                                        <div className="bg-light dark:bg-dark-light rounded-xl p-6 mb-8">
                                            <h3 className="text-lg font-bold mb-4">Write a Review</h3>
                                            <form onSubmit={handleReviewSubmit}>
                                                <div className="mb-4">
                                                    <label className="block font-medium mb-2">Overall Rating *</label>
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                                className="text-2xl focus:outline-none"
                                                            >
                                                                <i className={`fas fa-star ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block font-medium mb-2">Add a headline</label>
                                                    <input
                                                        type="text"
                                                        value={reviewForm.title}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                        placeholder="What's most important to know?"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block font-medium mb-2">Write your review *</label>
                                                    <textarea
                                                        value={reviewForm.comment}
                                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                        rows="4"
                                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                        placeholder="What did you like or dislike about this course?"
                                                        required
                                                    ></textarea>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block font-medium mb-2">Your Name *</label>
                                                        <input
                                                            type="text"
                                                            value={reviewForm.user_name}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block font-medium mb-2">Your Email *</label>
                                                        <input
                                                            type="email"
                                                            value={reviewForm.user_email}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, user_email: e.target.value })}
                                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button type="submit" disabled={submittingReview} className="btn">
                                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                                    </button>
                                                    <button type="button" onClick={() => setShowReviewForm(false)} className="btn-outline">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        {reviews.length === 0 ? (
                                            <div className="text-center py-8">
                                                <i className="fas fa-comments text-4xl text-gray-300 mb-3"></i>
                                                <p className="text-gray">No reviews yet. Be the first to review this course!</p>
                                            </div>
                                        ) : (
                                            reviews.map(review => (
                                                <div key={review.id} className="border-b border-light-gray dark:border-gray-700 pb-6 last:border-0">
                                                    <div className="mb-2">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-dark dark:text-white">{review.user_name}</span>
                                                        </div>
                                                        {renderStars(review.rating)}
                                                        {review.title && (
                                                            <h4 className="font-semibold mt-2 text-dark dark:text-white">{review.title}</h4>
                                                        )}
                                                    </div>
                                                    <p className="text-gray mt-2">{review.comment}</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-xs text-gray">{formatDateForDisplay(review.created_at)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Certificate Section */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <i className="fas fa-certificate text-5xl text-primary mb-4"></i>
                    <h2 className="text-2xl font-bold mb-4">Get Certified</h2>
                    <p className="text-gray mb-6">
                        Upon successful completion of this course, you will receive a government-recognized certificate
                        that validates your skills and enhances your career opportunities.
                    </p>
                    <div className="bg-light dark:bg-dark-light rounded-xl p-6">
                        <h3 className="font-semibold mb-2">Certificate Features</h3>
                        <ul className="text-left space-y-2">
                            <li><i className="fas fa-check text-primary mr-2"></i> Government recognized certification</li>
                            <li><i className="fas fa-check text-primary mr-2"></i> Lifetime validity</li>
                            <li><i className="fas fa-check text-primary mr-2"></i> Online verification code</li>
                            <li><i className="fas fa-check text-primary mr-2"></i> Share on LinkedIn & Resume</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-white/90 text-lg mb-8">Enroll now and take the first step towards your dream career</p>
                    {!course.isEnrolled ? (
                        <button onClick={handleEnroll} disabled={enrolling} className="btn bg-white text-primary hover:bg-accent">
                            {enrolling ? 'Processing...' : 'Enroll Now'}
                        </button>
                    ) : (
                        <Link to={`/course/learn/${course.id}`} className="btn bg-white text-primary hover:bg-accent">
                            Continue Learning <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                    )}
                </div>
            </section>
        </>
    );
};

export default CourseDetails;