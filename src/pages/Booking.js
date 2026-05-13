import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const Booking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [formData, setFormData] = useState({
        user_id: null,  // Add this field
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_id: '',
        booking_date: '',
        booking_time: '',
        notes: ''
    });

    useEffect(() => {
        fetchServices();

        // Pre-fill user data if authenticated
        if (isAuthenticated && user) {
            setFormData(prev => ({
                ...prev,
                user_id: user.id,  // Set user_id
                customer_name: user.name || '',
                customer_email: user.email || '',
                customer_phone: user.phone || ''
            }));
        }

        // Check for service parameter in URL
        const params = new URLSearchParams(location.search);
        const serviceId = params.get('service');
        if (serviceId) {
            setFormData(prev => ({ ...prev, service_id: serviceId }));
        }

        // Set min date for booking
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('booking-date');
        if (dateInput) dateInput.setAttribute('min', today);
    }, [isAuthenticated, user, location]);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
            toast.error('Failed to load services');
        }
    };

    const fetchAvailableSlots = async (date, serviceId) => {
        if (!date || !serviceId) return;
        try {
            const response = await api.get(`/bookings/slots?date=${date}&service_id=${serviceId}`);
            setAvailableSlots(response.data.slots || []);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'booking_date' || name === 'service_id') {
            fetchAvailableSlots(
                name === 'booking_date' ? value : formData.booking_date,
                name === 'service_id' ? value : formData.service_id
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Prepare data for API
        const bookingData = {
            user_id: isAuthenticated ? user?.id : null,
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            customer_phone: formData.customer_phone,
            service_id: parseInt(formData.service_id),
            booking_date: formData.booking_date,
            booking_time: formData.booking_time,
            notes: formData.notes || ''
        };

        console.log('Submitting booking:', bookingData);

        try {
            const response = await api.post('/bookings', bookingData);
            console.log('Booking response:', response.data);

            toast.success('Booking confirmed! We will contact you shortly.');

            // Reset form
            setFormData({
                user_id: isAuthenticated ? user?.id : null,
                customer_name: isAuthenticated ? user?.name || '' : '',
                customer_email: isAuthenticated ? user?.email || '' : '',
                customer_phone: isAuthenticated ? user?.phone || '' : '',
                service_id: '',
                booking_date: '',
                booking_time: '',
                notes: ''
            });
            setAvailableSlots([]);

            // Redirect to my bookings if logged in
            setTimeout(() => {
                if (isAuthenticated) {
                    navigate('/my-bookings');
                } else {
                    navigate('/');
                }
            }, 2000);
        } catch (error) {
            console.error('Booking error:', error);
            toast.error(error.response?.data?.error || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const workingHours = [
        { days: 'Monday - Saturday', hours: '9:00 AM - 8:00 PM' },
        { days: 'Sunday', hours: '10:00 AM - 6:00 PM' }
    ];

    const importantNotes = [
        'Please arrive 5-10 minutes before your appointment',
        'Cancellations require 24 hours notice',
        'Late arrivals may result in shortened service time',
        'Consultation is included with all first-time services'
    ];

    // Group services by category
    const servicesByCategory = services.reduce((acc, service) => {
        const categoryNames = {
            nails: 'Nail Services',
            lashes: 'Eyelash Services',
            facials: 'Facials & Skin',
            waxing: 'Waxing & Threading',
            manicure: 'Manicure',
            pedicure: 'Pedicure',
            addons: 'Add-On Services'
        };
        const category = categoryNames[service.category] || 'Other Services';
        if (!acc[category]) acc[category] = [];
        acc[category].push(service);
        return acc;
    }, {});

    return (
        <>
            <Helmet>
                <title>Book Appointment | Crazy Nails & Lashes</title>
                <meta name="description" content="Schedule your beauty treatment with our easy online booking system. Choose from nail extensions, eyelash treatments, facials, and more." />
            </Helmet>

            {/* Page Header */}
            <section className="page-header bg-gradient-to-r from-dark to-dark-light text-white py-28 text-center mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Book Your Appointment</h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">Schedule your beauty treatment with our easy online booking system</p>
                </div>
            </section>

            {/* Booking Section */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Booking Info */}
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Appointment Information</h2>
                            <p className="text-gray mb-8">Fill out the form to book your appointment. We'll confirm your booking via phone or email within 24 hours.</p>

                            {/* Working Hours */}
                            <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft mb-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <i className="fas fa-clock text-primary"></i> Working Hours
                                </h3>
                                <ul className="space-y-2">
                                    {workingHours.map((item, index) => (
                                        <li key={index} className="flex justify-between">
                                            <span className="text-gray">{item.days}</span>
                                            <span className="font-medium">{item.hours}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft mb-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <i className="fas fa-phone-alt text-primary"></i> Contact Information
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3">
                                        <i className="fas fa-phone-alt text-primary w-5"></i>
                                        <span>8264304266 / 8264304206</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <i className="fas fa-envelope text-primary w-5"></i>
                                        <span>bookings@crazynailsandlashes.com</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <i className="fas fa-map-marker-alt text-primary w-5"></i>
                                        <span>Beauty Parlour Street, City Center</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Important Notes */}
                            <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <i className="fas fa-info-circle text-primary"></i> Important Notes
                                </h3>
                                <ul className="space-y-2">
                                    {importantNotes.map((note, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <i className="fas fa-check-circle text-primary text-sm mt-1"></i>
                                            <span className="text-gray">{note}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Booking Form */}
                        <div className="bg-white dark:bg-dark rounded-2xl overflow-hidden shadow-large">
                            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-center">
                                <h2 className="text-white text-xl font-bold mb-2">Book Your Service</h2>
                                <p className="text-white/90">Fill out the form below to schedule your appointment</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block font-medium mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="customer_phone"
                                            value={formData.customer_phone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-2">Email Address *</label>
                                        <input
                                            type="email"
                                            name="customer_email"
                                            value={formData.customer_email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block font-medium mb-2">Select Service *</label>
                                    <select
                                        name="service_id"
                                        value={formData.service_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light appearance-none"
                                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%238b7355' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 15px center" }}
                                    >
                                        <option value="">Choose a service</option>
                                        {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                                            <optgroup key={category} label={category}>
                                                {categoryServices.map(service => (
                                                    <option key={service.id} value={service.id}>
                                                        {service.name} (₹{service.price})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block font-medium mb-2">Preferred Date *</label>
                                        <input
                                            type="date"
                                            id="booking-date"
                                            name="booking_date"
                                            value={formData.booking_date}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-2">Preferred Time *</label>
                                        <select
                                            name="booking_time"
                                            value={formData.booking_time}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light"
                                        >
                                            <option value="">Select time</option>
                                            {availableSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                        {availableSlots.length === 0 && formData.booking_date && formData.service_id && (
                                            <p className="text-xs text-yellow-500 mt-1">No available slots for this date. Please select another date.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block font-medium mb-2">Additional Notes (Optional)</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-light-gray dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-dark-light resize-vertical"
                                        placeholder="Any special requests, allergies, or additional information"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || availableSlots.length === 0}
                                    className="w-full btn py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <><i className="fas fa-spinner fa-spin mr-2"></i> Booking...</>
                                    ) : (
                                        'Book Appointment Now'
                                    )}
                                </button>
                                <p className="text-center text-gray text-xs mt-4">
                                    By booking, you agree to our <a href="#" className="text-primary">terms and conditions</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Booking;