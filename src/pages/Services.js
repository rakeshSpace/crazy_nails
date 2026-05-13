import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';

const Services = () => {
    const [services, setServices] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([
        { id: 'all', name: 'All Services', icon: 'fa-grid' },
        { id: 'nails', name: 'Nail Services', icon: 'fa-spa' },
        { id: 'lashes', name: 'Eyelash Services', icon: 'fa-eye' },
        { id: 'facials', name: 'Facials & Skin', icon: 'fa-gem' },
        { id: 'waxing', name: 'Waxing & Threading', icon: 'fa-hand-sparkles' },
        { id: 'manicure', name: 'Manicure', icon: 'fa-hand-peace' },
        { id: 'pedicure', name: 'Pedicure', icon: 'fa-shoe-prints' },
        { id: 'addons', name: 'Add-On Services', icon: 'fa-plus-circle' }
    ]);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = activeCategory === 'all' 
        ? services 
        : services.filter(s => s.category === activeCategory);

    // Group services by category for display
    const servicesByCategory = filteredServices.reduce((acc, service) => {
        if (!acc[service.category]) acc[service.category] = [];
        acc[service.category].push(service);
        return acc;
    }, {});

    const categoryNames = {
        nails: 'Nail Services & Extensions',
        lashes: 'Eyelash Extensions',
        facials: 'Facials & Skin Care',
        waxing: 'Waxing & Threading',
        manicure: 'Manicure',
        pedicure: 'Pedicure',
        addons: 'Add-On Services'
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
                <title>Our Services | Crazy Nails</title>
                <meta name="description" content="Explore our premium beauty services including nail extensions, eyelash treatments, facials, waxing, and more." />
            </Helmet>

            {/* Page Header */}
            <section className="page-header bg-gradient-to-r from-dark to-dark-light text-white py-28 text-center mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Our Beauty Services</h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">Explore our comprehensive range of premium beauty treatments and services</p>
                </div>
            </section>

            {/* Services Navigation */}
            <nav className="sticky top-20 z-40 bg-white dark:bg-dark shadow-soft py-4 border-b border-light-gray dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-wrap gap-2 justify-center overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                                    activeCategory === cat.id
                                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-medium'
                                        : 'bg-white dark:bg-dark-light text-dark dark:text-white border border-light-gray dark:border-gray-700 hover:border-primary'
                                }`}
                            >
                                <i className={`fas ${cat.icon} mr-2`}></i>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Services Sections */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    {activeCategory === 'all' ? (
                        // Show all categories grouped
                        Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                            <div key={category} id={category} className="mb-16 scroll-mt-28">
                                <div className="text-center mb-10">
                                    <div className="w-20 h-20 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className={`fas ${categories.find(c => c.id === category)?.icon || 'fa-spa'} text-3xl text-primary`}></i>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3">{categoryNames[category] || category}</h2>
                                    <p className="text-gray max-w-2xl mx-auto">Professional services for beautiful results</p>
                                </div>
                                
                                <div className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft border border-light-gray dark:border-gray-700">
                                    {/* Desktop Table Header */}
                                    <div className="hidden md:grid grid-cols-12 bg-gradient-to-r from-primary to-secondary text-white p-4 font-semibold">
                                        <div className="col-span-5">Service</div>
                                        <div className="col-span-2 text-center">Price</div>
                                        <div className="col-span-2 text-center">Duration</div>
                                        <div className="col-span-3 text-center">Book</div>
                                    </div>
                                    
                                    {/* Service Rows */}
                                    {categoryServices.map(service => (
                                        <div key={service.id} className="border-b border-light-gray dark:border-gray-700 last:border-b-0 hover:bg-light dark:hover:bg-dark/50 transition-all">
                                            <div className="grid grid-cols-1 md:grid-cols-12 p-4 md:p-5 gap-3">
                                                <div className="md:col-span-5">
                                                    <h4 className="text-lg font-semibold mb-1">{service.name}</h4>
                                                    <p className="text-gray text-sm">{service.description}</p>
                                                </div>
                                                <div className="md:col-span-2 text-center">
                                                    <span className="text-primary font-bold text-xl">₹{service.price}</span>
                                                </div>
                                                <div className="md:col-span-2 text-center">
                                                    <span className="text-gray">
                                                        <i className="far fa-clock mr-1"></i> {service.duration} min
                                                    </span>
                                                </div>
                                                <div className="md:col-span-3 text-center">
                                                    <Link 
                                                        to={`/booking?service=${service.id}`} 
                                                        className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-medium transition-all"
                                                    >
                                                        Book Now
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Show single category
                        <div>
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className={`fas ${categories.find(c => c.id === activeCategory)?.icon || 'fa-spa'} text-3xl text-primary`}></i>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-3">{categoryNames[activeCategory] || activeCategory}</h2>
                                <p className="text-gray max-w-2xl mx-auto">Professional services for beautiful results</p>
                            </div>
                            
                            <div className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft border border-light-gray dark:border-gray-700">
                                <div className="hidden md:grid grid-cols-12 bg-gradient-to-r from-primary to-secondary text-white p-4 font-semibold">
                                    <div className="col-span-5">Service</div>
                                    <div className="col-span-2 text-center">Price</div>
                                    <div className="col-span-2 text-center">Duration</div>
                                    <div className="col-span-3 text-center">Book</div>
                                </div>
                                
                                {servicesByCategory[activeCategory]?.map(service => (
                                    <div key={service.id} className="border-b border-light-gray dark:border-gray-700 last:border-b-0 hover:bg-light dark:hover:bg-dark/50 transition-all">
                                        <div className="grid grid-cols-1 md:grid-cols-12 p-4 md:p-5 gap-3">
                                            <div className="md:col-span-5">
                                                <h4 className="text-lg font-semibold mb-1">{service.name}</h4>
                                                <p className="text-gray text-sm">{service.description}</p>
                                            </div>
                                            <div className="md:col-span-2 text-center">
                                                <span className="text-primary font-bold text-xl">₹{service.price}</span>
                                            </div>
                                            <div className="md:col-span-2 text-center">
                                                <span className="text-gray">
                                                    <i className="far fa-clock mr-1"></i> {service.duration} min
                                                </span>
                                            </div>
                                            <div className="md:col-span-3 text-center">
                                                <Link 
                                                    to={`/booking?service=${service.id}`} 
                                                    className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-medium transition-all"
                                                >
                                                    Book Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Ready to Book Your Service?</h2>
                    <p className="text-white/90 text-lg mb-8">Select your preferred service and time slot for a seamless booking experience</p>
                    <Link to="/booking" className="btn-book">Book Appointment Now</Link>
                </div>
            </section>
        </>
    );
};

export default Services;