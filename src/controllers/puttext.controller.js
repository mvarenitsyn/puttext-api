/**
 * PutText Controller - Handles API requests for image text operations
 */
const fs = require('fs');
const path = require('path');
const PutTextService = require('../services/puttext.service');

// Temporary storage directory for uploaded files
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Controller methods
const puttextController = {
    /**
     * Add text to an image via URL
     * POST /api/puttext/url
     * 
     * Body: {
     *   imageUrl: string,
     *   text: string,
     *   options: {
     *     width: number,
     *     height: number,
     *     color: string,
     *     backgroundColor: string,
     *     font: string,
     *     fontSize: number,
     *     padding: number,
     *     maxWidth: number,
     *     align: string,
     *     minHeight: number,
     *     verticalOffset: number,
     *     textShadow: string
     *   },
     *   outputFormat: string (optional, 'jpeg' or 'png', default: 'jpeg')
     * }
     */
    addTextToImageUrl: async (req, res) => {
        try {
            const { imageUrl, text, options, outputFormat = 'jpeg' } = req.body;

            if (!imageUrl || !text) {
                return res.status(400).json({ error: 'Image URL and text are required' });
            }

            // Create instance with custom dimensions if provided
            const puttext = new PutTextService({
                width: options?.width,
                height: options?.height
            });

            // Load image from URL
            await puttext.loadImage(imageUrl);

            // Add text with provided options
            puttext.addText(text, options);

            // Convert to appropriate format
            const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
            const buffer = await puttext.toBuffer(mimeType);

            // Set content type and send image buffer
            res.contentType(mimeType);
            res.send(buffer);
        } catch (error) {
            console.error('Error processing image URL:', error);
            res.status(500).json({ error: 'Failed to process image', details: error.message });
        }
    },

    /**
     * Add text to an uploaded image
     * POST /api/puttext/upload
     * 
     * Multipart form data with:
     * - image: File
     * - text: string
     * - options: JSON string of options (optional)
     * - outputFormat: string (optional, 'jpeg' or 'png')
     */
    addTextToUploadedImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image file uploaded' });
            }

            const { text, options: optionsString, outputFormat = 'jpeg' } = req.body;
            let options = {};

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            // Parse options if provided
            if (optionsString) {
                try {
                    options = JSON.parse(optionsString);
                } catch (e) {
                    return res.status(400).json({ error: 'Invalid options format. Must be valid JSON.' });
                }
            }

            // Create instance with custom dimensions if provided
            const puttext = new PutTextService({
                width: options.width,
                height: options.height
            });

            // Load image from uploaded file
            await puttext.loadImage(req.file.path);

            // Add text with provided options
            puttext.addText(text, options);

            // Determine output format
            const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
            const buffer = await puttext.toBuffer(mimeType);

            // Clean up the uploaded file after processing
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });

            // Set content type and send image buffer
            res.contentType(mimeType);
            res.send(buffer);
        } catch (error) {
            console.error('Error processing uploaded image:', error);
            res.status(500).json({ error: 'Failed to process image', details: error.message });
        }
    }
};

module.exports = puttextController;
