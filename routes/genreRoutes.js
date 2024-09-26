const express = require('express');
const { addGenre, getGenres } = require('../controllers/genreController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getGenres);     // Get all genres
router.post('/', protect, admin, addGenre);     // Add a genre (Admin only)

module.exports = router;
