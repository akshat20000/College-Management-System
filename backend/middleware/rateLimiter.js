const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const  {RedisStore}  = require("rate-limit-redis")
const { createClient } = require('redis')
const { User } = require('../models/user'); 
const dotenv = require("dotenv");
dotenv.config()

const redisClient = createClient({
  username: process.env["redis-username"],
  password: process.env["redis-password"],
  socket: {
    host: process.env["redis-host"],
    port: process.env["redis-port"]
  }
});

redisClient.connect().catch(console.error)

const strictLimiter = rateLimit({

  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),

  windowMs: 15 * 60 * 1000,
  max:100,
  message: {
    message: 'Too many login attempts from this IP, please try again after a 15 minute wait'
  },
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req)
    if (req.body?.email) {
      return `${ip}:${req.body.email}`;
    }
    return req.user?.id || ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const moderateLimiter = rateLimit({

  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),

  windowMs: 60 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after an hour',
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req)
    if (req.body?.email) {
      return `${ip}:${req.body.email}`;
    }
    return req.user?.id || ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const rolebasedLimiter = async (req, res, next) => {
  try {
    let role;

    if (req.user?.id) {
      role = req.user.role;
    } 
    else if (req.body?.email) {
      const cacheKey = `role:${req.body.email.toLowerCase()}`;
      role = await redisClient.get(cacheKey);

      if (!role) {
      
        const user = await User.findOne({ email: req.body.email }).select('role').lean();
        role = user?.role || 'user';

        await redisClient.setEx(cacheKey, 600, role);
      }
    }

    if (role === 'admin') {
      return moderateLimiter(req, res, next);
    }
    return strictLimiter(req, res, next);

  } catch (err) {

    console.error('Role-based limiter error:', err);
    return strictLimiter(req, res, next);
  }
};

module.exports = {
  strictLimiter,
  moderateLimiter,
  rolebasedLimiter
};