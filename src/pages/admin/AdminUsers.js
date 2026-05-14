import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user'
    });
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
            // Mock data for demo
            setUsers([
                { id: 1, name: 'Admin User', email: 'admin@crazynails.com', phone: '8264304266', role: 'admin', is_active: 1, created_at: new Date().toISOString() },
                { id: 2, name: 'John Doe', email: 'john@example.com', phone: '9876543210', role: 'user', is_active: 1, created_at: new Date().toISOString() },
                { id: 3, name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', role: 'staff', is_active: 0, created_at: new Date().toISOString() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, role) => {
        try {
            await api.put(`/auth/users/${userId}/role`, { role });
            toast.success('User role updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const action = newStatus === 1 ? 'activate' : 'deactivate';
        
        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                await api.put(`/auth/users/${userId}/status`, { is_active: newStatus });
                toast.success(`User ${action}d successfully`);
                fetchUsers();
            } catch (error) {
                toast.error(`Failed to ${action} user`);
            }
        }
    };

    const editUser = (user) => {
        setSelectedUser(user);
        setEditFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role
        });
        setShowEditModal(true);
    };

    const saveUserEdit = async () => {
        try {
            await api.put(`/auth/users/${selectedUser.id}`, editFormData);
            toast.success('User updated successfully');
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/auth/users/${userId}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            staff: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            user: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
        return badges[role] || 'bg-gray-100 text-gray-800';
    };

    // Role filter component
    const RoleFilter = () => (
        <div className="flex flex-wrap gap-2">
            {['all', 'admin', 'staff', 'user'].map(role => (
                <button
                    key={role}
                    onClick={() => setFilterRole(role)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filterRole === role
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-light dark:text-gray-300'
                    }`}
                >
                    {role === 'all' ? 'All' : role.toUpperCase()}
                </button>
            ))}
        </div>
    );

    const filteredUsers = filterRole === 'all' 
        ? users 
        : users.filter(user => user.role === filterRole);

    const columns = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
            width: '70px',
            cell: row => <span className="font-mono text-sm">#{row.id}</span>,
        },
        {
            name: 'User',
            selector: row => row.name,
            sortable: true,
            cell: row => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {row.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-dark dark:text-white">{row.name}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                    </div>
                </div>
            ),
        },
        { name: 'Phone', selector: row => row.phone || '-', sortable: true, width: '120px' },
        {
            name: 'Role',
            selector: row => row.role,
            sortable: true,
            width: '120px',
            cell: row => (
                <select
                    value={row.role}
                    onChange={(e) => updateUserRole(row.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${getRoleBadge(row.role)} cursor-pointer`}
                >
                    <option value="user">User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                </select>
            ),
        },
        {
            name: 'Status',
            selector: row => row.is_active === 1 ? 'Active' : 'Inactive',
            sortable: true,
            width: '100px',
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    row.is_active === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                    {row.is_active === 1 ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            name: 'Joined',
            selector: row => new Date(row.created_at).toLocaleDateString(),
            sortable: true,
            width: '120px',
        },
        {
            name: 'Actions',
            width: '120px',
            cell: row => (
                <div className="flex gap-2">
                    <button onClick={() => editUser(row)} className="text-primary hover:text-primary-dark" title="Edit User">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button
                        onClick={() => toggleUserStatus(row.id, row.is_active)}
                        className={row.is_active === 1 ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}
                        title={row.is_active === 1 ? 'Deactivate' : 'Activate'}
                    >
                        <i className={`fas ${row.is_active === 1 ? 'fa-ban' : 'fa-check-circle'}`}></i>
                    </button>
                    {row.role !== 'admin' && (
                        <button onClick={() => deleteUser(row.id)} className="text-red-500 hover:text-red-600" title="Delete User">
                            <i className="fas fa-trash"></i>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const statsCards = [
        { title: 'Total Users', value: users.length, icon: 'fa-users', color: 'from-primary to-secondary' },
        { title: 'Active Users', value: users.filter(u => u.is_active === 1).length, icon: 'fa-user-check', color: 'from-green-500 to-green-600' },
        { title: 'Inactive Users', value: users.filter(u => u.is_active === 0).length, icon: 'fa-user-slash', color: 'from-red-500 to-red-600' },
        { title: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: 'fa-crown', color: 'from-purple-500 to-purple-600' },
        { title: 'Staff', value: users.filter(u => u.role === 'staff').length, icon: 'fa-user-tie', color: 'from-blue-500 to-blue-600' },
        { title: 'Customers', value: users.filter(u => u.role === 'user').length, icon: 'fa-user', color: 'from-yellow-500 to-yellow-600' },
    ];

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray text-xs mb-1">{card.title}</p>
                                <p className="text-xl font-bold">{card.value}</p>
                            </div>
                            <div className={`w-10 h-10 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center`}>
                                <i className={`fas ${card.icon} text-white text-lg`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Role Filter */}
            <div className="mb-4">
                <RoleFilter />
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredUsers}
                title="User Management"
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={10}
                exportable={true}
                exportFileName="users_export"
                noDataMessage="No users found"
                selectable={true}
                onSelectionChange={(selected) => console.log('Selected users:', selected)}
            />

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Edit User</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Role</label>
                                <select
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                >
                                    <option value="user">User</option>
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={saveUserEdit} className="btn flex-1">Save Changes</button>
                                <button onClick={() => setShowEditModal(false)} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;