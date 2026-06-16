const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Profile photo: max 2MB, images only
const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'nayepankh/profile-photos', allowed_formats: ['jpg', 'jpeg', 'png'] },
});

// ID documents: max 5MB, images + pdf
const docStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'nayepankh/documents', allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'] },
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { uploadPhoto, uploadDoc };
