import React, { useEffect } from 'react';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    footer = null
}) => {
    // Size classes
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[90vw] w-full'
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />
            
            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div 
                    className={`${sizeClasses[size]} w-full bg-white dark:bg-dark rounded-2xl shadow-2xl transform transition-all duration-300 animate-slide-up`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-light-gray dark:border-gray-700">
                        <h3 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                            {title}
                        </h3>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            >
                                <i className="fas fa-times text-lg"></i>
                            </button>
                        )}
                    </div>
                    
                    {/* Body */}
                    <div className="p-5 max-h-[calc(90vh-140px)] overflow-y-auto custom-scroll">
                        {children}
                    </div>
                    
                    {/* Footer */}
                    {footer && (
                        <div className="p-5 border-t border-light-gray dark:border-gray-700 bg-gray-50 dark:bg-dark-light rounded-b-2xl">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;