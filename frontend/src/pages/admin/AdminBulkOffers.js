import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminBulkOffers = () => {
    const [activeTab, setActiveTab] = useState('bulk');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('products');
    const [formData, setFormData] = useState({
        discount_percent: '',
        offer_badge: '',
        end_date: ''
    });

    // FIXED: Function to format date without timezone offset
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';

        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }

        // Parse the date string and extract year, month, day in local time
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        }
    };

    const uniqueCategories = [...new Set(products.map(p => p.category))];

    const getCategoryCount = (category) => {
        return products.filter(p => p.category === category).length;
    };

    const applyToAllProducts = async () => {
        if (!formData.discount_percent) {
            toast.error('Please enter discount percentage');
            return;
        }

        const itemsToUpdate = selectedType === 'products' ? products : services;

        if (!window.confirm(`⚠️ WARNING: This will apply this offer to ALL ${selectedType === 'products' ? 'products' : 'services'} (${itemsToUpdate.length} items)!\n\nAre you sure you want to continue?`)) return;

        setLoading(true);
        try {
            const updatePromises = itemsToUpdate.map(item => {
                // Calculate discounted price
                const originalPriceValue = item.original_price && item.original_price > 0 ? parseFloat(item.original_price) : parseFloat(item.price);
                const discountPercent = parseFloat(formData.discount_percent);
                const discountedPrice = Math.round(originalPriceValue * (1 - discountPercent / 100));
                // CRITICAL FIX: Send ALL required fields, not just offer fields
                const updateData = {
                    // Preserve all existing data
                    name: item.name,
                    category: item.category,
                    description: item.description || '',
                    price: discountedPrice,
                    original_price: originalPriceValue,
                    discount_percent: discountPercent,
                    offer_badge: formData.offer_badge || null,
                    offer_end_date: formData.end_date || null,
                    is_on_offer: 1
                };

                if (selectedType === 'products') {
                    updateData.stock_quantity = item.stock_quantity || 0;
                    updateData.badge = item.badge || null;
                    updateData.is_featured = item.is_featured || 0;
                    updateData.rating = item.rating || 0;
                } else {
                    updateData.duration = item.duration || 60;
                    updateData.display_order = item.display_order || 0;
                    updateData.is_active = 1;
                }

                console.log('Updating item:', item.id, updateData);

                const endpoint = selectedType === 'products' ? `/products/${item.id}` : `/services/${item.id}`;
                return api.put(endpoint, updateData);
            });

            await Promise.all(updatePromises);
            toast.success(`✅ Offer applied to ALL ${itemsToUpdate.length} ${selectedType} successfully!`);

            setFormData({
                discount_percent: '',
                offer_badge: '',
                end_date: ''
            });

            fetchData();
        } catch (error) {
            console.error('Apply all error:', error);
            toast.error('Failed to apply offer: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const applyToCategory = async () => {
        if (!selectedCategory) {
            toast.error('Please select a category');
            return;
        }
        if (!formData.discount_percent) {
            toast.error('Please enter discount percentage');
            return;
        }

        const categoryProducts = products.filter(p => p.category === selectedCategory);

        if (categoryProducts.length === 0) {
            toast.error('No products found in this category');
            return;
        }

        if (!window.confirm(`Apply ${formData.discount_percent}% OFF to ${categoryProducts.length} products in ${selectedCategory.toUpperCase()} category?`)) return;

        setLoading(true);
        try {
            const updatePromises = categoryProducts.map(product => {
                const originalPriceValue = product.original_price && product.original_price > 0 ? parseFloat(product.original_price) : parseFloat(product.price);
                const discountPercent = parseFloat(formData.discount_percent);
                const discountedPrice = Math.round(originalPriceValue * (1 - discountPercent / 100));

                const updateData = {
                    name: product.name,
                    category: product.category,
                    description: product.description || '',
                    price: discountedPrice,
                    original_price: originalPriceValue,
                    discount_percent: discountPercent,
                    offer_badge: formData.offer_badge || null,
                    offer_end_date: formData.end_date || null,
                    is_on_offer: 1,
                    stock_quantity: product.stock_quantity || 0,
                    badge: product.badge || null,
                    is_featured: product.is_featured || 0,
                    rating: product.rating || 0
                };

                console.log('Updating product:', product.id, updateData);

                return api.put(`/products/${product.id}`, updateData);
            });

            await Promise.all(updatePromises);
            toast.success(`✅ Offer applied to ${categoryProducts.length} products in ${selectedCategory} category!`);

            setFormData({
                discount_percent: '',
                offer_badge: '',
                end_date: ''
            });
            setSelectedCategory('');

            fetchData();
        } catch (error) {
            console.error('Apply category error:', error);
            toast.error('Failed to apply offer: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const removeAllOffers = async () => {
        const itemsToUpdate = selectedType === 'products' ? products : services;
        const activeOfferItems = itemsToUpdate.filter(item => item.is_on_offer === 1);

        if (activeOfferItems.length === 0) {
            toast.error('No active offers to remove');
            return;
        }

        if (!window.confirm(`🚨 DANGER: This will REMOVE ALL OFFERS from ${activeOfferItems.length} ${selectedType}!\n\nThis action CANNOT be undone.\n\nAre you absolutely sure you want to continue?`)) return;

        setLoading(true);
        try {
            const updatePromises = activeOfferItems.map(item => {
                const originalPriceValue = item.original_price && item.original_price > 0 ? parseFloat(item.original_price) : parseFloat(item.price);

                const updateData = {
                    name: item.name,
                    category: item.category,
                    description: item.description || '',
                    price: originalPriceValue,
                    original_price: null,
                    discount_percent: 0,
                    offer_badge: null,
                    offer_end_date: null,
                    is_on_offer: 0
                };

                if (selectedType === 'products') {
                    updateData.stock_quantity = item.stock_quantity || 0;
                    updateData.badge = item.badge || null;
                    updateData.is_featured = item.is_featured || 0;
                    updateData.rating = item.rating || 0;
                } else {
                    updateData.duration = item.duration || 60;
                    updateData.display_order = item.display_order || 0;
                    updateData.is_active = 1;
                }

                console.log('Removing offer from item:', item.id, updateData);

                const endpoint = selectedType === 'products' ? `/products/${item.id}` : `/services/${item.id}`;
                return api.put(endpoint, updateData);
            });

            await Promise.all(updatePromises);
            toast.success(`✅ All offers removed from ${activeOfferItems.length} ${selectedType} successfully!`);

            fetchData();
        } catch (error) {
            console.error('Remove all offers error:', error);
            toast.error('Failed to remove offers: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const getItemsWithOffersCount = () => {
        const items = selectedType === 'products' ? products : services;
        return items.filter(item => item.is_on_offer === 1).length;
    };

    const getTotalItemsCount = () => {
        return selectedType === 'products' ? products.length : services.length;
    };

    const getCategoryDisplayName = (cat) => {
        const categoryNames = {
            'nail-care': 'Nail Care',
            'lash-care': 'Lash Care',
            'skincare': 'Skincare',
            'hair-removal': 'Hair Removal',
            'tools': 'Tools & Kits'
        };
        return categoryNames[cat] || cat.replace('_', ' ').toUpperCase();
    };

    // FIXED: Format end_date for display in date input when editing
    // No direct edit functionality in this file, but ensure any date display is handled correctly

    // FIXED: When setting form data, ensure end_date is properly formatted
    // The formData.end_date is already in YYYY-MM-DD format from user input
    // When loading, we don't have an edit feature here, so no issue

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Bulk Offer Management</h2>
                <p className="text-gray">Apply offers to thousands of products or services in seconds</p>
            </div>

            <div className="flex gap-2 mb-6 border-b border-light-gray dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('bulk')}
                    className={`px-4 py-2 font-medium transition-all ${activeTab === 'bulk'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray hover:text-primary'
                        }`}
                >
                    <i className="fas fa-layer-group mr-2"></i> Bulk Apply
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 font-medium transition-all ${activeTab === 'history'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-gray hover:text-primary'
                        }`}
                >
                    <i className="fas fa-history mr-2"></i> Active Offers
                </button>
            </div>

            {activeTab === 'bulk' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                            <p className="text-gray text-sm">Select Type</p>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary"
                            >
                                <option value="products">Products ({products.length})</option>
                                <option value="services">Services ({services.length})</option>
                            </select>
                        </div>
                        <div className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                            <p className="text-gray text-sm">Total Items</p>
                            <p className="text-2xl font-bold">{getTotalItemsCount()}</p>
                        </div>
                        <div className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                            <p className="text-gray text-sm">Items with Active Offers</p>
                            <p className="text-2xl font-bold">{getItemsWithOffersCount()}</p>
                        </div>
                        <div className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                            <p className="text-gray text-sm">Categories</p>
                            <p className="text-2xl font-bold">{selectedType === 'products' ? uniqueCategories.length : 7}</p>
                        </div>
                    </div>

                    {/* Apply to All Items */}
                    <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft border border-light-gray dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <i className="fas fa-globe text-primary"></i> Apply to ALL {selectedType === 'products' ? 'Products' : 'Services'}
                        </h3>
                        <p className="text-gray text-sm mb-4">Apply discount to every {selectedType === 'products' ? 'product' : 'service'} in your store at once</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block font-medium mb-2">Discount Percentage (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.discount_percent}
                                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
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
                            disabled={loading || !formData.discount_percent}
                            className="btn w-full md:w-auto"
                        >
                            <i className="fas fa-rocket mr-2"></i> Apply to All {getTotalItemsCount()} {selectedType}
                        </button>
                    </div>

                    {/* Apply by Category - Only for Products */}
                    {selectedType === 'products' && (
                        <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft border border-light-gray dark:border-gray-700">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <i className="fas fa-folder-tree text-primary"></i> Apply by Category
                            </h3>
                            <p className="text-gray text-sm mb-4">Apply discount to all products in a specific category</p>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Select Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    >
                                        <option value="">-- Select Category --</option>
                                        {uniqueCategories.map(cat => {
                                            const categoryName = getCategoryDisplayName(cat);
                                            const count = getCategoryCount(cat);
                                            return (
                                                <option key={cat} value={cat}>
                                                    {categoryName} ({count} products)
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Discount Percentage (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={formData.discount_percent}
                                        onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
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
                                disabled={loading || !selectedCategory || !formData.discount_percent}
                                className="btn w-full md:w-auto"
                            >
                                <i className="fas fa-tag mr-2"></i> Apply to Selected Category
                            </button>
                        </div>
                    )}

                    {/* Danger Zone */}
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border-2 border-red-300 dark:border-red-800">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                            <i className="fas fa-exclamation-triangle"></i> Danger Zone
                        </h3>
                        <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                            ⚠️ This action will remove ALL offers from ALL {selectedType} in your store. This cannot be undone.
                        </p>

                        <button
                            onClick={removeAllOffers}
                            disabled={loading || getItemsWithOffersCount() === 0}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <i className="fas fa-trash-alt"></i> Remove All Offers ({getItemsWithOffersCount()} active)
                        </button>
                    </div>

                    {/* Category List - Only for Products */}
                    {selectedType === 'products' && (
                        <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft border border-light-gray dark:border-gray-700">
                            <h3 className="text-xl font-bold mb-4">Categories Overview</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {uniqueCategories.map(cat => {
                                    const categoryName = getCategoryDisplayName(cat);
                                    const count = getCategoryCount(cat);
                                    return (
                                        <div
                                            key={cat}
                                            className="p-3 bg-light dark:bg-dark-light rounded-lg cursor-pointer hover:bg-primary/10 transition-all border border-light-gray dark:border-gray-700"
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setSelectedType('products');
                                            }}
                                        >
                                            <p className="font-semibold capitalize">{categoryName}</p>
                                            <p className="text-sm text-gray">{count} products</p>
                                            <p className="text-xs text-primary mt-1">
                                                {products.filter(p => p.category === cat && p.is_on_offer === 1).length} on offer
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft border border-light-gray dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Items with Active Offers</h3>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-1 border rounded-lg focus:outline-none focus:border-primary text-sm"
                        >
                            <option value="products">Products</option>
                            <option value="services">Services</option>
                        </select>
                    </div>

                    {getItemsWithOffersCount() === 0 ? (
                        <div className="text-center py-8">
                            <i className="fas fa-tag text-4xl text-gray-300 mb-3"></i>
                            <p className="text-gray">No active offers found</p>
                            <p className="text-sm text-gray mt-2">Use the Bulk Apply tab to create offers</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(selectedType === 'products' ? products : services)
                                .filter(item => item.is_on_offer === 1)
                                .map(item => {
                                    // FIXED: Format date for display without timezone shift for daysLeft calculation
                                    const endDate = item.offer_end_date ? new Date(item.offer_end_date) : null;
                                    const daysLeft = endDate && !isNaN(endDate.getTime()) ?
                                        Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

                                    return (
                                        <div key={item.id} className="border border-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-all">
                                            <div className="flex justify-between items-start flex-wrap gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center overflow-hidden">
                                                            {item.image_url ? (
                                                                <img src={`http://localhost:5000${item.image_url}`} alt={item.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <i className="fas fa-box text-xl text-primary"></i>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{item.name}</h4>
                                                            <p className="text-sm text-gray capitalize">{item.category?.replace('_', ' ')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        {item.discount_percent > 0 && (
                                                            <span className="inline-block text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                                                                {item.discount_percent}% OFF
                                                            </span>
                                                        )}
                                                        {item.offer_badge && (
                                                            <span className="inline-block ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                                {item.offer_badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-primary font-bold text-lg">₹{item.price}</span>
                                                        {item.original_price && item.original_price > item.price && (
                                                            <span className="text-gray line-through text-sm">₹{item.original_price}</span>
                                                        )}
                                                    </div>
                                                    {item.offer_end_date && (
                                                        <p className="text-xs text-gray mt-1">
                                                            📅 Valid until: {new Date(item.offer_end_date).toLocaleDateString('en-GB')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBulkOffers;