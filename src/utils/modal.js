// Utility to handle modal body scroll
export const openModal = () => {
    document.body.classList.add('modal-open');
    window.dispatchEvent(new Event('modal-open'));
};

export const closeModal = () => {
    document.body.classList.remove('modal-open');
    window.dispatchEvent(new Event('modal-close'));
};

// Use in your modal components
// useEffect(() => {
//     openModal();
//     return () => closeModal();
// }, []);