import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await updateProfile(formData);
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>My Profile | Crazy Nails & Lashes</title>
                <meta name="description" content="Manage your profile information, view booking history, and update account settings." />
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-large overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-user-circle text-5xl text-primary"></i>
                            </div>
                            <h1 className="text-white text-2xl font-bold">{user?.name}</h1>
                            <p className="text-white/80">{user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                                {user?.role === 'admin' ? 'Administrator' : user?.role === 'staff' ? 'Staff Member' : 'Customer'}
                            </span>
                        </div>
                        
                        <div className="p-8">
                            <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray mt-1">Email cannot be changed. Contact support for assistance.</p>
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block font-medium mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn py-3 px-8 disabled:opacity-50"
                                >
                                    {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</> : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Profile;