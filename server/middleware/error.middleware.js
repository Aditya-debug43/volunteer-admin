const logger = require('../utils/logger');

// 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Central error handler
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`);

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists', field: Object.keys(err.keyValue || {})[0] });
  }
  // Mongoose validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed', errors: Object.values(err.errors).map((e) => e.message) });
  }

  res.status(status).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
