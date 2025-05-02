/**
 * PutText API Server
 * RESTful API to add text to images with customizable backgrounds
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const puttextRoutes = require('./routes/puttext.routes');

// Create Express app
const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev')); // HTTP request logger

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/puttext', puttextRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'PutText API',
        description: 'API for adding text to images with customizable backgrounds',
        endpoints: {
            addTextToImageUrl: '/api/puttext/url',
            addTextToUploadedImage: '/api/puttext/upload'
        },
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Error handling middleware
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server Error', details: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`PutText API server running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/`);
});

module.exports = app; // For testing purposes
