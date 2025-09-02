const mongoose = require('mongoose')

const courseSchema = mongoose.Schema(
    {
        name: { 
      type: String,
      required: [true, 'Please add a program name (e.g., BE CSE)'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a program description'],
    },
    duration: { // e.g., "4 Years", "2 Semesters"
      type: String,
      required: [true, 'Please add program duration'],
    },
    //Head of Department 
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Reference to a User (admin or teacher role)
      required: false,
    },
    }
)
 const Course =  mongoose.model('Course', courseSchema);
module.exports ={Course}