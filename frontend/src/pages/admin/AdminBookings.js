import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

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

    const updateBookingStatus = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            toast.success(`Booking status updated to ${status}`);
            fetchBookings();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteBooking = async (id) => {
        if (window.confirm('Are you sure you want to delete this booking?')) {
            try {
                await api.delete(`/bookings/${id}`);
                toast.success('Booking deleted successfully');
                fetchBookings();
            } catch (error) {
                toast.error('Failed to delete booking');
            }
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'confirmed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusOptions = (currentStatus) => {
        const options = [
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' }
        ];
        return options;
    };

    // Status filter component
    const StatusFilter = () => (
        <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        filterStatus === status
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-light dark:text-gray-300'
                    }`}
                >
                    {status === 'all' ? 'All' : status.toUpperCase()}
                </button>
            ))}
        </div>
    );

    const filteredBookings = filterStatus === 'all' 
        ? bookings 
        : bookings.filter(booking => booking.status === filterStatus);

    const columns = [
        {
            name: 'ID',
            selector: row => row.id,
            sortable: true,
            width: '70px',
            cell: row => <span className="font-mono text-sm">#{row.id}</span>,
        },
        {
            name: 'Customer',
            selector: row => row.customer_name,
            sortable: true,
            cell: row => (
                <div>
                    <p className="font-medium text-dark dark:text-white">{row.customer_name}</p>
                    <p className="text-xs text-gray-500">{row.customer_phone}</p>
                </div>
            ),
        },
        {
            name: 'Service',
            selector: row => row.service_name,
            sortable: true,
            cell: row => (
                <div>
                    <p className="font-medium">{row.service_name}</p>
                    <p className="text-xs text-gray-500">₹{row.price}</p>
                </div>
            ),
        },
        {
            name: 'Date & Time',
            selector: row => row.booking_date,
            sortable: true,
            width: '150px',
            cell: row => (
                <div>
                    <p className="text-sm">{new Date(row.booking_date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{row.booking_time}</p>
                </div>
            ),
        },
        {
            name: 'Duration',
            selector: row => row.duration,
            sortable: true,
            width: '80px',
            cell: row => <span className="text-sm">{row.duration} min</span>,
        },
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            width: '140px',
            cell: row => (
                <select
                    value={row.status}
                    onChange={(e) => updateBookingStatus(row.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(row.status)} cursor-pointer`}
                >
                    {getStatusOptions(row.status).map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            ),
        },
        {
            name: 'Booked On',
            selector: row => new Date(row.created_at).toLocaleDateString(),
            sortable: true,
            width: '120px',
        },
        {
            name: 'Actions',
            width: '100px',
            cell: row => (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setSelectedBooking(row);
                            setShowDetailsModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-600"
                        title="View Details"
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        onClick={() => deleteBooking(row.id)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete"
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
        },
    ];

    const statsCards = [
        { title: 'Total Bookings', value: bookings.length, icon: 'fa-calendar', color: 'from-primary to-secondary' },
        { title: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: 'fa-clock', color: 'from-yellow-500 to-yellow-600' },
        { title: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: 'fa-check-circle', color: 'from-green-500 to-green-600' },
        { title: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: 'fa-check-double', color: 'from-blue-500 to-blue-600' },
        { title: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, icon: 'fa-times-circle', color: 'from-red-500 to-red-600' },
    ];

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft hover:shadow-medium transition-all">
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

            {/* Status Filter */}
            <div className="mb-4">
                <StatusFilter />
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={filteredBookings}
                title="Bookings Management"
                actions={
                    <button
                        onClick={() => window.location.href = '/booking'}
                        className="btn btn-small"
                    >
                        <i className="fas fa-plus mr-2"></i> New Booking
                    </button>
                }
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={10}
                exportable={true}
                exportFileName="bookings_export"
                noDataMessage="No bookings found"
                selectable={true}
                onSelectionChange={(selected) => console.log('Selected bookings:', selected)}
            />

            {/* Booking Details Modal */}
            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Booking Details</h3>
                            <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            {/* Booking Info */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray">Booking ID</p>
                                    <p className="font-semibold">#{selectedBooking.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray">Booking Date</p>
                                    <p className="font-semibold">{new Date(selectedBooking.booking_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray">Booking Time</p>
                                    <p className="font-semibold">{selectedBooking.booking_time}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray">Duration</p>
                                    <p className="font-semibold">{selectedBooking.duration} minutes</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray">Price</p>
                                    <p className="font-semibold text-primary">₹{selectedBooking.price}</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="bg-light dark:bg-dark-light rounded-lg p-4 space-y-2">
                                    <p><strong>Name:</strong> {selectedBooking.customer_name}</p>
                                    <p><strong>Email:</strong> {selectedBooking.customer_email}</p>
                                    <p><strong>Phone:</strong> {selectedBooking.customer_phone}</p>
                                </div>
                            </div>

                            {/* Service Info */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3">Service Information</h4>
                                <div className="bg-light dark:bg-dark-light rounded-lg p-4 space-y-2">
                                    <p><strong>Service:</strong> {selectedBooking.service_name}</p>
                                    <p><strong>Duration:</strong> {selectedBooking.duration} minutes</p>
                                    <p><strong>Price:</strong> ₹{selectedBooking.price}</p>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedBooking.notes && (
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3">Additional Notes</h4>
                                    <div className="bg-light dark:bg-dark-light rounded-lg p-4">
                                        <p>{selectedBooking.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3">Booking Timeline</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                                            <i className="fas fa-check text-sm"></i>
                                        </div>
                                        <div>
                                            <p className="font-medium">Booking Created</p>
                                            <p className="text-xs text-gray">{new Date(selectedBooking.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {selectedBooking.status === 'confirmed' && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                                                <i className="fas fa-check-double text-sm"></i>
                                            </div>
                                            <div>
                                                <p className="font-medium">Booking Confirmed</p>
                                                <p className="text-xs text-gray">Status updated to confirmed</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedBooking.status === 'completed' && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                                                <i className="fas fa-star text-sm"></i>
                                            </div>
                                            <div>
                                                <p className="font-medium">Service Completed</p>
                                                <p className="text-xs text-gray">Service has been completed</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        updateBookingStatus(selectedBooking.id, 'confirmed');
                                        setShowDetailsModal(false);
                                    }}
                                    className="btn flex-1"
                                    disabled={selectedBooking.status !== 'pending'}
                                >
                                    <i className="fas fa-check-circle mr-2"></i> Confirm Booking
                                </button>
                                <button
                                    onClick={() => {
                                        updateBookingStatus(selectedBooking.id, 'cancelled');
                                        setShowDetailsModal(false);
                                    }}
                                    className="btn-outline flex-1"
                                    disabled={selectedBooking.status === 'cancelled' || selectedBooking.status === 'completed'}
                                >
                                    <i className="fas fa-times-circle mr-2"></i> Cancel Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;