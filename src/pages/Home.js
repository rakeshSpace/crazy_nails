import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const Home = () => {
    const [services, setServices] = useState([]);
    const [products, setProducts] = useState([]);
    const [testimonials, setTestimonials] = useState([]);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [servicesRes, productsRes] = await Promise.all([
                api.get('/services'),
                api.get('/products?featured=true&limit=4')
            ]);
            setServices(servicesRes.data.slice(0, 4));
            setProducts(productsRes.data);

            // Mock testimonials (in production, fetch from API)
            setTestimonials([
                { id: 1, name: 'Priya Sharma', role: 'Regular Client', comment: 'Best nail salon in town! Their attention to detail is amazing.', rating: 5 },
                { id: 2, name: 'Rohit Verma', role: 'New Client', comment: 'The eyelash extensions look so natural and lasted perfectly.', rating: 5 },
                { id: 3, name: 'Anjali Mehta', role: 'VIP Member', comment: 'Been coming here for 2 years. Consistent quality and friendly staff.', rating: 5 }
            ]);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const carouselSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        arrows: true,
        fade: true
    };

    const heroSlides = [
        {
            title: "Reveal Your Beautiful Self",
            description: "Where artistry meets perfection. Premium nail care, stunning eyelash extensions, and rejuvenating beauty treatments tailored just for you.",
            bgImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035"
        },
        {
            title: "Expert Nail Artistry",
            description: "Experience the finest nail extensions, custom designs, and premium finishes that reflect your unique style.",
            bgImage: "https://images.unsplash.com/photo-1604654894610-df63bc536371"
        },
        {
            title: "Stunning Lash Extensions",
            description: "Enhance your natural beauty with our classic, volume, and mega volume eyelash extensions for captivating eyes.",
            bgImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348"
        }
    ];

    return (
        <>
            {/* Hero Carousel */}
            <section className="relative h-[89vh] min-h-[600px] max-h-[800px] overflow-hidden mt-20">
                <Slider {...carouselSettings} className="h-full">
                    {heroSlides.map((slide, index) => (
                        <div key={index} className="relative h-[89vh] min-h-[600px]">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-[8s] scale-110"
                                style={{ backgroundImage: `url(${slide.bgImage}?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)` }}
                            >
                                <div className="absolute inset-0 bg-black/50"></div>
                            </div>
                            <div className="relative z-10 h-full flex items-center px-4 md:px-10">
                                <div className="container mx-auto max-w-7xl">
                                    <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-4 animate-slide-up">{slide.title}</h1>
                                    <p className="text-white/90 text-base md:text-lg mb-8 max-w-xl animate-slide-up">{slide.description}</p>
                                    <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                                        <Link to="/booking" className="btn btn-large">Book Appointment</Link>
                                        <Link to="/services" className="btn-outline btn-large">View Services</Link>
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

            {/* Featured Services */}
            <section id="featured-services" className="section-padding bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2>Our Premium Services</h2>
                        <p>Experience excellence with our specialized beauty treatments</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {services.map(service => (
                            <div key={service.id} className="bg-white dark:bg-dark-light rounded-2xl p-8 text-center shadow-soft hover:shadow-medium transition-all hover:-translate-y-2 border border-light-gray dark:border-gray-700">
                                <div className="w-16 h-16 bg-gradient-light dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <i className="fas fa-spa text-2xl text-primary"></i>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
                                <p className="text-gray text-sm mb-4">{service.description}</p>
                                <p className="text-primary font-bold text-xl mb-4">₹{service.price}</p>
                                <Link to={`/booking?service=${service.id}`} className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                                    Book Now <i className="fas fa-arrow-right text-sm"></i>
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/services" className="btn">View All Services</Link>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
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

            {/* Featured Products */}
            <section className="section-padding bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2>Our Beauty Products</h2>
                        <p>Shop premium beauty products for your home care routine</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {products.map(product => (
                            <div key={product.id} className="bg-white dark:bg-dark-light rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all hover:-translate-y-2 border border-light-gray dark:border-gray-700">
                                <div className="h-48 bg-gradient-light dark:bg-primary/20 flex items-center justify-center relative">
                                    {product.badge && (
                                        <span className="absolute top-3 right-3 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold px-3 py-1 rounded-full">{product.badge}</span>
                                    )}
                                    <i className="fas fa-spa text-5xl text-primary"></i>
                                </div>
                                <div className="p-5">
                                    <h4 className="text-lg font-semibold mb-2 line-clamp-1">{product.name}</h4>
                                    <p className="text-gray text-sm mb-3 line-clamp-2">{product.description}</p>
                                    <div className="text-primary font-bold text-xl mb-4">₹{product.price}</div>
                                    <button onClick={() => addToCart(product.id)} className="btn w-full py-2 text-sm">Add to Cart</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/products" className="btn">Shop All Products</Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section-padding bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2>What Our Clients Say</h2>
                        <p>Real feedback from our valued customers</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {testimonials.map(testimonial => (
                            <div key={testimonial.id} className="bg-white dark:bg-dark rounded-2xl p-8 shadow-soft">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={`fas fa-star ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                    ))}
                                </div>
                                <p className="text-dark dark:text-white mb-6 italic">"{testimonial.comment}"</p>
                                <div>
                                    <h4 className="font-semibold mb-1">{testimonial.name}</h4>
                                    <p className="text-primary text-sm mb-0">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Ready for Your Beauty Transformation?</h2>
                    <p className="text-white/90 text-lg mb-8">Book your appointment today and experience the Crazy Nails difference</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/booking" className="btn-book">Book Now</Link>
                        <a href="tel:8264304266" className="btn btn-call">
                            <i className="fas fa-phone-alt"></i> Call Now
                        </a>
                    </div>
                </div>
            </section>

            {/* WhatsApp Float */}
            <a href="https://wa.me/8264304206?text=Hello%20Crazy%20Nails%20%26%20Lashes!%20I%20would%20like%20to%20book%20an%20appointment" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center text-2xl shadow-medium z-[1000] transition-all duration-300 hover:scale-110 animate-float">
                <i className="fab fa-whatsapp"></i>
            </a>
        </>
    );
};

export default Home;