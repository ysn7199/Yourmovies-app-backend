const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const Movie = require('../models/Movie');

// Register a new user
exports.registerUser = async (req, res) => {
  const { username, email, password, likedMovies, watchedMovies, watchlist, isAdmin } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const user = await User.create({
      username,
      email,
      password,
      likedMovies,
      watchedMovies,
      watchlist,
      isAdmin,
    });

    // Generate a token for the newly registered user
    const token = generateToken(user._id, user.username, user.email, user.likedMovies, user.watchedMovies, user.watchlist, user.isAdmin);

    // Send user details and token in response
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      likedMovies: user.likedMovies,
      watchedMovies: user.watchedMovies,
      watchlist: user.watchlist,
      token, // Send the token to the client
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        likedMovies: user.likedMovies,
        watchedMovies: user.watchedMovies,
        watchlist: user.watchlist,
        token: generateToken(user._id, user.username, user.email, user.likedMovies, user.watchedMovies, user.watchlist, user.isAdmin)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get user's watchlist and watched movies
exports.getUserMovies = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('likedMovies').populate('watchlist').populate('watchedMovies');

    res.json({
      likedMovies: user.likedMovies,
      watchlist: user.watchlist,
      watchedMovies: user.watchedMovies
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

