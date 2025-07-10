const Mission = require('../models/Mission');
const HealCoin = require('../models/HealCoin');
const auth = require('../middleware/auth');

exports.createMission = [
  auth,
  async (req, res) => {
    const { title, description, target, current, category, difficulty, tasks, reward, timeLeft } = req.body;
    const userId = req.user.id;
    try {
      const mission = new Mission({ userId, title, description, target, current, category, difficulty, tasks, reward, timeLeft });
      await mission.save();
      res.status(201).json(mission);
    } catch (err) {
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];

exports.getMissions = [
  auth,
  async (req, res) => {
    const userId = req.user.id;
    try {
      const missions = await Mission.find({ userId }).sort({ createdAt: -1 });
      res.json(missions);
    } catch (err) {
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];

exports.completeMission = [
  auth,
  async (req, res) => {
    const { missionId } = req.body;
    const userId = req.user.id;
    try {
      const mission = await Mission.findOne({ _id: missionId, userId });
      if (!mission || mission.completed) {
        return res.status(400).json({ msg: 'Mission not found or already completed' });
      }
      mission.completed = true;
      mission.progress = 100;
      await mission.save();

      let healCoin = await HealCoin.findOne({ userId });
      if (!healCoin) {
        healCoin = new HealCoin({ userId, balance: 0 });
      }
      const reward = mission.reward;
      const xpReward = reward * 5; // 5 XP per HealCoin
      healCoin.balance += reward;
      healCoin.xp += xpReward;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (healCoin.lastActivity.toDateString() === today.toDateString()) {
        healCoin.streak += 1;
      } else {
        healCoin.streak = 1;
      }
      healCoin.lastActivity = today;
      if (healCoin.streak % 7 === 0 && !healCoin.badges.includes('MissionMaster')) {
        healCoin.badges.push('MissionMaster');
      }
      await healCoin.save();

      res.json({
        msg: 'Mission completed',
        reward: { healCoins: reward, xp: xpReward, badges: healCoin.badges, streak: healCoin.streak }
      });
    } catch (err) {
      console.error('Error completing mission:', err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  },
];