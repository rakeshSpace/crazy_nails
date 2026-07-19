// frontend/src/pages/MyCertificates.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const MyCertificates = () => {
    const { user, isAuthenticated } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatingId, setGeneratingId] = useState(null);

    // Helper function to format date
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please login to view your certificates');
            return;
        }
        fetchCertificates();
    }, [isAuthenticated]);

    const fetchCertificates = async () => {
        try {
            setLoading(true);
            console.log('Fetching certificates...');
            const response = await api.get('/courses/my-certificates');
            console.log('Certificates fetched:', response.data);
            setCertificates(response.data);
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
            if (error.response?.status === 401) {
                toast.error('Please login again');
            } else {
                toast.error(error.response?.data?.error || 'Failed to load certificates');
            }
            setCertificates([]);
        } finally {
            setLoading(false);
        }
    };

    const downloadCertificate = async (certificate) => {
        setGeneratingId(certificate.id);
        try {
            // Generate PDF certificate
            const response = await api.post('/certificates/generate-pdf', {
                certificate_id: certificate.id
            }, { responseType: 'blob' });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate_${certificate.certificate_number || certificate.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Certificate downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error(error.response?.data?.error || 'Failed to download certificate');
        } finally {
            setGeneratingId(null);
        }
    };

    const shareCertificate = (certificate) => {
        const shareText = `I've successfully completed "${certificate.course_name}" certification from Crazy Nails & Lashes! 🎓✨\n\nVerify at: ${window.location.origin}/verify/${certificate.verification_code}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Certificate',
                text: shareText,
                url: `${window.location.origin}/verify/${certificate.verification_code}`
            }).catch(() => {
                // Fallback to clipboard
                navigator.clipboard.writeText(shareText);
                toast.success('Certificate details copied to clipboard!');
            });
        } else {
            navigator.clipboard.writeText(shareText);
            toast.success('Certificate details copied to clipboard!');
        }
    };

    const verifyCertificate = (verificationCode) => {
        window.open(`/verify/${verificationCode}`, '_blank');
    };

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
                <title>My Certificates | Crazy Nails & Lashes</title>
                <meta name="description" content="View and download your professional certificates from Crazy Nails & Lashes training courses." />
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
                        <p className="text-gray">Your professional achievements and certifications</p>
                    </div>

                    {certificates.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-dark rounded-2xl">
                            <i className="fas fa-certificate text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                            <p className="text-gray mb-6">Complete courses to earn professional certificates.</p>
                            <Link to="/courses" className="btn">Browse Courses</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificates.map(cert => (
                                <div key={cert.id} className="bg-white dark:bg-dark rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all">
                                    <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white text-center">
                                        <i className="fas fa-certificate text-3xl mb-2"></i>
                                        <h3 className="font-bold">Certificate of Completion</h3>
                                    </div>
                                    <div className="p-6 text-center">
                                        <p className="text-gray mb-2">This certificate is awarded to</p>
                                        <h2 className="text-xl font-bold mb-2">{cert.user_name || user?.name}</h2>
                                        <p className="text-gray mb-2">for successfully completing</p>
                                        <h3 className="text-lg font-semibold text-primary mb-4">{cert.course_name}</h3>
                                        
                                        <div className="border-t border-light-gray dark:border-gray-700 pt-4 mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray">Certificate No:</span>
                                                <span className="font-mono text-xs">{cert.certificate_number}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray">Issue Date:</span>
                                                <span>{formatDateForDisplay(cert.completion_date || cert.issued_at)}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 justify-center">
                                            <button
                                                onClick={() => downloadCertificate(cert)}
                                                disabled={generatingId === cert.id}
                                                className="btn btn-small"
                                            >
                                                {generatingId === cert.id ? (
                                                    <><i className="fas fa-spinner fa-spin mr-2"></i> Generating...</>
                                                ) : (
                                                    <><i className="fas fa-download mr-2"></i> Download PDF</>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => shareCertificate(cert)}
                                                className="btn-outline btn-small"
                                            >
                                                <i className="fas fa-share-alt mr-2"></i> Share
                                            </button>
                                            <button
                                                onClick={() => verifyCertificate(cert.verification_code)}
                                                className="btn-outline btn-small"
                                            >
                                                <i className="fas fa-qrcode mr-2"></i> Verify
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Verification Info */}
                    <div className="mt-12 p-6 bg-primary/10 rounded-2xl text-center">
                        <i className="fas fa-shield-alt text-2xl text-primary mb-3"></i>
                        <h3 className="text-lg font-semibold mb-2">Certificate Verification</h3>
                        <p className="text-gray text-sm">
                            All certificates can be verified online using the unique verification code.
                            Employers can verify your credentials instantly.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default MyCertificates;