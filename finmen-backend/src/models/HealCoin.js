const mongoose = require('mongoose');

const healCoinSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  balance: { type: Number, default: 0, min: 0 },
  xp: { type: Number, default: 0 },
  badges: [{ type: String, default: [] }],
  streak: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  redemptionHistory: [{
    item: String,
    amount: Number,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('HealCoin', healCoinSchema);