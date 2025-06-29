const express = require('express');
const { createMission, getMissions } = require('../controllers/missionController');

const router = express.Router();

router.post('/', createMission);
router.get('/', getMissions); // Changed from '/:userId' to '/' with auth

module.exports = router;