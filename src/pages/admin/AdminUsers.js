import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Mock data for demo
      setUsers([
        { id: 1, name: 'Admin User', email: 'admin@crazynails.com', phone: '9999999999', role: 'admin', is_active: true },
        { id: 2, name: 'John Doe', email: 'john@example.com', phone: '9876543210', role: 'user', is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, role) => {
    try {
      await api.put(`/auth/users/${id}/role`, { role });
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const toggleStatus = async (id, is_active) => {
    try {
      await api.put(`/auth/users/${id}/status`, { is_active: !is_active });
      toast.success(`User ${!is_active ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="loading-spinner"></div></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      <div className="bg-white dark:bg-dark-light rounded-xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light dark:bg-dark">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-light-gray dark:border-gray-700">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="user">User</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(user.id, user.is_active)}
                      className={`px-3 py-1 rounded text-sm ${user.is_active ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;