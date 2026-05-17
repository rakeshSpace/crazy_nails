import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import TestimonialCarousel from '../components/TestimonialCarousel';

const Home = () => {
    const [heroSlides, setHeroSlides] = useState([]);
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const sliderRef = useRef(null);
    const { addToCart } = useCart();

    const IMAGE_BASE_URL = 'http://localhost:5000';

    // ========== CUSTOM ARROW COMPONENTS (DEFINED FIRST) ==========
    const SamplePrevArrow = (props) => {
        const { onClick } = props;
        return (
            <button
                onClick={onClick}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-primary rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110"
                style={{ backdropFilter: 'blur(4px)' }}
            >
                <i className="fas fa-chevron-left"></i>
            </button>
        );
    };

    const SampleNextArrow = (props) => {
        const { onClick } = props;
        return (
            <button
                onClick={onClick}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-primary rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110"
                style={{ backdropFilter: 'blur(4px)' }}
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        );
    };

    // ========== CAROUSEL SETTINGS ==========
    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: true,
        fade: true,
        prevArrow: <SamplePrevArrow />,
        nextArrow: <SampleNextArrow />
    };

    // ========== FETCH DATA ==========
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [heroRes, servicesRes, productsRes, testimonialsRes] = await Promise.all([
                api.get('/hero'),
                api.get('/services'),
                api.get('/products?featured=true&limit=4'),
                api.get('/testimonials?approved=true&limit=10')
            ]);

            setHeroSlides(heroRes.data);
            setServices(servicesRes.data.slice(0, 4));
            setProducts(productsRes.data);
            setTestimonials(testimonialsRes.data);

        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load content');

            // Fallback data
            setHeroSlides([
                { id: 1, title: 'Reveal Your Beautiful Self', description: 'Where artistry meets perfection. Premium nail care, stunning eyelash extensions, and rejuvenating beauty treatments.', image_url: null, button_text: 'Book Appointment', button_link: '/booking' }
            ]);

            setTestimonials([
                { id: 1, name: 'Priya Sharma', role: 'Regular Client', comment: 'Best nail salon in town! Their attention to detail is amazing. The staff is incredibly professional and the results are always stunning.', rating: 5 },
                { id: 2, name: 'Rohit Verma', role: 'New Client', comment: 'The eyelash extensions look so natural and lasted perfectly. Highly recommended! I have already booked my next appointment.', rating: 5 },
                { id: 3, name: 'Anjali Mehta', role: 'VIP Member', comment: 'Been coming here for 2 years. Consistent quality and friendly staff every time. They always make me feel special.', rating: 5 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ========== UTILITY FUNCTIONS ==========
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/uploads')) return `${IMAGE_BASE_URL}${imageUrl}`;
        return `${IMAGE_BASE_URL}/uploads/${imageUrl}`;
    };

    // Calculate discount percentage
    const calculateDiscount = (originalPrice, price) => {
        if (!originalPrice || originalPrice <= price) return null;
        return Math.round(((originalPrice - price) / originalPrice) * 100);
    };

    // Check if offer is active
    const isOfferActive = (item) => {
        if (!item.is_on_offer) return false;
        if (!item.offer_end_date) return true;
        return new Date(item.offer_end_date) >= new Date();
    };

    // ========== LOADING STATE ==========
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // ========== RENDER COMPONENT ==========
    return (
        <>
            {/* Hero Carousel Section */}
            <section className="relative h-[89vh] min-h-[600px] max-h-[800px] overflow-hidden mt-20">
                <Slider ref={sliderRef} {...carouselSettings} className="h-full">
                    {heroSlides.map((slide) => (
                        <div key={slide.id} className="relative h-[89vh] min-h-[600px]">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-[8s] scale-110"
                                style={{
                                    backgroundImage: `url(${getImageUrl(slide.image_url) || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'})`
                                }}
                            >
                                <div className="absolute inset-0 bg-black/50"></div>
                            </div>
                            <div className="relative z-10 h-full flex items-center px-4 md:px-10">
                                <div className="container mx-auto max-w-7xl">
                                    <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-4 animate-slide-up">{slide.title}</h1>
                                    <p className="text-white/90 text-base md:text-lg mb-8 max-w-xl animate-slide-up">{slide.description}</p>
                                    <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                                        <Link to={slide.button_link || '/booking'} className="btn btn-large">
                                            {slide.button_text || 'Book Appointment'}
                                        </Link>
                                        <Link to={slide.button_link_2 || '/services'} className="btn-outline btn-large">
                                            {slide.button_text_2 || 'View Services'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <a href="#featured-services" className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center text-white hover:bg-primary transition-all">
                        <i className="fas fa-chevron-down"></i>
                    </a>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-10 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-light dark:hover:bg-dark-light transition-all">
                            <div className="w-12 h-12 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center">
                                <i className="fas fa-award text-2xl text-primary"></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-1">Certified Professionals</h4>
                                <p className="text-sm text-gray mb-0">Expert technicians with years of experience</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-light dark:hover:bg-dark-light transition-all">
                            <div className="w-12 h-12 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center">
                                <i className="fas fa-shield-alt text-2xl text-primary"></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-1">Hygiene First</h4>
                                <p className="text-sm text-gray mb-0">Stringent sanitation protocols</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-light dark:hover:bg-dark-light transition-all">
                            <div className="w-12 h-12 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center">
                                <i className="fas fa-gem text-2xl text-primary"></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-1">Premium Products</h4>
                                <p className="text-sm text-gray mb-0">High-quality, safe products</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-light dark:hover:bg-dark-light transition-all">
                            <div className="w-12 h-12 bg-accent dark:bg-primary/20 rounded-full flex items-center justify-center">
                                <i className="fas fa-clock text-2xl text-primary"></i>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-1">Flexible Hours</h4>
                                <p className="text-sm text-gray mb-0">Open 7 days a week</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Services Section with Offers */}
            <section id="featured-services" className="section-padding bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2>Our Premium Services</h2>
                        <p>Experience excellence with our specialized beauty treatments</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {services.map(service => {
                            const discount = calculateDiscount(service.original_price, service.price);
                            const hasOffer = isOfferActive(service);
                            const daysLeft = hasOffer && service.offer_end_date ?
                                Math.ceil((new Date(service.offer_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

                            return (
                                <div key={service.id} className="group bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-light-gray dark:border-gray-700 relative">

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
                                    {hasOffer && service.offer_badge && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                <i className="fas fa-gift text-white text-xs"></i>
                                                <span>{service.offer_badge}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Service Image */}
                                    <div className="h-48 overflow-hidden bg-gradient-light dark:bg-primary/20">
                                        {service.image_url ? (
                                            <img
                                                src={getImageUrl(service.image_url)}
                                                alt={service.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><i class="fas fa-spa text-5xl text-primary"></i></div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <i className="fas fa-spa text-5xl text-primary"></i>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-xl font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                            {service.name}
                                        </h3>
                                        <p className="text-gray text-sm mb-3 line-clamp-2">{service.description}</p>

                                        {/* Price Section with Discount */}
                                        <div className="mb-3">
                                            {hasOffer && service.original_price ? (
                                                <>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-primary font-bold text-2xl">₹{service.price}</span>
                                                        <span className="text-gray line-through text-sm">₹{service.original_price}</span>
                                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                            {discount}% OFF
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-green-600 mt-1">
                                                        <i className="fas fa-save mr-1"></i> Save: ₹{service.original_price - service.price}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-primary font-bold text-2xl">₹{service.price}</div>
                                            )}
                                            <div className="text-xs text-gray mt-1">
                                                <i className="far fa-clock mr-1"></i> {service.duration} minutes
                                            </div>
                                        </div>

                                        {/* Offer End Date Timer */}
                                        {hasOffer && service.offer_end_date && daysLeft > 0 && daysLeft <= 7 && (
                                            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                                                    <i className="fas fa-hourglass-half"></i>
                                                    <span className="font-semibold">Limited Time Offer!</span>
                                                    <span>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>
                                                </div>
                                            </div>
                                        )}

                                        <Link to={`/booking?service=${service.id}`} className="btn w-full py-2.5 text-center">
                                            Book Now <i className="fas fa-arrow-right ml-2"></i>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/services" className="btn">View All Services</Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="section-padding bg-gradient-light dark:bg-dark-light relative overflow-hidden">
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <div className="section-title">
                        <h2>Why Choose Crazy Nails</h2>
                        <p>We're committed to delivering exceptional beauty experiences</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {[
                            { number: '01', title: 'Expert Professionals', desc: 'Our certified technicians have years of experience in beauty and nail artistry.' },
                            { number: '02', title: 'Premium Products', desc: 'We use only high-quality, safe products for all our treatments and services.' },
                            { number: '03', title: 'Hygiene First', desc: 'Stringent sanitation protocols ensure a clean and safe environment for every client.' },
                            { number: '04', title: 'Affordable Luxury', desc: 'Premium beauty services at competitive prices with no compromise on quality.' }
                        ].map(feature => (
                            <div key={feature.number} className="bg-white dark:bg-dark rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all hover:-translate-y-2 text-center">
                                <div className="text-4xl font-bold text-accent dark:text-primary/30 mb-3">{feature.number}</div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray text-sm mb-0">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section with Amazon-style Cards */}
            <section className="section-padding bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2>Our Beauty Products</h2>
                        <p>Shop premium beauty products for your home care routine</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {products.map(product => {
                            const discount = calculateDiscount(product.original_price, product.price);
                            const hasOffer = isOfferActive(product);
                            const daysLeft = hasOffer && product.offer_end_date ?
                                Math.ceil((new Date(product.offer_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

                            return (
                                <div key={product.id} className="group bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-light-gray dark:border-gray-700 relative">

                                    {/* Discount Badge - Top Left */}
                                    {hasOffer && discount && (
                                        <div className="absolute top-3 left-3 z-10">
                                            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                <i className="fas fa-tag text-white text-xs"></i>
                                                <span>{discount}% OFF</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Offer Badge - Top Right */}
                                    {hasOffer && product.offer_badge && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                <i className="fas fa-gift text-white text-xs"></i>
                                                <span>{product.offer_badge}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Image */}
                                    <div className="h-56 overflow-hidden bg-gradient-light dark:bg-primary/20 relative">
                                        {product.image_url ? (
                                            <img
                                                src={getImageUrl(product.image_url)}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><i class="fas fa-spa text-5xl text-primary"></i></div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <i className="fas fa-spa text-5xl text-primary"></i>
                                            </div>
                                        )}

                                        {/* Rating Badge */}
                                        {product.rating > 0 && (
                                            <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-dark/90 rounded-full px-2 py-1 text-xs font-semibold flex items-center gap-1 shadow-sm">
                                                <i className="fas fa-star text-yellow-500 text-xs"></i>
                                                <span>{product.rating}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        {/* Product Title */}
                                        <h4 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h4>

                                        {/* Product Description */}
                                        <p className="text-gray text-sm mb-3 line-clamp-2">{product.description}</p>

                                        {/* Price Section with Discount */}
                                        <div className="mb-3">
                                            {hasOffer && product.original_price ? (
                                                <>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-primary font-bold text-2xl">₹{product.price}</span>
                                                        <span className="text-gray line-through text-sm">₹{product.original_price}</span>
                                                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                            {discount}% OFF
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-green-600 mt-1">
                                                        <i className="fas fa-save mr-1"></i> You save: ₹{product.original_price - product.price}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-primary font-bold text-2xl">₹{product.price}</div>
                                            )}
                                        </div>

                                        {/* Offer End Date Timer */}
                                        {hasOffer && product.offer_end_date && daysLeft > 0 && daysLeft <= 7 && (
                                            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                                                    <i className="fas fa-hourglass-half"></i>
                                                    <span className="font-semibold">Hurry up!</span>
                                                    <span>Offer ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* EMI / Easy Payment Info */}
                                        <div className="mb-3 text-xs text-gray-500">
                                            <i className="fas fa-credit-card mr-1"></i>
                                            No Cost EMI available | Free Shipping
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button onClick={() => addToCart(product.id)} className="btn w-full py-2.5 text-center group-hover:shadow-lg transition-all">
                                            Add to Cart <i className="fas fa-shopping-cart ml-2"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/products" className="btn">Shop All Products</Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Dynamic */}
            <section className="section-padding bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2>What Our Clients Say</h2>
                        <p>Real feedback from our valued customers</p>
                    </div>
                    <TestimonialCarousel testimonials={testimonials} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Ready for Your Beauty Transformation?</h2>
                    <p className="text-white/90 text-lg mb-8">Book your appointment today and experience the Crazy Nails difference</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/booking" className="btn bg-white text-primary hover:bg-accent">
                            <i className="fas fa-calendar-check mr-2"></i> Book Now
                        </Link>
                        <a
                            href="tel:8264304266"
                            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg"
                        >
                            <i className="fas fa-phone-alt"></i> Call Now: 8264304266
                        </a>
                    </div>
                </div>
            </section>

            {/* WhatsApp Float Button */}
            <a
                href="https://wa.me/918264304266?text=Hello%20Crazy%20Nails%20%26%20Lashes!%20I%20would%20like%20to%20book%20an%20appointment"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center text-2xl shadow-lg z-[1000] transition-all duration-300 hover:scale-110 hover:shadow-xl animate-float"
            >
                <i className="fab fa-whatsapp"></i>
            </a>
        </>
    );
};

export default Home;