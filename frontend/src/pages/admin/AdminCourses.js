// frontend/src/pages/admin/AdminCourses.js

import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');

    // Course details states
    const [modules, setModules] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [outcomes, setOutcomes] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Module modal
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [moduleForm, setModuleForm] = useState({
        title: '',
        description: '',
        video_url: '',
        duration_minutes: '',
        module_order: ''
    });

    // Requirement/Outcome
    const [newRequirement, setNewRequirement] = useState('');
    const [newOutcome, setNewOutcome] = useState('');

    // FAQ modal
    const [showFaqModal, setShowFaqModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [faqForm, setFaqForm] = useState({
        question: '',
        answer: '',
        display_order: '',
        is_active: true
    });

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        category: 'nails',
        level: 'beginner',
        duration_hours: '',
        price: '',
        original_price: '',
        discount_percent: '',
        offer_badge: '',
        offer_end_date: '',
        is_on_offer: false,
        is_featured: false,
        display_order: '',
        meta_title: '',
        meta_description: ''
    });

    const categories = [
        { value: 'nails', label: 'Nail Art' },
        { value: 'lashes', label: 'Eyelash Extensions' },
        { value: 'facials', label: 'Facials & Skin' },
        { value: 'waxing', label: 'Waxing' },
        { value: 'makeup', label: 'Makeup' },
        { value: 'hair', label: 'Hair Styling' },
        { value: 'business', label: 'Business Management' }
    ];

    const levels = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'master', label: 'Master' }
    ];

    // Helper functions
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/courses/admin/all');
            console.log('Fetched courses:', response.data);
            setCourses(response.data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            toast.error('Failed to load courses: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseDetails = async (courseId) => {
        setLoadingDetails(true);
        try {
            console.log('Fetching details for course:', courseId);

            // Fetch modules
            const modulesRes = await api.get(`/courses/${courseId}/modules`);
            console.log('Modules fetched:', modulesRes.data);
            setModules(modulesRes.data || []);

            // Fetch requirements
            const requirementsRes = await api.get(`/courses/${courseId}/requirements`);
            console.log('Requirements fetched:', requirementsRes.data);
            setRequirements(requirementsRes.data || []);

            // Fetch outcomes
            const outcomesRes = await api.get(`/courses/${courseId}/outcomes`);
            console.log('Outcomes fetched:', outcomesRes.data);
            setOutcomes(outcomesRes.data || []);

            // Fetch FAQs
            const faqsRes = await api.get(`/courses/${courseId}/faqs`);
            console.log('FAQs fetched:', faqsRes.data);
            setFaqs(faqsRes.data || []);

        } catch (error) {
            console.error('Failed to fetch course details:', error);
            console.error('Error response:', error.response?.data);
            toast.error('Failed to load course details: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOfferToggle = (e) => {
        const isChecked = e.target.checked;
        setFormData(prev => ({ ...prev, is_on_offer: isChecked }));
        if (!isChecked) {
            setFormData(prev => ({
                ...prev,
                original_price: '',
                discount_percent: '',
                offer_badge: '',
                offer_end_date: ''
            }));
        }
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if ((name === 'original_price' || name === 'discount_percent') && formData.is_on_offer) {
            const originalPrice = name === 'original_price' ? parseFloat(value) : parseFloat(formData.original_price);
            const discountPercent = name === 'discount_percent' ? parseFloat(value) : parseFloat(formData.discount_percent);

            if (originalPrice && discountPercent && discountPercent > 0) {
                const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
                setFormData(prev => ({ ...prev, price: discountedPrice.toString() }));
            }
        }
    };

    // FIXED: Complete handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Submitting course form...', formData);

        // Validation
        if (!formData.title.trim()) {
            toast.error('Course title is required');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Valid price is required');
            return;
        }
        if (!formData.slug) {
            setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }));
        }

        // Create FormData object for file upload
        const submitData = new FormData();
        submitData.append('title', formData.title.trim());
        submitData.append('slug', formData.slug || generateSlug(formData.title));
        submitData.append('description', formData.description || '');
        submitData.append('category', formData.category);
        submitData.append('level', formData.level);
        submitData.append('duration_hours', formData.duration_hours || 0);
        submitData.append('price', parseFloat(formData.price));
        submitData.append('is_featured', formData.is_featured ? '1' : '0');
        submitData.append('display_order', formData.display_order || 0);
        submitData.append('meta_title', formData.meta_title || '');
        submitData.append('meta_description', formData.meta_description || '');
        submitData.append('is_on_offer', formData.is_on_offer ? '1' : '0');

        // IMPORTANT: Send empty strings as empty strings, backend will handle conversion to null
        if (formData.is_on_offer) {
            // Send original_price (can be empty string)
            submitData.append('original_price', formData.original_price || '');

            // Send discount_percent (can be empty string)
            submitData.append('discount_percent', formData.discount_percent || '');

            // Send offer_badge (can be empty string)
            submitData.append('offer_badge', formData.offer_badge || '');

            // Send offer_end_date (can be empty string)
            submitData.append('offer_end_date', formData.offer_end_date || '');
        } else {
            // If offer is disabled, send empty strings to clear the fields
            submitData.append('original_price', '');
            submitData.append('discount_percent', '');
            submitData.append('offer_badge', '');
            submitData.append('offer_end_date', '');
        }

        if (thumbnailFile) {
            submitData.append('thumbnail', thumbnailFile);
        }

        try {
            let response;
            if (editingCourse) {
                console.log('Updating course:', editingCourse.id);
                response = await api.put(`/courses/${editingCourse.id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Course updated successfully');
            } else {
                console.log('Creating new course');
                response = await api.post('/courses', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Course created successfully');
            }
            console.log('API Response:', response.data);

            // Close modal
            setShowModal(false);

            // Reset form
            resetForm();

            // Refresh the courses list
            await fetchCourses();

        } catch (error) {
            console.error('Submit error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.error || 'Operation failed. Please try again.');
        }
    };

    // Module functions
    const handleAddModule = async () => {
        if (!moduleForm.title) {
            toast.error('Module title is required');
            return;
        }
        try {
            if (editingModule) {
                await api.put(`/courses/modules/${editingModule.id}`, moduleForm);
                toast.success('Module updated successfully');
            } else {
                await api.post(`/courses/${editingCourse.id}/modules`, moduleForm);
                toast.success('Module added successfully');
            }
            setShowModuleModal(false);
            setEditingModule(null);
            setModuleForm({ title: '', description: '', video_url: '', duration_minutes: '', module_order: '' });
            fetchCourseDetails(editingCourse.id);
        } catch (error) {
            console.error('Module save error:', error);
            toast.error('Failed to save module: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm('Are you sure you want to delete this module?')) {
            try {
                await api.delete(`/courses/modules/${moduleId}`);
                toast.success('Module deleted successfully');
                fetchCourseDetails(editingCourse.id);
            } catch (error) {
                console.error('Delete module error:', error);
                toast.error('Failed to delete module');
            }
        }
    };

    // Requirement functions
    const handleAddRequirement = async () => {
        if (!newRequirement.trim()) {
            toast.error('Please enter a requirement');
            return;
        }
        try {
            await api.post(`/courses/${editingCourse.id}/requirements`, { requirement: newRequirement });
            toast.success('Requirement added successfully');
            setNewRequirement('');
            fetchCourseDetails(editingCourse.id);
        } catch (error) {
            console.error('Add requirement error:', error);
            toast.error('Failed to add requirement');
        }
    };

    const handleDeleteRequirement = async (requirementId) => {
        try {
            await api.delete(`/courses/requirements/${requirementId}`);
            toast.success('Requirement deleted successfully');
            fetchCourseDetails(editingCourse.id);
        } catch (error) {
            console.error('Delete requirement error:', error);
            toast.error('Failed to delete requirement');
        }
    };

    // Outcome functions
    const handleAddOutcome = async () => {
        if (!newOutcome.trim()) {
            toast.error('Please enter a learning outcome');
            return;
        }
        try {
            await api.post(`/courses/${editingCourse.id}/outcomes`, { outcome: newOutcome });
            toast.success('Learning outcome added successfully');
            setNewOutcome('');
            fetchCourseDetails(editingCourse.id);
        } catch (error) {
            console.error('Add outcome error:', error);
            toast.error('Failed to add outcome');
        }
    };

    const handleDeleteOutcome = async (outcomeId) => {
        try {
            await api.delete(`/courses/outcomes/${outcomeId}`);
            toast.success('Outcome deleted successfully');
            fetchCourseDetails(editingCourse.id);
        } catch (error) {
            console.error('Delete outcome error:', error);
            toast.error('Failed to delete outcome');
        }
    };

    // FAQ functions
    const handleAddFaq = async () => {
        if (!faqForm.question || !faqForm.answer) {
            toast.error('Question and answer are required');
            return;
        }
        try {
            if (editingFaq) {
                await api.put(`/courses/faqs/${editingFaq.id}`, faqForm);
                toast.success('FAQ updated successfully');
            } else {
                await api.post(`/courses/${editingCourse.id}/faqs`, faqForm);
                toast.success('FAQ added successfully');
            }
            setShowFaqModal(false);
            setEditingFaq(null);
            setFaqForm({ question: '', answer: '', display_order: '', is_active: true });
            fetchCourseDetails(editingCourse.id);
        } catch (error) {
            console.error('FAQ save error:', error);
            toast.error('Failed to save FAQ');
        }
    };

    const handleDeleteFaq = async (faqId) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await api.delete(`/courses/faqs/${faqId}`);
                toast.success('FAQ deleted successfully');
                fetchCourseDetails(editingCourse.id);
            } catch (error) {
                console.error('Delete FAQ error:', error);
                toast.error('Failed to delete FAQ');
            }
        }
    };

    const handleEdit = async (course) => {
        console.log('Editing course:', course);
        setEditingCourse(course);
        const isOfferActive = course.is_on_offer === 1;
        const formattedEndDate = formatDateForInput(course.offer_end_date);
        setFormData({
            title: course.title || '',
            slug: course.slug || '',
            description: course.description || '',
            category: course.category || 'nails',
            level: course.level || 'beginner',
            duration_hours: course.duration_hours || '',
            price: course.price || '',
            original_price: course.original_price || '',
            discount_percent: course.discount_percent || '',
            offer_badge: course.offer_badge || '',
            offer_end_date: formattedEndDate,
            is_on_offer: isOfferActive,
            is_featured: course.is_featured === 1,
            display_order: course.display_order || '',
            meta_title: course.meta_title || '',
            meta_description: course.meta_description || ''
        });
        if (course.thumbnail) {
            setThumbnailPreview(`http://localhost:5000${course.thumbnail}`);
        } else {
            setThumbnailPreview(null);
        }
        await fetchCourseDetails(course.id);
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingCourse(null);
        setModules([]);
        setRequirements([]);
        setOutcomes([]);
        setFaqs([]);
        setFormData({
            title: '',
            slug: '',
            description: '',
            category: 'nails',
            level: 'beginner',
            duration_hours: '',
            price: '',
            original_price: '',
            discount_percent: '',
            offer_badge: '',
            offer_end_date: '',
            is_on_offer: false,
            is_featured: false,
            display_order: '',
            meta_title: '',
            meta_description: ''
        });
        setThumbnailPreview(null);
        setThumbnailFile(null);
        setActiveTab('basic');
        setNewRequirement('');
        setNewOutcome('');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await api.delete(`/courses/${id}`);
                toast.success('Course deleted successfully');
                fetchCourses();
            } catch (error) {
                console.error('Delete course error:', error);
                toast.error('Failed to delete course');
            }
        }
    };

    // Stats cards
    const statsCards = [
        { title: 'Total Courses', value: courses.length, icon: 'fa-graduation-cap', color: 'bg-blue-500' },
        { title: 'Courses on Offer', value: courses.filter(c => c.is_on_offer === 1).length, icon: 'fa-tag', color: 'bg-green-500' },
        { title: 'Featured Courses', value: courses.filter(c => c.is_featured === 1).length, icon: 'fa-star', color: 'bg-yellow-500' },
        { title: 'Categories', value: categories.length, icon: 'fa-folder', color: 'bg-purple-500' },
    ];

    const columns = [
        {
            name: 'Thumbnail',
            width: '80px',
            cell: row => (
                row.thumbnail ? (
                    <img src={`http://localhost:5000${row.thumbnail}`} alt={row.title} className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <i className="fas fa-graduation-cap text-primary"></i>
                    </div>
                )
            ),
        },
        { name: 'Title', selector: row => row.title, sortable: true },
        { name: 'Category', selector: row => categories.find(c => c.value === row.category)?.label || row.category, sortable: true },
        { name: 'Level', selector: row => row.level?.charAt(0).toUpperCase() + row.level?.slice(1) || '-', sortable: true },
        {
            name: 'Price',
            selector: row => {
                if (row.is_on_offer === 1 && row.original_price && parseFloat(row.original_price) > parseFloat(row.price)) {
                    return `₹${row.price} (Was ₹${row.original_price})`;
                }
                return `₹${row.price}`;
            },
            sortable: true
        },
        {
            name: 'Discount',
            selector: row => row.is_on_offer === 1 && row.discount_percent ? `${row.discount_percent}% OFF` : 'No Offer',
            sortable: true
        },
        { name: 'Duration', selector: row => `${row.duration_hours} hrs`, sortable: true },
        {
            name: 'Valid Till',
            selector: row => formatDateForDisplay(row.offer_end_date),
            sortable: true
        },
        {
            name: 'Featured',
            width: '100px',
            cell: row => (
                row.is_featured === 1 ?
                    <span className="text-yellow-500"><i className="fas fa-star"></i> Featured</span> :
                    <span className="text-gray-400">No</span>
            ),
        },
        {
            name: 'Actions',
            width: '100px',
            cell: row => (
                <div className="flex gap-2">
                    <button onClick={() => handleEdit(row)} className="text-primary hover:text-primary-dark" title="Edit">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-600" title="Delete">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {statsCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-dark rounded-xl p-4 shadow-soft hover:shadow-medium transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray text-xs mb-1">{card.title}</p>
                                <p className="text-xl font-bold">{card.value}</p>
                            </div>
                            <div className={`w-10 h-10 ${card.color} bg-opacity-20 rounded-xl flex items-center justify-center`}>
                                <i className={`fas ${card.icon} text-xl text-${card.color.replace('bg-', '')}`}></i>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={courses}
                title="Courses Management"
                actions={
                    <button onClick={() => setShowModal(true)} className="btn btn-small">
                        <i className="fas fa-plus mr-2"></i> Add Course
                    </button>
                }
                progressPending={loading}
                searchable={true}
                pagination={true}
                itemsPerPage={10}
                exportable={true}
                exportFileName="courses_export"
                noDataMessage="No courses found. Click 'Add Course' to create one."
                onRowClick={(row) => console.log('Row clicked:', row.title)}
                selectable={true}
                onSelectionChange={(selected) => console.log('Selected rows:', selected)}
            />

            {/* Add/Edit Course Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                        <div className="sticky top-0 bg-white dark:bg-dark p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 px-6 pt-4 border-b border-light-gray dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('basic')}
                                className={`px-4 py-2 font-medium transition-all ${activeTab === 'basic' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                            >
                                <i className="fas fa-info-circle mr-2"></i> Basic Info
                            </button>
                            <button
                                onClick={() => setActiveTab('modules')}
                                className={`px-4 py-2 font-medium transition-all ${activeTab === 'modules' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                disabled={!editingCourse}
                            >
                                <i className="fas fa-book-open mr-2"></i> Modules
                            </button>
                            <button
                                onClick={() => setActiveTab('requirements')}
                                className={`px-4 py-2 font-medium transition-all ${activeTab === 'requirements' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                disabled={!editingCourse}
                            >
                                <i className="fas fa-clipboard-list mr-2"></i> Requirements
                            </button>
                            <button
                                onClick={() => setActiveTab('outcomes')}
                                className={`px-4 py-2 font-medium transition-all ${activeTab === 'outcomes' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                disabled={!editingCourse}
                            >
                                <i className="fas fa-trophy mr-2"></i> Outcomes
                            </button>
                            <button
                                onClick={() => setActiveTab('faqs')}
                                className={`px-4 py-2 font-medium transition-all ${activeTab === 'faqs' ? 'text-primary border-b-2 border-primary' : 'text-gray hover:text-primary'}`}
                                disabled={!editingCourse}
                            >
                                <i className="fas fa-question-circle mr-2"></i> FAQs
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                {/* Basic Info Tab */}
                                {activeTab === 'basic' && (
                                    <div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block font-medium mb-2">Course Title *</label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={handleTitleChange}
                                                    required
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="Enter course title"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2">Slug (URL)</label>
                                                <input
                                                    type="text"
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800"
                                                    placeholder="auto-generated"
                                                />
                                                <p className="text-xs text-gray mt-1">URL friendly version of the title</p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block font-medium mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows="4"
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                placeholder="Course description"
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block font-medium mb-2">Category</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2">Level</label>
                                                <select
                                                    value={formData.level}
                                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                >
                                                    {levels.map(lev => (
                                                        <option key={lev.value} value={lev.value}>{lev.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block font-medium mb-2">Duration (hours)</label>
                                                <input
                                                    type="number"
                                                    value={formData.duration_hours}
                                                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="e.g., 40"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2">Display Order</label>
                                                <input
                                                    type="number"
                                                    value={formData.display_order}
                                                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="Lower number appears first"
                                                />
                                            </div>
                                        </div>

                                        {/* Offer Section */}
                                        <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                            <label className="flex items-center gap-2 cursor-pointer mb-4">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_on_offer}
                                                    onChange={handleOfferToggle}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-semibold text-primary">Enable Offer / Discount on this course</span>
                                            </label>

                                            {formData.is_on_offer && (
                                                <div className="space-y-4 pl-6 border-l-2 border-primary">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block font-medium mb-2">Original Price (₹)</label>
                                                            <input
                                                                type="number"
                                                                name="original_price"
                                                                value={formData.original_price}
                                                                onChange={handlePriceChange}
                                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                                placeholder="Original price before discount"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-medium mb-2">Discount Percentage (%)</label>
                                                            <input
                                                                type="number"
                                                                name="discount_percent"
                                                                value={formData.discount_percent}
                                                                onChange={handlePriceChange}
                                                                step="0.01"
                                                                min="0"
                                                                max="100"
                                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                                placeholder="e.g., 20"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block font-medium mb-2">Discounted Price (₹)</label>
                                                            <input
                                                                type="number"
                                                                name="price"
                                                                value={formData.price}
                                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800"
                                                            />
                                                            <p className="text-xs text-gray mt-1">Auto-calculated or manually set</p>
                                                        </div>
                                                        <div>
                                                            <label className="block font-medium mb-2">Offer Badge Text</label>
                                                            <input
                                                                type="text"
                                                                value={formData.offer_badge}
                                                                onChange={(e) => setFormData({ ...formData, offer_badge: e.target.value })}
                                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                                placeholder="e.g., Summer Sale, Limited Time"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block font-medium mb-2">Offer End Date</label>
                                                        <input
                                                            type="date"
                                                            value={formData.offer_end_date}
                                                            onChange={(e) => setFormData({ ...formData, offer_end_date: e.target.value })}
                                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                        />
                                                        <p className="text-xs text-gray mt-1">Leave empty for no expiry date</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_featured}
                                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Feature this course (show on homepage)</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block font-medium mb-2">Meta Title (SEO)</label>
                                                <input
                                                    type="text"
                                                    value={formData.meta_title}
                                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="SEO title"
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-medium mb-2">Meta Description (SEO)</label>
                                                <textarea
                                                    value={formData.meta_description}
                                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                                    rows="2"
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                    placeholder="SEO description"
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block font-medium mb-2">Course Thumbnail</label>
                                            <div className="border-2 border-dashed border-light-gray dark:border-gray-700 rounded-lg p-4 text-center">
                                                {thumbnailPreview ? (
                                                    <div className="relative inline-block">
                                                        <img src={thumbnailPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto mb-2" />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setThumbnailPreview(null); setThumbnailFile(null); }}
                                                            className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center"
                                                        >
                                                            <i className="fas fa-times text-xs"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                                                        <p className="text-sm text-gray">Click or drag image to upload</p>
                                                        <p className="text-xs text-gray">PNG, JPG, GIF up to 5MB</p>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnailChange}
                                                    className="hidden"
                                                    id="course-thumbnail"
                                                />
                                                {!thumbnailPreview && (
                                                    <label htmlFor="course-thumbnail" className="mt-2 inline-block text-primary text-sm cursor-pointer">
                                                        Choose Image
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Modules Tab */}
                                {activeTab === 'modules' && editingCourse && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold">Course Modules</h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowModuleModal(true)}
                                                className="btn btn-small"
                                            >
                                                <i className="fas fa-plus mr-2"></i> Add Module
                                            </button>
                                        </div>

                                        {loadingDetails ? (
                                            <div className="flex justify-center py-8">
                                                <div className="loading-spinner"></div>
                                            </div>
                                        ) : modules.length === 0 ? (
                                            <div className="text-center py-8 text-gray">
                                                <i className="fas fa-book-open text-4xl mb-3"></i>
                                                <p>No modules added yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {modules.map((module, index) => (
                                                    <div key={module.id} className="border border-light-gray dark:border-gray-700 rounded-lg p-4 hover:shadow-soft transition-all">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-primary font-bold text-sm">Module {module.module_order || index + 1}</span>
                                                                    <h4 className="font-semibold">{module.title}</h4>
                                                                </div>
                                                                {module.description && (
                                                                    <p className="text-sm text-gray mt-1">{module.description}</p>
                                                                )}
                                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray">
                                                                    <span><i className="far fa-clock mr-1"></i> {module.duration_minutes || 0} min</span>
                                                                    {module.video_url && (
                                                                        <span><i className="fas fa-video mr-1"></i> Video included</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingModule(module);
                                                                        setModuleForm({
                                                                            title: module.title,
                                                                            description: module.description || '',
                                                                            video_url: module.video_url || '',
                                                                            duration_minutes: module.duration_minutes || '',
                                                                            module_order: module.module_order || ''
                                                                        });
                                                                        setShowModuleModal(true);
                                                                    }}
                                                                    className="text-primary hover:text-primary-dark"
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteModule(module.id)}
                                                                    className="text-red-500 hover:text-red-600"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Requirements Tab */}
                                {activeTab === 'requirements' && editingCourse && (
                                    <div>
                                        <div className="flex gap-3 mb-4">
                                            <input
                                                type="text"
                                                value={newRequirement}
                                                onChange={(e) => setNewRequirement(e.target.value)}
                                                placeholder="Enter requirement (e.g., Basic knowledge of beauty industry)"
                                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
                                            />
                                            <button type="button" onClick={handleAddRequirement} className="btn btn-small">
                                                <i className="fas fa-plus mr-2"></i> Add
                                            </button>
                                        </div>

                                        {requirements.length === 0 ? (
                                            <div className="text-center py-8 text-gray">
                                                <i className="fas fa-clipboard-list text-4xl mb-3"></i>
                                                <p>No requirements added yet.</p>
                                            </div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {requirements.map(req => (
                                                    <li key={req.id} className="flex justify-between items-center p-3 bg-light dark:bg-dark-light rounded-lg">
                                                        <span className="text-sm">{req.requirement}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRequirement(req.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {/* Outcomes Tab */}
                                {activeTab === 'outcomes' && editingCourse && (
                                    <div>
                                        <div className="flex gap-3 mb-4">
                                            <input
                                                type="text"
                                                value={newOutcome}
                                                onChange={(e) => setNewOutcome(e.target.value)}
                                                placeholder="Enter learning outcome (e.g., Master advanced nail art techniques)"
                                                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddOutcome()}
                                            />
                                            <button type="button" onClick={handleAddOutcome} className="btn btn-small">
                                                <i className="fas fa-plus mr-2"></i> Add
                                            </button>
                                        </div>

                                        {outcomes.length === 0 ? (
                                            <div className="text-center py-8 text-gray">
                                                <i className="fas fa-trophy text-4xl mb-3"></i>
                                                <p>No learning outcomes added yet.</p>
                                            </div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {outcomes.map(outcome => (
                                                    <li key={outcome.id} className="flex justify-between items-center p-3 bg-light dark:bg-dark-light rounded-lg">
                                                        <span className="text-sm">{outcome.outcome}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteOutcome(outcome.id)}
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {/* FAQs Tab */}
                                {activeTab === 'faqs' && editingCourse && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold">Frequently Asked Questions</h3>
                                            <button
                                                type="button"
                                                onClick={() => setShowFaqModal(true)}
                                                className="btn btn-small"
                                            >
                                                <i className="fas fa-plus mr-2"></i> Add FAQ
                                            </button>
                                        </div>

                                        {faqs.length === 0 ? (
                                            <div className="text-center py-8 text-gray">
                                                <i className="fas fa-question-circle text-4xl mb-3"></i>
                                                <p>No FAQs added yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {faqs.map(faq => (
                                                    <div key={faq.id} className="border border-light-gray dark:border-gray-700 rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-sm">{faq.question}</h4>
                                                                <p className="text-gray text-sm mt-1">{faq.answer}</p>
                                                                {faq.display_order !== null && (
                                                                    <p className="text-xs text-gray mt-1">Order: {faq.display_order}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingFaq(faq);
                                                                        setFaqForm({
                                                                            question: faq.question,
                                                                            answer: faq.answer,
                                                                            display_order: faq.display_order || '',
                                                                            is_active: faq.is_active === 1
                                                                        });
                                                                        setShowFaqModal(true);
                                                                    }}
                                                                    className="text-primary hover:text-primary-dark"
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteFaq(faq.id)}
                                                                    className="text-red-500 hover:text-red-600"
                                                                >
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Submit Buttons - Only for Basic Tab */}
                                {activeTab === 'basic' && (
                                    <div className="flex gap-3 mt-6 pt-4 border-t border-light-gray dark:border-gray-700">
                                        <button type="submit" className="btn flex-1">
                                            {editingCourse ? 'Update Course' : 'Create Course'}
                                        </button>
                                        <button type="button" onClick={resetForm} className="btn-outline flex-1">Cancel</button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Module Modal */}
            {showModuleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full animate-fade-in">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingModule ? 'Edit Module' : 'Add Module'}</h3>
                            <button onClick={() => { setShowModuleModal(false); setEditingModule(null); setModuleForm({ title: '', description: '', video_url: '', duration_minutes: '', module_order: '' }); }} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Module Title *</label>
                                <input
                                    type="text"
                                    value={moduleForm.title}
                                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., Introduction to Nail Art"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Description</label>
                                <textarea
                                    value={moduleForm.description}
                                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                    rows="2"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Brief description of the module"
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Video URL (YouTube/Vimeo)</label>
                                <input
                                    type="text"
                                    value={moduleForm.video_url}
                                    onChange={(e) => setModuleForm({ ...moduleForm, video_url: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                                <p className="text-xs text-gray mt-1">Embed URL from YouTube or Vimeo</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={moduleForm.duration_minutes}
                                        onChange={(e) => setModuleForm({ ...moduleForm, duration_minutes: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="e.g., 30"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Module Order</label>
                                    <input
                                        type="number"
                                        value={moduleForm.module_order}
                                        onChange={(e) => setModuleForm({ ...moduleForm, module_order: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="1, 2, 3..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={handleAddModule} className="btn flex-1">Save Module</button>
                                <button onClick={() => { setShowModuleModal(false); setEditingModule(null); setModuleForm({ title: '', description: '', video_url: '', duration_minutes: '', module_order: '' }); }} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ Modal */}
            {showFaqModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl max-w-md w-full animate-fade-in">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
                            <button onClick={() => { setShowFaqModal(false); setEditingFaq(null); setFaqForm({ question: '', answer: '', display_order: '', is_active: true }); }} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Question *</label>
                                <input
                                    type="text"
                                    value={faqForm.question}
                                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="e.g., Is there a certificate after completion?"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block font-medium mb-2">Answer *</label>
                                <textarea
                                    value={faqForm.answer}
                                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Detailed answer to the question"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-medium mb-2">Display Order</label>
                                    <input
                                        type="number"
                                        value={faqForm.display_order}
                                        onChange={(e) => setFaqForm({ ...faqForm, display_order: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
                                        placeholder="Lower number appears first"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer mt-7">
                                        <input
                                            type="checkbox"
                                            checked={faqForm.is_active}
                                            onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="font-medium">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={handleAddFaq} className="btn flex-1">Save FAQ</button>
                                <button onClick={() => { setShowFaqModal(false); setEditingFaq(null); setFaqForm({ question: '', answer: '', display_order: '', is_active: true }); }} className="btn-outline flex-1">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;