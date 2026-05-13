import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'nails',
    image_url: ''
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await api.get('/gallery');
      setGallery(response.data);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gallery', formData);
      toast.success('Image added to gallery');
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'nails', image_url: '' });
      fetchGallery();
    } catch (error) {
      toast.error('Failed to add image');
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

  const categories = [
    { value: 'nails', label: 'Nail Art' },
    { value: 'extensions', label: 'Nail Extensions' },
    { value: 'lashes', label: 'Eyelash Extensions' },
    { value: 'manicure', label: 'Manicure' },
    { value: 'pedicure', label: 'Pedicure' },
    { value: 'facials', label: 'Facials' }
  ];

  if (loading) {
    return <div className="flex justify-center py-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Gallery</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-small">
          <i className="fas fa-plus mr-2"></i> Add New Image
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map(item => (
          <div key={item.id} className="relative group bg-light dark:bg-dark-light rounded-xl overflow-hidden">
            <div className="aspect-square bg-accent dark:bg-primary/20 flex items-center justify-center">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-image text-4xl text-primary"></i>
              )}
            </div>
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => handleDelete(item.id)} className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
                <i className="fas fa-trash text-sm"></i>
              </button>
            </div>
            <div className="p-2 text-center">
              <p className="text-sm font-medium truncate">{item.title}</p>
              <span className="text-xs text-primary">{categories.find(c => c.value === item.category)?.label}</span>
            </div>
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-images text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray">No images in gallery. Add your first image.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Add to Gallery</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                  />
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
                <div className="mb-6">
                  <label className="block font-medium mb-2">Image URL</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn flex-1">Add Image</button>
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

export default AdminGallery;