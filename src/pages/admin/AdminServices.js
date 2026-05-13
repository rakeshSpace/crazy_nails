import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'nails',
    description: '',
    price: '',
    duration: '',
    image_url: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
        toast.success('Service updated successfully');
      } else {
        await api.post('/services', formData);
        toast.success('Service created successfully');
      }
      setShowModal(false);
      setEditingService(null);
      setFormData({ name: '', category: 'nails', description: '', price: '', duration: '', image_url: '' });
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
      image_url: service.image_url || ''
    });
    setShowModal(true);
  };

  const categories = [
    { value: 'nails', label: 'Nail Services' },
    { value: 'lashes', label: 'Eyelash Services' },
    { value: 'facials', label: 'Facials & Skin' },
    { value: 'waxing', label: 'Waxing & Threading' },
    { value: 'manicure', label: 'Manicure' },
    { value: 'pedicure', label: 'Pedicure' },
    { value: 'addons', label: 'Add-On Services' }
  ];

  if (loading) {
    return <div className="flex justify-center py-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Services</h2>
        <button onClick={() => { setEditingService(null); setFormData({ name: '', category: 'nails', description: '', price: '', duration: '', image_url: '' }); setShowModal(true); }} className="btn btn-small">
          <i className="fas fa-plus mr-2"></i> Add New Service
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
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray">No services found. Add your first service.</td>
                </tr>
              ) : (
                services.map(service => (
                  <tr key={service.id} className="border-t border-light-gray dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">{service.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-accent dark:bg-primary/20 text-primary rounded-full text-xs">
                        {categories.find(c => c.value === service.category)?.label || service.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">₹{service.price}</td>
                    <td className="px-4 py-3">{service.duration} min</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(service)} className="text-primary hover:text-primary-dark">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-600">
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
              <h3 className="text-xl font-bold mb-4">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-medium mb-2">Service Name</label>
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
                    <label className="block font-medium mb-2">Duration (min)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block font-medium mb-2">Image URL (optional)</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn flex-1">{editingService ? 'Update' : 'Create'}</button>
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

export default AdminServices;