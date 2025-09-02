const mongoose = require('mongoose')

const scheduleSlotSchema = mongoose.Schema(
  {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: [true, 'Please specify the room for this slot'],
    },
    // The specific teacher assigned for THIS particular slot (can override primary teacher)
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to a User with role 'teacher'
      required: false,
    },
  }
)

const classSchema = mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Please specify the subject for this class offering'],
    },

    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'courses',
      required: [true, 'Please link this class to a program/course'],
    },
    // e.g., "Group 2", "CSE-A"
    sectionName: {
      type: String,
      required: [true, 'Please add a section name (e.g., A, B, Group 1, Group 2)'],
      trim: true,
    },
    // The primary teacher responsible for this class offering (even if other teachers take some slots)
    primaryTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to a User with role 'teacher'
      required: [true, 'Please assign a primary teacher for this class offering'],
    },
    // Array of students enrolled in this specific section/group of the subject
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to a User with role 'student'
      },
    ],

    schedule: [scheduleSlotSchema], // Array of scheduleSlotSchema objects

    academicYear: { // e.g., "2024-2025"
      type: String,
      required: [true, 'Please specify the academic year'],
    },
    semester: { // e.g., "Fall", "Spring", "Odd", "Even"
      type: String,
      enum: ['Fall', 'Spring', 'Summer', 'Odd', 'Even', 'Yearly'],
      required: [true, 'Please specify the semester'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please add the class start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add the class end date'],
    },
  }
)

classSchema.index({ subject: 1, program: 1, sectionName: 1, academicYear: 1, semester: 1 }, { unique: true });

const Class = mongoose.model('Class', classSchema);
module.exports = { Class }