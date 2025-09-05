const { Course } = require('../models/courses');
const { User } = require('../models/user');
const {asyncHandler} = require('../middleware/asyncHandle');
const {
  NotFoundError,
  ValidationError,
} = require('../utils/errorClasses');
const redisClient = require('../utils/redisClient');

// @desc    Get all Courses (Programs)
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).populate('coordinator', 'name email').lean();
  res.status(200).json(courses);
});

// @desc    Create a new Course (Program)
// @route   POST /api/courses
// @access  Private (Admin only)
const createCourse = asyncHandler(async (req, res) => {
  const { name, description, duration, coordinator } = req.body;

  if (!name?.trim() || !description?.trim() || !duration?.trim()) {
    throw new ValidationError('Please enter all required course fields');
  }

  const existingCourse = await Course.findOne({ name: name.trim() });
  if (existingCourse) {
    throw new ValidationError('A course with this name already exists.');
  }

  const createdCourse = await Course.create({
    name: name.trim(),
    description: description.trim(),
    duration: duration.trim(),
    coordinator: coordinator || (req.user?.role === 'admin' ? req.user.id : null),
  });

  res.status(201).json(createdCourse);
});

// @desc    Get single Course (Program) by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).lean();
  if (!course) {
    throw new NotFoundError('Course not found');
  }
  res.status(200).json(course);
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Admin only)
const updateCourse = asyncHandler(async (req, res) => {
  const { name, description, duration, coordinator } = req.body;
  const updateData = {};

  if (name?.trim()) updateData.name = name.trim();
  if (description?.trim()) updateData.description = description.trim();
  if (duration?.trim()) updateData.duration = duration.trim();
  if (coordinator) updateData.coordinator = coordinator;

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('coordinator', 'name email').lean();

  if (!updatedCourse) {
    throw new NotFoundError('Course not found');
  }

  res.status(200).json(updatedCourse);
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  await Course.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Course removed successfully' });
});

module.exports = {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
};
