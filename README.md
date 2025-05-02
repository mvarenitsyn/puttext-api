# PutText API

A RESTful API service for adding text to images with customizable backgrounds, designed specifically for creating social media content such as Instagram covers with a 9:16 ratio.

## Features

- Add text with customizable background to images
- Support for both URL-based and direct image uploads
- Customizable text appearance (color, font, size, alignment)
- Customizable background box (color, transparency)
- Image output in JPEG or PNG format
- Ready for deployment to Railway

## API Endpoints

### Root Endpoint
- **GET /** - Returns API information and available endpoints

### Add Text to Images
- **POST /api/puttext/url** - Add text to an image from a URL
- **POST /api/puttext/upload** - Add text to an uploaded image file

## API Usage Examples

### Adding Text to an Image from URL

**Request:**
```http
POST /api/puttext/url
Content-Type: application/json

{
  "imageUrl": "https://example.com/image.jpg",
  "text": "Your Awesome Caption",
  "options": {
    "color": "#ffffff",
    "backgroundColor": "rgba(0, 0, 0, 0.7)",
    "font": "bold 60px Arial",
    "padding": 30,
    "verticalOffset": 0
  },
  "outputFormat": "jpeg"
}
```

**Response:** The processed image with the text added

### Adding Text to an Uploaded Image

**Request:**
```http
POST /api/puttext/upload
Content-Type: multipart/form-data

Form fields:
- image: [image file upload]
- text: "Your Awesome Caption"
- options: {"color":"#ffffff","backgroundColor":"rgba(0,0,0,0.7)","font":"bold 60px Arial","padding":30}
- outputFormat: "jpeg"
```

**Response:** The processed image with the text added

## Options

The API supports the following customization options:

| Parameter       | Type   | Description                                                   | Default        |
|-----------------|--------|---------------------------------------------------------------|----------------|
| width           | number | Canvas width                                                  | 1080           |
| height          | number | Canvas height                                                 | 1920           |
| color           | string | Text color                                                    | 'white'        |
| backgroundColor | string | Background color                                              | 'rgba(0,0,0,0.7)' |
| font            | string | Font style                                                    | 'bold 50px Arial' |
| fontSize        | number | Font size in pixels                                           | 50             |
| padding         | number | Padding around text                                           | 20             |
| maxWidth        | number | Maximum width for text                                        | 80% of canvas  |
| align           | string | Text alignment (left, center, right)                          | 'center'       |
| minHeight       | number | Minimum height for background box                             | 0              |
| verticalOffset  | number | Vertical offset from center (positive moves down)             | 0              |
| textShadow      | string | Text shadow (format: 'offsetX offsetY blur color')            | 'none'         |

## Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/puttext-api.git
   cd puttext-api
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory (optional)
   ```
   PORT=3000
   ```

4. Start the server
   ```
   npm run dev
   ```

## Deployment to Railway

This project is ready to be deployed to Railway using Docker. Here's how:

1. The repository already includes a Dockerfile that handles all necessary dependencies
2. Create a new Railway project
3. Connect your GitHub repository
4. Select "Deploy from Dockerfile" during setup
5. Railway will build and deploy the Docker container
6. Add any necessary environment variables in the Railway dashboard

> **Note:** We use Docker for deployment because the canvas package requires specific system dependencies (like Cairo graphics library) that may not be available in all environments.

## Development

- `npm run start` - Start the server
- `npm run dev` - Start the server with nodemon for development

## License

MIT