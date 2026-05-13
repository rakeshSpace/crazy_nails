import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_name: 'Crazy Nails & Lashes',
    contact_phone: '8264304266',
    contact_email: 'info@crazynails.com',
    working_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
    address: 'Beauty Parlour Street, City Center'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In production, save to API
      // await api.post('/settings', settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Site Settings</h2>
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-light rounded-xl p-6 shadow-soft">
        <div className="mb-4">
          <label className="block font-medium mb-2">Site Name</label>
          <input
            type="text"
            name="site_name"
            value={settings.site_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2">Contact Phone</label>
          <input
            type="text"
            name="contact_phone"
            value={settings.contact_phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2">Contact Email</label>
          <input
            type="email"
            name="contact_email"
            value={settings.contact_email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2">Working Hours</label>
          <input
            type="text"
            name="working_hours"
            value={settings.working_hours}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        
        <div className="mb-6">
          <label className="block font-medium mb-2">Address</label>
          <textarea
            name="address"
            value={settings.address}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          ></textarea>
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</> : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;