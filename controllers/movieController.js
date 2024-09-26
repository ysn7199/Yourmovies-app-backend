const Movie = require('../models/Movie');
const User = require('../models/User');
const { uploadToCloudStorage } = require('../utils/cloudStorage');

// Add a new movie (Any user)
exports.addMovie = async (req, res) => {
  const { title, description, director, releaseDate, genres } = req.body;
  try {
    let posterUrl = '';
    if (req.file) {
      posterUrl = await uploadToCloudStorage(req.file.path);
    }

    const movie = new Movie({
      title,
      description,
      director,
      releaseDate,
      genres,
      poster: posterUrl,
    });

    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit an existing movie (Admin only)
exports.editMovie = async (req, res) => {
  const { id } = req.params;
  const { title, description, director, releaseDate, genres } = req.body;

  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (req.file) {
      movie.poster = await uploadToCloudStorage(req.file.path);
    }

    movie.title = title || movie.title;
    movie.description = description || movie.description;
    movie.director = director || movie.director;
    movie.releaseDate = releaseDate || movie.releaseDate;
    movie.genres = genres || movie.genres;

    const updatedMovie = await movie.save();
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Add a Review
exports.addReview = async (req, res) => {
  const { review, rating } = req.body;
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    movie.reviews.push({ userId: req.user._id, username: req.user.name, review, rating });
    
    // Calculate the new average rating
    const totalReviews = movie.reviews.length;
    const totalRating = movie.reviews.reduce((acc, review) => acc + review.rating, 0);
    movie.averageRating = (totalRating / totalReviews).toFixed(1); // Keep one decimal place for half-stars

    await movie.save();
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all movies
// Get all movies with genre filter
exports.getMovies = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 24;
  const skip = (page - 1) * limit;
  const genre = req.query.genre || '';
  const search = req.query.search || ''; // Get search query from the request

  try {
    // Create filter object based on genre and search
    const filter = {};

    if (genre) {
      filter.genres = genre; // Filter by genre if provided
    }

    if (search) {
      // Search by title (case-insensitive)
      filter.title = { $regex: search, $options: 'i' };
    }

    const movies = await Movie.find(filter).skip(skip).limit(limit);
    const totalMovies = await Movie.countDocuments(filter);
    const totalPages = Math.ceil(totalMovies / limit);

    res.json({ movies, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get a single movie by ID (if needed)
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    
    res.json({
      _id: movie._id,
      title: movie.title,
      description: movie.description,
      director: movie.director,
      releaseDate: movie.releaseDate,
      genres: movie.genres,
      poster: movie.poster,
      backdrop: movie.backdrop,
      likes: movie.likes.length,
      reviews: movie.reviews,
      averageRating: movie.averageRating,
      imdbRating: movie.imdbRating,
      actors: movie.actors,
      runtime: movie.runtime
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Like or Unlike a Movie
exports.likeMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const userId = req.user._id;

    // Find the movie
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the user has already liked the movie
    const isLiked = user.likedMovies.includes(movieId);

    if (isLiked) {
      // Unlike the movie (remove from user's likedMovies and movie's likes)
      user.likedMovies.pull(movieId);
      movie.likes.pull(userId);
    } else {
      // Like the movie (add to user's likedMovies and movie's likes)
      user.likedMovies.push(movieId);
      movie.likes.push(userId);
    }

    // Save both the user and the movie
    await user.save();
    await movie.save();

    res.status(200).json({ 
      message: isLiked ? 'Movie unliked' : 'Movie liked',
      likedMovies: user.likedMovies,
      movieLikes: movie.likes.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Add movie to watchlist
exports.addToWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Check if the movie is already in the watchlist
    if (user.watchlist.includes(movie._id)) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    // Add movie to user's watchlist
    user.watchlist.push(movie._id);
    await user.save();

    res.json({ message: 'Movie added to watchlist', watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark movie as watched
exports.markAsWatched = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Check if the movie is already marked as watched
    if (user.watchedMovies.includes(movie._id)) {
      return res.status(400).json({ message: 'Movie already marked as watched' });
    }

    // Remove from watchlist if it's there
    user.watchlist.pull(movie._id);

    // Add movie to watchedMovies list
    user.watchedMovies.push(movie._id);
    await user.save();

    res.json({ message: 'Movie marked as watched', watchedMovies: user.watchedMovies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Remove movie from watchlist
exports.removeFromWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Check if the movie is in the watchlist
    if (!user.watchlist.includes(movie._id)) {
      return res.status(400).json({ message: 'Movie not in watchlist' });
    }

    // Remove movie from user's watchlist
    user.watchlist.pull(movie._id);
    await user.save();

    res.json({ message: 'Movie removed from watchlist', watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get User Actions for a Movie
exports.getUserMovieActions = async (req, res) => {
  try {
    const movieId = req.params.id; // Movie ID from the URL params
    const userId = req.user._id; // User ID from the JWT token (extracted by middleware)

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the movie action in user's action list
    const movieActions = user.actions.find((action) => action.movieId.toString() === movieId);
    if (!movieActions) {
      return res.json({ liked: false, watched: false, inWatchlist: false }); // Default if no actions found
    }

    res.status(200).json(movieActions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update User Actions for a Movie
exports.updateUserMovieActions = async (req, res) => {
  try {
    const movieId = req.params.id; // Movie ID from URL params
    const userId = req.user._id; // User ID from JWT token
    const { liked, watched, inWatchlist } = req.body; // Action details from the request body

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the index of the action related to the movie
    const existingActionsIndex = user.actions.findIndex((action) => action.movieId.toString() === movieId);

    if (existingActionsIndex >= 0) {
      // Update the existing action
      user.actions[existingActionsIndex] = {
        movieId,
        liked: liked ?? user.actions[existingActionsIndex].liked,
        watched: watched ?? user.actions[existingActionsIndex].watched,
        inWatchlist: inWatchlist ?? user.actions[existingActionsIndex].inWatchlist,
      };
    } else {
      // Add new action for the movie if none exists
      user.actions.push({
        movieId,
        liked: liked || false,
        watched: watched || false,
        inWatchlist: inWatchlist || false,
      });
    }

    // Save the user with updated actions
    await user.save();

    res.status(200).json({ message: 'User actions updated successfully', actions: user.actions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Movies Liked, Watched, and in Watchlist by the User
exports.getUserMovieLists = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the user and populate liked, watched, and watchlist movies
    const user = await User.findById(userId).populate('actions.movieId', 'title poster description');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Filter liked, watched, and watchlist movies
    const likedMovies = user.actions.filter((action) => action.liked).map((action) => action.movieId);
    const watchedMovies = user.actions.filter((action) => action.watched).map((action) => action.movieId);
    const watchlistMovies = user.actions.filter((action) => action.inWatchlist).map((action) => action.movieId);

    res.status(200).json({
      likedMovies,
      watchedMovies,
      watchlistMovies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
