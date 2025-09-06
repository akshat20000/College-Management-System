const { User } = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/asyncHandle');
const {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/errorClasses');
const redisClient = require('../utils/redisClient');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};


const cacheUserAndToken = async (user, refreshToken) => {
  const userId = user._id.toString();
  await redisClient.setEx(`refreshToken:${refreshToken}`, 7 * 24 * 60 * 60, userId);
  await redisClient.setEx(`user:${userId}`, 3600, JSON.stringify(user));
};


const clearUserCache = async (userId, refreshToken) => {
  await redisClient.del(`refreshToken:${refreshToken}`);
  await redisClient.del(`user:${userId}`);
};

// Register new user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    throw new ValidationError('Please enter all fields');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('User already exists with this email');
  }

  const newUser = await User.create({
    name: name.trim(),
    email: email.trim(),
    password,
    role: role || 'student',
  });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = await newUser.generateAndSaveRefreshToken();


  await cacheUserAndToken(newUser, refreshToken);

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
    token: accessToken,
  });
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    throw new ValidationError('Please enter all fields');
  }

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = await user.generateAndSaveRefreshToken();


  await cacheUserAndToken(user, refreshToken);

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: 'Logged in successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: accessToken,
  });
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(204).json({ message: 'No token found' });
  }

  const refreshToken = cookies.jwt;

  const userId = await redisClient.get(`refreshToken:${refreshToken}`);
  if (userId) {
    await clearUserCache(userId, refreshToken);
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  } else {

    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
      await clearUserCache(user._id.toString(), refreshToken);
    }
  }

  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

// Refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    throw new UnauthorizedError('No refresh token found');
  }

  const refreshToken = cookies.jwt;

  let userId = await redisClient.get(`refreshToken:${refreshToken}`);
  let user = null;

  if (userId) {

    const cachedUser = await redisClient.get(`user:${userId}`);
    user = cachedUser ? JSON.parse(cachedUser) : await User.findById(userId);
  } else {

    user = await User.findOne({ refreshToken });
    if (user) {
      userId = user._id.toString();
    }
  }

  if (!user) {
    throw new ForbiddenError('Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await user.generateAndSaveRefreshToken();


  await clearUserCache(userId, refreshToken);
  await cacheUserAndToken(user, newRefreshToken);

  res.cookie('jwt', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: 'Token refreshed successfully',
    accessToken: newAccessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

const handleRefreshToken = async (req, res) => {
 const refreshToken = req.cookies.jwt;
 
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Authentication failed. No refresh token.' });
  }
  try {
//const newAccessToken = generateAccessToken(User);
res.json({
      token: refreshToken,
      user: {
        id: User.id,
        name: User.name,
        email: User.email,
        role: User.role
      }
    });

  } catch (error) {
    // If the refresh token is invalid or expired
    
    return res.status(403).json({ message: 'Invalid refresh token.' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  handleRefreshToken
};
