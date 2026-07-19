import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeLevel, setActiveLevel] = useState('all');
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    const categories = [
        { id: 'all', name: 'All Courses' },
        { id: 'nails', name: 'Nail Art' },
        { id: 'lashes', name: 'Eyelash Extensions' },
        { id: 'facials', name: 'Facials & Skin' },
        { id: 'waxing', name: 'Waxing' },
        { id: 'makeup', name: 'Makeup' },
        { id: 'hair', name: 'Hair Styling' },
        { id: 'business', name: 'Business' }
    ];

    const levels = [
        { id: 'all', name: 'All Levels' },
        { id: 'beginner', name: 'Beginner' },
        { id: 'intermediate', name: 'Intermediate' },
        { id: 'advanced', name: 'Advanced' },
        { id: 'master', name: 'Master' }
    ];

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [courses, activeCategory, activeLevel]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = [...courses];
        
        if (activeCategory !== 'all') {
            filtered = filtered.filter(c => c.category === activeCategory);
        }
        if (activeLevel !== 'all') {
            filtered = filtered.filter(c => c.level === activeLevel);
        }
        
        setFilteredCourses(filtered);
    };

    const getLevelBadge = (level) => {
        const badges = {
            beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            master: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        };
        return badges[level] || 'bg-gray-100 text-gray-800';
    };

    const calculateDiscount = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price) return null;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    const isOfferActive = (course) => {
        if (!course.is_on_offer) return false;
        if (!course.offer_end_date) return true;
        return new Date(course.offer_end_date) >= new Date();
    };

    const getSavings = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price) return 0;
        return originalPrice - price;
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
                <title>Training Courses | Crazy Nails & Lashes</title>
                <meta name="description" content="Professional beauty training courses. Get certified in nail art, eyelash extensions, facials, and salon business management." />
            </Helmet>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 mt-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Professional Training & Certification</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Master the art of beauty with our industry-recognized courses. Get certified and start your dream career.
                    </p>
                </div>
            </section>

            {/* Filters */}
            <section className="py-6 bg-white dark:bg-dark border-b sticky top-20 z-30">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap gap-4 justify-center">
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full transition-all ${
                                        activeCategory === cat.id
                                            ? 'bg-primary text-white'
                                            : 'bg-light text-dark hover:bg-primary/20'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {levels.map(level => (
                                <button
                                    key={level.id}
                                    onClick={() => setActiveLevel(level.id)}
                                    className={`px-4 py-2 rounded-full transition-all ${
                                        activeLevel === level.id
                                            ? 'bg-primary text-white'
                                            : 'bg-light text-dark hover:bg-primary/20'
                                    }`}
                                >
                                    {level.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4">
                    {filteredCourses.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                            <p className="text-gray">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map(course => {
                                const discount = calculateDiscount(course.original_price, course.price);
                                const hasOffer = isOfferActive(course);
                                const savings = getSavings(course.original_price, course.price);
                                const daysLeft = hasOffer && course.offer_end_date ?
                                    Math.ceil((new Date(course.offer_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

                                return (
                                    <div key={course.id} className="bg-white dark:bg-dark rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative">
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
                                        {hasOffer && course.offer_badge && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                    <i className="fas fa-gift text-white text-xs"></i>
                                                    <span>{course.offer_badge}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Featured Badge */}
                                        {course.is_featured === 1 && !hasOffer && (
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                    <i className="fas fa-star mr-1"></i> Featured
                                                </div>
                                            </div>
                                        )}

                                        {/* Course Thumbnail */}
                                        <div className="h-56 overflow-hidden bg-gradient-light dark:bg-primary/20 relative">
                                            {course.thumbnail ? (
                                                <img 
                                                    src={`http://localhost:5000${course.thumbnail}`} 
                                                    alt={course.title} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><i class="fas fa-graduation-cap text-5xl text-primary"></i></div>';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <i className="fas fa-graduation-cap text-5xl text-primary"></i>
                                                </div>
                                            )}
                                            
                                            {/* Level Badge */}
                                            <div className="absolute bottom-3 left-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadge(course.level)} shadow-md`}>
                                                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Course Content */}
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-gray text-sm mb-3 line-clamp-2">
                                                {course.description}
                                            </p>

                                            {/* Duration & Hours */}
                                            <div className="flex items-center justify-between mb-3 text-sm text-gray">
                                                <span>
                                                    <i className="far fa-clock mr-1"></i> {course.duration_hours} hours
                                                </span>
                                                <span>
                                                    <i className="fas fa-certificate mr-1"></i> Certificate Included
                                                </span>
                                            </div>

                                            {/* Price Section with Discount */}
                                            <div className="mb-4">
                                                {hasOffer && course.original_price ? (
                                                    <>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-primary font-bold text-2xl">₹{course.price}</span>
                                                            <span className="text-gray line-through text-sm">₹{course.original_price}</span>
                                                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                                Save ₹{savings}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray mt-1">
                                                            <i className="fas fa-tag mr-1"></i> {discount}% OFF
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-primary font-bold text-2xl">₹{course.price}</div>
                                                )}
                                            </div>

                                            {/* Offer End Date Timer */}
                                            {hasOffer && course.offer_end_date && daysLeft > 0 && daysLeft <= 7 && (
                                                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                                                        <i className="fas fa-hourglass-half"></i>
                                                        <span className="font-semibold">Limited Time Offer!</span>
                                                        <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* EMI / Easy Payment Info */}
                                            <div className="mb-4 text-xs text-gray-500">
                                                <i className="fas fa-credit-card mr-1"></i>
                                                No Cost EMI available | Easy Installments
                                            </div>

                                            {/* View Details Button */}
                                            <Link
                                                to={`/courses/${course.slug}`}
                                                className="block w-full text-center btn py-2.5"
                                            >
                                                View Course Details <i className="fas fa-arrow-right ml-2"></i>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why Choose Our Training?</h2>
                        <p className="text-gray max-w-2xl mx-auto">Industry-recognized certification with hands-on training</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-certificate text-2xl text-primary"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Government Recognized</h3>
                            <p className="text-gray">Certificate valid across India</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-chalkboard-user text-2xl text-primary"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Expert Trainers</h3>
                            <p className="text-gray">Learn from industry professionals</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-briefcase text-2xl text-primary"></i>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Placement Assistance</h3>
                            <p className="text-gray">100% job placement support</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Courses;