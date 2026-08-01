// frontend/src/pages/Terms.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Terms = () => {
    return (
        <>
            <Helmet>
                <title>Terms & Conditions | Crazy Nails</title>
                <meta name="description" content="Read our terms and conditions for using Crazy Nails services, booking appointments, and purchasing products." />
            </Helmet>

            {/* Page Header */}
            <section className="page-header bg-gradient-to-r from-dark to-dark-light text-white py-28 text-center mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Terms & Conditions</h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">Please read our terms and conditions carefully before using our services</p>
                </div>
            </section>

            {/* Terms Content */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-light dark:bg-dark-light rounded-2xl p-8 shadow-soft">
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <p className="text-gray text-sm mb-8">
                                <i className="fas fa-calendar-alt text-primary mr-2"></i>
                                Last Updated: 24 July 2026
                            </p>

                            {/* Section 1 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">1.</span>
                                Introduction
                            </h2>
                            <p className="text-gray mb-6">
                                Welcome to Crazy Nails ("we", "our", "us"). These Terms and Conditions ("Terms") govern your use of our website, mobile application, and services offered by Crazy Nails. By accessing or using our services, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our services.
                            </p>

                            {/* Section 2 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">2.</span>
                                Services Offered
                            </h2>
                            <p className="text-gray mb-4">
                                Crazy Nails provides the following services:
                            </p>
                            <ul className="space-y-2 text-gray mb-6">
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Professional nail care services including manicure, pedicure, nail extensions, and nail art</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Eyelash extension services (classic, volume, and mega volume)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Facials and skincare treatments</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Waxing and hair removal services</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Beauty and skincare products for retail</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fas fa-check-circle text-primary mt-1"></i>
                                    <span>Professional training and certification courses</span>
                                </li>
                            </ul>

                            {/* Section 3 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">3.</span>
                                Booking and Appointments
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>
                                    <strong>3.1 Booking Confirmation:</strong> All bookings are subject to availability. A booking is confirmed only when you receive a confirmation email or SMS from us.
                                </p>
                                <p>
                                    <strong>3.2 Cancellation Policy:</strong> Cancellations must be made at least <strong>24 hours</strong> in advance. Late cancellations may result in a cancellation fee of up to 50% of the service price.
                                </p>
                                <p>
                                    <strong>3.3 No-Show Policy:</strong> If you fail to show up for your appointment without prior notice, you may be charged the full service price.
                                </p>
                                <p>
                                    <strong>3.4 Late Arrival:</strong> If you arrive more than 15 minutes late, we may need to shorten your service or reschedule your appointment.
                                </p>
                                <p>
                                    <strong>3.5 Rescheduling:</strong> You can reschedule your appointment up to 24 hours before your scheduled time at no extra charge.
                                </p>
                            </div>

                            {/* Section 4 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">4.</span>
                                Payments and Pricing
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>
                                    <strong>4.1 Pricing:</strong> All prices are in Indian Rupees (₹) and include applicable taxes unless otherwise stated.
                                </p>
                                <p>
                                    <strong>4.2 Payment Methods:</strong> We accept payments through Razorpay (cards, UPI, netbanking) and Cash on Delivery (for products).
                                </p>
                                <p>
                                    <strong>4.3 Payment Security:</strong> All online transactions are secured using industry-standard encryption. Your payment details are never stored on our servers.
                                </p>
                                <p>
                                    <strong>4.4 Refunds:</strong> Refunds are processed within 5-7 business days. Refunds will be credited to the original payment method used.
                                </p>
                            </div>

                            {/* Section 5 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">5.</span>
                                Product Orders and Delivery
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>
                                    <strong>5.1 Order Confirmation:</strong> Once you place an order, you will receive a confirmation email with your order details.
                                </p>
                                <p>
                                    <strong>5.2 Delivery:</strong> We deliver products within 3-7 business days. Delivery charges apply for orders below ₹2000.
                                </p>
                                <p>
                                    <strong>5.3 Returns and Exchanges:</strong> You can return or exchange products within 7 days of delivery. Products must be unused and in original packaging.
                                </p>
                                <p>
                                    <strong>5.4 Damaged Items:</strong> If you receive damaged or defective products, please contact us within 24 hours of delivery.
                                </p>
                            </div>

                            {/* Section 6 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">6.</span>
                                User Account
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>
                                    <strong>6.1 Account Creation:</strong> You must create an account to book appointments and place orders. You are responsible for maintaining the confidentiality of your account credentials.
                                </p>
                                <p>
                                    <strong>6.2 Account Security:</strong> You agree to notify us immediately of any unauthorized use of your account.
                                </p>
                                <p>
                                    <strong>6.3 Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate our terms or policies.
                                </p>
                            </div>

                            {/* Section 7 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">7.</span>
                                Hygiene and Safety
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>
                                    <strong>7.1 Sanitation:</strong> All tools and equipment are sterilized after each use. Single-use items are disposed of properly.
                                </p>
                                <p>
                                    <strong>7.2 Health Conditions:</strong> Please inform us of any allergies, skin conditions, or health concerns before your appointment.
                                </p>
                                <p>
                                    <strong>7.3 Safety Protocols:</strong> We follow strict safety protocols to ensure a clean and safe environment for our clients and staff.
                                </p>
                            </div>

                            {/* Section 8 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">8.</span>
                                Intellectual Property
                            </h2>
                            <p className="text-gray mb-6">
                                All content on our website, including text, images, logos, and designs, are the intellectual property of Crazy Nails. You may not reproduce, distribute, or use our content without prior written permission.
                            </p>

                            {/* Section 9 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">9.</span>
                                Privacy Policy
                            </h2>
                            <p className="text-gray mb-6">
                                Your privacy is important to us. Please read our <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your personal information.
                            </p>

                            {/* Section 10 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">10.</span>
                                Limitation of Liability
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>
                                    <strong>10.1</strong> Crazy Nails is not liable for any indirect, incidental, or consequential damages arising from the use of our services.
                                </p>
                                <p>
                                    <strong>10.2</strong> Our liability is limited to the total amount paid for the service or product in question.
                                </p>
                                <p>
                                    <strong>10.3</strong> We are not responsible for any allergic reactions or adverse effects resulting from our treatments or products.
                                </p>
                            </div>

                            {/* Section 11 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">11.</span>
                                Modifications
                            </h2>
                            <p className="text-gray mb-6">
                                We reserve the right to update these Terms at any time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of our services constitutes acceptance of the updated Terms.
                            </p>

                            {/* Section 12 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">12.</span>
                                Governing Law
                            </h2>
                            <p className="text-gray mb-6">
                                These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.
                            </p>

                            {/* Section 13 */}
                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">13.</span>
                                Contact Us
                            </h2>
                            <div className="bg-white dark:bg-dark rounded-xl p-6 border border-light-gray dark:border-gray-700">
                                <p className="text-gray mb-2">
                                    If you have any questions or concerns about these Terms, please contact us:
                                </p>
                                <ul className="space-y-2 text-gray">
                                    <li className="flex items-center gap-3">
                                        <i className="fas fa-envelope text-primary w-5"></i>
                                        <span>terms@crazynailss.com</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <i className="fas fa-phone-alt text-primary w-5"></i>
                                        <span>8264304266 / 8264304206</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <i className="fas fa-map-marker-alt text-primary w-5"></i>
                                        <span>45, 2nd Cross Rd, opposite to Simon Burgers, near Venkateswara Garments, Ramaiah Layout, Kammanahalli, Bengaluru, Karnataka 560084</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-8">
                        <Link to="/" className="text-primary hover:underline">
                            <i className="fas fa-arrow-left mr-2"></i> Back to Home
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Terms;