import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-r from-dark to-dark-light text-white pt-16 pb-4 mt-auto">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">

                            {/* Full Logo */}
                            <img
                                src="/logo.png"
                                alt="Crazy Nails Logo"
                                className="h-16 w-auto object-contain"
                            />

                            <div>
                                <h3 className="text-xl font-bold mb-1">
                                    Crazy Nails
                                </h3>

                                <p className="text-white/70 text-xs mb-0">
                                    Beauty & Nail Salon
                                </p>
                            </div>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed mb-5">
                            Your premier destination for premium beauty and wellness services in the heart of the city.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-all">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-all">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-all">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-all">
                                <i className="fab fa-pinterest"></i>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-primary">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-white/70 hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/services" className="text-white/70 hover:text-primary transition-colors">Services</Link></li>
                            <li><Link to="/products" className="text-white/70 hover:text-primary transition-colors">Products</Link></li>
                            <li><Link to="/gallery" className="text-white/70 hover:text-primary transition-colors">Gallery</Link></li>
                            <li><Link to="/about" className="text-white/70 hover:text-primary transition-colors">Why Choose Us</Link></li>
                            <li><Link to="/booking" className="text-white/70 hover:text-primary transition-colors">Booking</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-primary">Our Services</h4>
                        <ul className="space-y-2">
                            <li><Link to="/services#nails" className="text-white/70 hover:text-primary transition-colors">Nail Extensions</Link></li>
                            <li><Link to="/services#lashes" className="text-white/70 hover:text-primary transition-colors">Eyelash Extensions</Link></li>
                            <li><Link to="/services#facials" className="text-white/70 hover:text-primary transition-colors">Facials & Skin Care</Link></li>
                            <li><Link to="/services#waxing" className="text-white/70 hover:text-primary transition-colors">Waxing & Threading</Link></li>
                            <li><Link to="/services#mani-pedi" className="text-white/70 hover:text-primary transition-colors">Manicure & Pedicure</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 relative pb-2 after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-primary">Contact Info</h4>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-white/70">
                                <i className="fas fa-map-marker-alt text-primary mt-1"></i>
                                <span>Beauty Parlour Street, City Center</span>
                            </li>
                            <li className="flex gap-3 text-white/70">
                                <i className="fas fa-phone-alt text-primary mt-1"></i>
                                <div>
                                    <a href="tel:8264304266" className="hover:text-primary">8264304266</a> / <a href="tel:8264304206" className="hover:text-primary">8264304206</a>
                                </div>
                            </li>
                            <li className="flex gap-3 text-white/70">
                                <i className="fas fa-envelope text-primary mt-1"></i>
                                <a href="mailto:info@crazynails.com" className="hover:text-primary">info@crazynails.com</a>
                            </li>
                            <li className="flex gap-3 text-white/70">
                                <i className="fas fa-clock text-primary mt-1"></i>
                                <div>
                                    <div>Mon-Sat: 9AM-8PM</div>
                                    <div>Sun: 10AM-6PM</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="text-center pt-6 border-t border-white/10">
                    <p className="text-white/60 text-sm mb-0">&copy; {currentYear} Crazy Nails. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;