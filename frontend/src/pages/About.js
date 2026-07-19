import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import TestimonialCarousel from '../components/TestimonialCarousel';

const About = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Base URL for images
    const IMAGE_BASE_URL = 'http://localhost:5000';

    // Helper function to get correct image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        if (imageUrl.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${imageUrl}`;
        }
        return `${IMAGE_BASE_URL}/uploads/team/${imageUrl}`;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch team members from API
            const teamRes = await api.get('/team');
            setTeamMembers(teamRes.data);

            // Fetch testimonials from API
            const testimonialsRes = await api.get('/testimonials?approved=true&limit=10');
            setTestimonials(testimonialsRes.data);

        } catch (error) {
            console.error('Failed to fetch data:', error);
            // Fallback to mock data if API fails
            setTeamMembers([
                {
                    id: 1,
                    name: 'Priya Sharma',
                    role: 'Head Nail Artist',
                    experience: '8+ years experience specializing in nail extensions and intricate nail art.',
                    specialization: 'Nail Extensions, Nail Art',
                    image_url: null,
                    social_facebook: null,
                    social_instagram: null,
                    social_twitter: null
                },
                {
                    id: 2,
                    name: 'Anjali Mehta',
                    role: 'Eyelash Specialist',
                    experience: 'Certified lash artist with expertise in classic, volume, and mega volume extensions.',
                    specialization: 'Volume Lashes, Classic Lashes',
                    image_url: null,
                    social_facebook: null,
                    social_instagram: null,
                    social_twitter: null
                },
                {
                    id: 3,
                    name: 'Riya Verma',
                    role: 'Skin Care Expert',
                    experience: 'Specialized in advanced facials, cleanups, and customized skincare treatments.',
                    specialization: 'Facials, Skin Treatments',
                    image_url: null,
                    social_facebook: null,
                    social_instagram: null,
                    social_twitter: null
                }
            ]);

            setTestimonials([
                { id: 1, name: 'Priya Sharma', role: 'Regular Client', comment: 'I\'ve been getting my nails done at Crazy Nails for over a year now. Their attention to detail is amazing, and my gel nails last perfectly for 3+ weeks every time!', rating: 5 },
                { id: 2, name: 'Anjali Mehta', role: 'First Time Visitor', comment: 'Got my first volume eyelash extensions here and I\'m absolutely in love! The staff was so professional and made sure I was comfortable throughout the process.', rating: 5 },
                { id: 3, name: 'Rohit Verma', role: 'Gift Card Recipient', comment: 'The hydra facial I received was exceptional! My skin has never looked better. The entire experience was relaxing and the results were beyond my expectations.', rating: 5 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const values = [
        { icon: 'fa-award', title: 'Quality Excellence', description: 'We never compromise on quality, using only premium products and the latest techniques to deliver outstanding results.' },
        { icon: 'fa-heart', title: 'Client Satisfaction', description: 'Your happiness is our priority. We listen carefully to your needs and preferences to deliver personalized beauty solutions.' },
        { icon: 'fa-shield-alt', title: 'Hygiene & Safety', description: 'We maintain the highest standards of cleanliness and sanitation, with all tools sterilized between clients.' },
        { icon: 'fa-users', title: 'Expert Team', description: 'Our certified professionals undergo continuous training to stay updated with the latest beauty trends and techniques.' }
    ];

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
                <title>Why Choose Us | Crazy Nails</title>
                <meta name="description" content="Discover what makes Crazy Nails the preferred choice for premium beauty services. Quality excellence, client satisfaction, hygiene, and expert team." />
            </Helmet>

            {/* Page Header */}
            <section className="page-header bg-gradient-to-r from-dark to-dark-light text-white py-28 text-center mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Why Choose Crazy Nails</h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">Discover what makes us the preferred choice for premium beauty services</p>
                </div>
            </section>

            {/* Introduction */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Commitment to Excellence</h2>
                    <p className="text-gray text-lg mb-4">At Crazy Nails, we believe that beauty is an art form that should be accessible to everyone. Founded with a passion for enhancing natural beauty, we've grown to become one of the city's most trusted beauty salons, specializing in nail extensions, eyelash treatments, and comprehensive beauty services.</p>
                    <p className="text-gray text-lg">Our mission is simple: to provide exceptional beauty services in a welcoming, hygienic environment where every client feels valued and leaves looking and feeling their absolute best.</p>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2 className="text-2xl md:text-3xl font-bold">Our Core Values</h2>
                        <p>The principles that guide everything we do at Crazy Nails</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white dark:bg-dark rounded-2xl p-8 text-center shadow-soft hover:shadow-medium transition-all hover:-translate-y-2">
                                <div className="w-20 h-20 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <i className={`fas ${value.icon} text-3xl text-primary`}></i>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                                <p className="text-gray">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet Our Experts - DYNAMIC SECTION WITH FIXED IMAGES */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2 className="text-2xl md:text-3xl font-bold">Meet Our Experts</h2>
                        <p>Our skilled team of beauty professionals</p>
                    </div>

                    {teamMembers.length === 0 ? (
                        <div className="text-center py-12">
                            <i className="fas fa-users text-5xl text-gray-300 mb-4"></i>
                            <p className="text-gray">Team members will be added soon.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                            {teamMembers.map((member) => {
                                const imageUrl = getImageUrl(member.image_url);
                                return (
                                    <div key={member.id} className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                                        {/* Image Container - Fixed Round Shape */}
                                        <div className="relative pt-6 pb-4 bg-gradient-to-b from-primary/5 to-transparent">
                                            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-gradient-light dark:bg-primary/20 border-4 border-white dark:border-dark shadow-lg">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => {
                                                            console.error('Image failed to load:', imageUrl);
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-primary/10"><i class="fas fa-user-circle text-6xl text-primary"></i></div>';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                        <i className="fas fa-user-circle text-6xl text-primary"></i>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Social Media Icons - Below Image */}
                                            {(member.social_facebook || member.social_instagram || member.social_twitter) && (
                                                <div className="flex justify-center gap-3 mt-4">
                                                    {member.social_facebook && (
                                                        <a
                                                            href={member.social_facebook}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-8 h-8 bg-gray-100 dark:bg-dark rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-110"
                                                        >
                                                            <i className="fab fa-facebook-f text-sm"></i>
                                                        </a>
                                                    )}
                                                    {member.social_instagram && (
                                                        <a
                                                            href={member.social_instagram}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-8 h-8 bg-gray-100 dark:bg-dark rounded-full flex items-center justify-center text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-500 hover:text-white transition-all duration-300 hover:scale-110"
                                                        >
                                                            <i className="fab fa-instagram text-sm"></i>
                                                        </a>
                                                    )}
                                                    {member.social_twitter && (
                                                        <a
                                                            href={member.social_twitter}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-8 h-8 bg-gray-100 dark:bg-dark rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-300 hover:scale-110"
                                                        >
                                                            <i className="fab fa-twitter text-sm"></i>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 text-center">
                                            <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                                            <p className="text-primary font-medium mb-3">{member.role}</p>
                                            {member.specialization && (
                                                <div className="mb-3">
                                                    <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                                                        <i className="fas fa-tag text-primary text-xs mr-1"></i> {member.specialization}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-gray text-sm leading-relaxed">{member.experience}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials Section - SAME AS HOME PAGE */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2 className="text-2xl md:text-3xl font-bold">What Our Clients Say</h2>
                        <p>Real feedback from our valued customers</p>
                    </div>
                    <TestimonialCarousel testimonials={testimonials} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Experience the Difference</h2>
                    <p className="text-white/90 text-lg mb-8">Book your appointment today and discover why so many clients trust Crazy Nails for their beauty needs.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/booking" className="btn-book">Book Now</Link>
                        <a href="tel:8264304266" className="btn btn-call">
                            <i className="fas fa-phone-alt"></i> Call Now
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
};

export default About;