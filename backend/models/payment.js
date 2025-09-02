const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // Reference to the User model (role 'student')
      required: [true, 'Payment must be associated with a student'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add payment amount'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Please add payment date'],
      default: Date.now,
    },
    course: { // Optional: Which course this payment is for
      type: mongoose.Schema.Types.ObjectId,
      ref: 'course',
      required: false,
    },
    status: { 
      type: String,
      enum: ['paid', 'pending', 'refunded', 'partial'],
      default: 'pending',
    },
    // Optional: Payment method, transaction ID, etc.
    paymentMethod: {
      type: String,
      required: false,
    },
    transactionId: {
      type: String,
      required: false,
      unique: false, // Can be unique, depends on your payment gateway
    }
  },
  {
    timestamps: true,
  }
);

const payment= mongoose.model('Payment', paymentSchema);
module.exports ={payment}