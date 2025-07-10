const express = require('express');
const { createMission, getMissions, completeMission } = require('../controllers/missionController');

const router = express.Router();

router.post('/', createMission);
router.get('/', getMissions);
router.post('/complete', completeMission);

module.exports = router;