import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminHeroSlider = () => {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        button_text: 'Book Now',
        button_link: '/booking',
        button_text_2: 'View Services',
        button_link_2: '/services',
        display_order: '',
        is_active: true
    });

    useEffect(() => {
        fetchSliders();
    }, []);

    const fetchSliders = async () => {
        try {
            const response = await api.get('/hero/admin/all');
            setSliders(response.data);
        } catch (error) {
            console.error('Failed to fetch sliders:', error);
            toast.error('Failed to load sliders');
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
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('button_text', formData.button_text);
        formDataToSend.append('button_link', formData.button_link);
        formDataToSend.append('button_text_2', formData.button_text_2);
        formDataToSend.append('button_link_2', formData.button_link_2);
        formDataToSend.append('display_order', formData.display_order || 0);
        formDataToSend.append('is_active', formData.is_active ? '1' : '0');
        
        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }
        
        try {
            if (editingItem) {
                await api.put(`/hero/${editingItem.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Hero slider updated successfully');
            } else {
                await api.post('/hero', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Hero slider created successfully');
            }
            resetForm();
            fetchSliders();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this slider?')) {
            try {
                await api.delete(`/hero/${id}`);
                toast.success('Hero slider deleted successfully');
                fetchSliders();
            } catch (error) {
                toast.error('Failed to delete slider');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description || '',
            button_text: item.button_text || 'Book Now',
            button_link: item.button_link || '/booking',
            button_text_2: item.button_text_2 || 'View Services',
            button_link_2: item.button_link_2 || '/services',
            display_order: item.display_order || '',
            is_active: item.is_active === 1
        });
        if (item.image_url) {
            setImagePreview(`http://localhost:5000${item.image_url}`);
        }
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            button_text: 'Book Now',
            button_link: '/booking',
            button_text_2: 'View Services',
            button_link_2: '/services',
            display_order: '',
            is_active: true
        });
        setImagePreview(null);
        setImageFile(null);
    };

    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '70px' },
        {
            name: 'Image',
            width: '80px',
            cell: row => (
                row.image_url ? (
                    <img src={`http://localhost:5000${row.image_url}`} alt={row.title} className="w-12 h-12 object-cover rounded" />
                ) : (
                    <div className="w-12 h-12 bg-accent rounded flex items-center justify-center">
                        <i className="fas fa-image text-primary"></i>
                    </div>
                )
            ),
        },
        { name: 'Title', selector: row => row.title, sortable: true },
        { name: 'Description', selector: row => row.description?.substring(0, 50) + (row.description?.length > 50 ? '...' : ''), sortable: true },
        { name: 'Display Order', selector: row => row.display_order || 0, sortable: true },
        {
            name: 'Status',
            width: '100px',
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            name: 'Actions',
            width: '100px',
            cell: row => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-primary" title="Edit">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-500" title="Delete">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Hero Sliders</h2>
                <button onClick={() => setShowModal(true)} className="btn btn-small">
                    <i className="fas fa-plus mr-2"></i> Add New Slide
                </button>
            </div>

            <DataTable
                columns={columns}
                data={sliders}
                title="Hero Sliders (Homepage Carousel)"
                progressPending={loading}
                searchable={true}
                pagination={true}
                exportable={true}
                exportFileName="hero_sliders_export"
                noDataMessage="No hero sliders found. Click 'Add New Slide' to create one."
            />

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingItem ? 'Edit Hero Slide' : 'Add New Hero Slide'}</h3>
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
                                    placeholder="Slide title"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Slide description"
                                ></textarea>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Button 1 Text</label>
                                    <input
                                        type="text"
                                        value={formData.button_text}
                                        onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="Book Now"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Button 1 Link</label>
                                    <input
                                        type="text"
                                        value={formData.button_link}
                                        onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="/booking"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Button 2 Text</label>
                                    <input
                                        type="text"
                                        value={formData.button_text_2}
                                        onChange={(e) => setFormData({ ...formData, button_text_2: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="View Services"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Button 2 Link</label>
                                    <input
                                        type="text"
                                        value={formData.button_link_2}
                                        onChange={(e) => setFormData({ ...formData, button_link_2: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="/services"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
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
                                <div>
                                    <label className="block font-medium mb-2">Status</label>
                                    <select
                                        value={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Slide Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
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
                                            <p className="text-xs text-gray">Recommended size: 1920x1080px</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="hero-image"
                                    />
                                    {!imagePreview && (
                                        <label htmlFor="hero-image" className="mt-2 inline-block text-primary text-sm cursor-pointer">
                                            Choose Image
                                        </label>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="submit" className="btn flex-1">
                                    {editingItem ? 'Update Slide' : 'Create Slide'}
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

export default AdminHeroSlider;