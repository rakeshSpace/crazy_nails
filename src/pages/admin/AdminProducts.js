import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'nail-care',
        description: '',
        price: '',
        original_price: '',
        stock_quantity: '',
        badge: '',
        is_featured: false,
        rating: ''
    });

    const categories = [
        { value: 'nail-care', label: 'Nail Care', color: 'bg-pink-500' },
        { value: 'lash-care', label: 'Lash Care', color: 'bg-purple-500' },
        { value: 'skincare', label: 'Skincare', color: 'bg-green-500' },
        { value: 'hair-removal', label: 'Hair Removal', color: 'bg-orange-500' },
        { value: 'tools', label: 'Tools & Kits', color: 'bg-blue-500' }
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
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
        formDataToSend.append('original_price', formData.original_price || '');
        formDataToSend.append('stock_quantity', formData.stock_quantity || 0);
        formDataToSend.append('badge', formData.badge || '');
        formDataToSend.append('is_featured', formData.is_featured ? '1' : '0');
        formDataToSend.append('rating', formData.rating || 0);
        
        if (imageFile) {
            formDataToSend.append('image', imageFile);
        }
        
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product created successfully');
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            description: product.description || '',
            price: product.price,
            original_price: product.original_price || '',
            stock_quantity: product.stock_quantity || 0,
            badge: product.badge || '',
            is_featured: product.is_featured === 1,
            rating: product.rating || ''
        });
        if (product.image_url) {
            setImagePreview(`http://localhost:5000${product.image_url}`);
        }
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            category: 'nail-care',
            description: '',
            price: '',
            original_price: '',
            stock_quantity: '',
            badge: '',
            is_featured: false,
            rating: ''
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
        { name: 'Stock', selector: row => row.stock_quantity || 0, sortable: true },
        {
            name: 'Featured',
            width: '100px',
            cell: row => (
                row.is_featured ? 
                    <span className="text-yellow-500"><i className="fas fa-star"></i> Featured</span> : 
                    <span className="text-gray-400">No</span>
            ),
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
        { title: 'Total Products', value: products.length, icon: 'fa-box', color: 'from-primary to-secondary' },
        { title: 'Low Stock', value: products.filter(p => p.stock_quantity < 10 && p.stock_quantity > 0).length, icon: 'fa-exclamation-triangle', color: 'from-yellow-500 to-yellow-600' },
        { title: 'Out of Stock', value: products.filter(p => p.stock_quantity === 0).length, icon: 'fa-times-circle', color: 'from-red-500 to-red-600' },
        { title: 'Featured', value: products.filter(p => p.is_featured).length, icon: 'fa-star', color: 'from-yellow-500 to-yellow-600' },
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
                data={products}
                title="Products Management"
                actions={
                    <button onClick={() => setShowModal(true)} className="btn btn-small">
                        <i className="fas fa-plus mr-2"></i> Add Product
                    </button>
                }
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={10}
                exportable={true}
                exportFileName="products_export"
                noDataMessage="No products found. Click 'Add Product' to create one."
            />

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-light-gray flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-4">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
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
                                    <label className="block font-medium mb-2">Original Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.original_price}
                                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Rating (1-5)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={formData.rating}
                                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Badge (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.badge}
                                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Bestseller, New, Sale, etc."
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-medium">Feature this product (show on homepage)</span>
                                </label>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Product Image</label>
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
                                        id="product-image"
                                    />
                                    {!imagePreview && (
                                        <label htmlFor="product-image" className="mt-2 inline-block text-primary text-sm cursor-pointer">
                                            Choose Image
                                        </label>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button type="submit" className="btn flex-1">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
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

export default AdminProducts;