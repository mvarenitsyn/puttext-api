/**
 * PutText Service - Server-side implementation of PutText
 * Based on the original PutText API with Node.js specific adaptations
 */
const { createCanvas, Image } = require('canvas');
const fs = require('fs');
const path = require('path');

class PutTextService {
    /**
     * Creates a new PutTextService instance
     * @param {Object} options - Configuration options
     * @param {number} options.width - Canvas width (default: 1080)
     * @param {number} options.height - Canvas height (default: 1920)
     */
    constructor(options = {}) {
        this.width = options.width || 1080; // Instagram recommended width
        this.height = options.height || 1920; // Instagram recommended height (9:16 ratio)
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Loads an image from file path, buffer or URL
     * @param {string|Buffer} imageSource - Path, URL, or buffer of the image
     * @returns {Promise} - Promise that resolves when the image is loaded
     */
    loadImage(imageSource) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                // Cover the canvas with the image (preserving aspect ratio)
                const imgRatio = img.width / img.height;
                const canvasRatio = this.width / this.height;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (imgRatio > canvasRatio) {
                    // Image is wider than canvas ratio
                    drawHeight = this.height;
                    drawWidth = drawHeight * imgRatio;
                    offsetX = (this.width - drawWidth) / 2;
                    offsetY = 0;
                } else {
                    // Image is taller than canvas ratio
                    drawWidth = this.width;
                    drawHeight = drawWidth / imgRatio;
                    offsetX = 0;
                    offsetY = (this.height - drawHeight) / 2;
                }

                this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                resolve();
            };

            img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));

            // Handle different types of image sources
            if (Buffer.isBuffer(imageSource)) {
                // Handle buffer input
                img.src = imageSource;
            } else if (typeof imageSource === 'string') {
                if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
                    // Handle URL
                    img.src = imageSource;
                } else {
                    // Handle local file path
                    try {
                        const data = fs.readFileSync(imageSource);
                        img.src = data;
                    } catch (err) {
                        reject(new Error(`Failed to load image file: ${err.message}`));
                    }
                }
            } else {
                reject(new Error('Invalid image source type. Must be a buffer, file path, or URL.'));
            }
        });
    }

    /**
     * Adds text to the image with a background box
     * @param {string} text - Text to add to the image
     * @param {Object} options - Text options
     * @param {string} options.color - Text color (default: 'white')
     * @param {string} options.backgroundColor - Background color (default: 'rgba(0, 0, 0, 0.7)')
     * @param {string} options.font - Font style (default: 'bold 50px Arial')
     * @param {number} options.fontSize - Font size in pixels (default: extracted from font string or 50)
     * @param {number} options.padding - Padding around text (default: 20)
     * @param {number} options.maxWidth - Maximum width for text (default: 80% of canvas width)
     * @param {string} options.align - Text alignment (default: 'center')
     * @param {number} options.minHeight - Minimum height for the background box (default: 0)
     * @param {number} options.verticalOffset - Vertical offset from center (default: 0, positive moves down)
     * @param {string} options.textShadow - Text shadow (default: 'none', format: 'offsetX offsetY blur color')
     */
    addText(text, options = {}) {
        const {
            color = 'white',
            backgroundColor = 'rgba(0, 0, 0, 0.7)',
            font = 'bold 50px Arial',
            fontSize = parseInt(font.match(/\d+/)?.[0] || 50),
            padding = 20,
            maxWidth = this.width * 0.8,
            align = 'center',
            minHeight = 0,
            verticalOffset = 0,
            textShadow = 'none'
        } = options;

        // Create modified font with provided fontSize if it was explicitly provided
        let finalFont = font;
        if (options.fontSize) {
            finalFont = font.replace(/\d+px/, `${fontSize}px`);
        }

        this.ctx.font = finalFont;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = 'middle';

        // Wrap text if needed
        const lines = this.wrapText(text, maxWidth);
        const lineHeight = fontSize * 1.2; // Approximate line height based on font size

        // Calculate text block dimensions
        const textBlockHeight = Math.max(lines.length * lineHeight, minHeight);
        const textBlockWidth = maxWidth + (padding * 2);

        // Draw background box in the center "safe zone" (with vertical offset)
        const boxX = (this.width - textBlockWidth) / 2;
        const boxY = (this.height - textBlockHeight) / 2 - (padding / 2) + verticalOffset;

        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(boxX, boxY, textBlockWidth, textBlockHeight + padding);

        // Configure text shadow if provided
        if (textShadow !== 'none') {
            const [offsetX, offsetY, blur, shadowColor] = textShadow.split(' ');
            this.ctx.shadowOffsetX = parseFloat(offsetX) || 0;
            this.ctx.shadowOffsetY = parseFloat(offsetY) || 0;
            this.ctx.shadowBlur = parseFloat(blur) || 0;
            this.ctx.shadowColor = shadowColor || 'rgba(0, 0, 0, 0.5)';
        }

        // Draw text
        this.ctx.fillStyle = color;
        lines.forEach((line, index) => {
            const y = boxY + (index * lineHeight) + lineHeight / 2 + padding / 2;
            this.ctx.fillText(line, this.width / 2, y);
        });

        // Reset shadow
        if (textShadow !== 'none') {
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = 'transparent';
        }
    }

    /**
     * Wraps text to fit within a maximum width
     * @param {string} text - Text to wrap
     * @param {number} maxWidth - Maximum width for text
     * @returns {Array} - Array of wrapped text lines
     */
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.ctx.measureText(currentLine + ' ' + word).width;

            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        lines.push(currentLine);
        return lines;
    }

    /**
     * Saves the resulting image to a file
     * @param {string} outputPath - Path to save the output image
     * @returns {Promise} - Promise that resolves when the image is saved
     */
    saveToFile(outputPath) {
        return new Promise((resolve, reject) => {
            try {
                // Ensure directory exists
                const dir = path.dirname(outputPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                // Create write stream
                const out = fs.createWriteStream(outputPath);
                let stream;

                // Determine file type based on extension
                if (outputPath.toLowerCase().endsWith('.png')) {
                    stream = this.canvas.createPNGStream();
                } else {
                    // Default to JPEG
                    stream = this.canvas.createJPEGStream({ quality: 0.9 });
                }

                // Pipe the image data to the file
                stream.pipe(out);
                out.on('finish', () => resolve(outputPath));
                out.on('error', reject);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Gets the buffer of the resulting image
     * @param {string} type - Image type (default: 'image/jpeg')
     * @param {Object} options - Options for image creation (quality for JPEG, etc.)
     * @returns {Promise<Buffer>} - Promise that resolves with the image buffer
     */
    toBuffer(type = 'image/jpeg', options = { quality: 0.9 }) {
        return new Promise((resolve, reject) => {
            try {
                let stream;
                if (type === 'image/png') {
                    stream = this.canvas.createPNGStream();
                } else {
                    stream = this.canvas.createJPEGStream({ quality: options.quality || 0.9 });
                }

                const chunks = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = PutTextService;
