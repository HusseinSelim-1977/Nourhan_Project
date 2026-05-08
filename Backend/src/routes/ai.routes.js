const express = require('express');
const router = express.Router();
const { extractSkills } = require('../controllers/ai.controller');

// POST /api/ai/skills/extract — public (rate-limited globally on /api).
// Wired here as part of the AI surface so the frontend can run live skill
// extraction from the Seeker dashboard without requiring a logged-in user.
router.post('/skills/extract', extractSkills);

module.exports = router;
