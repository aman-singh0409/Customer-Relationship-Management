const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5, 
  message: {
    status: 429,
    message: "Too many login attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
