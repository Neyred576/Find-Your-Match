import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// JSON metadata file path
const metadataFile = path.join(process.cwd(), 'uploads', 'videos.json');

// Helper: read metadata
function readMetadata(): any[] {
  if (!fs.existsSync(metadataFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
  } catch {
    return [];
  }
}

// Helper: write metadata
function writeMetadata(data: any[]) {
  fs.writeFileSync(metadataFile, JSON.stringify(data, null, 2));
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Not a video file. Please upload only videos.'));
    }
  }
});

// GET /api/videos - List all videos
router.get('/', (req, res) => {
  try {
    const videos = readMetadata().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/videos - Upload a new video or embed a link
router.post('/', upload.single('video'), (req, res) => {
  try {
    const { title, description, externalUrl } = req.body;

    if (!req.file && !externalUrl) {
      return res.status(400).json({ message: 'Provide either a video file or an external URL' });
    }

    const isExternal = !!externalUrl;
    const videoUrl = isExternal ? externalUrl : `/uploads/videos/${req.file?.filename}`;

    const newVideo = {
      _id: Date.now().toString(),
      title: title || 'Untitled Video',
      description: description || '',
      url: videoUrl,
      isExternal,
      filename: req.file?.filename || null,
      mimetype: req.file?.mimetype || 'external/link',
      size: req.file?.size || 0,
      createdAt: new Date().toISOString()
    };

    const videos = readMetadata();
    videos.push(newVideo);
    writeMetadata(videos);

    res.status(201).json(newVideo);
  } catch (error: any) {
    console.error('Error uploading video:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// DELETE /api/videos/:id - Delete a video
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const videos = readMetadata();
    const videoIndex = videos.findIndex(v => v._id === id);

    if (videoIndex === -1) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const video = videos[videoIndex];

    // Delete the physical file
    const filePath = path.join(uploadDir, video.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    videos.splice(videoIndex, 1);
    writeMetadata(videos);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
