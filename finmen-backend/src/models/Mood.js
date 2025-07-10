const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true, enum: ['😊', '😌', '😐', '😔', '😡', '😴'] }, // Match UI emojis
  mood: { type: String, required: true, enum: ['happy', 'calm', 'neutral', 'sad', 'angry', 'tired'] }, // Store mood label
  note: { type: String, default: '' }, // Optional short note
  journal: { type: String, default: '' }, // Optional journal entry
  timestamp: { type: Date, default: Date.now },
});

// Add index for better query performance
moodSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Mood', moodSchema);