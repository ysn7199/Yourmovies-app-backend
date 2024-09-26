const express = require('express');
const { registerUser, loginUser ,getUserMovies } = require('../controllers/authController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Logout endpoint (client-side action)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// Example of a protected route with admin authorization
router.get('/admin', protect, admin, (req, res) => {
  res.send('Admin Content');
});


// Example of a protected route
router.get('/protected-route', protect, (req, res) => {
  res.json({ message: 'This route is protected' });
});

// Example of an admin-protected route
router.get('/admin-route', protect, admin, (req, res) => {
  res.json({ message: 'This route is only accessible by admins' });
});

router.get('/usermovies', protect, getUserMovies);



module.exports = router;
