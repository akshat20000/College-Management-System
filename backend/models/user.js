const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = mongoose.Schema(
  { 
    cmsid:{
    type: String,
    required:false
    },
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, 
      match: [/.+@.+\..+/, 'Please enter a valid email address'], 
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'], 
      default: 'student', 
    },
  
    teacherDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher', 
      required: false//function() { return this.role === 'teacher'; } 
    },
    studentDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: false//function() { return this.role === 'student'; } 
    },
    // For teachers and students, list of classes they are associated with
    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      }
    ],

    refreshToken: {
            type: String, 
            default: null, 
        },
  },
  {
    timestamps: true, 
  }
);


const generateCMSID = async () => {
  const currentYear = new Date().getFullYear();
  
  while (true) {
    const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
    const potentialCMSID = `${currentYear}${randomFourDigits}`;

    const existingUser = await mongoose.models.User.findOne({ cmsid: potentialCMSID });
    
    if (!existingUser) {
      return potentialCMSID;
    }
    
  }
};
userSchema.pre('save', async function (next) {
  // 'this' refers to the document being saved
  if (this.isNew && !this.cmsid) {
    this.cmsid = await generateCMSID();
  }
  next(); 
});



userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.generateAndSaveRefreshToken = async function () {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const salt = await bcrypt.genSalt(10);
    this.refreshToken = await bcrypt.hash(refreshToken, salt);
    // expiration date
    this.refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.save({ validateBeforeSave: false });
    return refreshToken;
};

userSchema.methods.matchRefreshToken = async function (enteredRefreshToken) {
    // if expired
    if (this.refreshTokenExpiresAt && this.refreshTokenExpiresAt < new Date()) {
        return false;
    }
    return await bcrypt.compare(enteredRefreshToken, this.refreshToken);
};

const User = mongoose.model('User', userSchema);
module.exports ={User};