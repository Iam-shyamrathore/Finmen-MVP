const Mission = require('../models/Mission');
const auth = require('../middleware/auth');

exports.createMission = [
  auth,
  async (req, res) => {
    const { title, description, progress, target, current, category, difficulty, tasks, reward, timeLeft } = req.body;
    const userId = req.user.id;
    try {
      const mission = new Mission({ userId, title, description, progress, target, current, category, difficulty, tasks, reward, timeLeft });
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