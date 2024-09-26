const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadToCloudStorage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'movie_posters',
    });
    return result.secure_url;  // URL to the uploaded image
  } catch (error) {
    throw new Error('Error uploading image to cloud storage');
  }
};
