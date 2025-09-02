const express = require('express');
const router = express.Router();
const { getCourses, createCourse, getCourseById , updateCourse, deleteCourse} = require('../controllers/courseController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { moderateLimiter,rolebasedLimiter } = require('../middleware/rateLimiter');

// Public route to get all courses (programs)
router.get('/',rolebasedLimiter, getCourses);

// Public route to get a single course (program) by ID
router.get('/:id', rolebasedLimiter,getCourseById);

// Protected route to create a new course (program) - only for Admin
router.post('/', protect, moderateLimiter,authorizeRoles('admin'), createCourse);
router.put('/:id', protect, moderateLimiter,authorizeRoles('admin'), updateCourse);  
router.delete('/:id', protect,moderateLimiter, authorizeRoles('admin'), deleteCourse);

module.exports = router;