const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { moderateLimiter ,rolebasedLimiter} = require('../middleware/rateLimiter');

// Public route to get all subjects
router.get('/', rolebasedLimiter,getSubjects);

// Public route to get a single subject by ID
router.get('/:id', rolebasedLimiter,getSubjectById);

// Protected routes (Admin only for CUD operations)
router.post('/', protect,moderateLimiter, authorizeRoles('admin'), createSubject);
router.put('/:id', protect,moderateLimiter, authorizeRoles('admin'), updateSubject);
router.delete('/:id', protect, moderateLimiter,authorizeRoles('admin'), deleteSubject);

module.exports = router;