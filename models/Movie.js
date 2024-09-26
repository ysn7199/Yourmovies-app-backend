const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  review: { type: String, required: true },
  rating: { type: Number, required: true }, // Rating with half-star support
}, { timestamps: true });

const movieSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  director: { type: String },
  releaseDate: { type: Date },
  genres: [String],
  poster: { type: String }, // Cloud storage URL for poster
  backdrop : { type : String},
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // To store user IDs who liked the movie
  reviews: [reviewSchema], // Store reviews with ratings
  imdbRating: { type: Number }, // IMDb rating
  actors: { type: [String], default: [] }, // Actors
  runtime: { type: String }, // Runtime
  genre: { type: String }, // Genre (if you want to store it separately)
  averageRating: { type: Number, default: 0 }, // Store the average rating
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
