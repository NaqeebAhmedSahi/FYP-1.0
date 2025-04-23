import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import uiRoute from './ui/ui.route';
import pageRoute from './page/page.route';
import assetRoute from './assets/assets.route';
import projectRoute from './project/project.route';
import renderHtml from './render/render.controller';
import bodyParser from 'body-parser';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import templateRoutes from './routes/template.js';
import pageRoutes from './routes/page.js';
import grapejs from './routes/grapes.js';
import homeEditor from './routes/homeEditor.js';
import history from './routes/history.js';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { JWT_SECRET } from './config.js';


// const path = require('path');
const __filename = __filename;
const __dirname = __dirname;

// Initialize App
const app = express();

// Image Schema and Model
const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
  url: String,
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'x-requested-with',
    'X-Requested-With'
  ],
  credentials: true,
  maxAge: 86400,
  exposedHeaders: ['Content-Disposition']
}));

app.options('*', cors());

// Session Configuration
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Static Files
app.use('/resources', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// MongoDB Connection
const mongoUri = 'mongodb://127.0.0.1:27017/webpage_builder';
mongoose.connect(
  mongoUri,
  {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Multer Configuration
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (JPEG, PNG, GIF) are allowed'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use('/uploads', express.static(uploadsDir));

// Image Upload Routes
app.post('/api/images/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newImage = new Image({
      filename: req.file.filename,
      path: req.file.path,
      url: imageUrl
    });

    await newImage.save();

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: newImage
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

app.get('/api/images', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single image
app.get('/api/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update image (replace existing)
app.put('/api/images/:id', upload.single('image'), async (req, res) => {
  try {
    const existingImage = await Image.findById(req.params.id);
    if (!existingImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete old file
    if (fs.existsSync(existingImage.path)) {
      fs.unlinkSync(existingImage.path);
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      {
        filename: req.file.filename,
        path: req.file.path,
        url: imageUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({
      message: 'Image updated successfully',
      image: updatedImage
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete image
app.delete('/api/images/:id', async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Other Routes
app.use('/api/projects', projectRoute);
app.use('/api/pages', pageRoute);
app.use('/api/assets', assetRoute);
app.use('/api/', uiRoute);
app.get('/:pageId?', renderHtml);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/page', pageRoutes); 
app.use('/api/status', grapejs); 
app.use('/api/home', homeEditor); 
app.use('/api/history', history);

// Start Server
const PORT = process.env.APP_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});