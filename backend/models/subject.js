const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a subject name'],
      trim: true,
    },
    code: { // Subject code like "CS301", "IT205"
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },

    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course', // 'Course' is now our program model
      required: [true, 'Please link this subject to a program/course'],
    },

    type: {
      type: String,
      enum: ['Theory', 'Lab', 'Tutorial', 'Project'],
      default: 'Theory',
      required: true,
    },
    credits: {
      type: Number,
      min: 0,
      required: false,
    }
  }
)
const Subject = new mongoose.model("Subject", subjectSchema);
module.exports = { Subject }