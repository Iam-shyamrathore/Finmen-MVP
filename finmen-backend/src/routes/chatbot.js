const express = require('express');
const router = express.Router();

// Placeholder route for chatbot response
router.post('/message', (req, res) => {
  const { message } = req.body;
  res.json({ reply: `Echo: ${message}`, intent: 'greeting' });
});

module.exports = router;