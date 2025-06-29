const Mood = require('../models/Mood');
const auth = require('../middleware/auth');
exports.logMood = [
  auth,
  async (req, res) => {
    const { mood } = req.body;
    const userId = req.user.id;
    const emojiMap = { happy: '😊', calm: '😌', neutral: '😐', sad: '😔', angry: '😡', tired: '😴' };
    const emoji = emojiMap[mood.toLowerCase()] || '😐';
    try {
      const moodEntry = new Mood({ userId, emoji, note: req.body.note || '' });
      await moodEntry.save();
      res.status(201).json(moodEntry);
    } catch (err) {
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];

exports.getMoods = [
  auth,
  async (req, res) => {
    const userId = req.user.id;
    try {
      const moods = await Mood.find({ userId }).sort({ timestamp: -1 }).limit(7);
      res.json(moods);
    } catch (err) {
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];