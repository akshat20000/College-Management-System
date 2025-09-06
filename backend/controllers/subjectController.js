const {asyncHandler} = require('../middleware/asyncHandle');
const { Subject } = require('../models/subject');
const { Course } = require('../models/courses');
const {
  NotFoundError,
  ValidationError
} = require('../utils/errorClasses'); 

// Helper to check if Course exists
const validateProgram = async (programId) => {
  const program = await Course.findById(programId);
  return !!program;
};

// @desc    Get all Subjects
// @route   GET /api/subjects
// @access  Public (or restricted to authenticated users)
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().populate('program').lean();
  res.status(200).json(subjects);
});

// @desc    Create a new Subject
// @route   POST /api/subjects
// @access  Private (Admin only)
const createSubject = asyncHandler(async (req, res) => {
  const { name, code, description, program, type, credits } = req.body;
   console.log(req.body)
  if (!name || !program || !type || !code) {
    res.send(error)
    throw new ValidationError('Missing required fields: name, code, program, type');
  }

  const isProgramValid = await validateProgram(program);
  if (!isProgramValid) {
    throw new NotFoundError('Program ID not found');
  }

  try {
    const subject = await Subject.create({ name, code, description, program, type, credits });
    res.status(201).json(subject);
  } catch (error) {
    if (error.code === 11000) {
      throw new ValidationError('Subject with this name or code already exists.');
    }
    throw error; 
  }
});

// @desc    Get single Subject by ID
// @route   GET /api/subjects/:id
// @access  Public
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id).populate('program').lean();
  if (!subject) {
    throw new NotFoundError('Subject not found');
  }
  res.status(200).json(subject);
});

// @desc    Update a Subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
const updateSubject = asyncHandler(async (req, res) => {
  const { program, ...updateData } = req.body;

  if (program && !(await validateProgram(program))) {
    throw new NotFoundError('Provided program ID not found');
  }
  if (program) updateData.program = program;

  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('program').lean();

    if (!updatedSubject) {
      throw new NotFoundError('Subject not found');
    }

    res.status(200).json(updatedSubject);
  } catch (error) {
    if (error.code === 11000) {
      throw new ValidationError('Duplicate subject name or code');
    }
    throw error;
  }
});

// @desc    Delete a Subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    throw new NotFoundError('Subject not found');
  }

  await Subject.deleteOne({ _id: req.params.id });
  res.status(200).json({ message: 'Subject removed' });
});

module.exports = {
  getSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
};
