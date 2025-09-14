require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Middleware
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./Routes/auth');
const courseRoutes = require('./Routes/courseRoutes');
const subjectRoutes = require('./Routes/subjectRoute');
const classRoutes = require('./Routes/classRoutes');
const attendanceRoutes = require('./Routes/attendanceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- Global Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// --- Basic Route for Testing ---
app.get('/', (req, res) => {
  res.send('Institute Management Backend API');
});

// --- API Routes ---
app.use('/api/users',authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes',  classRoutes);
app.use('/api/attendance', attendanceRoutes);


app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});


app.use(errorHandler);


const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server due to database connection error:', err);
    process.exit(1);
  }
};

connectDb();
