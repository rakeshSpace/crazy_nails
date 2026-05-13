import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setLoading(true);
        const { confirmPassword, ...submitData } = formData;
        const success = await register(submitData);
        if (success) {
            navigate('/');
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Register | Crazy Nails & Lashes</title>
                <meta name="description" content="Create an account at Crazy Nails & Lashes to book appointments, save favorites, and get exclusive offers." />
            </Helmet>

            <section className="min-h-screen flex items-center justify-center py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-md">
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-large p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-crown text-white text-2xl"></i>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Create Account</h1>
                            <p className="text-gray">Join us for exclusive beauty offers</p>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light ${
                                        errors.name ? 'border-red-500' : 'border-light-gray dark:border-gray-700'
                                    }`}
                                    placeholder="Enter your full name"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light ${
                                        errors.email ? 'border-red-500' : 'border-light-gray dark:border-gray-700'
                                    }`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light ${
                                        errors.phone ? 'border-red-500' : 'border-light-gray dark:border-gray-700'
                                    }`}
                                    placeholder="Enter your phone number"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light ${
                                        errors.password ? 'border-red-500' : 'border-light-gray dark:border-gray-700'
                                    }`}
                                    placeholder="Create a password"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Confirm Password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-light-gray dark:border-gray-700'
                                    }`}
                                    placeholder="Confirm your password"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn py-3 text-lg font-semibold disabled:opacity-50"
                            >
                                {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Creating Account...</> : 'Sign Up'}
                            </button>
                        </form>
                        
                        <div className="text-center mt-6">
                            <p className="text-gray">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary font-semibold hover:underline">
                                    Login
                                </Link>
                            </p>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-light-gray dark:border-gray-700">
                            <p className="text-center text-gray text-xs">
                                By signing up, you agree to our <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Register;