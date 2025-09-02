const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema(
  {
    class: { // This now refers to the specific Class offering (e.g., JP Theory - Group 2)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Attendance must be linked to a class offering'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: [true, 'Attendance must be for a specific student'],
    },
    date: { // The specific date the attendance was taken
      type: Date,
      required: [true, 'Please add the date of attendance'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: [true, 'Please add attendance status'],
      default: 'present',
    },
    markedBy: { // The specific teacher (User ID) who marked this attendance entry for this slot
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: [true, 'Attendance must be marked by a teacher'],
    },
    
    slotTime: {
      type: String, 
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// to prevent duplicates for the same student in the same class on the same date (and slot if used)
attendanceSchema.index({ class: 1, student: 1, date: 1, slotTime: 1 }, { unique: true });

const attendance = mongoose.model('Attendance', attendanceSchema);
module.exports={attendance}