import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminTransformations = () => {
    const [transformations, setTransformations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [beforePreview, setBeforePreview] = useState(null);
    const [afterPreview, setAfterPreview] = useState(null);
    const [beforeFile, setBeforeFile] = useState(null);
    const [afterFile, setAfterFile] = useState(null);
    const [removeBeforeImage, setRemoveBeforeImage] = useState(false);
    const [removeAfterImage, setRemoveAfterImage] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'nails',
        tags: '',
        display_order: ''
    });

    const categories = [
        { value: 'nails', label: 'Nail Art', icon: 'fa-hand-peace' },
        { value: 'lashes', label: 'Eyelash Extensions', icon: 'fa-eye' },
        { value: 'facials', label: 'Facials', icon: 'fa-gem' },
        { value: 'waxing', label: 'Waxing', icon: 'fa-hand-sparkles' },
        { value: 'hair', label: 'Hair', icon: 'fa-cut' }
    ];

    useEffect(() => {
        fetchTransformations();
    }, []);

    const fetchTransformations = async () => {
        try {
            const response = await api.get('/transformations');
            setTransformations(response.data);
        } catch (error) {
            console.error('Failed to fetch transformations:', error);
            toast.error('Failed to load transformations');
        } finally {
            setLoading(false);
        }
    };

    const handleBeforeImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            setBeforeFile(file);
            setRemoveBeforeImage(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setBeforePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAfterImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            setAfterFile(file);
            setRemoveAfterImage(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAfterPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveBeforeImage = () => {
        setBeforePreview(null);
        setBeforeFile(null);
        setRemoveBeforeImage(true);
    };

    const handleRemoveAfterImage = () => {
        setAfterPreview(null);
        setAfterFile(null);
        setRemoveAfterImage(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title) {
            toast.error('Title is required');
            return;
        }
        
        // For new item, at least one image is required
        if (!editingItem && !beforeFile && !afterFile) {
            toast.error('Please upload at least one image (Before or After)');
            return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('display_order', formData.display_order || 0);
        
        // Process tags
        if (formData.tags) {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim());
            formDataToSend.append('tags', JSON.stringify(tagsArray));
        }
        
        // Handle images for edit mode
        if (editingItem) {
            // Before Image
            if (removeBeforeImage) {
                formDataToSend.append('remove_before_image', 'true');
                console.log('Before image removal requested');
            } else if (beforeFile) {
                formDataToSend.append('before_image', beforeFile);
                console.log('New before image uploaded');
            }
            
            // After Image
            if (removeAfterImage) {
                formDataToSend.append('remove_after_image', 'true');
                console.log('After image removal requested');
            } else if (afterFile) {
                formDataToSend.append('after_image', afterFile);
                console.log('New after image uploaded');
            }
        } else {
            // New transformation - images are optional but at least one required
            if (beforeFile) {
                formDataToSend.append('before_image', beforeFile);
            }
            if (afterFile) {
                formDataToSend.append('after_image', afterFile);
            }
        }
        
        try {
            if (editingItem) {
                await api.put(`/transformations/${editingItem.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Transformation updated successfully');
            } else {
                await api.post('/transformations', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Transformation created successfully');
            }
            resetForm();
            fetchTransformations();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transformation?')) {
            try {
                await api.delete(`/transformations/${id}`);
                toast.success('Transformation deleted successfully');
                fetchTransformations();
            } catch (error) {
                toast.error('Failed to delete transformation');
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setRemoveBeforeImage(false);
        setRemoveAfterImage(false);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            category: item.category || 'nails',
            tags: item.tags ? item.tags.join(', ') : '',
            display_order: item.display_order || ''
        });
        
        if (item.before_image) {
            setBeforePreview(`http://localhost:5000${item.before_image}`);
            setBeforeFile(null);
        } else {
            setBeforePreview(null);
            setBeforeFile(null);
        }
        
        if (item.after_image) {
            setAfterPreview(`http://localhost:5000${item.after_image}`);
            setAfterFile(null);
        } else {
            setAfterPreview(null);
            setAfterFile(null);
        }
        
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
            title: '',
            description: '',
            category: 'nails',
            tags: '',
            display_order: ''
        });
        setBeforePreview(null);
        setAfterPreview(null);
        setBeforeFile(null);
        setAfterFile(null);
        setRemoveBeforeImage(false);
        setRemoveAfterImage(false);
    };

    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '70px' },
        { name: 'Title', selector: row => row.title, sortable: true },
        { name: 'Category', selector: row => categories.find(c => c.value === row.category)?.label || row.category, sortable: true },
        {
            name: 'Images',
            cell: row => (
                <div className="flex gap-2 items-center">
                    {row.before_image ? (
                        <img src={`http://localhost:5000${row.before_image}`} alt="Before" className="w-10 h-10 object-cover rounded" />
                    ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No</div>
                    )}
                    <i className="fas fa-arrow-right text-primary text-xs"></i>
                    {row.after_image ? (
                        <img src={`http://localhost:5000${row.after_image}`} alt="After" className="w-10 h-10 object-cover rounded" />
                    ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No</div>
                    )}
                </div>
            ),
        },
        { name: 'Display Order', selector: row => row.display_order || 0, sortable: true },
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
                <h2 className="text-2xl font-bold">Manage Transformations (Before/After)</h2>
                <button onClick={() => setShowModal(true)} className="btn btn-small">
                    <i className="fas fa-plus mr-2"></i> Add Transformation
                </button>
            </div>

            <DataTable
                columns={columns}
                data={transformations}
                title="Before & After Transformations"
                progressPending={loading}
                searchable={true}
                pagination={true}
                exportable={true}
                exportFileName="transformations_export"
                noDataMessage="No transformations found. Click 'Add Transformation' to create one."
            />

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingItem ? 'Edit Transformation' : 'Add New Transformation'}</h3>
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
                                    placeholder="e.g., Nail Extension Transformation"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Describe the transformation..."
                                ></textarea>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
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
                                <label className="block font-medium mb-2">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., Gel Extensions, Nail Art, French Tips"
                                />
                                <p className="text-xs text-gray mt-1">Separate tags with commas</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                {/* Before Image */}
                                <div>
                                    <label className="block font-medium mb-2">
                                        Before Image {editingItem ? '(Optional)' : ''}
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        {beforePreview ? (
                                            <div className="relative">
                                                <img src={beforePreview} alt="Before Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveBeforeImage}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <i className="fas fa-times text-xs"></i>
                                                </button>
                                                <p className="text-xs text-gray">Click × to remove image</p>
                                            </div>
                                        ) : (
                                            <>
                                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                                <p className="text-sm text-gray">Click to upload before image</p>
                                                <p className="text-xs text-gray">PNG, JPG up to 5MB</p>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBeforeImageChange}
                                            className="hidden"
                                            id="before-image"
                                        />
                                        {!beforePreview && (
                                            <label htmlFor="before-image" className="mt-2 inline-block text-primary text-sm cursor-pointer hover:text-primary-dark">
                                                Choose Image
                                            </label>
                                        )}
                                    </div>
                                </div>
                                
                                {/* After Image */}
                                <div>
                                    <label className="block font-medium mb-2">
                                        After Image {editingItem ? '(Optional)' : ''}
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        {afterPreview ? (
                                            <div className="relative">
                                                <img src={afterPreview} alt="After Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveAfterImage}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <i className="fas fa-times text-xs"></i>
                                                </button>
                                                <p className="text-xs text-gray">Click × to remove image</p>
                                            </div>
                                        ) : (
                                            <>
                                                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                                <p className="text-sm text-gray">Click to upload after image</p>
                                                <p className="text-xs text-gray">PNG, JPG up to 5MB</p>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAfterImageChange}
                                            className="hidden"
                                            id="after-image"
                                        />
                                        {!afterPreview && (
                                            <label htmlFor="after-image" className="mt-2 inline-block text-primary text-sm cursor-pointer hover:text-primary-dark">
                                                Choose Image
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="submit" className="btn flex-1">
                                    {editingItem ? 'Update Transformation' : 'Create Transformation'}
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

export default AdminTransformations;