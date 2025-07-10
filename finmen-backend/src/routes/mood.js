const express = require('express');
const { logMood, getMoods, getMoodStats, deleteMood } = require('../controllers/moodController');

const router = express.Router();

// @route   POST /api/mood
// @desc    Log a new mood entry
// @access  Private
router.post('/', logMood);

// @route   GET /api/mood
// @desc    Get user's mood history
// @access  Private
router.get('/', getMoods);

// @route   GET /api/mood/stats
// @desc    Get mood statistics
// @access  Private
router.get('/stats', getMoodStats);

// @route   DELETE /api/mood/:moodId
// @desc    Delete a mood entry
// @access  Private
router.delete('/:moodId', deleteMood);

module.exports = router;