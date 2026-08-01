// frontend/src/pages/PrivacyPolicy.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
    return (
        <>
            <Helmet>
                <title>Privacy Policy | Crazy Nails</title>
                <meta name="description" content="Learn how Crazy Nails collects, uses, and protects your personal information. Your privacy is important to us." />
            </Helmet>

            {/* Page Header */}
            <section className="page-header bg-gradient-to-r from-dark to-dark-light text-white py-28 text-center mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Privacy Policy</h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">How we collect, use, and protect your personal information</p>
                </div>
            </section>

            {/* Privacy Policy Content */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-light dark:bg-dark-light rounded-2xl p-8 shadow-soft">
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <p className="text-gray text-sm mb-8">
                                <i className="fas fa-calendar-alt text-primary mr-2"></i>
                                Last Updated: 24 July 2026
                            </p>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">1.</span>
                                Introduction
                            </h2>
                            <p className="text-gray mb-6">
                                Crazy Nails ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website, mobile application, and services.
                            </p>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">2.</span>
                                Information We Collect
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>
                                    <strong>2.1 Personal Information:</strong> We may collect personal information such as:
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Name, email address, and phone number</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Address and location details</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Payment information (processed securely through Razorpay)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Booking history and preferences</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Device and browser information</span>
                                    </li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">3.</span>
                                How We Use Your Information
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>We use your information to:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Process and confirm your bookings and orders</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Send appointment reminders and notifications</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Improve our services and customer experience</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Process payments securely</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Send promotional offers and updates (with your consent)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Respond to your inquiries and customer support requests</span>
                                    </li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">4.</span>
                                Information Sharing
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>We do not sell or rent your personal information to third parties. We may share your information in the following cases:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span><strong>Service Providers:</strong> Payment processors, delivery partners, and IT service providers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span><strong>Legal Requirements:</strong> To comply with applicable laws and regulations</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</span>
                                    </li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">5.</span>
                                Data Security
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>
                                    We take reasonable measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption and security protocols to safeguard your data.
                                </p>
                                <p>
                                    <strong>Security Measures:</strong>
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-shield-alt text-primary mt-1"></i>
                                        <span>SSL/TLS encryption for all data transmissions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-shield-alt text-primary mt-1"></i>
                                        <span>Secure payment processing through Razorpay</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-shield-alt text-primary mt-1"></i>
                                        <span>Regular security audits and vulnerability assessments</span>
                                    </li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">6.</span>
                                Cookies and Tracking
                            </h2>
                            <p className="text-gray mb-6">
                                We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can manage your cookie preferences through your browser settings.
                            </p>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">7.</span>
                                Your Rights
                            </h2>
                            <div className="space-y-4 text-gray mb-6">
                                <p>You have the right to:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Access and review your personal information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Update or correct your information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Request deletion of your personal information</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Opt-out of marketing communications</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <i className="fas fa-check-circle text-primary mt-1"></i>
                                        <span>Withdraw consent at any time</span>
                                    </li>
                                </ul>
                            </div>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">8.</span>
                                Data Retention
                            </h2>
                            <p className="text-gray mb-6">
                                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                            </p>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">9.</span>
                                Children's Privacy
                            </h2>
                            <p className="text-gray mb-6">
                                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                            </p>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">10.</span>
                                Updates to Privacy Policy
                            </h2>
                            <p className="text-gray mb-6">
                                We may update this Privacy Policy periodically. We will notify you of any changes by posting the updated policy on this page with a revised "Last Updated" date. We encourage you to review this policy regularly.
                            </p>

                            <h2 className="text-2xl font-bold text-dark dark:text-white mb-4 flex items-center gap-3">
                                <span className="text-primary text-3xl">11.</span>
                                Contact Us
                            </h2>
                            <div className="bg-white dark:bg-dark rounded-xl p-6 border border-light-gray dark:border-gray-700">
                                <p className="text-gray mb-2">
                                    If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:
                                </p>
                                <ul className="space-y-2 text-gray">
                                    <li className="flex items-center gap-3">
                                        <i className="fas fa-envelope text-primary w-5"></i>
                                        <span>privacy@crazynailss.com</span>
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

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <Link to="/" className="text-primary hover:underline">
                            <i className="fas fa-arrow-left mr-2"></i> Back to Home
                        </Link>
                        <Link to="/terms" className="text-primary hover:underline">
                            <i className="fas fa-file-alt mr-2"></i> Terms & Conditions
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default PrivacyPolicy;