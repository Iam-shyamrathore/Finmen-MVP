const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  progress: { type: Number, default: 0 },
  target: { type: String, required: true },
  current: { type: String, default: '0' },
  category: { type: String, enum: ['Saving', 'Budgeting', 'Debt Payoff'], required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  tasks: [{ task: String, completed: { type: Boolean, default: false } }],
  reward: { type: String, required: true },
  timeLeft: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mission', missionSchema);