import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import toast from 'react-hot-toast';

const Franchise = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        investment_ready: '',
        experience: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await api.post('/franchise/apply', formData);
            toast.success('Application submitted successfully! We will contact you soon.');
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                city: '',
                state: '',
                investment_ready: '',
                experience: '',
                message: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        { icon: 'fa-chart-line', title: 'High ROI', description: 'Average ROI of 30-40% within first year' },
        { icon: 'fa-handshake', title: 'Full Support', description: 'Complete training and operational support' },
        { icon: 'fa-bullhorn', title: 'Brand Recognition', description: 'Leverage our established brand name' },
        { icon: 'fa-truck', title: 'Supply Chain', description: 'Direct access to premium products' },
        { icon: 'fa-laptop', title: 'Tech Support', description: 'Booking system and management software' },
        { icon: 'fa-chalkboard-user', title: 'Training', description: 'Regular staff training programs' }
    ];

    return (
        <>
            <Helmet>
                <title>Franchise Opportunity | Crazy Nails & Lashes</title>
                <meta name="description" content="Join Crazy Nails & Lashes franchise. Be part of India's fastest growing beauty salon chain. Complete support and training provided." />
            </Helmet>

            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 mt-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Own a Crazy Nails & Lashes Franchise</h1>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Join India's fastest growing beauty salon chain. Start your entrepreneurial journey with us!
                    </p>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
                        <p className="text-gray max-w-2xl mx-auto">Everything you need to run a successful beauty salon business</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="bg-white dark:bg-dark rounded-2xl p-6 text-center shadow-soft hover:shadow-medium transition-all">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <i className={`fas ${benefit.icon} text-2xl text-primary`}></i>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-gray">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Investment Info */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Investment Details</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Area Required</span>
                                    <span>800 - 1500 sq. ft.</span>
                                </div>
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Initial Investment</span>
                                    <span>₹15 - 25 Lakhs</span>
                                </div>
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Royalty Fee</span>
                                    <span>5% of monthly revenue</span>
                                </div>
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Ad Fee</span>
                                    <span>2% of monthly revenue</span>
                                </div>
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Agreement Period</span>
                                    <span>5 years (renewable)</span>
                                </div>
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Expected ROI</span>
                                    <span className="text-green-600">30-40% annually</span>
                                </div>
                                <div className="flex justify-between py-3 border-b">
                                    <span className="font-semibold">Break-even Period</span>
                                    <span>12-18 months</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-6">What We Provide</h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Complete salon setup and interior design support</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Comprehensive staff training and certification</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Marketing and promotional support</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Standardized operating procedures</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Booking and management software</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Regular quality audits and support visits</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Form */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">Apply for Franchise</h2>
                        <p className="text-gray">Fill out the form below and our team will get back to you within 48 hours</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-dark rounded-2xl p-8 shadow-soft">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">City *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter your city"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">State *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter your state"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Investment Ready? *</label>
                                <select
                                    name="investment_ready"
                                    value={formData.investment_ready}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select</option>
                                    <option value="yes">Yes, ready to invest</option>
                                    <option value="need_finance">Need financing assistance</option>
                                    <option value="exploring">Still exploring</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <label className="block font-medium mb-2">Previous Experience (if any)</label>
                            <textarea
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Tell us about your business or beauty industry experience"
                            ></textarea>
                        </div>
                        
                        <div className="mt-6">
                            <label className="block font-medium mb-2">Additional Message</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Any specific questions or requirements"
                            ></textarea>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn mt-6 py-3 text-lg font-semibold"
                        >
                            {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Submitting...</> : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
};

export default Franchise;