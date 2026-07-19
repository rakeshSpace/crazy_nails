const db = require('../config/database');

// Get all courses with filters
const getCourses = async (req, res) => {
    try {
        const { category, level, featured, limit, is_on_offer } = req.query;
        let query = 'SELECT * FROM courses WHERE is_active = 1';
        const values = [];

        if (category && category !== 'all') {
            query += ' AND category = ?';
            values.push(category);
        }

        if (level && level !== 'all') {
            query += ' AND level = ?';
            values.push(level);
        }

        if (featured === 'true') {
            query += ' AND is_featured = 1';
        }

        if (is_on_offer === 'true') {
            query += ' AND is_on_offer = 1';
        }

        query += ' ORDER BY display_order ASC, id DESC';

        if (limit) {
            query += ' LIMIT ?';
            values.push(parseInt(limit));
        }

        const [courses] = await db.execute(query, values);
        res.json(courses);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

// Get single course by slug
const getCourseBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [courses] = await db.execute(
            `SELECT c.*, 
                    COALESCE(AVG(cr.rating), 0) as avg_rating,
                    COUNT(DISTINCT cr.id) as total_reviews,
                    COUNT(DISTINCT ue.id) as total_enrollments
             FROM courses c
             LEFT JOIN course_reviews cr ON c.id = cr.course_id AND cr.is_approved = 1
             LEFT JOIN user_enrollments ue ON c.id = ue.course_id
             WHERE c.slug = ? AND c.is_active = 1
             GROUP BY c.id`,
            [slug]
        );

        if (courses.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Get modules for this course
        const [modules] = await db.execute(
            'SELECT * FROM course_modules WHERE course_id = ? ORDER BY module_order ASC',
            [courses[0].id]
        );

        // Get requirements
        const [requirements] = await db.execute(
            'SELECT * FROM course_requirements WHERE course_id = ? ORDER BY id ASC',
            [courses[0].id]
        );

        // Get learning outcomes
        const [outcomes] = await db.execute(
            'SELECT * FROM course_outcomes WHERE course_id = ? ORDER BY id ASC',
            [courses[0].id]
        );

        // Get FAQs
        const [faqs] = await db.execute(
            'SELECT * FROM course_faqs WHERE course_id = ? AND is_active = 1 ORDER BY display_order ASC',
            [courses[0].id]
        );

        const course = {
            ...courses[0],
            modules,
            requirements,
            outcomes,
            faqs
        };

        res.json(course);
    } catch (error) {
        console.error('Get course by slug error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};

// Get single course by ID
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const [courses] = await db.execute(
            'SELECT * FROM courses WHERE id = ? AND is_active = 1',
            [id]
        );

        if (courses.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Get modules for this course
        const [modules] = await db.execute(
            'SELECT * FROM course_modules WHERE course_id = ? ORDER BY module_order ASC',
            [id]
        );

        // Get requirements
        const [requirements] = await db.execute(
            'SELECT * FROM course_requirements WHERE course_id = ? ORDER BY id ASC',
            [id]
        );

        // Get learning outcomes
        const [outcomes] = await db.execute(
            'SELECT * FROM course_outcomes WHERE course_id = ? ORDER BY id ASC',
            [id]
        );

        // Get FAQs
        const [faqs] = await db.execute(
            'SELECT * FROM course_faqs WHERE course_id = ? AND is_active = 1 ORDER BY display_order ASC',
            [id]
        );

        const course = {
            ...courses[0],
            modules,
            requirements,
            outcomes,
            faqs
        };

        res.json(course);
    } catch (error) {
        console.error('Get course by id error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};

// Admin - Get all courses (including inactive)
const adminGetAllCourses = async (req, res) => {
    try {
        // FIXED: Only fetch active courses (is_active = 1)
        const [courses] = await db.execute(
            'SELECT * FROM courses WHERE is_active = 1 ORDER BY display_order ASC, id DESC'
        );
        res.json(courses);
    } catch (error) {
        console.error('Admin get courses error:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

// Create course
const createCourse = async (req, res) => {
    try {
        const {
            title, slug, description, category, level,
            duration_hours, price, original_price, discount_percent,
            offer_badge, offer_end_date, is_on_offer,
            thumbnail, is_featured, display_order,
            meta_title, meta_description
        } = req.body;

        let thumbnail_url = null;
        if (req.file) {
            thumbnail_url = `/uploads/courses/${req.file.filename}`;
        }

        const [result] = await db.execute(
            `INSERT INTO courses (
                title, slug, description, category, level,
                duration_hours, price, original_price, discount_percent,
                offer_badge, offer_end_date, is_on_offer,
                thumbnail, is_featured, display_order,
                meta_title, meta_description, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                title, slug, description, category, level,
                duration_hours, price, original_price, discount_percent,
                offer_badge, offer_end_date, is_on_offer ? 1 : 0,
                thumbnail_url, is_featured ? 1 : 0, display_order || 0,
                meta_title, meta_description
            ]
        );

        res.status(201).json({ id: result.insertId, message: 'Course created successfully' });
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course: ' + error.message });
    }
};

// Update course
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, slug, description, category, level,
            duration_hours, price, original_price, discount_percent,
            offer_badge, offer_end_date, is_on_offer,
            is_featured, display_order,
            meta_title, meta_description
        } = req.body;

        console.log('Updating course ID:', id);
        console.log('Received data:', { title, price, original_price, discount_percent, is_on_offer });

        // CRITICAL FIX: Convert empty strings to null for database
        const sanitizeValue = (value) => {
            if (value === undefined || value === '' || value === 'undefined' || value === 'null') {
                return null;
            }
            return value;
        };

        // Also handle numeric values
        const sanitizeNumber = (value) => {
            if (value === undefined || value === '' || value === 'undefined' || value === 'null') {
                return null;
            }
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
        };

        let thumbnail_url = null;
        if (req.file) {
            thumbnail_url = `/uploads/courses/${req.file.filename}`;

            // Delete old thumbnail
            const [current] = await db.execute('SELECT thumbnail FROM courses WHERE id = ?', [id]);
            if (current[0]?.thumbnail) {
                const fs = require('fs');
                const path = require('path');
                const oldPath = path.join(__dirname, '../../', current[0].thumbnail);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        // CRITICAL FIX: Sanitize all values before using in query
        const sanitizedTitle = sanitizeValue(title);
        const sanitizedSlug = sanitizeValue(slug);
        const sanitizedDescription = sanitizeValue(description);
        const sanitizedCategory = sanitizeValue(category);
        const sanitizedLevel = sanitizeValue(level);
        const sanitizedDurationHours = sanitizeNumber(duration_hours) || 0;
        const sanitizedPrice = sanitizeNumber(price) || 0;
        const sanitizedOriginalPrice = sanitizeNumber(original_price);
        const sanitizedDiscountPercent = sanitizeNumber(discount_percent) || 0;
        const sanitizedOfferBadge = sanitizeValue(offer_badge);
        const sanitizedOfferEndDate = sanitizeValue(offer_end_date);
        const sanitizedIsOnOffer = is_on_offer === '1' || is_on_offer === 1 || is_on_offer === true ? 1 : 0;
        const sanitizedIsFeatured = is_featured === '1' || is_featured === 1 || is_featured === true ? 1 : 0;
        const sanitizedDisplayOrder = sanitizeNumber(display_order) || 0;
        const sanitizedMetaTitle = sanitizeValue(meta_title);
        const sanitizedMetaDescription = sanitizeValue(meta_description);

        // Build query - ensure all values are either valid or null
        let query = `UPDATE courses SET 
            title = ?, slug = ?, description = ?, category = ?, level = ?,
            duration_hours = ?, price = ?, original_price = ?, discount_percent = ?,
            offer_badge = ?, offer_end_date = ?, is_on_offer = ?,
            is_featured = ?, display_order = ?, meta_title = ?, meta_description = ?`;

        const values = [
            sanitizedTitle,
            sanitizedSlug,
            sanitizedDescription,
            sanitizedCategory,
            sanitizedLevel,
            sanitizedDurationHours,
            sanitizedPrice,
            sanitizedOriginalPrice,  // This can be null
            sanitizedDiscountPercent,
            sanitizedOfferBadge,      // This can be null
            sanitizedOfferEndDate,    // This can be null
            sanitizedIsOnOffer,
            sanitizedIsFeatured,
            sanitizedDisplayOrder,
            sanitizedMetaTitle,
            sanitizedMetaDescription
        ];

        if (thumbnail_url) {
            query += ', thumbnail = ? WHERE id = ?';
            values.push(thumbnail_url, id);
        } else {
            query += ' WHERE id = ?';
            values.push(id);
        }

        console.log('Executing query with values:', values);

        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        console.log('Course updated successfully, affected rows:', result.affectedRows);

        // Fetch and return the updated course
        const [updatedCourse] = await db.execute('SELECT * FROM courses WHERE id = ?', [id]);

        res.json({
            message: 'Course updated successfully',
            course: updatedCourse[0]
        });
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: 'Failed to update course: ' + error.message });
    }
};

// Delete course (soft delete)
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('UPDATE courses SET is_active = 0 WHERE id = ?', [id]);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};

// ============ COURSE MODULES FUNCTIONS ============

// Get course modules
const getCourseModules = async (req, res) => {
    try {
        const { courseId } = req.params;
        const [modules] = await db.execute(
            'SELECT * FROM course_modules WHERE course_id = ? ORDER BY module_order ASC',
            [courseId]
        );
        res.json(modules);
    } catch (error) {
        console.error('Get course modules error:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
};

// Add course module
const addCourseModule = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, video_url, duration_minutes, module_order } = req.body;

        const [result] = await db.execute(
            `INSERT INTO course_modules (course_id, title, description, video_url, duration_minutes, module_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [courseId, title, description, video_url, duration_minutes, module_order || 0]
        );

        res.status(201).json({ id: result.insertId, message: 'Module added successfully' });
    } catch (error) {
        console.error('Add course module error:', error);
        res.status(500).json({ error: 'Failed to add module' });
    }
};

// Update course module
const updateCourseModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, description, video_url, duration_minutes, module_order } = req.body;

        await db.execute(
            `UPDATE course_modules SET title = ?, description = ?, video_url = ?, duration_minutes = ?, module_order = ?
             WHERE id = ?`,
            [title, description, video_url, duration_minutes, module_order || 0, moduleId]
        );

        res.json({ message: 'Module updated successfully' });
    } catch (error) {
        console.error('Update course module error:', error);
        res.status(500).json({ error: 'Failed to update module' });
    }
};

// Delete course module
const deleteCourseModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        await db.execute('DELETE FROM course_modules WHERE id = ?', [moduleId]);
        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Delete course module error:', error);
        res.status(500).json({ error: 'Failed to delete module' });
    }
};

// ============ COURSE REQUIREMENTS FUNCTIONS ============

const addCourseRequirement = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { requirement } = req.body;

        const [result] = await db.execute(
            'INSERT INTO course_requirements (course_id, requirement) VALUES (?, ?)',
            [courseId, requirement]
        );

        res.status(201).json({ id: result.insertId, message: 'Requirement added successfully' });
    } catch (error) {
        console.error('Add requirement error:', error);
        res.status(500).json({ error: 'Failed to add requirement' });
    }
};

const deleteCourseRequirement = async (req, res) => {
    try {
        const { requirementId } = req.params;
        await db.execute('DELETE FROM course_requirements WHERE id = ?', [requirementId]);
        res.json({ message: 'Requirement deleted successfully' });
    } catch (error) {
        console.error('Delete requirement error:', error);
        res.status(500).json({ error: 'Failed to delete requirement' });
    }
};

// ============ COURSE OUTCOMES FUNCTIONS ============

const addCourseOutcome = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { outcome } = req.body;

        const [result] = await db.execute(
            'INSERT INTO course_outcomes (course_id, outcome) VALUES (?, ?)',
            [courseId, outcome]
        );

        res.status(201).json({ id: result.insertId, message: 'Outcome added successfully' });
    } catch (error) {
        console.error('Add outcome error:', error);
        res.status(500).json({ error: 'Failed to add outcome' });
    }
};

const deleteCourseOutcome = async (req, res) => {
    try {
        const { outcomeId } = req.params;
        await db.execute('DELETE FROM course_outcomes WHERE id = ?', [outcomeId]);
        res.json({ message: 'Outcome deleted successfully' });
    } catch (error) {
        console.error('Delete outcome error:', error);
        res.status(500).json({ error: 'Failed to delete outcome' });
    }
};

// ============ COURSE FAQs FUNCTIONS ============

const addCourseFAQ = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { question, answer, display_order } = req.body;

        const [result] = await db.execute(
            'INSERT INTO course_faqs (course_id, question, answer, display_order) VALUES (?, ?, ?, ?)',
            [courseId, question, answer, display_order || 0]
        );

        res.status(201).json({ id: result.insertId, message: 'FAQ added successfully' });
    } catch (error) {
        console.error('Add FAQ error:', error);
        res.status(500).json({ error: 'Failed to add FAQ' });
    }
};

