const express = require('express');
const { logMood, getMoods } = require('../controllers/moodController');

const router = express.Router();

router.post('/', logMood);
router.get('/', getMoods); // Changed from '/:userId' to '/' with auth handling user context

module.exports = router;