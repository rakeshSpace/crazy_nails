import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminGallery = () => {
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'nails',
        display_order: ''
    });

    const categories = [
        { value: 'nails', label: 'Nail Art', icon: 'fa-paintbrush', color: 'bg-pink-500' },
        { value: 'extensions', label: 'Nail Extensions', icon: 'fa-hand-peace', color: 'bg-purple-500' },
        { value: 'lashes', label: 'Eyelash Extensions', icon: 'fa-eye', color: 'bg-blue-500' },
        { value: 'manicure', label: 'Manicure', icon: 'fa-hand-sparkles', color: 'bg-green-500' },
        { value: 'pedicure', label: 'Pedicure', icon: 'fa-shoe-prints', color: 'bg-orange-500' },
        { value: 'facials', label: 'Facials', icon: 'fa-gem', color: 'bg-red-500' }
    ];

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const response = await api.get('/gallery');
            setGallery(response.data);
        } catch (error) {
            console.error('Failed to fetch gallery:', error);
            toast.error('Failed to load gallery');
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
        
        if (!imageFile && !formData.title) {
            toast.error('Please select an image');
            return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('display_order', formData.display_order || 0);
        
        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }
        
        try {
            await api.post('/gallery', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Image added to gallery');
            resetForm();
            fetchGallery();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add image');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await api.delete(`/gallery/${id}`);
                toast.success('Image deleted');
                fetchGallery();
            } catch (error) {
                toast.error('Failed to delete image');
            }
        }
    };

    const resetForm = () => {
        setShowModal(false);
        setFormData({
            title: '',
            description: '',
            category: 'nails',
            display_order: ''
        });
        setImagePreview(null);
        setImageFile(null);
    };

    const columns = [
        {
            name: 'Image',
            width: '100px',
            cell: row => (
                row.image_url ? (
                    <img src={`http://localhost:5000${row.image_url}`} alt={row.title} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                    <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center">
                        <i className="fas fa-image text-primary text-2xl"></i>
                    </div>
                )
            ),
        },
        { name: 'Title', selector: row => row.title, sortable: true },
        { name: 'Description', selector: row => row.description?.substring(0, 50) + (row.description?.length > 50 ? '...' : ''), sortable: true },
        { name: 'Category', selector: row => categories.find(c => c.value === row.category)?.label || row.category, sortable: true },
        { name: 'Display Order', selector: row => row.display_order || 0, sortable: true },
        {
            name: 'Actions',
            width: '100px',
            cell: row => (
                <div className="flex gap-2">
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-600" title="Delete">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
        },
    ];

    const statsCards = [
        { title: 'Total Images', value: gallery.length, icon: 'fa-images', color: 'from-primary to-secondary' },
        { title: 'Categories', value: categories.length, icon: 'fa-tags', color: 'from-blue-500 to-blue-600' },
    ];

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
                data={gallery}
                title="Gallery Management"
                actions={
                    <button onClick={() => setShowModal(true)} className="btn btn-small">
                        <i className="fas fa-plus mr-2"></i> Add Image
                    </button>
                }
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={12}
                exportable={true}
                exportFileName="gallery_export"
                noDataMessage="No images in gallery. Click 'Add Image' to upload one."
            />

            {/* Add Image Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Add to Gallery</h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter image title"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Describe the image"
                                ></textarea>
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
                                <label className="block font-medium mb-2">Image *</label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
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
                                        id="gallery-image"
                                        required={!imagePreview}
                                    />
                                    {!imagePreview && (
                                        <label htmlFor="gallery-image" className="mt-2 inline-block text-primary text-sm cursor-pointer">
                                            Choose Image
                                        </label>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="submit" className="btn flex-1">Add to Gallery</button>
                                <button type="button" onClick={resetForm} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;