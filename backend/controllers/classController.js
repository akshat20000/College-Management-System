const mongoose = require('mongoose');
const { Class } = require('../models/class');
const { Subject } = require('../models/subject');
const { User } = require('../models/user');

const {asyncHandler} = require('../middleware/asyncHandle');
const {
  ValidationError,
  NotFoundError,
  ForbiddenError
} = require('../utils/errorClasses');

// Helper: populate class
const populateClass = (query) => {
  return query
    .populate('subject')
    .populate('primaryTeacher', 'name email role')
    .populate('students', 'name email role')
    .populate('schedule.assignedTeacher', 'name email role');
};

// Helper: validate user and role
const validateUserAndRole = async (userId, allowedRoles) => {
  const user = await User.findById(userId);
  if (!user || !allowedRoles.includes(user.role)) {
    throw new ValidationError(
      `User with ID ${userId} does not exist or is not a ${allowedRoles.join(' or ')}`
    );
  }
  return user;
};

// GET all classes with filters
const getClasses = asyncHandler(async (req, res) => {
  const query = { ...req.query };
  const classes = await populateClass(Class.find(query).lean());
  res.status(200).json(classes);
});

// POST create class
const createClass = asyncHandler(async (req, res) => {
  const {
    subject,
    program,
    sectionName,
    primaryTeacher,
    academicYear,
    semester,
    startDate,
    endDate,
    students = [],
    schedule = []
  } = req.body;

  if (!subject || !program || !sectionName || !primaryTeacher || !academicYear || !semester || !startDate || !endDate) {
    throw new ValidationError('Missing required fields.');
  }

  const teacherId = new mongoose.Types.ObjectId(primaryTeacher);
  await validateUserAndRole(teacherId, ['teacher']);
  await Promise.all(students.map(id => validateUserAndRole(id, ['student'])));

  const filteredSchedule = schedule.filter(item => item.assignedTeacher);
  await Promise.all(filteredSchedule.map(item => validateUserAndRole(item.assignedTeacher, ['teacher'])));

  const newClass = new Class({
    subject,
    program,
    sectionName,
    primaryTeacher,
    academicYear,
    semester,
    startDate,
    endDate,
    students,
    schedule
  });

  const savedClass = await newClass.save();
  const populated = await populateClass(Class.findById(savedClass._id));
  res.status(201).json(populated);
});

// GET class by ID
const getClassById = asyncHandler(async (req, res) => {
  const classItem = await populateClass(Class.findById(req.params.id));
  if (!classItem) throw new NotFoundError('Class not found');
  res.status(200).json(classItem);
});

// PUT update class
const updateClass = asyncHandler(async (req, res) => {
  const { primaryTeacher, students, schedule } = req.body;

  if (primaryTeacher) await validateUserAndRole(primaryTeacher, ['teacher']);
  if (students) await Promise.all(students.map(id => validateUserAndRole(id, ['student'])));
  if (schedule) await Promise.all(schedule.map(item => validateUserAndRole(item.assignedTeacher, ['teacher'])));

  const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) throw new NotFoundError('Class not found');

  const populated = await populateClass(Class.findById(updated._id));
  res.status(200).json(populated);
});

// DELETE class
const deleteClass = asyncHandler(async (req, res) => {
  const deleted = await Class.findByIdAndDelete(req.params.id);
  if (!deleted) throw new NotFoundError('Class not found');
  res.status(200).json({ message: 'Class deleted successfully' });
});

// PUT enroll students
const enrollStudents = asyncHandler(async (req, res) => {
  const { students } = req.body;
  const classItem = await Class.findById(req.params.id);
  if (!classItem) throw new NotFoundError('Class not found');

  await Promise.all(students.map(id => validateUserAndRole(id, ['student'])));
  const newStudents = students.filter(id => !classItem.students.includes(id));

  classItem.students.push(...newStudents);
  await classItem.save();

  const populated = await populateClass(Class.findById(classItem._id));
  res.status(200).json({ message: 'Students enrolled', class: populated });
});

// PUT unenroll students
const unenrollStudents = asyncHandler(async (req, res) => {
  const { students } = req.body;
  const classItem = await Class.findById(req.params.id);
  if (!classItem) throw new NotFoundError('Class not found');

  classItem.students = classItem.students.filter(id => !students.includes(id.toString()));
  await classItem.save();

  const populated = await populateClass(Class.findById(classItem._id));
  res.status(200).json({ message: 'Students unenrolled', class: populated });
});

module.exports = {
  getClasses,
  createClass,
  getClassById,
  updateClass,
  deleteClass,
  enrollStudents,
  unenrollStudents
};
