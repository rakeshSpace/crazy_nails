import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import api from '../services/api';
import { Helmet } from 'react-helmet-async';

const Gallery = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Base URL for images (your backend server)
    const IMAGE_BASE_URL = 'http://localhost:5000';

    const categories = [
        { id: 'all', name: 'All Work' },
        { id: 'nails', name: 'Nail Art' },
        { id: 'extensions', name: 'Nail Extensions' },
        { id: 'lashes', name: 'Eyelash Extensions' },
        { id: 'manicure', name: 'Manicure' },
        { id: 'pedicure', name: 'Pedicure' },
        { id: 'facials', name: 'Facials' }
    ];

    const stats = [
        { number: '500+', label: 'Nail Designs Created' },
        { number: '300+', label: 'Happy Clients' },
        { number: '50+', label: 'Nail Art Awards' },
        { number: '100%', label: 'Client Satisfaction' }
    ];

    useEffect(() => {
        fetchGallery();
    }, []);

    useEffect(() => {
        filterGallery();
    }, [galleryItems, activeCategory]);

    const fetchGallery = async () => {
        try {
            const response = await api.get('/gallery');
            console.log('Gallery data from API:', response.data);
            setGalleryItems(response.data);
        } catch (error) {
            console.error('Failed to fetch gallery:', error);
            // Fallback to mock data for demo
            setGalleryItems([
                { id: 1, title: 'Floral Nail Art', description: 'Intricate floral design with 3D elements', category: 'nails', image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371' },
                { id: 2, title: 'French Tip with Glitter', description: 'Classic French manicure with glitter gradient', category: 'nails', image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796' },
                { id: 3, title: 'Volume Eyelash Extensions', description: 'Full volume eyelash extensions for dramatic look', category: 'lashes', image_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e' },
                { id: 4, title: 'Marble Nail Design', description: 'Elegant marble effect with gold foil accents', category: 'nails', image_url: 'https://images.unsplash.com/photo-1574098529590-f5d101f1c48a' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filterGallery = () => {
        if (activeCategory === 'all') {
            setFilteredItems(galleryItems);
        } else {
            setFilteredItems(galleryItems.filter(item => item.category === activeCategory));
        }
    };

    // Function to get correct image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        
        // If it's already a full URL (starts with http), return as is
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        
        // If it's a local path (starts with /uploads), prepend base URL
        if (imageUrl.startsWith('/uploads')) {
            return `${IMAGE_BASE_URL}${imageUrl}`;
        }
        
        // Otherwise, assume it's a local path
        return `${IMAGE_BASE_URL}/uploads/gallery/${imageUrl}`;
    };

    const openLightbox = (index) => {
        setCurrentIndex(index);
        setCurrentImage(filteredItems[index]);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setCurrentImage(null);
        document.body.style.overflow = 'auto';
    };

    const nextImage = () => {
        const nextIndex = (currentIndex + 1) % filteredItems.length;
        setCurrentIndex(nextIndex);
        setCurrentImage(filteredItems[nextIndex]);
    };

    const prevImage = () => {
        const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
        setCurrentIndex(prevIndex);
        setCurrentImage(filteredItems[prevIndex]);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentIndex]);

    const categoryDisplayNames = {
        nails: 'Nail Art',
        extensions: 'Nail Extensions',
        lashes: 'Eyelash Extensions',
        manicure: 'Manicure',
        pedicure: 'Pedicure',
        facials: 'Facials'
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
                <title>Gallery | Crazy Nails & Lashes</title>
                <meta name="description" content="Explore our portfolio of nail art, eyelash extensions, and beauty transformations. See why we're the preferred choice for premium beauty services." />
            </Helmet>

            {/* Page Header */}
            <section className="bg-gradient-to-r from-dark to-dark-light text-white py-28 text-center mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 max-w-7xl relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Our Work Gallery</h1>
                    <p className="text-white/90 text-lg max-w-2xl mx-auto">Explore our portfolio of nail art, eyelash extensions, and beauty transformations</p>
                </div>
            </section>

            {/* Category Filters */}
            <section className="py-6 bg-white dark:bg-dark border-b border-light-gray dark:border-gray-700 sticky top-20 z-30">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2 rounded-full font-medium transition-all ${
                                    activeCategory === cat.id
                                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-medium'
                                        : 'bg-white dark:bg-dark-light text-dark dark:text-white border border-light-gray dark:border-gray-700 hover:border-primary'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16">
                            <i className="fas fa-images text-6xl text-gray-300 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">No gallery items found</h3>
                            <p className="text-gray">Check back soon for more beautiful work!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItems.map((item, index) => {
                                const imageUrl = getImageUrl(item.image_url);
                                console.log(`Image ${item.id} URL:`, imageUrl);
                                
                                return (
                                    <div
                                        key={item.id}
                                        className="group relative rounded-2xl overflow-hidden cursor-pointer bg-light dark:bg-dark-light aspect-square"
                                        onClick={() => openLightbox(index)}
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    console.error(`Failed to load image: ${imageUrl}`);
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><i class="fas fa-image text-5xl text-primary"></i></div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <i className="fas fa-image text-5xl text-primary"></i>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                                            <span className="text-white text-xs bg-primary px-2 py-1 rounded-full inline-block w-fit mb-2">
                                                {categoryDisplayNames[item.category] || item.category}
                                            </span>
                                            <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                                            <p className="text-white/80 text-sm">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-light-gray dark:border-gray-700">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-6 bg-light dark:bg-dark-light rounded-xl hover:shadow-soft transition-all hover:-translate-y-1">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                                <p className="text-dark dark:text-white font-medium mb-0">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Before & After Section */}
            <section className="py-16 bg-light dark:bg-dark-light">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2 className="text-2xl md:text-3xl font-bold">Transformations</h2>
                        <p>See the amazing before and after results from our beauty treatments</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {/* Before/After 1 */}
                        <div className="bg-white dark:bg-dark rounded-2xl overflow-hidden shadow-soft">
                            <div className="grid grid-cols-2">
                                <div className="p-6 text-center border-r border-light-gray dark:border-gray-700">
                                    <h4 className="font-semibold mb-4">Before</h4>
                                    <div className="aspect-square bg-accent dark:bg-primary/20 rounded-xl flex flex-col items-center justify-center">
                                        <i className="fas fa-image text-4xl text-primary mb-3"></i>
                                        <p className="text-gray text-sm mb-0">Natural nails</p>
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <h4 className="font-semibold mb-4">After</h4>
                                    <div className="aspect-square bg-accent dark:bg-primary/20 rounded-xl flex flex-col items-center justify-center">
                                        <i className="fas fa-image text-4xl text-primary mb-3"></i>
                                        <p className="text-gray text-sm mb-0">Gel extensions with nail art</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-light-gray dark:border-gray-700">
                                <h3 className="font-bold mb-2">Nail Extension Transformation</h3>
                                <p className="text-gray text-sm mb-3">Client received gel nail extensions with intricate floral nail art design.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-accent dark:bg-primary/20 text-primary px-3 py-1 rounded-full">Gel Extensions</span>
                                    <span className="text-xs bg-accent dark:bg-primary/20 text-primary px-3 py-1 rounded-full">Nail Art</span>
                                    <span className="text-xs bg-accent dark:bg-primary/20 text-primary px-3 py-1 rounded-full">French Tips</span>
                                </div>
                            </div>
                        </div>

                        {/* Before/After 2 */}
                        <div className="bg-white dark:bg-dark rounded-2xl overflow-hidden shadow-soft">
                            <div className="grid grid-cols-2">
                                <div className="p-6 text-center border-r border-light-gray dark:border-gray-700">
                                    <h4 className="font-semibold mb-4">Before</h4>
                                    <div className="aspect-square bg-accent dark:bg-primary/20 rounded-xl flex flex-col items-center justify-center">
                                        <i className="fas fa-image text-4xl text-primary mb-3"></i>
                                        <p className="text-gray text-sm mb-0">Natural eyelashes</p>
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <h4 className="font-semibold mb-4">After</h4>
                                    <div className="aspect-square bg-accent dark:bg-primary/20 rounded-xl flex flex-col items-center justify-center">
                                        <i className="fas fa-image text-4xl text-primary mb-3"></i>
                                        <p className="text-gray text-sm mb-0">Volume eyelash extensions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-light-gray dark:border-gray-700">
                                <h3 className="font-bold mb-2">Eyelash Extension Transformation</h3>
                                <p className="text-gray text-sm mb-3">Volume eyelash extensions applied for a dramatic, eye-opening effect.</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs bg-accent dark:bg-primary/20 text-primary px-3 py-1 rounded-full">Volume Lashes</span>
                                    <span className="text-xs bg-accent dark:bg-primary/20 text-primary px-3 py-1 rounded-full">Eye Enhancement</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Instagram Feed */}
            <section className="py-16 bg-white dark:bg-dark">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="section-title">
                        <h2 className="text-2xl md:text-3xl font-bold">Follow Us on Instagram</h2>
                        <p>See more of our work and stay updated with the latest trends</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="group relative aspect-square bg-accent dark:bg-primary/20 rounded-xl overflow-hidden cursor-pointer">
                                <div className="w-full h-full flex items-center justify-center">
                                    <i className="fas fa-heart text-3xl text-primary group-hover:scale-110 transition-transform"></i>
                                </div>
                                <div className="absolute inset-0 bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <span className="text-white text-sm font-medium">@crazynails</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-medium transition-all">
                            <i className="fab fa-instagram"></i> Follow @crazynailsandlashes
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">Inspired by Our Work?</h2>
                    <p className="text-white/90 text-lg mb-8">Book an appointment to get your own beautiful transformation</p>
                    <Link to="/booking" className="btn bg-white text-primary hover:bg-accent">Book Your Appointment Now</Link>
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxOpen && currentImage && (
                <div className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center">
                    <button onClick={closeLightbox} className="absolute top-5 right-5 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/20 transition-all">
                        <i className="fas fa-times"></i>
                    </button>
                    <button onClick={prevImage} className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/20 transition-all">
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button onClick={nextImage} className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl hover:bg-white/20 transition-all">
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    <div className="max-w-4xl w-full mx-4">
                        <img 
                            src={getImageUrl(currentImage.image_url)}
                            alt={currentImage.title}
                            className="w-full h-auto rounded-2xl"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                            }}
                        />
                        <div className="mt-4 text-center">
                            <h3 className="text-white text-xl font-semibold mb-2">{currentImage.title}</h3>
                            <p className="text-white/70">{currentImage.description}</p>
                            <span className="inline-block mt-2 text-primary text-sm">{categoryDisplayNames[currentImage.category]}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Gallery;