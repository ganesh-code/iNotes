const mongoose = require('mongoose');
const { Schema } = mongoose;

const PageSchema = new Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'workspace',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'page',
    default: null
  },
  title: {
    type: String,
    default: 'Untitled',
    maxlength: 500
  },
  icon: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  coverColor: {
    type: String,
    default: ''
  },
  content: {
    // Stores JSON from TipTap editor
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  isTrashed: {
    type: Boolean,
    default: false
  },
  trashedAt: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  // For quick listing without fetching full content
  excerpt: {
    type: String,
    default: '',
    maxlength: 300
  }
}, { timestamps: true });

// Text index for search
PageSchema.index({ title: 'text', excerpt: 'text' });

module.exports = mongoose.model('page', PageSchema);
