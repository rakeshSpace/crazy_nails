import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';

const VerifyCertificate = () => {
    const { code } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        verifyCertificate();
    }, [code]);

    const verifyCertificate = async () => {
        try {
            const response = await api.get(`/certificates/verify/${code}`);
            setCertificate(response.data.certificate);
        } catch (error) {
            setError(error.response?.data?.message || 'Certificate not found');
        } finally {
            setLoading(false);
        }
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
                <title>Certificate Verification | Crazy Nails & Lashes</title>
            </Helmet>

            <section className="min-h-screen py-28 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-2xl">
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-large overflow-hidden">
                        <div className={`p-6 text-center ${certificate ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
                            <i className={`fas ${certificate ? 'fa-check-circle' : 'fa-times-circle'} text-4xl mb-3`}></i>
                            <h1 className="text-2xl font-bold">
                                {certificate ? 'Certificate Verified' : 'Invalid Certificate'}
                            </h1>
                        </div>
                        
                        <div className="p-8">
                            {certificate ? (
                                <>
                                    <div className="text-center mb-6">
                                        <p className="text-gray">This is to certify that</p>
                                        <h2 className="text-2xl font-bold text-primary mt-2">{certificate.user_name}</h2>
                                        <p className="text-gray mt-2">has successfully completed</p>
                                        <h3 className="text-xl font-semibold mt-2">{certificate.course_name}</h3>
                                    </div>
                                    
                                    <div className="border-t border-light-gray dark:border-gray-700 pt-4 mt-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray">Certificate Number</p>
                                                <p className="font-mono">{certificate.certificate_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray">Issue Date</p>
                                                <p>{new Date(certificate.completion_date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray">Verification Code</p>
                                                <p className="font-mono">{certificate.verification_code}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray">Status</p>
                                                <p className="text-green-500 font-semibold">Valid & Active</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 p-4 bg-light dark:bg-dark-light rounded-lg text-center">
                                        <i className="fas fa-shield-alt text-primary mb-2"></i>
                                        <p className="text-sm text-gray">
                                            This certificate is issued by Crazy Nails & Lashes, 
                                            an authorized beauty training institute.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <i className="fas fa-search text-5xl text-gray-300 mb-4"></i>
                                    <h3 className="text-xl font-semibold mb-2">Certificate Not Found</h3>
                                    <p className="text-gray">
                                        The verification code you entered is invalid or the certificate has expired.
                                        Please check the code and try again.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default VerifyCertificate;