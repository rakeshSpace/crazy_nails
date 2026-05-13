import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'nail-care',
    description: '',
    price: '',
    original_price: '',
    stock_quantity: '',
    badge: '',
    is_featured: false
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', formData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', category: 'nail-care', description: '', price: '', original_price: '', stock_quantity: '', badge: '', is_featured: false });
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

  const categories = [
    { value: 'nail-care', label: 'Nail Care' },
    { value: 'lash-care', label: 'Lash Care' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'hair-removal', label: 'Hair Removal' },
    { value: 'tools', label: 'Tools & Kits' }
  ];

  if (loading) {
    return <div className="flex justify-center py-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <button onClick={() => { setEditingProduct(null); setFormData({ name: '', category: 'nail-care', description: '', price: '', original_price: '', stock_quantity: '', badge: '', is_featured: false }); setShowModal(true); }} className="btn btn-small">
          <i className="fas fa-plus mr-2"></i> Add New Product
        </button>
      </div>

      <div className="bg-white dark:bg-dark-light rounded-xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light dark:bg-dark">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Featured</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray">No products found. Add your first product.</td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="border-t border-light-gray dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-accent dark:bg-primary/20 text-primary rounded-full text-xs">
                        {categories.find(c => c.value === product.category)?.label || product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹{product.price}</td>
                    <td className="px-4 py-3">{product.stock_quantity}</td>
                    <td className="px-4 py-3">
                      {product.is_featured ? <i className="fas fa-star text-yellow-500"></i> : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            name: product.name,
                            category: product.category,
                            description: product.description || '',
                            price: product.price,
                            original_price: product.original_price || '',
                            stock_quantity: product.stock_quantity,
                            badge: product.badge || '',
                            is_featured: product.is_featured
                          });
                          setShowModal(true);
                        }} className="text-primary hover:text-primary-dark">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-600">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-medium mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
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
                    className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium mb-2">Price (₹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Original Price (₹)</label>
                    <input
                      type="number"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
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
                      className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Badge</label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Bestseller, New, etc."
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Feature this product</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn flex-1">{editingProduct ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;