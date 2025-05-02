/**
 * PutText API Routes
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const puttextController = require('../controllers/puttext.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Set up upload middleware with file type filtering
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

/**
 * @route POST /api/puttext/url
 * @desc Add text to an image from a URL
 * @access Public
 */
router.post('/url', puttextController.addTextToImageUrl);

/**
 * @route POST /api/puttext/upload
 * @desc Add text to an uploaded image
 * @access Public
 */
router.post('/upload', upload.single('image'), puttextController.addTextToUploadedImage);

/**
 * Error handler specifically for multer upload errors
 */
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

module.exports = router;
