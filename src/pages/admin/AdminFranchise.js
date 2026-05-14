import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminFranchise = () => {
    const [applications, setApplications] = useState([]);
    const [franchises, setFranchises] = useState([]);
    const [activeTab, setActiveTab] = useState('applications');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('Fetching franchise data...');
            
            const [appsRes, franchisesRes] = await Promise.all([
                api.get('/franchise/applications'),
                api.get('/franchise/partners')
            ]);
            
            console.log('Applications:', appsRes.data);
            console.log('Franchises:', franchisesRes.data);
            
            setApplications(appsRes.data || []);
            setFranchises(franchisesRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error(error.response?.data?.error || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const updateApplicationStatus = async (id, status) => {
        try {
            await api.put(`/franchise/applications/${id}/status`, { 
                status, 
                admin_notes: adminNotes 
            });
            toast.success(`Application ${status}`);
            fetchData();
            setShowModal(false);
            setAdminNotes('');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const applicationColumns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '70px' },
        { name: 'Name', selector: row => row.full_name, sortable: true },
        { name: 'Email', selector: row => row.email, sortable: true },
        { name: 'Phone', selector: row => row.phone, sortable: true },
        { name: 'City', selector: row => row.city, sortable: true },
        { name: 'State', selector: row => row.state, sortable: true },
        { 
            name: 'Status', 
            selector: row => row.status, 
            sortable: true, 
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    row.status === 'approved' ? 'bg-green-100 text-green-800' :
                    row.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    row.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {row.status}
                </span>
            )
        },
        { 
            name: 'Submitted', 
            selector: row => new Date(row.created_at).toLocaleDateString(), 
            sortable: true 
        },
        {
            name: 'Actions',
            width: '100px',
            cell: row => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedApp(row);
                            setSelectedStatus(row.status);
                            setAdminNotes(row.admin_notes || '');
                            setShowModal(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                        title="Update Status"
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                </div>
            ),
        },
    ];

    const franchiseColumns = [
        { name: 'Code', selector: row => row.partner_code, sortable: true },
        { name: 'Name', selector: row => row.full_name, sortable: true },
        { name: 'Email', selector: row => row.email, sortable: true },
        { name: 'Phone', selector: row => row.phone, sortable: true },
        { name: 'City', selector: row => row.city, sortable: true },
        { name: 'Revenue Share', selector: row => `${row.revenue_share_percentage}%`, sortable: true },
        { 
            name: 'Status', 
            selector: row => row.status, 
            sortable: true, 
            cell: row => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    row.status === 'active' ? 'bg-green-100 text-green-800' : 
                    row.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {row.status}
                </span>
            )
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('applications')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'applications'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-600 hover:text-primary'
                    }`}
                >
                    <i className="fas fa-file-alt mr-2"></i> 
                    Applications ({applications.length})
                </button>
                <button
                    onClick={() => setActiveTab('franchises')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'franchises'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-600 hover:text-primary'
                    }`}
                >
                    <i className="fas fa-store mr-2"></i> 
                    Franchise Partners ({franchises.length})
                </button>
            </div>

            {/* Applications Tab */}
            {activeTab === 'applications' && (
                <DataTable
                    columns={applicationColumns}
                    data={applications}
                    title="Franchise Applications"
                    progressPending={loading}
                    searchable={true}
                    pagination={true}
                    itemsPerPage={10}
                    exportable={true}
                    exportFileName="franchise_applications"
                    noDataMessage="No franchise applications found"
                />
            )}

            {/* Franchises Tab */}
            {activeTab === 'franchises' && (
                <DataTable
                    columns={franchiseColumns}
                    data={franchises}
                    title="Franchise Partners"
                    progressPending={loading}
                    searchable={true}
                    pagination={true}
                    exportable={true}
                    exportFileName="franchise_partners"
                    noDataMessage="No franchise partners found"
                />
            )}

            {/* Status Update Modal */}
            {showModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Update Application</h3>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-sm text-gray">Applicant Details</p>
                                <p className="font-semibold">{selectedApp.full_name}</p>
                                <p className="text-sm">{selectedApp.email} | {selectedApp.phone}</p>
                                <p className="text-sm">{selectedApp.city}, {selectedApp.state}</p>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="reviewing">Reviewing</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block font-medium mb-2">Admin Notes</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Add notes for internal reference..."
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => updateApplicationStatus(selectedApp.id, selectedStatus)}
                                    className="btn flex-1"
                                >
                                    Update Status
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="btn-outline flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFranchise;