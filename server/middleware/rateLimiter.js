const rateLimit = require('express-rate-limit');

// In development we don't want to lock ourselves out while testing.
const skipInDev = () => process.env.NODE_ENV !== 'production';

// Registration: 20 requests per IP per hour (prod only)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { message: 'Too many registration attempts. Please try again in an hour.' },
});

// Login: 15 attempts per IP per 15 minutes (prod only)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { message: 'Too many login attempts. Please try again in a few minutes.' },
});

// General API limiter — generous, applies in all environments
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { registerLimiter, loginLimiter, apiLimiter };
