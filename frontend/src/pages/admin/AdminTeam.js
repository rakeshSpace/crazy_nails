import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminTeam = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        experience: '',
        specialization: '',
        display_order: '',
        is_active: true,
        social_facebook: '',
        social_instagram: '',
        social_twitter: ''
    });

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            const response = await api.get('/team/admin/all');
            setTeamMembers(response.data);
        } catch (error) {
            console.error('Failed to fetch team members:', error);
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Name is required');
            return;
        }
        if (!formData.role) {
            toast.error('Role is required');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('role', formData.role);
        formDataToSend.append('experience', formData.experience);
        formDataToSend.append('specialization', formData.specialization);
        formDataToSend.append('display_order', formData.display_order || 0);
        formDataToSend.append('is_active', formData.is_active ? '1' : '0');
        formDataToSend.append('social_facebook', formData.social_facebook || '');
        formDataToSend.append('social_instagram', formData.social_instagram || '');
        formDataToSend.append('social_twitter', formData.social_twitter || '');

        // Handle image for edit mode
        if (editingMember) {
            if (removeImage) {
                // User wants to remove the image
                formDataToSend.append('remove_image', 'true');
                console.log('Team member image removal requested');
            } else if (imageFile) {
                // User uploaded a new image
                formDataToSend.append('image', imageFile);
                console.log('New team member image uploaded');
            }
            // If neither, keep existing image
        } else {
            // New team member - image is optional
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
        }

        try {
            if (editingMember) {
                await api.put(`/team/${editingMember.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Team member updated successfully');
            } else {
                await api.post('/team', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Team member created successfully');
            }
            resetForm();
            fetchTeamMembers();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this team member?')) {
            try {
                await api.delete(`/team/${id}`);
                toast.success('Team member deleted successfully');
                fetchTeamMembers();
            } catch (error) {
                toast.error('Failed to delete team member');
            }
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        setRemoveImage(false);
        setFormData({
            name: member.name || '',
            role: member.role || '',
            experience: member.experience || '',
            specialization: member.specialization || '',
            display_order: member.display_order || '',
            is_active: member.is_active === 1,
            social_facebook: member.social_facebook || '',
            social_instagram: member.social_instagram || '',
            social_twitter: member.social_twitter || ''
        });
        if (member.image_url) {
            setImagePreview(`http://localhost:5000${member.image_url}`);
            setImageFile(null);
        } else {
            setImagePreview(null);
            setImageFile(null);
        }
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingMember(null);
        setFormData({
            name: '',
            role: '',
            experience: '',
            specialization: '',
            display_order: '',
            is_active: true,
            social_facebook: '',
            social_instagram: '',
            social_twitter: ''
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
                    <img src={`http://localhost:5000${row.image_url}`} alt={row.name} className="w-12 h-12 object-cover rounded-full" />
                ) : (
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-primary"></i>
                    </div>
                )
            ),
        },
        { name: 'Name', selector: row => row.name, sortable: true },
        { name: 'Role', selector: row => row.role, sortable: true },
        { name: 'Experience', selector: row => row.experience?.substring(0, 50) + (row.experience?.length > 50 ? '...' : ''), sortable: true },
        { name: 'Specialization', selector: row => row.specialization || '-', sortable: true },
        { name: 'Display Order', selector: row => row.display_order || 0, sortable: true },
        {
            name: 'Status',
            width: '100px',
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
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

    const statsCards = [
        { title: 'Total Team Members', value: teamMembers.length, icon: 'fa-users', color: 'from-primary to-secondary' },
        { title: 'Active Members', value: teamMembers.filter(m => m.is_active === 1).length, icon: 'fa-user-check', color: 'from-green-500 to-green-600' },
        { title: 'Inactive', value: teamMembers.filter(m => m.is_active === 0).length, icon: 'fa-user-slash', color: 'from-red-500 to-red-600' },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                data={teamMembers}
                title="Team Management"
                actions={
                    <button onClick={() => setShowModal(true)} className="btn btn-small">
                        <i className="fas fa-plus mr-2"></i> Add Team Member
                    </button>
                }
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={10}
                exportable={true}
                exportFileName="team_members_export"
                noDataMessage="No team members found. Click 'Add Team Member' to create one."
            />

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Role/Designation *</label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="e.g., Head Nail Artist"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block font-medium mb-2">Experience</label>
                                <textarea
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., 8+ years experience specializing in nail extensions and intricate nail art."
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Specialization</label>
                                    <input
                                        type="text"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="e.g., Nail Extensions, Nail Art"
                                    />
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
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4"
                                    />
                                    <span className="font-medium">Show on website</span>
                                </label>
                            </div>

                            <div className="mb-4">
                                <label className="block font-medium mb-2">Social Media Links</label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <i className="fab fa-facebook text-blue-600 w-6"></i>
                                        <input
                                            type="url"
                                            value={formData.social_facebook}
                                            onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            placeholder="Facebook profile URL"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="fab fa-instagram text-pink-600 w-6"></i>
                                        <input
                                            type="url"
                                            value={formData.social_instagram}
                                            onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            placeholder="Instagram profile URL"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <i className="fab fa-twitter text-blue-400 w-6"></i>
                                        <input
                                            type="url"
                                            value={formData.social_twitter}
                                            onChange={(e) => setFormData({ ...formData, social_twitter: e.target.value })}
                                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                            placeholder="Twitter profile URL"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block font-medium mb-2">Profile Image</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-full mx-auto mb-2 border-2 border-primary" />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <i className="fas fa-times text-xs"></i>
                                            </button>
                                            <p className="text-xs text-gray">Click × to remove image</p>
                                        </div>
                                    ) : (
                                        <>
                                            <i className="fas fa-user-circle text-4xl text-gray-400 mb-2"></i>
                                            <p className="text-sm text-gray">Click to upload profile image</p>
                                            <p className="text-xs text-gray">PNG, JPG up to 5MB</p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="team-image"
                                    />
                                    <label htmlFor="team-image" className="mt-2 inline-block text-primary text-sm cursor-pointer hover:text-primary-dark">
                                        {imagePreview ? 'Change Image' : 'Choose Image'}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="btn flex-1">
                                    {editingMember ? 'Update Member' : 'Add Member'}
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

export default AdminTeam;