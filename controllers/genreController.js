const Genre = require('../models/Genre');

// Add a new genre
exports.addGenre = async (req, res) => {
  const { name } = req.body;
  try {
    const genre = new Genre({ name });
    const savedGenre = await genre.save();
    res.status(201).json(savedGenre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all genres
exports.getGenres = async (req, res) => {
  try {
    const genres = await Genre.find(); // Fetch all genres from the "genres" collection
    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};