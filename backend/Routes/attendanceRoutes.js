const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAttendanceByStudent,
  getAttendanceByClass,
  markAttendance,
  getAttendanceByStudentAndClass,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { strictLimiter, moderateLimiter, rolebasedLimiter } = require('../middleware/rateLimiter');

// A route for marking new attendance
router.post('/:classId', protect, rolebasedLimiter, authorizeRoles('admin', 'teacher'), markAttendance);

// A route to get attendance records for a specific class
router.get('/class/:classId', rolebasedLimiter, getAttendanceByClass);

// A route to get attendance records for a specific student
router.get('/student/:studentId', strictLimiter, getAttendanceByStudent);

// A route to get attendance record for a specific student &class
router.get('/student/:studentId/class/:classId',strictLimiter,getAttendanceByStudentAndClass);

// A route to update an existing attendance record by its ID
router.put('/:id', protect, moderateLimiter, authorizeRoles('admin', 'teacher'), updateAttendance);

// A route to delete an attendance record by its ID
router.delete('/:id', protect, moderateLimiter, authorizeRoles('admin', 'teacher'), deleteAttendance);

module.exports = router;
