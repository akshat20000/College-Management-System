const express = require('express');
const router = express.Router();
const {
  getClasses,
  createClass,
  getClassById,
  updateClass,
  deleteClass,
  enrollStudents,
  unenrollStudents,
} = require('../controllers/classController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {  moderateLimiter ,rolebasedLimiter} = require('../middleware/rateLimiter');

// Public route to get all classes (can add filters later)
router.get('/',rolebasedLimiter, getClasses);

// Public route to get a single class by ID
router.get('/:id',rolebasedLimiter, getClassById);

// Protected routes (Admin only for CUD operations and enrollment management)
router.post('/', protect,moderateLimiter, authorizeRoles('admin'), createClass);
router.put('/:id', protect,moderateLimiter, authorizeRoles('admin'), updateClass);
router.delete('/:id', protect, moderateLimiter,authorizeRoles('admin'), deleteClass);

// Specific actions for classes
router.put('/:id/enroll', protect,moderateLimiter, authorizeRoles('admin'), enrollStudents); 
router.put('/:id/unenroll', protect,moderateLimiter, authorizeRoles('admin'), unenrollStudents); 

// TODO: Add teacher-specific routes later (e.g., teacher can view their classes, mark attendance)

module.exports = router;