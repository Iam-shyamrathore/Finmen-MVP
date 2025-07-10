const express = require('express');
const router = express.Router();

// Placeholder route for leaderboard data
router.get('/', (req, res) => {
  res.json([
    { rank: 1, userName: 'User1', healCoins: 100 },
    { rank: 2, userName: 'User2', healCoins: 75 },
  ]);
});

module.exports = router;