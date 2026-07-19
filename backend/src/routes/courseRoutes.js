const express = require('express');
const {
    getCourses,
    getCourseBySlug,
    getCourseById,
    adminGetAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseModules,
    addCourseModule,
    updateCourseModule,
    deleteCourseModule,
    getCourseRequirements,
    addCourseRequirement,
    deleteCourseRequirement,
    getCourseOutcomes,
    addCourseOutcome,
    deleteCourseOutcome,
    getCourseFaqs,
    addCourseFAQ,
    updateCourseFAQ,
    deleteCourseFAQ,
    getCourseReviews,
    addCourseReview,
    enrollInCourse,
    enrollInCourseWithPayment,
    getUserEnrollments,
    getEnrollmentStatus,
    markModuleComplete,
    getMyCertificates,
    checkCourseAccess,
    getPendingCourseReviews,
    getApprovedCourseReviews,
    getCourseReviewsAdmin,
    approveCourseReview,
    deleteCourseReview
} = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// ============ PUBLIC ROUTES ============
router.get('/', getCourses);
router.get('/slug/:slug', getCourseBySlug);
router.get('/:courseId/reviews', getCourseReviews);

// ============ PROTECTED ROUTES (Login Required) - MUST BE BEFORE /:id ============
// User enrollments and certificates
router.get('/my-enrollments', authenticate, getUserEnrollments);
router.get('/my-certificates', authenticate, getMyCertificates);

// Course access and learning
router.get('/learn/:courseId', authenticate, checkCourseAccess);
router.post('/enroll', authenticate, enrollInCourse);
router.post('/enroll-with-payment', authenticate, enrollInCourseWithPayment);
router.get('/enrollment/:courseId', authenticate, getEnrollmentStatus);
router.post('/mark-complete', authenticate, markModuleComplete);

// Course reviews
router.post('/:courseId/reviews', authenticate, addCourseReview);

// ============ GET COURSE BY ID - MUST BE AFTER SPECIFIC ROUTES ============
router.get('/:id', getCourseById);

// ============ ADMIN ROUTES ============
router.get('/admin/all', authenticate, authorize('admin'), adminGetAllCourses);
router.post('/', authenticate, authorize('admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', authenticate, authorize('admin'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', authenticate, authorize('admin'), deleteCourse);

// ============ COURSE MODULES ROUTES (Admin Only) ============
router.get('/:courseId/modules', authenticate, authorize('admin'), getCourseModules);
router.post('/:courseId/modules', authenticate, authorize('admin'), addCourseModule);
router.put('/modules/:moduleId', authenticate, authorize('admin'), updateCourseModule);
router.delete('/modules/:moduleId', authenticate, authorize('admin'), deleteCourseModule);

// ============ COURSE REQUIREMENTS ROUTES (Admin Only) ============
router.get('/:courseId/requirements', authenticate, authorize('admin'), getCourseRequirements);
router.post('/:courseId/requirements', authenticate, authorize('admin'), addCourseRequirement);
router.delete('/requirements/:requirementId', authenticate, authorize('admin'), deleteCourseRequirement);

// ============ COURSE OUTCOMES ROUTES (Admin Only) ============
router.get('/:courseId/outcomes', authenticate, authorize('admin'), getCourseOutcomes);
router.post('/:courseId/outcomes', authenticate, authorize('admin'), addCourseOutcome);
router.delete('/outcomes/:outcomeId', authenticate, authorize('admin'), deleteCourseOutcome);

// ============ COURSE FAQS ROUTES (Admin Only) ============
router.get('/:courseId/faqs', authenticate, authorize('admin'), getCourseFaqs);
router.post('/:courseId/faqs', authenticate, authorize('admin'), addCourseFAQ);
router.put('/faqs/:faqId', authenticate, authorize('admin'), updateCourseFAQ);
router.delete('/faqs/:faqId', authenticate, authorize('admin'), deleteCourseFAQ);

// ============ COURSE REVIEW MANAGEMENT ROUTES (Admin only) ============
router.get('/reviews/pending', authenticate, authorize('admin'), getPendingCourseReviews);
router.get('/reviews/approved', authenticate, authorize('admin'), getApprovedCourseReviews);
router.get('/:id/reviews/admin', authenticate, authorize('admin'), getCourseReviewsAdmin);
router.put('/reviews/:reviewId/approve', authenticate, authorize('admin'), approveCourseReview);
router.delete('/reviews/:reviewId', authenticate, authorize('admin'), deleteCourseReview);

module.exports = router;