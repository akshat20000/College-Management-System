const mongoose = require('mongoose')
const { attendance } = require('../models/attendance');
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

// @desc Get attendance records of a specified student
// @route GET /api/attendance/student/studentid
// @access Private (Teacher/Admin)
const getAttendanceByStudent = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;
  await validateStudentExists(studentId);

  const records = await attendance.find({ student: studentId })  
    .populate('student', 'name email cmsid')
    .lean();

  if (!records || records.length === 0) {
    throw new NotFoundError('No attendance records found for this student');
  }

  res.status(200).json(records);
});

// @desc Get attendance for a specific class
// @route GET /api/attendance/class/:classId
// @access Private (Teacher/Admin)
const getAttendanceByClass = asyncHandler(async (req, res) => {
  const classId = new mongoose.Types.ObjectId(req.params.classId);
  await validateClassExists(classId);

  const records = await attendance.find({ class: classId })  
    .populate('student', 'name email')
    .lean();

  res.status(200).json(records);
});

// @desc Mark attendance
// @route POST /api/attendance/:classId
// @access Private (Teacher/Admin)
const markAttendance = asyncHandler(async (req, res) => {
  const {  date, records } = req.body;
  const {classId } = req.params;

  if (!classId || !date || !Array.isArray(records) || records.length === 0) {
    throw new ValidationError('classId, date, and attendance records are required');
  }

  const classItem = await validateClassExists(classId);

  // Validate students
  await Promise.all(records.map(r => validateStudentExists(r.studentId)));

  // Save records
  const savedRecords = await attendance.insertMany(
    records.map(r => ({
     class: classId,       
      student: r.studentId,   
      markedBy: req.user._id,  
      date,
      status: r.status
    }))
  );

  res.status(201).json({
    message: 'Attendance marked successfully',
    attendance: savedRecords
  });
});

// GET /attendance/student/:studentId/class/:classId
const getAttendanceByStudentAndClass = asyncHandler(async (req, res) => {
  const { studentId, classId } = req.params;

  // validate inputs
  await validateStudentExists(studentId);
  await validateClassExists(classId);

  const records = await attendance.find({ student: studentId, class: classId })
    .populate('student', 'name email cmsid')
    .populate('class', 'sectionName subject')
    .lean();

  if (!records || records.length === 0) {
    throw new NotFoundError('No attendance records found for this student in this class');
  }

  res.status(200).json(records);
});

// @desc Update attendance
// @route PUT /api/attendance/:id
// @access Private (Teacher/Admin)
const updateAttendance = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) throw new ValidationError('Status is required to update attendance');

  const updated = await attendance.findByIdAndUpdate(
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
  const deleted = await attendance.findByIdAndDelete(req.params.id);
  if (!deleted) throw new NotFoundError('Attendance record not found');

  res.status(200).json({ message: 'Attendance record deleted successfully' });
});

module.exports = {
  getAttendanceByStudent,
  getAttendanceByClass,
  markAttendance,
  getAttendanceByStudentAndClass,
  updateAttendance,
  deleteAttendance
};
