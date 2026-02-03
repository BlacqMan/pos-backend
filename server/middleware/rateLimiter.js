const rateLimit = require("express-rate-limit");

// General API limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: {
    message: "Too many requests, please try again later",
  },
});

// Stricter limiter for auth routes
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // login attempts
  message: {
    message: "Too many login attempts, try again later",
  },
});
