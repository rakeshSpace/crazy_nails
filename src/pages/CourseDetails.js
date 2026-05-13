import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';  // Add Link here
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

    useEffect(() => {
        fetchCourse();
    }, [slug]);

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

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll');
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            await api.post('/courses/enroll', { course_id: course.id });
            toast.success('Successfully enrolled in course!');
            fetchCourse();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to enroll');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <>
            <Helmet>
                <title>{course.title} | Crazy Nails & Lashes Training</title>
            </Helmet>

            {/* Course Header */}
            <section className="bg-gradient-to-r from-dark to-dark-light text-white py-20 mt-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <div className="mb-4">
                                <span className="px-3 py-1 bg-primary rounded-full text-sm">
                                    {course.level}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-lg opacity-90 mb-6">{course.description}</p>
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
                            </div>
                            {!course.isEnrolled ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl font-bold">₹{course.price}</span>
                                    <button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="btn btn-large"
                                    >
                                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                                    <p className="text-green-400">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        You are enrolled in this course!
                                    </p>
                                    <Link to={`/course/learn/${course.id}`} className="btn mt-3 inline-block">
                                        Continue Learning
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="bg-white/10 rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
                            <ul className="space-y-3">
                                {course.modules?.map((module, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>{module.title}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Curriculum Section */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                    <div className="space-y-4">
                        {course.modules?.map((module, index) => (
                            <div key={module.id} className="bg-white dark:bg-dark rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-primary font-semibold">Module {index + 1}</span>
                                        <h3 className="font-bold mt-1">{module.title}</h3>
                                        <p className="text-gray text-sm mt-1">{module.description}</p>
                                    </div>
                                    <span className="text-gray text-sm">
                                        {module.duration_minutes} min
                                    </span>
                                </div>
                            </div>
                        ))}
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
        </>
    );
};

export default CourseDetails;