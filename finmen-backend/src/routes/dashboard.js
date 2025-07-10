const express = require('express');
const router = express.Router();

// Placeholder route for user dashboard data
router.get('/user', (req, res) => {
  res.json({
    moodStats: [{ _id: 'neutral', count: 5 }],
    missionsCompleted: 2,
    healCoinBalance: 50,
  });
});

module.exports = router;