import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        site_name: 'Crazy Nails & Lashes',
        site_email: 'info@crazynails.com',
        site_phone: '8264304266',
        site_address: 'Beauty Parlour Street, City Center',
        working_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
        base_delivery_charge: '100',
        free_delivery_threshold: '2000',
        estimated_delivery_days: '3-5',
        cod_available: 'true',
        google_analytics_id: '',
        facebook_pixel_id: '',
        meta_description: 'Premium beauty salon specializing in nail extensions, eyelash treatments, and beauty services',
        meta_keywords: 'nail salon, eyelash extensions, beauty salon, nail art, manicure, pedicure',
        whatsapp_number: '918264304266',
        instagram_url: 'https://instagram.com/crazynails',
        facebook_url: 'https://facebook.com/crazynails',
        twitter_url: 'https://twitter.com/crazynails',
        youtube_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', name: 'General Settings', icon: 'fa-globe' },
        { id: 'delivery', name: 'Delivery Settings', icon: 'fa-truck' },
        { id: 'seo', name: 'SEO Settings', icon: 'fa-search' },
        { id: 'social', name: 'Social Media', icon: 'fa-share-alt' },
        { id: 'integrations', name: 'Integrations', icon: 'fa-plug' }
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            if (response.data) {
                setSettings(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked.toString() : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/settings', settings);
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Site Settings</h2>
                <button onClick={handleSubmit} disabled={loading} className="btn btn-small">
                    {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</> : 'Save All Settings'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium transition-all ${
                            activeTab === tab.id
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-600 hover:text-primary'
                        }`}
                    >
                        <i className={`fas ${tab.icon} mr-2`}></i>
                        {tab.name}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {/* General Settings Tab */}
                {activeTab === 'general' && (
                    <div className="bg-white dark:bg-dark rounded-xl shadow-soft p-6">
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Site Name</label>
                            <input
                                type="text"
                                name="site_name"
                                value={settings.site_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Site Email</label>
                            <input
                                type="email"
                                name="site_email"
                                value={settings.site_email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Contact Phone</label>
                            <input
                                type="text"
                                name="site_phone"
                                value={settings.site_phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">WhatsApp Number</label>
                            <input
                                type="text"
                                name="whatsapp_number"
                                value={settings.whatsapp_number}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="918264304266"
                            />
                            <p className="text-xs text-gray mt-1">Include country code without +</p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Site Address</label>
                            <textarea
                                name="site_address"
                                value={settings.site_address}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            ></textarea>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Working Hours</label>
                            <input
                                type="text"
                                name="working_hours"
                                value={settings.working_hours}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Mon-Sat: 9AM-8PM, Sun: 10AM-6PM"
                            />
                        </div>
                    </div>
                )}

                {/* Delivery Settings Tab */}
                {activeTab === 'delivery' && (
                    <div className="bg-white dark:bg-dark rounded-xl shadow-soft p-6">
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Base Delivery Charge (₹)</label>
                            <input
                                type="number"
                                name="base_delivery_charge"
                                value={settings.base_delivery_charge}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            />
                            <p className="text-xs text-gray mt-1">Delivery charge for orders below free threshold</p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Free Delivery Threshold (₹)</label>
                            <input
                                type="number"
                                name="free_delivery_threshold"
                                value={settings.free_delivery_threshold}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            />
                            <p className="text-xs text-gray mt-1">Orders above this amount get free delivery</p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Estimated Delivery Days</label>
                            <input
                                type="text"
                                name="estimated_delivery_days"
                                value={settings.estimated_delivery_days}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="3-5"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="cod_available"
                                    checked={settings.cod_available === 'true'}
                                    onChange={(e) => setSettings({ ...settings, cod_available: e.target.checked.toString() })}
                                    className="w-4 h-4"
                                />
                                <span className="font-medium">Enable Cash on Delivery</span>
                            </label>
                        </div>

                        {/* Delivery Partners */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold mb-3">Delivery Partners</h4>
                            <div className="flex flex-wrap gap-2">
                                {['DTDC', 'BlueDart', 'Delhivery', 'SpeedPost', 'XpressBees', 'Amazon Shipping'].map(partner => (
                                    <label key={partner} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-dark-light rounded-lg cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" defaultChecked />
                                        <span className="text-sm">{partner}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SEO Settings Tab */}
                {activeTab === 'seo' && (
                    <div className="bg-white dark:bg-dark rounded-xl shadow-soft p-6">
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Meta Description</label>
                            <textarea
                                name="meta_description"
                                value={settings.meta_description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            ></textarea>
                            <p className="text-xs text-gray mt-1">Recommended length: 150-160 characters</p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Meta Keywords</label>
                            <textarea
                                name="meta_keywords"
                                value={settings.meta_keywords}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Comma separated keywords"
                            ></textarea>
                        </div>
                    </div>
                )}

                {/* Social Media Tab */}
                {activeTab === 'social' && (
                    <div className="bg-white dark:bg-dark rounded-xl shadow-soft p-6">
                        <div className="mb-4">
                            <label className="block font-medium mb-2">
                                <i className="fab fa-instagram text-pink-600 mr-2"></i> Instagram URL
                            </label>
                            <input
                                type="url"
                                name="instagram_url"
                                value={settings.instagram_url}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="https://instagram.com/yourusername"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">
                                <i className="fab fa-facebook text-blue-600 mr-2"></i> Facebook URL
                            </label>
                            <input
                                type="url"
                                name="facebook_url"
                                value={settings.facebook_url}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="https://facebook.com/yourpage"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">
                                <i className="fab fa-twitter text-blue-400 mr-2"></i> Twitter URL
                            </label>
                            <input
                                type="url"
                                name="twitter_url"
                                value={settings.twitter_url}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="https://twitter.com/yourhandle"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">
                                <i className="fab fa-youtube text-red-600 mr-2"></i> YouTube URL
                            </label>
                            <input
                                type="url"
                                name="youtube_url"
                                value={settings.youtube_url}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="https://youtube.com/c/yourchannel"
                            />
                        </div>
                    </div>
                )}

                {/* Integrations Tab */}
                {activeTab === 'integrations' && (
                    <div className="bg-white dark:bg-dark rounded-xl shadow-soft p-6">
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Google Analytics ID</label>
                            <input
                                type="text"
                                name="google_analytics_id"
                                value={settings.google_analytics_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="G-XXXXXXXXXX"
                            />
                            <p className="text-xs text-gray mt-1">Paste your Google Analytics 4 measurement ID</p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block font-medium mb-2">Facebook Pixel ID</label>
                            <input
                                type="text"
                                name="facebook_pixel_id"
                                value={settings.facebook_pixel_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                placeholder="XXXXXXXXXXXXX"
                            />
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold mb-3">Razorpay Settings</h4>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Razorpay Key ID (Test)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="rzp_test_xxxxxxxxxx"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Razorpay Key Secret (Test)</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="xxxxxxxxxxxxxxxxxxxx"
                                />
                            </div>
                            <p className="text-xs text-gray">Get your API keys from <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-primary">Razorpay Dashboard</a></p>
                        </div>
                    </div>
                )}

                {/* Save Button at bottom */}
                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={loading} className="btn">
                        {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</> : 'Save All Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;