import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const MyLearning = () => {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const response = await api.get('/courses/my-enrollments');
            setEnrollments(response.data);
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
            toast.error('Failed to load your courses');
        } finally {
            setLoading(false);
        }
    };

    const filteredEnrollments = enrollments.filter(e => 
        activeTab === 'all' ? true : e.status === activeTab
    );

    const getProgressColor = (percentage) => {
        if (percentage >= 75) return 'bg-green-500';
        if (percentage >= 50) return 'bg-blue-500';
        if (percentage >= 25) return 'bg-yellow-500';
        return 'bg-gray-500';
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
                <title>My Learning | Crazy Nails & Lashes</title>
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">My Learning</h1>
                        <p className="text-gray">Track your course progress and continue learning</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-light-gray dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 font-medium transition-all ${
                                activeTab === 'active'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray hover:text-primary'
                            }`}
                        >
                            Active Courses
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`px-4 py-2 font-medium transition-all ${
                                activeTab === 'completed'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray hover:text-primary'
                            }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 font-medium transition-all ${
                                activeTab === 'all'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray hover:text-primary'
                            }`}
                        >
                            All Courses
                        </button>
                    </div>

                    {/* Enrollments List */}
                    {filteredEnrollments.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl">
                            <i className="fas fa-book-open text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                            <p className="text-gray mb-6">You haven't enrolled in any courses yet.</p>
                            <Link to="/courses" className="btn">Browse Courses</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEnrollments.map(enrollment => (
                                <div key={enrollment.id} className="bg-white dark:bg-dark rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all">
                                    <div className="h-40 bg-gradient-light flex items-center justify-center relative">
                                        {enrollment.course_thumbnail ? (
                                            <img src={enrollment.course_thumbnail} alt={enrollment.course_title} className="w-full h-full object-cover" />
                                        ) : (
                                            <i className="fas fa-graduation-cap text-4xl text-primary"></i>
                                        )}
                                        {enrollment.status === 'completed' && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                <i className="fas fa-check-circle mr-1"></i> Completed
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold mb-2 line-clamp-1">{enrollment.course_title}</h3>
                                        <p className="text-gray text-sm mb-3 line-clamp-2">{enrollment.course_description}</p>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Progress</span>
                                                <span>{enrollment.completion_percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`${getProgressColor(enrollment.completion_percentage)} h-2 rounded-full transition-all duration-500`}
                                                    style={{ width: `${enrollment.completion_percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray mb-4">
                                            <span><i className="far fa-calendar mr-1"></i> Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                                            {enrollment.certificate_issued && (
                                                <span className="text-green-500">
                                                    <i className="fas fa-certificate mr-1"></i> Certified
                                                </span>
                                            )}
                                        </div>

                                        <Link 
                                            to={`/course/learn/${enrollment.course_id}`}
                                            className="w-full btn py-2 text-center inline-block"
                                        >
                                            {enrollment.completion_percentage === 100 ? 'Review Course' : 'Continue Learning'}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default MyLearning;