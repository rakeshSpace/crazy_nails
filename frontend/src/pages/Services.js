import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';

const Services = () => {
    const [services, setServices] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
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

    const calculateDiscount = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price) return null;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    const isOfferActive = (item) => {
        if (!item.is_on_offer) return false;
        if (!item.offer_end_date) return true;
        return new Date(item.offer_end_date) >= new Date();
    };

    const handleCategorySelect = (categoryId) => {
        setActiveCategory(categoryId);
        setIsFilterOpen(false);
    };

    const getSelectedCategoryName = () => {
        const cat = categories.find(c => c.id === activeCategory);
        return cat?.name || 'All Services';
    };

    const filteredServices = activeCategory === 'all' 
        ? services 
        : services.filter(s => s.category === activeCategory);

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

            {/* Page Header - EXACT SAME as original */}
            <section className="page-header bg-gradient-to-r from-dark to-dark-light text-white text-center mt-20 relative overflow-hidden py-28">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        Our Beauty Services
                    </h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">
                        Explore our comprehensive range of premium beauty treatments and services
                    </p>
                </div>
            </section>

            {/* Services Navigation - Mobile Filter Button */}
            <nav className="sticky top-20 z-40 bg-white dark:bg-dark shadow-soft py-4 border-b border-light-gray dark:border-gray-700">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* ===== MOBILE ONLY - Filter Button ===== */}
                    <div className="md:hidden flex items-center justify-between w-full">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium transition-all flex-shrink-0"
                        >
                            <i className="fas fa-sliders-h text-[10px]"></i>
                            <span>Filter</span>
                            <i className={`fas fa-chevron-${isFilterOpen ? 'up' : 'down'} text-[7px] ml-0.5 transition-transform`}></i>
                        </button>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 truncate flex-1 text-center px-1">
                            {getSelectedCategoryName()}
                        </span>
                        <span className="text-[8px] text-gray-400 flex-shrink-0">
                            {filteredServices.length}
                        </span>
                    </div>

                    {/* ===== DESKTOP & TABLET - Categories (EXACT SAME) ===== */}
                    <div className="hidden md:flex flex-wrap gap-2 justify-center overflow-x-auto pb-2">
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

            {/* ===== MOBILE FILTER SIDEBAR - Flush with header ===== */}
            {isFilterOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-[55] md:hidden"
                        onClick={() => setIsFilterOpen(false)}
                    ></div>
                    <div 
                        className="fixed left-0 w-[260px] max-w-[70vw] bg-white dark:bg-dark shadow-2xl z-[60] overflow-y-auto transform transition-transform duration-300 ease-in-out md:hidden"
                        style={{
                            top: 'clamp(68px, 10vh, 80px)',
                            height: 'calc(100vh - clamp(68px, 10vh, 80px))',
                            borderRadius: '0 16px 16px 0'
                        }}
                    >
                        <div className="sticky top-0 bg-white dark:bg-dark z-10 px-3.5 py-2.5 border-b border-light-gray dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-dark dark:text-white">Filter Services</h3>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="w-6 h-6 rounded-full bg-light dark:bg-dark-light flex items-center justify-center text-gray-500 hover:bg-primary/10 hover:text-primary transition-all text-xs"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-1.5">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2.5 text-xs ${
                                        activeCategory === cat.id
                                            ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-semibold border-l-[2px] border-primary'
                                            : 'hover:bg-light dark:hover:bg-dark-light text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    <i className={`fas ${cat.icon} w-4 text-center text-xs`}></i>
                                    <span className="flex-1 text-xs">{cat.name}</span>
                                    {activeCategory === cat.id && (
                                        <i className="fas fa-check-circle text-primary text-[10px]"></i>
                                    )}
                                    <span className="text-[9px] text-gray-400">
                                        ({services.filter(s => s.category === cat.id).length})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Services Sections */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    {activeCategory === 'all' ? (
                        Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                            <div key={category} id={category} className="mb-16 scroll-mt-28">
                                {/* Category Header - Hidden on Mobile */}
                                <div className="hidden md:block text-center mb-10">
                                    <div className="w-20 h-20 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className={`fas ${categories.find(c => c.id === category)?.icon || 'fa-spa'} text-3xl text-primary`}></i>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-3">{categoryNames[category] || category}</h2>
                                    <p className="text-gray max-w-2xl mx-auto">Professional services for beautiful results</p>
                                </div>
                                
                                {/* ===== DESKTOP & TABLET - Table View (EXACT SAME) ===== */}
                                <div className="hidden md:block bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft border border-light-gray dark:border-gray-700">
                                    <div className="grid grid-cols-12 bg-gradient-to-r from-primary to-secondary text-white p-4 font-semibold">
                                        <div className="col-span-5">Service</div>
                                        <div className="col-span-2 text-center">Price</div>
                                        <div className="col-span-2 text-center">Duration</div>
                                        <div className="col-span-3 text-center">Book</div>
                                    </div>
                                    
                                    {categoryServices.map(service => {
                                        const discount = calculateDiscount(service.original_price, service.price);
                                        const hasOffer = isOfferActive(service);
                                        
                                        return (
                                            <div key={service.id} className="border-b border-light-gray dark:border-gray-700 last:border-b-0 hover:bg-light dark:hover:bg-dark/50 transition-all">
                                                <div className="grid grid-cols-12 p-4 md:p-5 gap-3">
                                                    <div className="col-span-5">
                                                        <h4 className="text-lg font-semibold mb-1">
                                                            {service.name}
                                                            {hasOffer && discount && (
                                                                <span className="ml-2 inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                                                                    {discount}% OFF
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className="text-gray text-sm">{service.description}</p>
                                                        {hasOffer && service.offer_badge && (
                                                            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                <i className="fas fa-gift text-xs mr-1"></i> {service.offer_badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        {hasOffer && service.original_price ? (
                                                            <div>
                                                                <span className="text-primary font-bold text-xl">₹{service.price}</span>
                                                                <span className="text-gray line-through text-sm ml-2 block md:inline-block md:ml-2">₹{service.original_price}</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-primary font-bold text-xl">₹{service.price}</span>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-gray">
                                                            <i className="far fa-clock mr-1"></i> {service.duration} min
                                                        </span>
                                                    </div>
                                                    <div className="col-span-3 text-center">
                                                        <Link 
                                                            to={`/booking?service=${service.id}`} 
                                                            className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-medium transition-all"
                                                        >
                                                            Book Now
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ===== MOBILE ONLY - Grid with 2 columns ===== */}
                                <div className="md:hidden">
                                    <div className="grid grid-cols-2 gap-2">
                                        {categoryServices.map(service => {
                                            const discount = calculateDiscount(service.original_price, service.price);
                                            const hasOffer = isOfferActive(service);
                                            
                                            return (
                                                <div key={service.id} className="bg-white dark:bg-dark-light rounded-lg overflow-hidden shadow-soft border border-light-gray dark:border-gray-700 h-full flex flex-col">
                                                    <div className="p-2.5 flex flex-col flex-1">
                                                        <div className="flex items-start justify-between gap-1 mb-1">
                                                            <h4 className="text-[11px] font-semibold line-clamp-2 flex-1 leading-tight">
                                                                {service.name}
                                                            </h4>
                                                            {hasOffer && discount && (
                                                                <span className="flex-shrink-0 bg-red-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                                                                    {discount}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray text-[9px] line-clamp-2 mb-1 leading-relaxed flex-1">
                                                            {service.description}
                                                        </p>
                                                        {hasOffer && service.offer_badge && (
                                                            <span className="inline-block mb-1 text-[7px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                                                <i className="fas fa-gift text-[7px] mr-0.5"></i> {service.offer_badge}
                                                            </span>
                                                        )}
                                                        <div className="mt-auto">
                                                            <div className="mb-0.5">
                                                                {hasOffer && service.original_price ? (
                                                                    <div className="flex items-center gap-1 flex-wrap">
                                                                        <span className="text-primary font-bold text-sm">₹{service.price}</span>
                                                                        <span className="text-gray line-through text-[8px]">₹{service.original_price}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-primary font-bold text-sm">₹{service.price}</span>
                                                                )}
                                                            </div>
                                                            <div className="text-gray text-[7px] mb-1.5">
                                                                <i className="far fa-clock mr-0.5"></i> {service.duration} min
                                                            </div>
                                                            <Link 
                                                                to={`/booking?service=${service.id}`} 
                                                                className="w-full block text-center bg-gradient-to-r from-primary to-secondary text-white px-2 py-1 rounded-full text-[8px] font-semibold hover:shadow-medium transition-all"
                                                            >
                                                                Book Now
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>
                            {/* Category Header - Hidden on Mobile */}
                            <div className="hidden md:block text-center mb-10">
                                <div className="w-20 h-20 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className={`fas ${categories.find(c => c.id === activeCategory)?.icon || 'fa-spa'} text-3xl text-primary`}></i>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-3">{categoryNames[activeCategory] || activeCategory}</h2>
                                <p className="text-gray max-w-2xl mx-auto">Professional services for beautiful results</p>
                            </div>
                            
                            {/* ===== DESKTOP & TABLET - Table View (EXACT SAME) ===== */}
                            <div className="hidden md:block bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft border border-light-gray dark:border-gray-700">
                                <div className="grid grid-cols-12 bg-gradient-to-r from-primary to-secondary text-white p-4 font-semibold">
                                    <div className="col-span-5">Service</div>
                                    <div className="col-span-2 text-center">Price</div>
                                    <div className="col-span-2 text-center">Duration</div>
                                    <div className="col-span-3 text-center">Book</div>
                                </div>
                                
                                {servicesByCategory[activeCategory]?.map(service => {
                                    const discount = calculateDiscount(service.original_price, service.price);
                                    const hasOffer = isOfferActive(service);
                                    
                                    return (
                                        <div key={service.id} className="border-b border-light-gray dark:border-gray-700 last:border-b-0 hover:bg-light dark:hover:bg-dark/50 transition-all">
                                            <div className="grid grid-cols-12 p-4 md:p-5 gap-3">
                                                <div className="col-span-5">
                                                    <h4 className="text-lg font-semibold mb-1">
                                                        {service.name}
                                                        {hasOffer && discount && (
                                                            <span className="ml-2 inline-block bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                                                                {discount}% OFF
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-gray text-sm">{service.description}</p>
                                                    {hasOffer && service.offer_badge && (
                                                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                            <i className="fas fa-gift text-xs mr-1"></i> {service.offer_badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    {hasOffer && service.original_price ? (
                                                        <div>
                                                            <span className="text-primary font-bold text-xl">₹{service.price}</span>
                                                            <span className="text-gray line-through text-sm ml-2 block md:inline-block md:ml-2">₹{service.original_price}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-primary font-bold text-xl">₹{service.price}</span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <span className="text-gray">
                                                        <i className="far fa-clock mr-1"></i> {service.duration} min
                                                    </span>
                                                </div>
                                                <div className="col-span-3 text-center">
                                                    <Link 
                                                        to={`/booking?service=${service.id}`} 
                                                        className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-medium transition-all"
                                                    >
                                                        Book Now
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ===== MOBILE ONLY - Grid with 2 columns ===== */}
                            <div className="md:hidden">
                                <div className="grid grid-cols-2 gap-2">
                                    {servicesByCategory[activeCategory]?.map(service => {
                                        const discount = calculateDiscount(service.original_price, service.price);
                                        const hasOffer = isOfferActive(service);
                                        
                                        return (
                                            <div key={service.id} className="bg-white dark:bg-dark-light rounded-lg overflow-hidden shadow-soft border border-light-gray dark:border-gray-700 h-full flex flex-col">
                                                <div className="p-2.5 flex flex-col flex-1">
                                                    <div className="flex items-start justify-between gap-1 mb-1">
                                                        <h4 className="text-[11px] font-semibold line-clamp-2 flex-1 leading-tight">
                                                            {service.name}
                                                        </h4>
                                                        {hasOffer && discount && (
                                                            <span className="flex-shrink-0 bg-red-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                                                                {discount}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray text-[9px] line-clamp-2 mb-1 leading-relaxed flex-1">
                                                        {service.description}
                                                    </p>
                                                    {hasOffer && service.offer_badge && (
                                                        <span className="inline-block mb-1 text-[7px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                                            <i className="fas fa-gift text-[7px] mr-0.5"></i> {service.offer_badge}
                                                        </span>
                                                    )}
                                                    <div className="mt-auto">
                                                        <div className="mb-0.5">
                                                            {hasOffer && service.original_price ? (
                                                                <div className="flex items-center gap-1 flex-wrap">
                                                                    <span className="text-primary font-bold text-sm">₹{service.price}</span>
                                                                    <span className="text-gray line-through text-[8px]">₹{service.original_price}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-primary font-bold text-sm">₹{service.price}</span>
                                                            )}
                                                        </div>
                                                        <div className="text-gray text-[7px] mb-1.5">
                                                            <i className="far fa-clock mr-0.5"></i> {service.duration} min
                                                        </div>
                                                        <Link 
                                                            to={`/booking?service=${service.id}`} 
                                                            className="w-full block text-center bg-gradient-to-r from-primary to-secondary text-white px-2 py-1 rounded-full text-[8px] font-semibold hover:shadow-medium transition-all"
                                                        >
                                                            Book Now
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section - EXACT SAME as original */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
                        Ready to Book Your Service?
                    </h2>
                    <p className="text-white/90 text-lg mb-8">
                        Select your preferred service and time slot for a seamless booking experience
                    </p>
                    <Link to="/booking" className="btn-book">Book Appointment Now</Link>
                </div>
            </section>
        </>
    );
};

export default Services;