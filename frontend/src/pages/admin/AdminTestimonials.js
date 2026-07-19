import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminTestimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        comment: '',
        rating: 5,
        display_order: '',
        is_approved: true
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const response = await api.get('/testimonials/admin/all');
            setTestimonials(response.data);
        } catch (error) {
            console.error('Failed to fetch testimonials:', error);
            toast.error('Failed to load testimonials');
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
        formDataToSend.append('role', formData.role);
        formDataToSend.append('comment', formData.comment);
        formDataToSend.append('rating', formData.rating);
        formDataToSend.append('display_order', formData.display_order || 0);
        formDataToSend.append('is_approved', formData.is_approved ? '1' : '0');
        
        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }
        
        try {
            if (editingItem) {
                await api.put(`/testimonials/${editingItem.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Testimonial updated successfully');
            } else {
                await api.post('/testimonials', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Testimonial created successfully');
            }
            resetForm();
            fetchTestimonials();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this testimonial?')) {
            try {
                await api.delete(`/testimonials/${id}`);
                toast.success('Testimonial deleted successfully');
                fetchTestimonials();
            } catch (error) {
                toast.error('Failed to delete testimonial');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            role: item.role || '',
            comment: item.comment,
            rating: item.rating,
            display_order: item.display_order || '',
            is_approved: item.is_approved === 1
        });
        if (item.image_url) {
            setImagePreview(`http://localhost:5000${item.image_url}`);
        }
        setShowModal(true);
    };

    // Fixed approve/hide functionality
    const handleApprove = async (id) => {
        try {
            await api.put(`/testimonials/${id}/approve`);
            toast.success('Testimonial approved and will appear on website');
            fetchTestimonials();
        } catch (error) {
            toast.error('Failed to approve testimonial');
        }
    };

    const handleHide = async (id) => {
        try {
            await api.put(`/testimonials/${id}/hide`);
            toast.success('Testimonial hidden from website');
            fetchTestimonials();
        } catch (error) {
            toast.error('Failed to hide testimonial');
        }
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            name: '',
            role: '',
            comment: '',
            rating: 5,
            display_order: '',
            is_approved: true
        });
        setImagePreview(null);
        setImageFile(null);
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <i key={star} className={`fas fa-star text-xs ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                ))}
            </div>
        );
    };

    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '70px' },
        {
            name: 'Photo',
            width: '80px',
            cell: row => (
                row.image_url ? (
                    <img 
                        src={`http://localhost:5000${row.image_url}`} 
                        alt={row.name} 
                        className="w-10 h-10 object-cover rounded-full border-2 border-primary"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">' + row.name?.charAt(0).toUpperCase() + '</div>';
                        }}
                    />
                ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {row.name?.charAt(0).toUpperCase()}
                    </div>
                )
            ),
        },
        { name: 'Name', selector: row => row.name, sortable: true },
        { name: 'Role', selector: row => row.role || '-', sortable: true },
        { name: 'Comment', selector: row => row.comment?.substring(0, 60) + (row.comment?.length > 60 ? '...' : ''), sortable: true },
        { name: 'Rating', selector: row => row.rating, sortable: true, cell: row => renderStars(row.rating) },
        { name: 'Display Order', selector: row => row.display_order || 0, sortable: true },
        {
            name: 'Status',
            width: '100px',
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {row.is_approved ? 'Visible' : 'Hidden'}
                </span>
            ),
        },
        {
            name: 'Actions',
            width: '130px',
            cell: row => (
                <div className="flex gap-2">
                    {row.is_approved ? (
                        <button 
                            onClick={() => handleHide(row.id)} 
                            className="text-yellow-500 hover:text-yellow-600" 
                            title="Hide from website"
                        >
                            <i className="fas fa-eye-slash"></i>
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleApprove(row.id)} 
                            className="text-green-500 hover:text-green-600" 
                            title="Approve and show on website"
                        >
                            <i className="fas fa-check-circle"></i>
                        </button>
                    )}
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

    const statsCards = [
        { title: 'Total Testimonials', value: testimonials.length, icon: 'fa-comments', color: 'from-primary to-secondary' },
        { title: 'Visible on Website', value: testimonials.filter(t => t.is_approved === 1).length, icon: 'fa-eye', color: 'from-green-500 to-green-600' },
        { title: 'Hidden', value: testimonials.filter(t => t.is_approved === 0).length, icon: 'fa-eye-slash', color: 'from-yellow-500 to-yellow-600' },
        { title: 'Average Rating', value: (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length || 0).toFixed(1), icon: 'fa-star', color: 'from-yellow-500 to-yellow-600' },
    ];

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                data={testimonials}
                title="Customer Testimonials"
                actions={
                    <button onClick={() => setShowModal(true)} className="btn btn-small">
                        <i className="fas fa-plus mr-2"></i> Add Testimonial
                    </button>
                }
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={10}
                exportable={true}
                exportFileName="testimonials_export"
                noDataMessage="No testimonials found. Click 'Add Testimonial' to create one."
            />

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Customer Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter customer name"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Role/Designation</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., Regular Client, VIP Member, Beauty Blogger"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Testimonial Comment *</label>
                                <textarea
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    rows="4"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="What they say about us..."
                                ></textarea>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Rating (1-5)</label>
                                    <select
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    >
                                        <option value="5">★★★★★ (5)</option>
                                        <option value="4">★★★★☆ (4)</option>
                                        <option value="3">★★★☆☆ (3)</option>
                                        <option value="2">★★☆☆☆ (2)</option>
                                        <option value="1">★☆☆☆☆ (1)</option>
                                    </select>
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
                            
                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_approved}
                                        onChange={(e) => setFormData({ ...formData, is_approved: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-medium">Show on website immediately</span>
                                </label>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Customer Photo (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border-2 border-primary" />
                                            <button
                                                type="button"
                                                onClick={() => { setImagePreview(null); setImageFile(null); }}
                                                className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center"
                                            >
                                                <i className="fas fa-times text-xs"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="fas fa-user-circle text-4xl text-gray-400 mb-2"></i>
                                            <p className="text-sm text-gray">Click to upload customer photo</p>
                                            <p className="text-xs text-gray">PNG, JPG up to 2MB</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="testimonial-image"
                                    />
                                    <label htmlFor="testimonial-image" className="mt-2 inline-block text-primary text-sm cursor-pointer">
                                        {imagePreview ? 'Change Image' : 'Choose Image'}
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="submit" className="btn flex-1">
                                    {editingItem ? 'Update Testimonial' : 'Add Testimonial'}
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

export default AdminTestimonials;