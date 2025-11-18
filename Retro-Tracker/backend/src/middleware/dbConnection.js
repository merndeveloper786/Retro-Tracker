import mongoose from 'mongoose';

// Middleware to check if MongoDB is connected
export const checkDBConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection not available. Please try again later.',
      error: 'Database unavailable'
    });
  }
  next();
};

