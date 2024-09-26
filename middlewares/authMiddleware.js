const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the authorization header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user associated with the token, excluding the password
      req.user = await User.findById(decoded.id).select('-password');

      // Check if the user exists
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error);

      // Determine the type of token error
      let message;
      if (error.name === 'TokenExpiredError') {
        message = 'Token expired';
      } else if (error.name === 'JsonWebTokenError') {
        message = 'Invalid token';
      } else {
        message = 'Not authorized, token failed';
      }

      // Send an error response
      return res.status(401).json({ message });
    }
  } else {
    // No token provided
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check if the user is an admin
exports.admin = (req, res, next) => {
  // Check if the user exists and is an admin
  if (req.user && req.user.isAdmin) {
    return next(); // User is an admin, proceed to the next middleware
  } else {
    // User is not an admin
    return res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
