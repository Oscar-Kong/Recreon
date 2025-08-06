const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Upload avatar image
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // For now, just return a success response
    // In the future, you can integrate with Cloudinary or another storage service
    res.json({ 
      success: true, 
      message: 'Upload endpoint created - integration pending',
      filename: req.file.originalname 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Export the router (this is crucial!)
module.exports = router;