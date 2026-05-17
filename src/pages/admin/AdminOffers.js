import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminOffers = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
    const [formData, setFormData] = useState({
        is_on_offer: false,
        discount_percent: '',
        original_price: '',
        offer_badge: '',
        offer_end_date: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterItems();
    }, [products, services, searchTerm, filterStatus, activeTab]);

    const fetchData = async () => {
        try {
            const [productsRes, servicesRes] = await Promise.all([
                api.get('/products'),
                api.get('/services')
            ]);
            setProducts(productsRes.data);
            setServices(servicesRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        // Filter Products
        let filteredProd = [...products];
        
        // Search filter
        if (searchTerm) {
            filteredProd = filteredProd.filter(item => 
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.offer_badge?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Status filter
        if (filterStatus === 'active') {
            filteredProd = filteredProd.filter(item => item.is_on_offer === 1);
        } else if (filterStatus === 'inactive') {
            filteredProd = filteredProd.filter(item => item.is_on_offer !== 1);
        }
        
        setFilteredProducts(filteredProd);
        
        // Filter Services
        let filteredServ = [...services];
        
        if (searchTerm) {
            filteredServ = filteredServ.filter(item => 
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.offer_badge?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (filterStatus === 'active') {
            filteredServ = filteredServ.filter(item => item.is_on_offer === 1);
        } else if (filterStatus === 'inactive') {
            filteredServ = filteredServ.filter(item => item.is_on_offer !== 1);
        }
        
        setFilteredServices(filteredServ);
    };

    const handleEdit = (item, type) => {
        setEditingItem({ ...item, type });
        setFormData({
            is_on_offer: item.is_on_offer === 1,
            discount_percent: item.discount_percent || '',
            original_price: item.original_price || '',
            offer_badge: item.offer_badge || '',
            offer_end_date: item.offer_end_date || ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        const endpoint = editingItem.type === 'product' 
            ? `/products/${editingItem.id}` 
            : `/services/${editingItem.id}`;
        
        const updateData = {
            is_on_offer: formData.is_on_offer ? 1 : 0,
            discount_percent: formData.discount_percent || null,
            original_price: formData.original_price || null,
            offer_badge: formData.offer_badge || null,
            offer_end_date: formData.offer_end_date || null
        };

        try {
            await api.put(endpoint, updateData);
            toast.success('Offer updated successfully');
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error('Failed to update offer');
        }
    };

    const handleBulkAction = async (action) => {
        const itemsToUpdate = activeTab === 'products' ? filteredProducts : filteredServices;
        if (itemsToUpdate.length === 0) {
            toast.error('No items to update');
            return;
        }
        
        if (window.confirm(`Are you sure you want to ${action} offers for ${itemsToUpdate.length} items?`)) {
            const endpoint = activeTab === 'products' ? '/products/bulk-offer' : '/services/bulk-offer';
            try {
                await api.post(endpoint, {
                    ids: itemsToUpdate.map(item => item.id),
                    action: action // 'activate' or 'deactivate'
                });
                toast.success(`Bulk ${action} completed`);
                fetchData();
            } catch (error) {
                toast.error('Bulk action failed');
            }
        }
    };

    const renderOfferCard = (item, type) => {
        const isOfferValid = item.offer_end_date && new Date(item.offer_end_date) >= new Date();
        const daysLeft = item.offer_end_date ? 
            Math.ceil((new Date(item.offer_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
        
        return (
            <div className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft hover:shadow-medium transition-all group">
                <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-20 bg-accent rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                            <img src={`http://localhost:5000${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <i className="fas fa-spa text-2xl text-primary"></i>
                        )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                        <h4 className="font-semibold text-dark dark:text-white">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {item.is_on_offer ? (
                                <>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <i className="fas fa-check-circle text-xs"></i> Active
                                    </span>
                                    {item.discount_percent && (
                                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <i className="fas fa-tag text-xs"></i> {item.discount_percent}% OFF
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                                    <i className="fas fa-ban text-xs"></i> No Offer
                                </span>
                            )}
                            {item.is_on_offer && item.offer_badge && (
                                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                    <i className="fas fa-gift text-xs mr-1"></i> {item.offer_badge}
                                </span>
                            )}
                        </div>
                        
                        {/* Price Info */}
                        {item.is_on_offer && item.original_price ? (
                            <div className="mt-2">
                                <span className="text-primary font-bold text-lg">₹{item.price}</span>
                                <span className="text-gray line-through text-sm ml-2">₹{item.original_price}</span>
                                {item.discount_percent && (
                                    <span className="text-green-600 text-xs ml-2">Save {item.discount_percent}%</span>
                                )}
                            </div>
                        ) : (
                            <div className="mt-1">
                                <span className="text-primary font-semibold">₹{item.price}</span>
                            </div>
                        )}
                        
                        {/* Offer Validity */}
                        {item.is_on_offer && item.offer_end_date && (
                            <div className={`mt-2 text-xs flex items-center gap-1 ${daysLeft <= 3 ? 'text-red-500' : 'text-gray-500'}`}>
                                <i className="far fa-calendar-alt"></i>
                                <span>Valid until: {new Date(item.offer_end_date).toLocaleDateString()}</span>
                                {daysLeft <= 7 && daysLeft > 0 && (
                                    <span className="ml-2 font-semibold">({daysLeft} day{daysLeft !== 1 ? 's' : ''} left)</span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Action Button */}
                    <button 
                        onClick={() => handleEdit(item, type)}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-1 text-sm"
                    >
                        <i className="fas fa-edit"></i> {item.is_on_offer ? 'Edit Offer' : 'Add Offer'}
                    </button>
                </div>
            </div>
        );
    };

    // Stats calculation
    const getStats = () => {
        const currentItems = activeTab === 'products' ? products : services;
        const activeOffers = currentItems.filter(item => item.is_on_offer === 1).length;
        const expiringSoon = currentItems.filter(item => {
            if (!item.is_on_offer || !item.offer_end_date) return false;
            const daysLeft = Math.ceil((new Date(item.offer_end_date) - new Date()) / (1000 * 60 * 60 * 24));
            return daysLeft <= 7 && daysLeft > 0;
        }).length;
        
        return { total: currentItems.length, activeOffers, expiringSoon };
    };

    const stats = getStats();

    if (loading) {
        return <div className="flex justify-center py-8"><div className="loading-spinner"></div></div>;
    }

    const currentItems = activeTab === 'products' ? filteredProducts : filteredServices;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Offers & Discounts</h2>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray">Total {activeTab === 'products' ? 'Products' : 'Services'}</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <i className="fas fa-box text-3xl text-primary/50"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray">Active Offers</p>
                            <p className="text-2xl font-bold text-green-600">{stats.activeOffers}</p>
                        </div>
                        <i className="fas fa-tag text-3xl text-green-500/50"></i>
                    </div>
                </div>
                <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray">Expiring Soon (7 days)</p>
                            <p className="text-2xl font-bold text-red-600">{stats.expiringSoon}</p>
                        </div>
                        <i className="fas fa-hourglass-half text-3xl text-red-500/50"></i>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${
                        activeTab === 'products'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray hover:text-primary'
                    }`}
                >
                    <i className="fas fa-box"></i> Products
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {products.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 font-medium transition-all flex items-center gap-2 ${
                        activeTab === 'services'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray hover:text-primary'
                    }`}
                >
                    <i className="fas fa-spa"></i> Services
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {services.length}
                    </span>
                </button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Search by name or badge..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary w-64"
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                    >
                        <option value="all">All Items</option>
                        <option value="active">Active Offers</option>
                        <option value="inactive">No Offers</option>
                    </select>
                    
                    {/* Clear Filters Button */}
                    {(searchTerm || filterStatus !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                            }}
                            className="px-3 py-2 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <i className="fas fa-times mr-1"></i> Clear Filters
                        </button>
                    )}
                </div>
                
                {/* Bulk Actions */}
                {currentItems.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleBulkAction('activate')}
                            className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <i className="fas fa-check-circle mr-1"></i> Bulk Activate
                        </button>
                        <button
                            onClick={() => handleBulkAction('deactivate')}
                            className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <i className="fas fa-ban mr-1"></i> Bulk Deactivate
                        </button>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="mb-3 text-sm text-gray">
                Showing {currentItems.length} of {activeTab === 'products' ? products.length : services.length} items
            </div>

            {/* Items List */}
            {currentItems.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-dark rounded-xl">
                    <i className="fas fa-tag text-5xl text-gray-300 mb-3"></i>
                    <p className="text-gray">No {activeTab} found matching your filters</p>
                    {(searchTerm || filterStatus !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                            }}
                            className="mt-3 text-primary hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                        {currentItems.map(item => renderOfferCard(item, activeTab === 'products' ? 'product' : 'service'))}
                    </div>
                </div>
            )}

            {/* Offer Edit Modal */}
            {showModal && editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">Manage Offer: {editingItem.name}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_on_offer}
                                        onChange={(e) => setFormData({ ...formData, is_on_offer: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-medium">Enable Offer / Discount</span>
                                </label>
                            </div>

                            {formData.is_on_offer && (
                                <>
                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Discount Percentage (%)</label>
                                        <input
                                            type="number"
                                            value={formData.discount_percent}
                                            onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            placeholder="e.g., 20"
                                        />
                                        <p className="text-xs text-gray mt-1">This will calculate the discounted price automatically</p>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Original Price (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.original_price}
                                            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            placeholder="Original price before discount"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Offer Badge Text</label>
                                        <input
                                            type="text"
                                            value={formData.offer_badge}
                                            onChange={(e) => setFormData({ ...formData, offer_badge: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            placeholder="e.g., Great Summer Deal, Limited Time, Bestseller"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block font-medium mb-2">Offer End Date</label>
                                        <input
                                            type="date"
                                            value={formData.offer_end_date}
                                            onChange={(e) => setFormData({ ...formData, offer_end_date: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        />
                                        <p className="text-xs text-gray mt-1">Leave empty for no expiry date</p>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button onClick={handleSave} className="btn flex-1">Save Offer</button>
                                <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOffers;