import React, { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const TestimonialCarousel = ({ testimonials }) => {
    const sliderRef = useRef(null);

    // Custom Previous Arrow
    const PrevArrow = ({ onClick }) => {
        return (
            <button
                onClick={onClick}
                className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-dark rounded-full shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
            >
                <i className="fas fa-chevron-left text-sm"></i>
            </button>
        );
    };

    // Custom Next Arrow
    const NextArrow = ({ onClick }) => {
        return (
            <button
                onClick={onClick}
                className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-dark rounded-full shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300"
                style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
            >
                <i className="fas fa-chevron-right text-sm"></i>
            </button>
        );
    };

    const settings = {
        dots: true,
        infinite: testimonials && testimonials.length > 1,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        arrows: true,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    dots: true,
                }
            }
        ]
    };

    const IMAGE_BASE_URL = 'http://localhost:5000';

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/uploads')) return `${IMAGE_BASE_URL}${imageUrl}`;
        return `${IMAGE_BASE_URL}/uploads/testimonials/${imageUrl}`;
    };

    // If no testimonials, show placeholder
    if (!testimonials || testimonials.length === 0) {
        return (
            <div className="text-center py-12">
                <i className="fas fa-comment-dots text-5xl text-gray-300 mb-4"></i>
                <p className="text-gray">No testimonials yet. Be the first to share your experience!</p>
            </div>
        );
    }

    return (
        <div className="relative px-4 md:px-8 lg:px-10">
            <Slider ref={sliderRef} {...settings}>
                {testimonials.map((testimonial, index) => (
                    <div key={testimonial.id || index} className="px-3">
                        <div className="bg-white dark:bg-dark rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all h-full flex flex-col">
                            {/* Rating Stars */}
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i 
                                        key={star} 
                                        className={`fas fa-star ${star <= (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}
                                    ></i>
                                ))}
                            </div>
                            
                            {/* Comment */}
                            <p className="text-dark dark:text-white mb-6 italic leading-relaxed flex-grow line-clamp-4">
                                "{testimonial.comment}"
                            </p>
                            
                            {/* Author Info */}
                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-light-gray dark:border-gray-700">
                                {/* Profile Image / Initials */}
                                {testimonial.image_url ? (
                                    <img 
                                        src={getImageUrl(testimonial.image_url)} 
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                            const parent = e.target.parentElement;
                                            const fallback = document.createElement('div');
                                            fallback.className = 'w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg';
                                            fallback.textContent = testimonial.name?.charAt(0).toUpperCase() || '?';
                                            parent.insertBefore(fallback, e.target);
                                            e.target.remove();
                                        }}
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {testimonial.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold mb-0 text-dark dark:text-white">{testimonial.name}</h4>
                                    <p className="text-primary text-sm mb-0">{testimonial.role || 'Happy Customer'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default TestimonialCarousel;