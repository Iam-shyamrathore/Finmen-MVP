const express = require('express');
const router = express.Router();
const HealCoin = require('../models/HealCoin');
const auth = require('../middleware/auth');

// Get HealCoin balance and stats
router.get('/balance', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let healCoin = await HealCoin.findOne({ userId });
    if (!healCoin) {
      healCoin = new HealCoin({ userId, balance: 0 });
      await healCoin.save();
    }
    res.json({
      healCoins: healCoin.balance,
      xp: healCoin.xp,
      badges: healCoin.badges,
      streak: healCoin.streak,
      msg: 'HealCoin stats retrieved'
    });
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Earn HealCoins, XP, and update streak
router.post('/earn', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let healCoin = await HealCoin.findOne({ userId });
    if (!healCoin) {
      healCoin = new HealCoin({ userId, balance: 0 });
    }
    healCoin.balance += 10;
    healCoin.xp += 50;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (healCoin.lastActivity.toDateString() === today.toDateString()) {
      healCoin.streak += 1;
    } else {
      healCoin.streak = 1;
    }
    healCoin.lastActivity = today;
    if (healCoin.streak % 7 === 0 && !healCoin.badges.includes('StreakMaster')) {
      healCoin.badges.push('StreakMaster');
    }
    await healCoin.save();
    res.json({
      healCoinsEarned: 10,
      xpEarned: 50,
      newBalance: healCoin.balance,
      streak: healCoin.streak,
      badges: healCoin.badges,
      msg: 'Rewards earned successfully'
    });
  } catch (err) {
    console.error('Error earning rewards:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Redeem HealCoins
router.post('/redeem', auth, async (req, res) => {
  try {
    const { item, amount } = req.body;
    const userId = req.user.id;
    const healCoin = await HealCoin.findOne({ userId });
    if (!healCoin || healCoin.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient HealCoins' });
    }
    healCoin.balance -= amount;
    healCoin.redemptionHistory.push({ item, amount });
    await healCoin.save();
    res.json({
      newBalance: healCoin.balance,
      msg: `Redeemed ${amount} HealCoins for ${item}`
    });
  } catch (err) {
    console.error('Error redeeming HealCoins:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;