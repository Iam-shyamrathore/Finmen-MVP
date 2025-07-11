const Mood = require('../models/Mood');
const auth = require('../middleware/auth');
const axios = require('axios');

// Emoji mapping for mood labels
const emojiMap = { 
  happy: '😊', 
  calm: '😌', 
  neutral: '😐', 
  sad: '😔', 
  angry: '😡', 
  tired: '😴' 
};

exports.logMood = [
  auth,
  async (req, res) => {
    try {
      const { mood, note = '', journal = '' } = req.body;
      const userId = req.user.id;
      
      // Validate mood
      if (!mood || !emojiMap[mood.toLowerCase()]) {
        return res.status(400).json({ 
          msg: 'Invalid mood. Must be one of: happy, calm, neutral, sad, angry, tired' 
        });
      }

      const moodLabel = mood.toLowerCase();
      const emoji = emojiMap[moodLabel];

      // Check if user already logged mood today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingMood = await Mood.findOne({
        userId,
        timestamp: { $gte: today, $lt: tomorrow }
      });

      if (existingMood) {
        // Update existing mood for today
        existingMood.mood = moodLabel;
        existingMood.emoji = emoji;
        existingMood.note = note;
        existingMood.journal = journal;
        existingMood.timestamp = new Date();
        
        await existingMood.save();
        // Award 10 HealCoins for update
        await axios.post('https://finmen-mvp.onrender.com/api/healcoin/earn', {}, {
          headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` }
        });

        return res.status(200).json({
          msg: 'Mood updated successfully',
          mood: existingMood
        });
      } else {
        // Create new mood entry
        const moodEntry = new Mood({ 
          userId, 
          mood: moodLabel,
          emoji, 
          note, 
          journal 
        });
        
        await moodEntry.save();
        // Award 10 HealCoins for new entry
        await axios.post('https://finmen-mvp.onrender.com/api/healcoin/earn', {}, {
          headers: { Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}` }
        });

        return res.status(201).json({
          msg: 'Mood logged successfully',
          mood: moodEntry
        });
      }
    } catch (err) {
      console.error('Error logging mood:', err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];

exports.getMoods = [
  auth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 7, days = 7 } = req.query;

      // Get moods from the last N days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));

      const moods = await Mood.find({ 
        userId,
        timestamp: { $gte: daysAgo }
      })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

      res.json(moods);
    } catch (err) {
      console.error('Error fetching moods:', err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];

exports.getMoodStats = [
  auth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { days = 30 } = req.query;

      // Get mood stats for the last N days
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));

      const moodStats = await Mood.aggregate([
        {
          $match: {
            userId: userId,
            timestamp: { $gte: daysAgo }
          }
        },
        {
          $group: {
            _id: '$mood',
            count: { $sum: 1 },
            emoji: { $first: '$emoji' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const totalMoods = moodStats.reduce((sum, stat) => sum + stat.count, 0);
      const statsWithPercentage = moodStats.map(stat => ({
        mood: stat._id,
        emoji: stat.emoji,
        count: stat.count,
        percentage: ((stat.count / totalMoods) * 100).toFixed(1)
      }));

      res.json({
        totalEntries: totalMoods,
        period: `${days} days`,
        stats: statsWithPercentage
      });
    } catch (err) {
      console.error('Error fetching mood stats:', err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];

exports.deleteMood = [
  auth,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { moodId } = req.params;

      const mood = await Mood.findOneAndDelete({
        _id: moodId,
        userId: userId
      });

      if (!mood) {
        return res.status(404).json({ msg: 'Mood entry not found' });
      }

      res.json({ msg: 'Mood entry deleted successfully' });
    } catch (err) {
      console.error('Error deleting mood:', err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];