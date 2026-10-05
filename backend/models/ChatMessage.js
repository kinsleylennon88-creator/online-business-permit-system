const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['public', 'user', 'admin', 'superadmin'],
    default: 'user'
  },
  message: {
    type: String,
    required: true,
    maxlength: 4000
  },
  reply: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'ai'],
    default: 'text'
  },
  room: {
    type: String,
    default: 'general'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
chatMessageSchema.index({ createdAt: -1 });
chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ userId: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
