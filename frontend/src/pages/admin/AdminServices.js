// frontend/src/pages/admin/AdminServices.js

import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'nails',
        description: '',
        price: '',
        original_price: '',
        discount_percent: '',
        offer_badge: '',
        offer_end_date: '',
        is_on_offer: false,
        duration: '',
        display_order: ''
    });

    const categories = [
        { value: 'nails', label: 'Nail Services', icon: 'fa-hand-peace' },
        { value: 'lashes', label: 'Eyelash Services', icon: 'fa-eye' },
        { value: 'facials', label: 'Facials & Skin', icon: 'fa-gem' },
        { value: 'waxing', label: 'Waxing & Threading', icon: 'fa-hand-sparkles' },
        { value: 'manicure', label: 'Manicure', icon: 'fa-hand-peace' },
        { value: 'pedicure', label: 'Pedicure', icon: 'fa-shoe-prints' },
        { value: 'addons', label: 'Add-On Services', icon: 'fa-plus-circle' }
    ];

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            console.log('Fetched services:', response.data);
            setServices(response.data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const calculateDiscountedPrice = (originalPrice, discountPercent) => {
        if (originalPrice && discountPercent && discountPercent > 0) {
            const discounted = originalPrice * (1 - discountPercent / 100);
            return Math.round(discounted);
        }
        return originalPrice;
    };

    const handleOfferToggle = (e) => {
        const isChecked = e.target.checked;
        setFormData(prev => ({ ...prev, is_on_offer: isChecked }));
        
        if (!isChecked) {
            setFormData(prev => ({
                ...prev,
                is_on_offer: false,
                original_price: '',
                discount_percent: '',
                offer_badge: '',
                offer_end_date: ''
            }));
        }
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if ((name === 'original_price' || name === 'discount_percent') && formData.is_on_offer) {
            const originalPrice = name === 'original_price' ? parseFloat(value) : parseFloat(formData.original_price);
            const discountPercent = name === 'discount_percent' ? parseFloat(value) : parseFloat(formData.discount_percent);
            
            if (originalPrice && discountPercent && discountPercent > 0) {
                const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercent);
                setFormData(prev => ({ ...prev, price: discountedPrice.toString() }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name) {
            toast.error('Service name is required');
            return;
        }
        if (!formData.price) {
            toast.error('Price is required');
            return;
        }
        if (!formData.duration) {
            toast.error('Duration is required');
            return;
        }
        
        let offerEndDateValue = null;
        if (formData.is_on_offer && formData.offer_end_date && formData.offer_end_date.trim() !== '') {
            offerEndDateValue = formData.offer_end_date;
        }
        
        const submitData = {
            name: formData.name,
            category: formData.category,
            description: formData.description || '',
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration),
            display_order: parseInt(formData.display_order) || 0,
            is_active: 1,
            is_on_offer: formData.is_on_offer ? 1 : 0,
            original_price: (formData.is_on_offer && formData.original_price) ? parseFloat(formData.original_price) : null,
            discount_percent: (formData.is_on_offer && formData.discount_percent) ? parseFloat(formData.discount_percent) : 0,
            offer_badge: (formData.is_on_offer && formData.offer_badge) ? formData.offer_badge : null,
            offer_end_date: offerEndDateValue
        };
        
        console.log('Submitting service data:', submitData);
        
        const formDataToSend = new FormData();
        Object.keys(submitData).forEach(key => {
            if (submitData[key] !== null && submitData[key] !== undefined && submitData[key] !== '') {
                formDataToSend.append(key, submitData[key]);
            }
        });
        
        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }
        
        try {
            if (editingService) {
                await api.put(`/services/${editingService.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Service updated successfully');
            } else {
                await api.post('/services', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Service created successfully');
            }
            resetForm();
            fetchServices();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await api.delete(`/services/${id}`);
                toast.success('Service deleted successfully');
                fetchServices();
            } catch (error) {
                toast.error('Failed to delete service');
            }
        }
    };

    // Function to format date without timezone offset
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

    const handleEdit = (service) => {
        console.log('Original service data from API:', service);
        setEditingService(service);
        
        const isOfferActive = service.is_on_offer === 1;
        
        const formattedOfferEndDate = formatDateForInput(service.offer_end_date);
        
        setFormData({
            name: service.name || '',
            category: service.category || 'nails',
            description: service.description || '',
            price: service.price || '',
            original_price: service.original_price || '',
            discount_percent: service.discount_percent || '',
            offer_badge: service.offer_badge || '',
            offer_end_date: formattedOfferEndDate,
            is_on_offer: isOfferActive,
            duration: service.duration || '',
            display_order: service.display_order || ''
        });
        
        if (service.image_url) {
            setImagePreview(`http://localhost:5000${service.image_url}`);
        } else {
            setImagePreview(null);
        }
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingService(null);
        setFormData({
            name: '',
            category: 'nails',
            description: '',
            price: '',
            original_price: '',
            discount_percent: '',
            offer_badge: '',
            offer_end_date: '',
            is_on_offer: false,
            duration: '',
            display_order: ''
        });
        setImagePreview(null);
        setImageFile(null);
    };

    const columns = [
        {
            name: 'Image',
            width: '80px',
            cell: row => (
                row.image_url ? (
                    <img src={`http://localhost:5000${row.image_url}`} alt={row.name} className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <i className="fas fa-spa text-primary"></i>
                    </div>
                )
            ),
        },
        { name: 'Name', selector: row => row.name, sortable: true },
        { name: 'Category', selector: row => categories.find(c => c.value === row.category)?.label || row.category, sortable: true },
        { 
            name: 'Price', 
            selector: row => {
                if (row.is_on_offer === 1 && row.original_price && row.original_price > row.price) {
                    return `₹${row.price} (Was ₹${row.original_price})`;
                }
                return `₹${row.price}`;
            }, 
            sortable: true 
        },
        { 
            name: 'Discount', 
            selector: row => {
                if (row.is_on_offer === 1 && row.discount_percent && row.discount_percent > 0) {
                    return `${row.discount_percent}% OFF`;
                }
                return 'No Offer';
            },
            sortable: true 
        },
        { name: 'Duration', selector: row => `${row.duration} min`, sortable: true },
        {
            name: 'Offer Badge',
            selector: row => row.offer_badge || '-',
            sortable: true
        },
        {
            name: 'Valid Till',
            selector: row => row.offer_end_date ? new Date(row.offer_end_date).toLocaleDateString('en-GB') : '-',
            sortable: true
        },
        {
            name: 'Actions',
            width: '100px',
            cell: row => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-primary hover:text-primary-dark" title="Edit">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-600" title="Delete">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
        },
    ];

    const statsCards = [
        { title: 'Total Services', value: services.length, icon: 'fa-spa', color: 'from-primary to-secondary' },
        { title: 'Categories', value: categories.length, icon: 'fa-tags', color: 'from-blue-500 to-blue-600' },
        { title: 'Services on Offer', value: services.filter(s => s.is_on_offer === 1).length, icon: 'fa-tag', color: 'from-green-500 to-green-600' },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray text-sm mb-1">{card.title}</p>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </div>
                            <div className={`w-10 h-10 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center`}>
                                <i className={`fas ${card.icon} text-white text-lg`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={services}
                title="Services Management"
                actions={
                    <button onClick={() => setShowModal(true)} className="btn btn-small">
                        <i className="fas fa-plus mr-2"></i> Add Service
                    </button>
                }
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={10}
                exportable={true}
                exportFileName="services_export"
                noDataMessage="No services found. Click 'Add Service' to create one."
            />

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-light-gray dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Service Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter service name"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Category *</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Describe the service"
                                ></textarea>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Duration (minutes) *</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="e.g., 60"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="Lower number appears first"
                                    />
                                </div>
                            </div>
                            
                            {/* Offer Section */}
                            <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <label className="flex items-center gap-2 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_on_offer === true}
                                        onChange={handleOfferToggle}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-semibold text-primary">Enable Offer / Discount on this service</span>
                                </label>
                                
                                {formData.is_on_offer && (
                                    <div className="space-y-4 pl-6 border-l-2 border-primary">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-medium mb-2">Original Price (₹)</label>
                                                <input
                                                    type="number"
                                                    name="original_price"
                                                    value={formData.original_price}
                                                    onChange={handlePriceChange}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="Original price before discount"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2">Discount Percentage (%)</label>
                                                <input
                                                    type="number"
                                                    name="discount_percent"
                                                    value={formData.discount_percent}
                                                    onChange={handlePriceChange}
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="e.g., 20"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-medium mb-2">Discounted Price (₹)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                                                />
                                                <p className="text-xs text-gray mt-1">Auto-calculated or manually set</p>
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2">Offer Badge Text</label>
                                                <input
                                                    type="text"
                                                    value={formData.offer_badge}
                                                    onChange={(e) => setFormData({ ...formData, offer_badge: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="e.g., Summer Sale, Limited Time"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block font-medium mb-2">Offer End Date</label>
                                            <input
                                                type="date"
                                                value={formData.offer_end_date}
                                                onChange={(e) => setFormData({ ...formData, offer_end_date: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            />
                                            <p className="text-xs text-gray mt-1">Leave empty for no expiry date</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Service Image</label>
                                <div className="border-2 border-dashed border-light-gray rounded-lg p-4 text-center">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                                            <button
                                                type="button"
                                                onClick={() => { setImagePreview(null); setImageFile(null); }}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center"
                                            >
                                                <i className="fas fa-times text-xs"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                            <p className="text-sm text-gray">Click or drag image to upload</p>
                                            <p className="text-xs text-gray">PNG, JPG, GIF up to 5MB</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="service-image"
                                    />
                                    {!imagePreview && (
                                        <label htmlFor="service-image" className="mt-2 inline-block text-primary text-sm cursor-pointer">
                                            Choose Image
                                        </label>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="submit" className="btn flex-1">
                                    {editingService ? 'Update Service' : 'Create Service'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;