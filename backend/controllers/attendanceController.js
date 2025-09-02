const { Attendance } = require('../models/attendance');
const { Class } = require('../models/class');
const { User } = require('../models/user');
const {asyncHandler} = require('../middleware/asyncHandle');
const { ValidationError, NotFoundError } = require('../utils/errorClasses');


const validateClassExists = async (classId) => {
  const classItem = await Class.findById(classId);
  if (!classItem) throw new NotFoundError('Class not found');
  return classItem;
};

// Helper: validate if student exists
const validateStudentExists = async (studentId) => {
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') {
    throw new ValidationError(`User with ID ${studentId} is not a valid student`);
  }
  return student;
};

// @desc Get attendance records
// @route GET /api/attendance
// @access Private (Teacher/Admin)
const getAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find()
    .populate('classId')
    .populate('studentId', 'name email')
    .lean();

  res.status(200).json(records);
});

// @desc Get attendance for a specific class
// @route GET /api/attendance/class/:classId
// @access Private (Teacher/Admin)
const getAttendanceByClass = asyncHandler(async (req, res) => {
  await validateClassExists(req.params.classId);

  const records = await Attendance.find({ classId: req.params.classId })
    .populate('studentId', 'name email')
    .lean();

  res.status(200).json(records);
});

// @desc Mark attendance
// @route POST /api/attendance
// @access Private (Teacher/Admin)
const markAttendance = asyncHandler(async (req, res) => {
  const { classId, date, records } = req.body;

  if (!classId || !date || !Array.isArray(records) || records.length === 0) {
    throw new ValidationError('classId, date, and attendance records are required');
  }

  const classItem = await validateClassExists(classId);

  // Validate students
  await Promise.all(records.map(r => validateStudentExists(r.studentId)));

  // Save records
  const savedRecords = await Attendance.insertMany(
    records.map(r => ({
      classId,
      date,
      studentId: r.studentId,
      status: r.status
    }))
  );

  res.status(201).json({
    message: 'Attendance marked successfully',
    attendance: savedRecords
  });
});

// @desc Update attendance
// @route PUT /api/attendance/:id
// @access Private (Teacher/Admin)
const updateAttendance = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) throw new ValidationError('Status is required to update attendance');

  const updated = await Attendance.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!updated) throw new NotFoundError('Attendance record not found');

  res.status(200).json({
    message: 'Attendance updated successfully',
    attendance: updated
  });
});

// @desc Delete attendance record
// @route DELETE /api/attendance/:id
// @access Private (Teacher/Admin)
const deleteAttendance = asyncHandler(async (req, res) => {
  const deleted = await Attendance.findByIdAndDelete(req.params.id);
  if (!deleted) throw new NotFoundError('Attendance record not found');

  res.status(200).json({ message: 'Attendance record deleted successfully' });
});

module.exports = {
  getAttendance,
  getAttendanceByClass,
  markAttendance,
  updateAttendance,
  deleteAttendance
};
