const mongoose = require('mongoose');
const { Schema } = mongoose;

const WorkspaceSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: 100
  },
  icon: {
    type: String,
    default: '🏠'
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  coverColor: {
    type: String,
    default: '#5E6AD2'
  }
}, { timestamps: true });

module.exports = mongoose.model('workspace', WorkspaceSchema);