const updateCourseFAQ = async (req, res) => {
    try {
        const { faqId } = req.params;
        const { question, answer, display_order, is_active } = req.body;

        await db.execute(
            `UPDATE course_faqs SET question = ?, answer = ?, display_order = ?, is_active = ?
             WHERE id = ?`,
            [question, answer, display_order || 0, is_active ? 1 : 0, faqId]
        );

        res.json({ message: 'FAQ updated successfully' });
    } catch (error) {
        console.error('Update FAQ error:', error);
        res.status(500).json({ error: 'Failed to update FAQ' });
    }
};

const deleteCourseFAQ = async (req, res) => {
    try {
        const { faqId } = req.params;
        await db.execute('DELETE FROM course_faqs WHERE id = ?', [faqId]);
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Delete FAQ error:', error);
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
};

// ============ COURSE REVIEWS FUNCTIONS ============

const getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Get all approved reviews
        const [reviews] = await db.execute(
            `SELECT r.*, u.name as reviewer_name 
             FROM course_reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.course_id = ? AND r.is_approved = 1
             ORDER BY r.created_at DESC`,
            [courseId]
        );

        // ✅ ADD THIS - Get average rating
        const [avgRating] = await db.execute(
            'SELECT AVG(rating) as average, COUNT(*) as total FROM course_reviews WHERE course_id = ? AND is_approved = 1',
            [courseId]
        );

        // ✅ ADD THIS - Get rating distribution
        const [ratingDistribution] = await db.execute(
            `SELECT rating, COUNT(*) as count 
             FROM course_reviews 
             WHERE course_id = ? AND is_approved = 1 
             GROUP BY rating
             ORDER BY rating DESC`,
            [courseId]
        );

        console.log('Rating Distribution from DB:', ratingDistribution); // Debug log

        res.json({
            reviews,
            averageRating: avgRating[0]?.average || 0,
            totalReviews: avgRating[0]?.total || 0,
            ratingDistribution: ratingDistribution  // ✅ THIS IS IMPORTANT
        });
    } catch (error) {
        console.error('Get course reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

const addCourseReview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { rating, title, comment, user_name, user_email } = req.body;
        const userId = req.user?.id || null;

        const [result] = await db.execute(
            `INSERT INTO course_reviews 
             (course_id, user_id, user_name, user_email, rating, title, comment, is_approved) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [courseId, userId, user_name, user_email, rating, title, comment]
        );

        res.status(201).json({
            id: result.insertId,
            message: 'Review submitted successfully! It will appear after approval.'
        });
    } catch (error) {
        console.error('Add course review error:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
};

// ============ ENROLLMENT FUNCTIONS ============

const enrollInCourse = async (req, res) => {
    try {
        const { course_id } = req.body;
        const user_id = req.user.id;

        // Check if already enrolled
        const [existing] = await db.execute(
            'SELECT id FROM user_enrollments WHERE user_id = ? AND course_id = ?',
            [user_id, course_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        const [result] = await db.execute(
            `INSERT INTO user_enrollments (user_id, course_id, enrollment_date, status)
             VALUES (?, ?, NOW(), 'active')`,
            [user_id, course_id]
        );

        res.status(201).json({ id: result.insertId, message: 'Successfully enrolled!' });
    } catch (error) {
        console.error('Enroll in course error:', error);
        res.status(500).json({ error: 'Failed to enroll' });
    }
};

const getUserEnrollments = async (req, res) => {
    try {
        const user_id = req.user.id;
        const [enrollments] = await db.execute(
            `SELECT e.*, 
                    c.title as course_title, 
                    c.slug, 
                    c.thumbnail, 
                    c.description as course_description,
                    c.duration_hours, 
                    c.level
             FROM user_enrollments e
             JOIN courses c ON e.course_id = c.id
             WHERE e.user_id = ? AND c.is_active = 1
             ORDER BY e.enrollment_date DESC`,
            [user_id]
        );
        res.json(enrollments);
    } catch (error) {
        console.error('Get user enrollments error:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};

const getEnrollmentStatus = async (req, res) => {
    try {
        const { courseId } = req.params;
        const user_id = req.user.id;

        const [enrollment] = await db.execute(
            `SELECT e.*, 
                    (SELECT COUNT(*) FROM user_progress WHERE enrollment_id = e.id AND completed = 1) as completed_modules,
                    (SELECT COUNT(*) FROM course_modules WHERE course_id = e.course_id) as total_modules
             FROM user_enrollments e
             WHERE e.user_id = ? AND e.course_id = ?`,
            [user_id, courseId]
        );

        if (enrollment.length === 0) {
            return res.json({ enrolled: false });
        }

        const completion_percentage = enrollment[0].total_modules > 0
            ? Math.round((enrollment[0].completed_modules / enrollment[0].total_modules) * 100)
            : 0;

        res.json({
            enrolled: true,
            enrollment: enrollment[0],
            completion_percentage
        });
    } catch (error) {
        console.error('Get enrollment status error:', error);
        res.status(500).json({ error: 'Failed to fetch enrollment status' });
    }
};

const markModuleComplete = async (req, res) => {
    try {
        const { enrollment_id, module_id } = req.body;

        const [existing] = await db.execute(
            'SELECT id FROM user_progress WHERE enrollment_id = ? AND module_id = ?',
            [enrollment_id, module_id]
        );

        if (existing.length === 0) {
            await db.execute(
                'INSERT INTO user_progress (enrollment_id, module_id, completed, completed_at) VALUES (?, ?, 1, NOW())',
                [enrollment_id, module_id]
            );
        }

        // Update completion percentage
        const [progress] = await db.execute(
            `SELECT 
                (SELECT COUNT(*) FROM user_progress WHERE enrollment_id = ? AND completed = 1) as completed,
                (SELECT COUNT(*) FROM course_modules WHERE course_id = (SELECT course_id FROM user_enrollments WHERE id = ?)) as total`,
            [enrollment_id, enrollment_id]
        );

        const completion_percentage = progress[0].total > 0
            ? Math.round((progress[0].completed / progress[0].total) * 100)
            : 0;

        await db.execute(
            'UPDATE user_enrollments SET completion_percentage = ? WHERE id = ?',
            [completion_percentage, enrollment_id]
        );

        res.json({ message: 'Module marked as complete', completion_percentage });
    } catch (error) {
        console.error('Mark module complete error:', error);
        res.status(500).json({ error: 'Failed to mark module as complete' });
    }
};

// ============ GET COURSE REQUIREMENTS ============
const getCourseRequirements = async (req, res) => {
    try {
        const { courseId } = req.params;
        const [requirements] = await db.execute(
            'SELECT * FROM course_requirements WHERE course_id = ? ORDER BY id ASC',
            [courseId]
        );
        res.json(requirements);
    } catch (error) {
        console.error('Get course requirements error:', error);
        res.status(500).json({ error: 'Failed to fetch requirements' });
    }
};

// ============ GET COURSE OUTCOMES ============
const getCourseOutcomes = async (req, res) => {
    try {
        const { courseId } = req.params;
        const [outcomes] = await db.execute(
            'SELECT * FROM course_outcomes WHERE course_id = ? ORDER BY id ASC',
            [courseId]
        );
        res.json(outcomes);
    } catch (error) {
        console.error('Get course outcomes error:', error);
        res.status(500).json({ error: 'Failed to fetch outcomes' });
    }
};

// ============ GET COURSE FAQS ============
const getCourseFaqs = async (req, res) => {
    try {
        const { courseId } = req.params;
        const [faqs] = await db.execute(
            'SELECT * FROM course_faqs WHERE course_id = ? AND is_active = 1 ORDER BY display_order ASC',
            [courseId]
        );
        res.json(faqs);
    } catch (error) {
        console.error('Get course FAQs error:', error);
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
};

const getMyCertificates = async (req, res) => {
    try {
        const user_id = req.user.id;
        const [certificates] = await db.execute(
            `SELECT c.*, 
                    cr.title as course_name
             FROM certificates c
             JOIN courses cr ON c.course_id = cr.id
             WHERE c.user_id = ? 
             ORDER BY c.issued_at DESC`,
            [user_id]
        );
        res.json(certificates);
    } catch (error) {
        console.error('Get my certificates error:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};

// Add this function for enrollment with payment
const enrollInCourseWithPayment = async (req, res) => {
    try {
        const { course_id, payment_id, order_id } = req.body;
        const user_id = req.user.id;

        // Check if already enrolled
        const [existing] = await db.execute(
            'SELECT id FROM user_enrollments WHERE user_id = ? AND course_id = ?',
            [user_id, course_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Already enrolled in this course' });
        }

        // Get course details
        const [courses] = await db.execute(
            'SELECT price, title FROM courses WHERE id = ? AND is_active = 1',
            [course_id]
        );

        if (courses.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Record payment transaction
        await db.execute(
            `INSERT INTO course_payments (user_id, course_id, amount, payment_id, order_id, status) 
             VALUES (?, ?, ?, ?, ?, 'completed')`,
            [user_id, course_id, courses[0].price, payment_id, order_id]
        );

        // Enroll user
        const [result] = await db.execute(
            `INSERT INTO user_enrollments (user_id, course_id, enrollment_date, status, completion_percentage)
             VALUES (?, ?, NOW(), 'active', 0)`,
            [user_id, course_id]
        );

        res.status(201).json({
            id: result.insertId,
            message: `Successfully enrolled in ${courses[0].title}!`,
            enrolled: true
        });
    } catch (error) {
        console.error('Enroll with payment error:', error);
        res.status(500).json({ error: 'Failed to enroll' });
    }
};

const checkCourseAccess = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Check if user is enrolled in this course
        const [enrollment] = await db.execute(
            `SELECT * FROM user_enrollments 
             WHERE user_id = ? AND course_id = ? AND status = 'active'`,
            [userId, courseId]
        );

        if (enrollment.length === 0) {
            return res.status(403).json({
                error: 'Access denied. You are not enrolled in this course.',
                enrolled: false
            });
        }

        // Get course details
        const [courses] = await db.execute(
            'SELECT * FROM courses WHERE id = ? AND is_active = 1',
            [courseId]
        );

        if (courses.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Get modules
        const [modules] = await db.execute(
            'SELECT * FROM course_modules WHERE course_id = ? ORDER BY module_order ASC',
            [courseId]
        );

        // Get user progress
        const [progress] = await db.execute(
            `SELECT module_id, completed FROM user_progress 
             WHERE enrollment_id = ?`,
            [enrollment[0].id]
        );

        const progressMap = {};
        progress.forEach(p => {
            progressMap[p.module_id] = p.completed;
        });

        res.json({
            enrolled: true,
            enrollment: enrollment[0],
            course: courses[0],
            modules: modules,
            progress: progressMap,
            completion_percentage: enrollment[0].completion_percentage || 0
        });
    } catch (error) {
        console.error('Check course access error:', error);
        res.status(500).json({ error: 'Failed to check course access' });
    }
};

// ============ COURSE REVIEW MANAGEMENT FUNCTIONS ============

// Get all pending course reviews (for admin)
const getPendingCourseReviews = async (req, res) => {
    try {
        const [reviews] = await db.execute(
            `SELECT r.*, c.title as course_name, u.name as reviewer_name 
             FROM course_reviews r
             LEFT JOIN courses c ON r.course_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.is_approved = 0
             ORDER BY r.created_at DESC`,
            []
        );
        res.json(reviews);
    } catch (error) {
        console.error('Get pending course reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch pending reviews' });
    }
};

// Get all approved course reviews (for admin)
const getApprovedCourseReviews = async (req, res) => {
    try {
        const [reviews] = await db.execute(
            `SELECT r.*, c.title as course_name, u.name as reviewer_name 
             FROM course_reviews r
             LEFT JOIN courses c ON r.course_id = c.id
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.is_approved = 1
             ORDER BY r.created_at DESC`,
            []
        );
        res.json(reviews);
    } catch (error) {
        console.error('Get approved course reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch approved reviews' });
    }
};

// Get course reviews for admin (with unapproved)
const getCourseReviewsAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const [reviews] = await db.execute(
            `SELECT r.*, u.name as reviewer_name 
             FROM course_reviews r
             LEFT JOIN users u ON r.user_id = u.id
             WHERE r.course_id = ?
             ORDER BY r.created_at DESC`,
            [id]
        );
        res.json(reviews);
    } catch (error) {
        console.error('Get course reviews admin error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

// Approve a course review
const approveCourseReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Get review details to update course rating
        const [review] = await db.execute(
            'SELECT course_id, rating FROM course_reviews WHERE id = ?',
            [reviewId]
        );

        if (review.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Approve the review
        await db.execute(
            'UPDATE course_reviews SET is_approved = 1 WHERE id = ?',
            [reviewId]
        );

        // Update course's average rating
        const [avgRating] = await db.execute(
            'SELECT AVG(rating) as average FROM course_reviews WHERE course_id = ? AND is_approved = 1',
            [review[0].course_id]
        );

        const newRating = avgRating[0]?.average || 0;
        await db.execute(
            'UPDATE courses SET avg_rating = ? WHERE id = ?',
            [newRating, review[0].course_id]
        );

        res.json({ message: 'Review approved successfully' });
    } catch (error) {
        console.error('Approve course review error:', error);
        res.status(500).json({ error: 'Failed to approve review' });
    }
};

// Delete a course review
const deleteCourseReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Get review details
        const [review] = await db.execute(
            'SELECT course_id, rating FROM course_reviews WHERE id = ?',
            [reviewId]
        );

        if (review.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }

        // Delete the review
        await db.execute('DELETE FROM course_reviews WHERE id = ?', [reviewId]);

        // Update course's average rating
        const [avgRating] = await db.execute(
            'SELECT AVG(rating) as average FROM course_reviews WHERE course_id = ? AND is_approved = 1',
            [review[0].course_id]
        );

        const newRating = avgRating[0]?.average || 0;
        await db.execute(
            'UPDATE courses SET avg_rating = ? WHERE id = ?',
            [newRating, review[0].course_id]
        );

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Delete course review error:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
};

module.exports = {
    // Public Routes
    getCourses,
    getCourseBySlug,
    getCourseById,

    // Admin Routes
    adminGetAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,

    // Course Modules (Admin)
    getCourseModules,
    addCourseModule,
    updateCourseModule,
    deleteCourseModule,

    // Course Requirements (Admin)
    getCourseRequirements,
    addCourseRequirement,
    deleteCourseRequirement,

    // Course Outcomes (Admin)
    getCourseOutcomes,
    addCourseOutcome,
    deleteCourseOutcome,

    // Course FAQs (Admin)
    getCourseFaqs,
    addCourseFAQ,
    updateCourseFAQ,
    deleteCourseFAQ,

    // Course Reviews
    getCourseReviews,
    addCourseReview,

    // Enrollment (User)
    enrollInCourse,
    enrollInCourseWithPayment,
    getUserEnrollments,
    getEnrollmentStatus,
    markModuleComplete,

    // Certificates
    getMyCertificates,

    // Course Access (For Course Player)
    checkCourseAccess,

    getPendingCourseReviews,
    getApprovedCourseReviews,
    getCourseReviewsAdmin,
    approveCourseReview,
    deleteCourseReview
};