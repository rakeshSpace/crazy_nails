import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';  // Add Link here
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [currentModule, setCurrentModule] = useState(null);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [enrollment, setEnrollment] = useState(null);

    useEffect(() => {
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            // Fetch course details with modules
            const courseRes = await api.get(`/courses/${courseId}`);
            setCourse(courseRes.data);
            setModules(courseRes.data.modules || []);
            
            // Set first module as current
            if (courseRes.data.modules && courseRes.data.modules.length > 0) {
                setCurrentModule(courseRes.data.modules[0]);
            }
            
            // Fetch enrollment and progress
            const enrollmentRes = await api.get(`/courses/enrollment/${courseId}`);
            setEnrollment(enrollmentRes.data);
            
            // Fetch progress for all modules
            const progressRes = await api.get(`/courses/progress/${enrollmentRes.data.id}`);
            const progressMap = {};
            progressRes.data.forEach(p => {
                progressMap[p.module_id] = p.completed;
            });
            setProgress(progressMap);
            
        } catch (error) {
            console.error('Failed to fetch course data:', error);
            toast.error('Course not found or access denied');
            navigate('/my-learning');
        } finally {
            setLoading(false);
        }
    };

    const markModuleComplete = async (moduleId) => {
        if (progress[moduleId]) return;
        
        try {
            await api.post('/courses/mark-complete', {
                enrollment_id: enrollment.id,
                module_id: moduleId
            });
            
            setProgress(prev => ({ ...prev, [moduleId]: true }));
            toast.success('Module completed!');
            
            // Refresh course data to update progress
            fetchCourseData();
        } catch (error) {
            toast.error('Failed to mark module as complete');
        }
    };

    const goToNextModule = () => {
        const currentIndex = modules.findIndex(m => m.id === currentModule.id);
        if (currentIndex < modules.length - 1) {
            setCurrentModule(modules[currentIndex + 1]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.success('Congratulations! You have completed all modules!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!course || !enrollment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="fas fa-lock text-5xl text-gray-300 mb-4"></i>
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-gray mb-4">You don't have access to this course.</p>
                    <Link to="/courses" className="btn">Browse Courses</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{course.title} | Crazy Nails & Lashes Learning</title>
            </Helmet>

            <div className="min-h-screen bg-light dark:bg-dark-light pt-20">
                <div className="container mx-auto px-4 max-w-7xl py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar - Course Modules */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft sticky top-24">
                                <div className="p-4 border-b border-light-gray dark:border-gray-700">
                                    <h2 className="font-bold text-lg">Course Content</h2>
                                    <p className="text-sm text-gray">{course.title}</p>
                                </div>
                                <div className="p-4">
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Overall Progress</span>
                                            <span>{enrollment.completion_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${enrollment.completion_percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                        {modules.map((module, index) => (
                                            <button
                                                key={module.id}
                                                onClick={() => setCurrentModule(module)}
                                                className={`w-full text-left p-3 rounded-lg transition-all ${
                                                    currentModule?.id === module.id
                                                        ? 'bg-primary/10 border-l-4 border-primary'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {progress[module.id] ? (
                                                        <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                                    ) : (
                                                        <span className="text-primary font-semibold mt-1">{index + 1}</span>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{module.title}</p>
                                                        <p className="text-xs text-gray">{module.duration_minutes} min</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Video Player */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-dark rounded-2xl shadow-soft overflow-hidden">
                                {/* Video Player */}
                                <div className="aspect-video bg-black flex items-center justify-center">
                                    {currentModule?.video_url ? (
                                        <iframe
                                            src={currentModule.video_url}
                                            title={currentModule.title}
                                            className="w-full h-full"
                                            allowFullScreen
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        ></iframe>
                                    ) : (
                                        <div className="text-center text-white">
                                            <i className="fas fa-play-circle text-5xl mb-3"></i>
                                            <p>Video content will be available soon</p>
                                        </div>
                                    )}
                                </div>

                                {/* Module Content */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h1 className="text-2xl font-bold mb-2">{currentModule?.title}</h1>
                                            <p className="text-gray">{currentModule?.description}</p>
                                        </div>
                                        {!progress[currentModule?.id] && (
                                            <button
                                                onClick={() => markModuleComplete(currentModule?.id)}
                                                className="btn btn-small"
                                            >
                                                <i className="fas fa-check mr-2"></i> Mark Complete
                                            </button>
                                        )}
                                    </div>

                                    {/* Notes Section */}
                                    <div className="mt-6 p-4 bg-light dark:bg-dark-light rounded-xl">
                                        <h3 className="font-semibold mb-2">
                                            <i className="fas fa-pen mr-2"></i> Your Notes
                                        </h3>
                                        <textarea
                                            className="w-full p-3 border rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark"
                                            rows="3"
                                            placeholder="Take notes here... Your notes are saved automatically."
                                        ></textarea>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between mt-6">
                                        <button
                                            onClick={() => {
                                                const prevIndex = modules.findIndex(m => m.id === currentModule?.id) - 1;
                                                if (prevIndex >= 0) setCurrentModule(modules[prevIndex]);
                                            }}
                                            className="btn-outline"
                                            disabled={modules.findIndex(m => m.id === currentModule?.id) === 0}
                                        >
                                            <i className="fas fa-chevron-left mr-2"></i> Previous
                                        </button>
                                        <button
                                            onClick={goToNextModule}
                                            className="btn"
                                            disabled={modules.findIndex(m => m.id === currentModule?.id) === modules.length - 1}
                                        >
                                            Next Module <i className="fas fa-chevron-right ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CoursePlayer;