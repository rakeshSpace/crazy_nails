import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { getItemCount } = useCart();
    const { darkMode, toggleDarkMode } = useTheme();
    const location = useLocation();

    // Check if current page is admin
    const isAdminPage = location.pathname.startsWith('/admin');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/services', label: 'Services' },
        { to: '/products', label: 'Products' },
        { to: '/gallery', label: 'Gallery' },
        { to: '/about', label: 'Why Choose Us' },
        // { to: '/franchise', label: 'Franchise' },
        { to: '/courses', label: 'Training' }
        
    ];

    return (
        <header 
            className={`fixed top-0 w-full transition-all duration-300 ${
                isScrolled ? 'bg-white/98 shadow-soft py-2' : 'bg-white py-3'
            } dark:bg-dark ${
                isAdminPage ? 'z-40' : 'z-[1000]'
            }`}
        >
            <div className="container mx-auto px-4 max-w-7xl">
                <nav className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 hover:-translate-y-0.5 transition-all">
                        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden shadow-soft flex items-center justify-center p-1">
                            <img
                                src="/logo.png"
                                alt="Crazy Nails Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-dark dark:text-white mb-0">
                                Crazy Nails
                            </h1>
                            <p className="text-xs text-primary uppercase tracking-wider mb-0">
                                Beauty & Nail Salon
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Hide on admin pages */}
                    {!isAdminPage && (
                        <ul className="hidden lg:flex items-center gap-1">
                            {navLinks.map(link => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className={`px-3 py-1.5 font-medium relative ${location.pathname === link.to ? 'text-primary' : 'text-dark dark:text-white'} hover:text-primary transition-colors`}
                                    >
                                        {link.label}
                                        {location.pathname === link.to && (
                                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary"></span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link to="/booking" className="btn-book ml-2">Book Now</Link>
                            </li>
                            <li className="relative ml-2">
                                <Link to="/cart" className="w-9 h-9 bg-light dark:bg-dark-light rounded-full flex items-center justify-center hover:bg-accent dark:hover:bg-primary/20 transition-all">
                                    <i className="fas fa-shopping-cart text-primary"></i>
                                    {getItemCount() > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-primary to-secondary text-white rounded-full text-xs flex items-center justify-center">
                                            {getItemCount()}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        </ul>
                    )}

                    {/* Right side buttons */}
                    <div className="flex items-center gap-3">
                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-9 h-9 rounded-full bg-light dark:bg-dark-light flex items-center justify-center hover:bg-accent dark:hover:bg-primary/20 transition-all"
                            aria-label="Toggle dark mode"
                        >
                            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-primary`}></i>
                        </button>

                        {/* Auth buttons - Show on non-admin pages or if admin is not in admin panel */}
                        {!isAdminPage && (
                            <>
                                {isAuthenticated ? (
                                    <div className="relative group hidden lg:block">
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-light dark:bg-dark-light">
                                            <i className="fas fa-user-circle text-primary text-xl"></i>
                                            <span className="text-dark dark:text-white">{user?.name?.split(' ')[0]}</span>
                                            <i className="fas fa-chevron-down text-xs text-gray"></i>
                                        </button>
                                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-light rounded-xl shadow-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                            <Link to="/profile" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">
                                                <i className="fas fa-user mr-2 w-4"></i> My Profile
                                            </Link>
                                            <Link to="/my-bookings" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">
                                                <i className="fas fa-calendar-alt mr-2 w-4"></i> My Bookings
                                            </Link>
                                            <Link to="/my-learning" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">
                                                <i className="fas fa-graduation-cap mr-2 w-4"></i> My Learning
                                            </Link>
                                            <Link to="/my-certificates" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">
                                                <i className="fas fa-certificate mr-2 w-4"></i> My Certificates
                                            </Link>
                                            <Link to="/my-orders" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">
                                                <i className="fas fa-shopping-bag mr-2 w-4"></i> My Orders
                                            </Link>
                                            <div className="border-t border-light-gray dark:border-gray-700 my-1"></div>
                                            {user?.role === 'admin' && (
                                                <>
                                                    <Link to="/admin" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">
                                                        <i className="fas fa-tachometer-alt mr-2 w-4"></i> Admin Panel
                                                    </Link>
                                                    <div className="border-t border-light-gray dark:border-gray-700 my-1"></div>
                                                </>
                                            )}
                                            <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors text-red-500">
                                                <i className="fas fa-sign-out-alt mr-2 w-4"></i> Logout
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="hidden lg:flex gap-2">
                                        <Link to="/login" className="px-4 py-1.5 text-primary font-medium hover:bg-light dark:hover:bg-dark-light rounded-full transition-colors">Login</Link>
                                        <Link to="/register" className="btn-small">Sign Up</Link>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Admin back to site button */}
                        {isAdminPage && (
                            <Link to="/" className="hidden lg:block px-4 py-1.5 text-primary font-medium hover:bg-light dark:hover:bg-dark-light rounded-full transition-colors">
                                <i className="fas fa-arrow-left mr-2"></i> Back to Site
                            </Link>
                        )}

                        {/* Mobile menu button - Hide on admin pages */}
                        {!isAdminPage && (
                            <button
                                className="lg:hidden w-9 h-9 rounded-full bg-light dark:bg-dark-light flex items-center justify-center"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-primary`}></i>
                            </button>
                        )}
                    </div>
                </nav>

                {/* Mobile Navigation - Only on non-admin pages */}
                {!isAdminPage && (
                    <div className={`lg:hidden fixed top-[73px] left-0 w-full bg-white dark:bg-dark shadow-medium transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                        <ul className="flex flex-col p-4 max-h-[calc(100vh-73px)] overflow-y-auto">
                            {navLinks.map(link => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className={`block py-3 ${location.pathname === link.to ? 'text-primary' : 'text-dark dark:text-white'}`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link to="/booking" className="btn-book block text-center mt-2" onClick={() => setIsMenuOpen(false)}>
                                    <i className="fas fa-calendar-check mr-2"></i> Book Now
                                </Link>
                            </li>
                            
                            {!isAuthenticated && (
                                <>
                                    <li className="mt-4 pt-4 border-t border-light-gray dark:border-gray-700">
                                        <Link to="/login" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>
                                            <i className="fas fa-sign-in-alt mr-2 w-5"></i> Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/register" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>
                                            <i className="fas fa-user-plus mr-2 w-5"></i> Sign Up
                                        </Link>
                                    </li>
                                </>
                            )}
                            
                            {isAuthenticated && (
                                <>
                                    <li className="mt-4 pt-4 border-t border-light-gray dark:border-gray-700">
                                        <Link to="/profile" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>
                                            <i className="fas fa-user mr-2 w-5"></i> My Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-bookings" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>
                                            <i className="fas fa-calendar-alt mr-2 w-5"></i> My Bookings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-learning" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>
                                            <i className="fas fa-graduation-cap mr-2 w-5"></i> My Learning
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-certificates" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>
                                            <i className="fas fa-certificate mr-2 w-5"></i> My Certificates
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-orders" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>
                                            <i className="fas fa-shopping-bag mr-2 w-5"></i> My Orders
                                        </Link>
                                    </li>
                                    {user?.role === 'admin' && (
                                        <li>
                                            <Link to="/admin" className="block py-3 text-primary" onClick={() => setIsMenuOpen(false)}>
                                                <i className="fas fa-tachometer-alt mr-2 w-5"></i> Admin Panel
                                            </Link>
                                        </li>
                                    )}
                                    <li className="border-t border-light-gray dark:border-gray-700 mt-2 pt-2">
                                        <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left py-3 text-red-500">
                                            <i className="fas fa-sign-out-alt mr-2 w-5"></i> Logout
                                        </button>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;