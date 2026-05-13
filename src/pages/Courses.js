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
        } catch (error) {
            console.error('Failed to fetch courses:', error);
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
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-blue-100 text-blue-800',
            advanced: 'bg-purple-100 text-purple-800',
            master: 'bg-gold-100 text-gold-800'
        };
        return badges[level] || 'bg-gray-100 text-gray-800';
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
                            {filteredCourses.map(course => (
                                <div key={course.id} className="bg-white dark:bg-dark rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all">
                                    <div className="h-48 bg-gradient-light flex items-center justify-center">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <i className="fas fa-graduation-cap text-5xl text-primary"></i>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelBadge(course.level)}`}>
                                                {course.level}
                                            </span>
                                            <span className="text-2xl font-bold text-primary">₹{course.price}</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                        <p className="text-gray text-sm mb-4 line-clamp-2">{course.description}</p>
                                        <div className="flex justify-between items-center mb-4 text-sm text-gray">
                                            <span><i className="far fa-clock mr-1"></i> {course.duration_hours} hours</span>
                                            <span><i className="fas fa-certificate mr-1"></i> Certificate Included</span>
                                        </div>
                                        <Link
                                            to={`/courses/${course.slug}`}
                                            className="block w-full text-center btn py-2"
                                        >
                                            View Course Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
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