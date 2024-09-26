const jwt = require('jsonwebtoken');

const generateToken = (id, username, email,likedMovies, watchedMovies,watchlist , isAdmin) => {
  return jwt.sign({ id, username: username, email: email,likedMovies: likedMovies, watchedMovies: watchedMovies, watchlist: watchlist, isAdmin: isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
