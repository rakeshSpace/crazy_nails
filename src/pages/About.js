import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';

const About = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            // In production, fetch from API
            // const response = await api.get('/testimonials?approved=true');
            // setTestimonials(response.data);

            // Mock data for demo
            setTestimonials([
                { id: 1, name: 'Priya Sharma', role: 'Regular Client', comment: 'I\'ve been getting my nails done at Crazy Nails for over a year now. Their attention to detail is amazing, and my gel nails last perfectly for 3+ weeks every time!', rating: 5 },
                { id: 2, name: 'Anjali Mehta', role: 'First Time Visitor', comment: 'Got my first volume eyelash extensions here and I\'m absolutely in love! The staff was so professional and made sure I was comfortable throughout the process.', rating: 5 },
                { id: 3, name: 'Rohit Verma', role: 'Gift Card Recipient', comment: 'The hydra facial I received was exceptional! My skin has never looked better. The entire experience was relaxing and the results were beyond my expectations.', rating: 5 }
            ]);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
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

    const team = [
        { name: 'Priya Sharma', role: 'Head Nail Artist', experience: '8+ years experience specializing in nail extensions and intricate nail art.' },
        { name: 'Anjali Mehta', role: 'Eyelash Specialist', experience: 'Certified lash artist with expertise in classic, volume, and mega volume extensions.' },
        { name: 'Riya Verma', role: 'Skin Care Expert', experience: 'Specialized in advanced facials, cleanups, and customized skincare treatments.' }
    ];

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

            {/* Meet the Team */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2 className="text-2xl md:text-3xl font-bold">Meet Our Experts</h2>
                        <p>Our skilled team of beauty professionals</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all hover:-translate-y-2">
                                <div className="h-48 bg-gradient-light dark:bg-primary/20 flex items-center justify-center">
                                    <i className="fas fa-user-circle text-7xl text-primary"></i>
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                                    <p className="text-primary font-medium mb-3">{member.role}</p>
                                    <p className="text-gray text-sm">{member.experience}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2 className="text-2xl md:text-3xl font-bold">What Our Clients Say</h2>
                        <p>Real feedback from our valued customers</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {testimonials.map(testimonial => (
                            <div key={testimonial.id} className="bg-white dark:bg-dark rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={`fas fa-star ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                    ))}
                                </div>
                                <p className="text-dark dark:text-white mb-6 italic leading-relaxed">"{testimonial.comment}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-0">{testimonial.name}</h4>
                                        <p className="text-primary text-sm mb-0">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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