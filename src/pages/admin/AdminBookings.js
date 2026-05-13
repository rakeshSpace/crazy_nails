import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Bookings</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white dark:bg-dark-light rounded-xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light dark:bg-dark">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Date & Time</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray">No bookings found.</td>
                </tr>
              ) : (
                filteredBookings.map(booking => (
                  <tr key={booking.id} className="border-t border-light-gray dark:border-gray-700">
                    <td className="px-4 py-3">#{booking.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{booking.customer_name}</p>
                        <p className="text-xs text-gray">{booking.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{booking.service_name}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p>{new Date(booking.booking_date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray">{booking.booking_time}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={booking.status}
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;