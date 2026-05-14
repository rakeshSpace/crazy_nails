import React from 'react';

const AdminFooter = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-gradient-to-r from-dark to-dark-light text-white pt-4 pb-4 mt-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center">
                    <p className="text-white/60 text-sm mb-0">
                        © {currentYear} Crazy Nails. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default AdminFooter;