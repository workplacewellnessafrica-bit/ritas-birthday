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
  origin: '*', // Allows all origins, including GitHub Pages
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Serve the frontend from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// Multer — memory storage for Cloudinary streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|avi|heic/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only images and videos are allowed'));
  },
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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`🎂 Rita's Birthday Server running on port ${PORT}`);
  console.log(`   Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
