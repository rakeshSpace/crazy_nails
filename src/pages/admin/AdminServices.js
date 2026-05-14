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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('duration', formData.duration);
        formDataToSend.append('display_order', formData.display_order || 0);
        
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

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            category: service.category,
            description: service.description || '',
            price: service.price,
            duration: service.duration,
            display_order: service.display_order || ''
        });
        if (service.image_url) {
            setImagePreview(`http://localhost:5000${service.image_url}`);
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
        { name: 'Price', selector: row => `₹${row.price}`, sortable: true },
        { name: 'Duration', selector: row => `${row.duration} min`, sortable: true },
        { name: 'Display Order', selector: row => row.display_order || 0, sortable: true },
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
        { title: 'Active Services', value: services.filter(s => s.is_active !== 0).length, icon: 'fa-check-circle', color: 'from-green-500 to-green-600' },
    ];

    return (
        <div>
            {/* Stats Cards */}
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

            {/* Data Table */}
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-light-gray dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-4">
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
                                    <label className="block font-medium mb-2">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Duration (min) *</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Lower number appears first"
                                />
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