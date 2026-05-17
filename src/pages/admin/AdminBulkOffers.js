import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminBulkOffers = () => {
    const [activeTab, setActiveTab] = useState('bulk');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bulkOffers, setBulkOffers] = useState([]);
    const [formData, setFormData] = useState({
        discount_type: 'percentage',
        discount_value: '',
        applicable_on: 'products',
        category: '',
        min_quantity: 1,
        max_discount_amount: '',
        offer_badge: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        apply_to: 'all'
    });

    useEffect(() => {
        fetchCategories();
        fetchBulkOffers();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/bulk-offers/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchBulkOffers = async () => {
        try {
            const response = await api.get('/bulk-offers');
            setBulkOffers(response.data);
        } catch (error) {
            console.error('Failed to fetch bulk offers:', error);
        }
    };

    const applyToAllProducts = async () => {
        if (!formData.discount_value) {
            toast.error('Please enter discount percentage');
            return;
        }
        
        if (!window.confirm('⚠️ WARNING: This will apply this offer to ALL products in your store!\n\nAre you sure you want to continue?')) return;
        
        setLoading(true);
        try {
            await api.post('/bulk-offers/apply-all', {
                discount_percent: formData.discount_value,
                offer_badge: formData.offer_badge,
                end_date: formData.end_date
            });
            toast.success(`✅ Offer applied to ALL products successfully!`);
            setFormData({
                ...formData,
                discount_value: '',
                offer_badge: '',
                end_date: ''
            });
        } catch (error) {
            toast.error('Failed to apply offer');
        } finally {
            setLoading(false);
        }
    };

    const applyToCategory = async () => {
        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }
        if (!formData.discount_value) {
            toast.error('Please enter discount percentage');
            return;
        }
        
        setLoading(true);
        try {
            await api.post('/bulk-offers/apply-category', {
                category: formData.category,
                discount_percent: formData.discount_value,
                offer_badge: formData.offer_badge,
                end_date: formData.end_date
            });
            toast.success(`✅ Offer applied to ${formData.category} category successfully!`);
        } catch (error) {
            toast.error('Failed to apply offer');
        } finally {
            setLoading(false);
        }
    };

    const removeAllOffers = async () => {
        if (!window.confirm('🚨 DANGER: This will REMOVE ALL OFFERS from ALL products in your store!\n\nThis action CANNOT be undone.\n\nAre you absolutely sure you want to continue?')) return;
        
        setLoading(true);
        try {
            await api.delete('/bulk-offers/remove-all');
            toast.success('✅ All offers removed successfully!');
        } catch (error) {
            toast.error('Failed to remove offers');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Bulk Offer Management</h2>
                <p className="text-gray">Apply offers to thousands of products in seconds</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-light-gray dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('bulk')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'bulk'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray hover:text-primary'
                    }`}
                >
                    <i className="fas fa-layer-group mr-2"></i> Bulk Apply
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'history'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray hover:text-primary'
                    }`}
                >
                    <i className="fas fa-history mr-2"></i> Offer History
                </button>
            </div>

            {/* Bulk Apply Tab */}
            {activeTab === 'bulk' && (
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                            <p className="text-gray text-sm">Total Categories</p>
                            <p className="text-2xl font-bold">{categories.length}</p>
                        </div>
                        <div className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                            <p className="text-gray text-sm">Active Bulk Offers</p>
                            <p className="text-2xl font-bold">{bulkOffers.length}</p>
                        </div>
                    </div>

                    {/* Apply to All Products */}
                    <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft border border-light-gray dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <i className="fas fa-globe text-primary"></i> Apply to ALL Products
                        </h3>
                        <p className="text-gray text-sm mb-4">Apply discount to every product in your store at once</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block font-medium mb-2">Discount Percentage (%)</label>
                                <input
                                    type="number"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., 20"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Offer Badge Text</label>
                                <input
                                    type="text"
                                    value={formData.offer_badge}
                                    onChange={(e) => setFormData({ ...formData, offer_badge: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., Mega Sale!"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Valid Until (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        
                        <button 
                            onClick={applyToAllProducts} 
                            disabled={loading || !formData.discount_value}
                            className="btn w-full md:w-auto"
                        >
                            <i className="fas fa-rocket mr-2"></i> Apply to All Products
                        </button>
                    </div>

                    {/* Apply by Category */}
                    <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft border border-light-gray dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <i className="fas fa-folder-tree text-primary"></i> Apply by Category
                        </h3>
                        <p className="text-gray text-sm mb-4">Apply discount to all products in a specific category</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block font-medium mb-2">Select Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map(cat => (
                                        <option key={cat.category} value={cat.category}>
                                            {cat.category.toUpperCase()} ({cat.count} products)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Discount Percentage (%)</label>
                                <input
                                    type="number"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., 20"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Offer Badge Text</label>
                                <input
                                    type="text"
                                    value={formData.offer_badge}
                                    onChange={(e) => setFormData({ ...formData, offer_badge: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., Category Sale!"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Valid Until (Optional)</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        
                        <button 
                            onClick={applyToCategory} 
                            disabled={loading || !formData.category || !formData.discount_value}
                            className="btn w-full md:w-auto"
                        >
                            <i className="fas fa-tag mr-2"></i> Apply to Selected Category
                        </button>
                    </div>

                    {/* Danger Zone - Remove All Offers */}
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border-2 border-red-300 dark:border-red-800">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                            <i className="fas fa-exclamation-triangle"></i> Danger Zone
                        </h3>
                        <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                            ⚠️ This action will remove ALL offers from ALL products in your store. This cannot be undone.
                        </p>
                        
                        <button 
                            onClick={removeAllOffers} 
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <i className="fas fa-trash-alt"></i> Remove All Offers
                        </button>
                    </div>

                    {/* Category List */}
                    <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft border border-light-gray dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Categories Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {categories.map(cat => (
                                <div 
                                    key={cat.category} 
                                    className="p-3 bg-light dark:bg-dark-light rounded-lg cursor-pointer hover:bg-primary/10 transition-all border border-light-gray dark:border-gray-700"
                                    onClick={() => {
                                        setFormData({ ...formData, category: cat.category });
                                        window.scrollTo({ top: document.getElementById('category-section')?.offsetTop, behavior: 'smooth' });
                                    }}
                                >
                                    <p className="font-semibold capitalize">{cat.category}</p>
                                    <p className="text-sm text-gray">{cat.count} products</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Offer History Tab */}
            {activeTab === 'history' && (
                <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft border border-light-gray dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Previous Bulk Offers</h3>
                    {bulkOffers.length === 0 ? (
                        <div className="text-center py-8">
                            <i className="fas fa-clock text-4xl text-gray-300 mb-3"></i>
                            <p className="text-gray">No bulk offers created yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bulkOffers.map(offer => (
                                <div key={offer.id} className="border border-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-all">
                                    <div className="flex justify-between items-start flex-wrap gap-3">
                                        <div>
                                            <h4 className="font-semibold text-lg">{offer.name}</h4>
                                            <p className="text-sm text-gray mt-1">
                                                {offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                                {offer.category && ` on ${offer.category.toUpperCase()}`}
                                            </p>
                                            {offer.offer_badge && (
                                                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                                    {offer.offer_badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray">
                                                📅 {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                                            </p>
                                            <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                                                offer.is_active 
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                {offer.is_active ? '● Active' : '○ Expired'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBulkOffers;