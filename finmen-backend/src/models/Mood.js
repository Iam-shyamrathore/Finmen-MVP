const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true, enum: ['😊', '😌', '😐', '😔', '😡', '😴'] }, // Match UI emojis
  note: { type: String, default: '' }, // Optional note
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mood', moodSchema);