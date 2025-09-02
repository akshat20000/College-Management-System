const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authControllers');
const { rolebasedLimiter} = require('../middleware/rateLimiter');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register',registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', rolebasedLimiter,loginUser);


router.post('/logout',logoutUser);

module.exports = router;