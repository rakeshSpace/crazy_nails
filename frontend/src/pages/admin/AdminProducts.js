// frontend/src/pages/admin/AdminProducts.js

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
    const [removeImage, setRemoveImage] = useState(false);
    const [productImages, setProductImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [selectedProductReviews, setSelectedProductReviews] = useState([]);
    const [reviewFilter, setReviewFilter] = useState('pending');
    const [formData, setFormData] = useState({
        name: '',
        category: 'nail-care',
        description: '',
        price: '',
        original_price: '',
        discount_percent: '',
        offer_badge: '',
        offer_end_date: '',
        is_on_offer: false,
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
            console.log('Fetched products:', response.data);
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductImages = async (productId) => {
        try {
            const response = await api.get(`/products/${productId}/images`);
            setProductImages(response.data);
        } catch (error) {
            console.error('Failed to fetch product images:', error);
            setProductImages([]);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setRemoveImage(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setRemoveImage(true);
    };

    const handleMultipleImagesChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!editingProduct) {
            toast.error('Please save the product first, then upload additional images');
            return;
        }

        setUploadingImages(true);
        const formDataToSend = new FormData();
        files.forEach(file => {
            formDataToSend.append('images', file);
        });

        try {
            const response = await api.post(`/products/${editingProduct.id}/images`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`${response.data.images?.length || files.length} images uploaded successfully`);
            fetchProductImages(editingProduct.id);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.error || 'Failed to upload images');
        } finally {
            setUploadingImages(false);
            e.target.value = '';
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            await api.delete(`/products/images/${imageId}`);
            toast.success('Image deleted successfully');
            fetchProductImages(editingProduct.id);
        } catch (error) {
            console.error('Delete image error:', error);
            toast.error('Failed to delete image');
        }
    };

    const handleSetPrimaryImage = async (productId, imageId) => {
        try {
            await api.put(`/products/${productId}/images/${imageId}/primary`);
            toast.success('Primary image updated');
            fetchProductImages(productId);
            fetchProducts();
        } catch (error) {
            console.error('Set primary image error:', error);
            toast.error('Failed to set primary image');
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

    const handleFeaturedToggle = (e) => {
        setFormData(prev => ({ ...prev, is_featured: e.target.checked }));
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
            toast.error('Product name is required');
            return;
        }
        if (!formData.price) {
            toast.error('Price is required');
            return;
        }

        const submitData = {
            name: formData.name,
            category: formData.category,
            description: formData.description || '',
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity) || 0,
            badge: formData.badge || null,
            is_featured: formData.is_featured ? 1 : 0,
            rating: parseFloat(formData.rating) || 0,
            is_on_offer: formData.is_on_offer ? 1 : 0,
            original_price: formData.original_price ? parseFloat(formData.original_price) : null,
            discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : 0,
            offer_badge: formData.offer_badge || null,
            offer_end_date: formData.offer_end_date || null
        };

        console.log('Submitting product data:', submitData);

        const formDataToSend = new FormData();
        Object.keys(submitData).forEach(key => {
            if (submitData[key] !== null && submitData[key] !== undefined) {
                formDataToSend.append(key, submitData[key]);
            }
        });

        // Handle image for edit mode
        if (editingProduct) {
            if (removeImage) {
                // User wants to remove the main image
                formDataToSend.append('remove_image', 'true');
                console.log('Main image removal requested');
            } else if (imageFile) {
                // User uploaded a new main image
                formDataToSend.append('image', imageFile);
                console.log('New main image uploaded');
            }
            // If neither, keep existing main image
        } else {
            // New product - main image is optional
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
        }

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully');
                if (editingProduct.id) {
                    fetchProductImages(editingProduct.id);
                }
            } else {
                const response = await api.post('/products', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product created successfully');
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product? This will also delete all associated images.')) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Product deleted successfully');
                fetchProducts();
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    // Function to format date without timezone offset
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';

        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }

        // Parse the date string and extract year, month, day in local time
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        // Get local date components to avoid timezone shift
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const handleEdit = async (product) => {
        console.log('Editing product:', product);
        setEditingProduct(product);
        setRemoveImage(false);

        await fetchProductImages(product.id);

        const isOfferActive = product.is_on_offer === 1;
        const isFeaturedActive = product.is_featured === 1;

        const formattedEndDate = formatDateForInput(product.offer_end_date);

        setFormData({
            name: product.name || '',
            category: product.category || 'nail-care',
            description: product.description || '',
            price: product.price || '',
            original_price: product.original_price || '',
            discount_percent: product.discount_percent || '',
            offer_badge: product.offer_badge || '',
            offer_end_date: formattedEndDate,
            is_on_offer: isOfferActive,
            stock_quantity: product.stock_quantity || '',
            badge: product.badge || '',
            is_featured: isFeaturedActive,
            rating: product.rating || ''
        });

        if (product.image_url) {
            setImagePreview(`http://localhost:5000${product.image_url}`);
            setImageFile(null);
        } else {
            setImagePreview(null);
            setImageFile(null);
        }
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingProduct(null);
        setProductImages([]);
        setFormData({
            name: '',
            category: 'nail-care',
            description: '',
            price: '',
            original_price: '',
            discount_percent: '',
            offer_badge: '',
            offer_end_date: '',
            is_on_offer: false,
            stock_quantity: '',
            badge: '',
            is_featured: false,
            rating: ''
        });
        setImagePreview(null);
        setImageFile(null);
        setRemoveImage(false);
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
        { name: 'Stock', selector: row => row.stock_quantity || 0, sortable: true },
        {
            name: 'Offer Badge',
            selector: row => row.offer_badge || '-',
            sortable: true
        },
        {
            name: 'Valid Till',
            selector: row => {
                if (!row.offer_end_date) return '-';
                const date = new Date(row.offer_end_date);
                if (isNaN(date.getTime())) return '-';
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            },
            sortable: true
        },
        {
            name: 'Featured',
            width: '100px',
            cell: row => (
                row.is_featured === 1 ?
                    <span className="text-yellow-500"><i className="fas fa-star"></i> Featured</span> :
                    <span className="text-gray-400">No</span>
            ),
        },
        {
            name: 'SKU',
            selector: row => row.sku || '-',
            sortable: true,
            width: '120px'
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
        { title: 'Products on Offer', value: products.filter(p => p.is_on_offer === 1).length, icon: 'fa-tag', color: 'from-green-500 to-green-600' },
        { title: 'Featured', value: products.filter(p => p.is_featured === 1).length, icon: 'fa-star', color: 'from-yellow-500 to-yellow-600' },
    ];

    return (
        <div>
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

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-light-gray flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Product Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Enter product name"
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
                                    placeholder="Product description"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="0"
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
                                        placeholder="0"
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
                                        checked={formData.is_featured === true}
                                        onChange={handleFeaturedToggle}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-medium">Feature this product (show on homepage)</span>
                                </label>
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
                                    <span className="font-semibold text-primary">Enable Offer / Discount on this product</span>
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
                                                    placeholder="e.g., Limited Time, Mega Sale"
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

                            {/* Main Product Image */}
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Main Product Image</label>
                                <div className="border-2 border-dashed border-light-gray rounded-lg p-4 text-center">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <i className="fas fa-times text-xs"></i>
                                            </button>
                                            <p className="text-xs text-gray">Click × to remove image</p>
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
                                        <label htmlFor="product-image" className="mt-2 inline-block text-primary text-sm cursor-pointer hover:text-primary-dark">
                                            Choose Image
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Additional Images Section - Only show when editing */}
                            {editingProduct && (
                                <div className="mb-6">
                                    <label className="block font-medium mb-2">Additional Images (Multiple)</label>
                                    <div className="border-2 border-dashed border-light-gray rounded-lg p-4 text-center">
                                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                        <p className="text-sm text-gray">Upload additional product images</p>
                                        <p className="text-xs text-gray">You can upload up to 10 images at once</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleMultipleImagesChange}
                                            className="hidden"
                                            id="multiple-images"
                                            disabled={uploadingImages}
                                        />
                                        <label htmlFor="multiple-images" className="mt-2 inline-block text-primary text-sm cursor-pointer">
                                            {uploadingImages ? 'Uploading...' : 'Choose Images'}
                                        </label>
                                    </div>

                                    {/* Display uploaded additional images */}
                                    {productImages.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-medium mb-2">Product Gallery ({productImages.length} images)</h4>
                                            <div className="grid grid-cols-4 gap-3">
                                                {productImages.map((img, idx) => (
                                                    <div key={img.id} className="relative group">
                                                        <img
                                                            src={`http://localhost:5000${img.image_url}`}
                                                            alt={`Product ${idx + 1}`}
                                                            className="w-full h-20 object-cover rounded-lg"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                                            {!img.is_primary && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSetPrimaryImage(editingProduct.id, img.id)}
                                                                    className="w-6 h-6 bg-blue-500 rounded-full text-white flex items-center justify-center text-xs hover:scale-110 transition-transform"
                                                                    title="Set as primary image"
                                                                >
                                                                    <i className="fas fa-star"></i>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteImage(img.id)}
                                                                className="w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center text-xs hover:scale-110 transition-transform"
                                                                title="Delete image"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                        {img.is_primary && (
                                                            <span className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 rounded-full">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray mt-2">
                                                <i className="fas fa-info-circle mr-1"></i>
                                                Primary image appears as the main product image. These additional images will show in the product gallery.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

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