require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Cloudinary Config ──
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Middleware ──
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Force pre-flight OPTIONS to return 200
app.options('*', cors());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// API-only mode (frontend is on GitHub Pages)
// Removed static file serving to avoid path issues on Railway

// ── Root Route ──
app.get('/', (req, res) => {
  res.send('🎂 Rita\'s Birthday API is Online! Use /api/health to check status.');
});

// ── Upload Endpoint ──
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const uploader = req.body.uploader || 'A Friend';
    const caption = req.body.caption || '';
    const style = req.body.style || 'polaroid';

    const uploadPromises = req.files.map((file) => {
      return new Promise((resolve, reject) => {
        const isVideo = file.mimetype.startsWith('video');
        const resourceType = isVideo ? 'video' : 'image';

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ritas-birthday',
            resource_type: resourceType,
            transformation: isVideo
              ? [{ quality: 'auto', fetch_format: 'mp4' }]
              : [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
          },
          (error, result) => {
            if (error) reject(error);
            else
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                isVideo,
                width: result.width,
                height: result.height,
              });
          }
        );

        uploadStream.end(file.buffer);
      });
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      files: results,
      uploader,
      caption,
      style,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', message: err.message });
  }
});

// ── Upload Song Endpoint ──
app.post('/api/upload-song', upload.single('song'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No song file provided' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ritas-birthday/songs',
          resource_type: 'video', // Cloudinary treats audio as video
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    console.error('Song upload error:', err);
    res.status(500).json({ error: 'Song upload failed', message: err.message });
  }
});

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      node_version: process.version,
      port: PORT
    }
  });
});

// ── Start Server ──
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎂 Rita's Birthday Server running on port ${PORT}`);
  console.log(`   Internal bind: 0.0.0.0:${PORT}`);
  console.log(`   Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
