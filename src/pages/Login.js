import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password);
        if (success) {
            navigate(from, { replace: true });
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Login | Crazy Nails & Lashes</title>
                <meta name="description" content="Login to your Crazy Nails & Lashes account to manage bookings, track orders, and access exclusive offers." />
            </Helmet>

            <section className="min-h-screen flex items-center justify-center py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-md">
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-large p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-crown text-white text-2xl"></i>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-gray">Login to your account to manage bookings</p>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                    placeholder="Enter your email"
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                    placeholder="Enter your password"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn py-3 text-lg font-semibold disabled:opacity-50"
                            >
                                {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Logging in...</> : 'Login'}
                            </button>
                        </form>
                        
                        <div className="text-center mt-6">
                            <p className="text-gray">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary font-semibold hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-light-gray dark:border-gray-700">
                            <p className="text-center text-gray text-sm">
                                <i className="fas fa-shield-alt text-primary mr-1"></i> Secure login with SSL encryption
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Login;