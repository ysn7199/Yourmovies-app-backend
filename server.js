const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const genreRoutes = require('./routes/genreRoutes');


// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Initialize the Express application
const app = express();

const allowedOrigins = [
    'https://yourmovies-nine.vercel.app',
    'https://yourmovies-git-main-yassines-projects-370de181.vercel.app',
    'https://yourmovies-ps9pmk12r-yassines-projects-370de181.vercel.app'
];
// Use CORS middleware
app.use(cors({
  origin:allowedOrigins ,
  credentials: true 
}));

// Use JSON parser middleware
app.use(express.json());

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/genres', genreRoutes)
app.use('/api/movies', movieRoutes);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
