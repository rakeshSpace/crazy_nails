import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const { user } = useAuth();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            console.log('Fetching bookings for user:', user?.email);
            const response = await api.get('/bookings/my-bookings');
            console.log('Bookings response:', response.data);
            setBookings(response.data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
            toast.success('Booking cancelled successfully');
            fetchBookings();
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    const filteredBookings = activeTab === 'all'
        ? bookings
        : bookings.filter(b => b.status === activeTab);

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };

    const statusNames = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };

    const tabs = [
        { id: 'all', name: 'All Bookings' },
        { id: 'pending', name: 'Pending' },
        { id: 'confirmed', name: 'Confirmed' },
        { id: 'completed', name: 'Completed' },
        { id: 'cancelled', name: 'Cancelled' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Bookings | Crazy Nails & Lashes</title>
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-large overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-secondary p-8">
                            <h1 className="text-white text-2xl font-bold">My Bookings</h1>
                            <p className="text-white/80">View and manage your appointments</p>
                        </div>

                        <div className="p-6">
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-light-gray dark:border-gray-700">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-4 py-2 rounded-full font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-primary to-secondary text-white'
                                                : 'bg-white dark:bg-dark-light text-dark dark:text-white border border-light-gray dark:border-gray-700 hover:border-primary'
                                            }`}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </div>

                            {/* Bookings List */}
                            {filteredBookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <i className="fas fa-calendar-check text-6xl text-gray-300 mb-4"></i>
                                    <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
                                    <p className="text-gray mb-6">You haven't made any appointments yet.</p>
                                    <Link to="/booking" className="btn">Book an Appointment</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredBookings.map(booking => (
                                        <div key={booking.id} className="border border-light-gray dark:border-gray-700 rounded-xl p-5 hover:shadow-soft transition-all">
                                            <div className="flex flex-wrap justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                                                        <h3 className="text-lg font-semibold">{booking.service_name}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status]}`}>
                                                            {statusNames[booking.status]}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <p className="text-gray">
                                                            <i className="far fa-calendar-alt text-primary w-5"></i>
                                                            {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-gray">
                                                            <i className="far fa-clock text-primary w-5"></i>
                                                            {booking.booking_time} • {booking.duration} minutes
                                                        </p>
                                                        <p className="text-gray">
                                                            <i className="fas fa-rupee-sign text-primary w-5"></i>
                                                            ₹{booking.price}
                                                        </p>
                                                        {booking.notes && (
                                                            <p className="text-gray text-sm">
                                                                <i className="fas fa-note-sticky text-primary w-5"></i>
                                                                {booking.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray mt-3">
                                                        Booked on {new Date(booking.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {booking.status === 'pending' && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => cancelBooking(booking.id)}
                                                            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default MyBookings;