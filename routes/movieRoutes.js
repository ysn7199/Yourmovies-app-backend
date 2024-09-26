const express = require('express');
const { addMovie, editMovie, likeMovie, addReview, getMovies, getMovieById, addToWatchlist, markAsWatched, removeFromWatchlist, getUserMovieActions, updateUserMovieActions, getUserMovieLists} = require('../controllers/movieController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();


router.get('/', getMovies);            // Get all movies
router.get('/:id', getMovieById);      // Get a movie by ID
router.post('/', protect, upload.single('poster'), addMovie);            // Add a movie (Any user)
router.put('/:id', protect, admin, upload.single('poster'), editMovie);  // Edit a movie (Admin only)
router.post('/:id/like', protect, likeMovie);                           // Like or Unlike a movie
router.post('/:id/review', protect, addReview);                         // Add a review
router.post('/:id/watchlist', protect, addToWatchlist);
router.post('/:id/watched', protect, markAsWatched);
router.delete('/:id/watchlist', protect, removeFromWatchlist);


// Get user actions for a specific movie
router.get('/:id/user-actions', protect, getUserMovieActions);

// Update user actions for a specific movie
router.post('/:id/user-actions', protect, updateUserMovieActions);

router.get('/user/movies', protect, getUserMovieLists);
module.exports = router;
