import React from 'react';

const WhatsAppFloat = () => {
    return (
        <a
            href="https://wa.me/918264304266?text=Hello%20Crazy%20Nails%20%26%20Lashes!%20I%20would%20like%20to%20book%20an%20appointment"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center text-2xl shadow-medium z-[1000] transition-all duration-300 hover:scale-110 hover:shadow-large animate-float"
        >
            <i className="fab fa-whatsapp"></i>
        </a>
    );
};

export default WhatsAppFloat;