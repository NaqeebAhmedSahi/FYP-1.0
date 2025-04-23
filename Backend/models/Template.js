import mongoose from 'mongoose';
import path from 'path';

const contentSchema = new mongoose.Schema({
  htmlFileName: {
    type: String,
    required: true,
    trim: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  cssFileName: {
    type: String,
    trim: true
  },
  cssContent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['ecommerce', 'blog', 'portfolio'],
    required: true,
    default: 'ecommerce'
  },
  imageUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  content: {
    type: Map,
    of: contentSchema,
    default: {}
  }
}, {
  timestamps: true
});

// Middleware to update timestamps
contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Website = mongoose.model('Website', websiteSchema);
export default Website;