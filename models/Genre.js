const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const Genre = mongoose.model('Genre', genreSchema, 'genres'); // Explicitly specify the collection name

module.exports = Genre;