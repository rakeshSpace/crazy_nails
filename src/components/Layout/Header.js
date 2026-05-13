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
        { to: '/about', label: 'Why Choose Us' }
    ];

    return (
        <header className={`fixed top-0 w-full z-[1000] transition-all duration-300 ${isScrolled ? 'bg-white/98 shadow-soft py-2' : 'bg-white py-3'} dark:bg-dark`}>
            <div className="container mx-auto px-4 max-w-7xl">
                <nav className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 hover:-translate-y-0.5 transition-all">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white text-xl shadow-soft">
                            <i className="fas fa-crown"></i>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-dark dark:text-white mb-0">Crazy Nails & Lashes</h1>
                            <p className="text-xs text-primary uppercase tracking-wider mb-0">Beauty & Nail Salon</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
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

                    {/* Right side buttons */}
                    <div className="flex items-center gap-3">
                        {/* Dark mode toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-9 h-9 rounded-full bg-light dark:bg-dark-light flex items-center justify-center hover:bg-accent dark:hover:bg-primary/20 transition-all"
                        >
                            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-primary`}></i>
                        </button>

                        {/* Auth buttons */}
                        {isAuthenticated ? (
                            <div className="relative group hidden lg:block">
                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-light dark:bg-dark-light">
                                    <i className="fas fa-user-circle text-primary text-xl"></i>
                                    <span className="text-dark dark:text-white">{user?.name?.split(' ')[0]}</span>
                                    <i className="fas fa-chevron-down text-xs text-gray"></i>
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-light rounded-xl shadow-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <Link to="/profile" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">My Profile</Link>
                                    <Link to="/my-bookings" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">My Bookings</Link>
                                    {user?.role === 'admin' && (
                                        <Link to="/admin" className="block px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors">Admin Panel</Link>
                                    )}
                                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-light dark:hover:bg-dark transition-colors text-red-500">Logout</button>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden lg:flex gap-2">
                                <Link to="/login" className="px-4 py-1.5 text-primary font-medium hover:bg-light dark:hover:bg-dark-light rounded-full transition-colors">Login</Link>
                                <Link to="/register" className="btn-small">Sign Up</Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden w-9 h-9 rounded-full bg-light dark:bg-dark-light flex items-center justify-center"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-primary`}></i>
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation */}
                <div className={`lg:hidden fixed top-[73px] left-0 w-full bg-white dark:bg-dark shadow-medium transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                    <ul className="flex flex-col p-4">
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
                            <Link to="/booking" className="btn-book block text-center mt-2" onClick={() => setIsMenuOpen(false)}>Book Now</Link>
                        </li>
                        {!isAuthenticated && (
                            <>
                                <li><Link to="/login" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>Login</Link></li>
                                <li><Link to="/register" className="btn-small block text-center mt-2" onClick={() => setIsMenuOpen(false)}>Sign Up</Link></li>
                            </>
                        )}
                        {isAuthenticated && (
                            <>
                                <li><Link to="/profile" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>My Profile</Link></li>
                                <li><Link to="/my-bookings" className="block py-3 text-dark dark:text-white" onClick={() => setIsMenuOpen(false)}>My Bookings</Link></li>
                                <li><button onClick={() => { logout(); setIsMenuOpen(false); }} className="block py-3 text-red-500">Logout</button></li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;