const express = require('express');
const router = express.Router();
const { extractSkills, matchScore } = require('../controllers/ai.controller');

// POST /api/ai/skills/extract — public (rate-limited globally on /api).
router.post('/skills/extract', extractSkills);

// POST /api/ai/match — semantic CV-to-jobs scoring; public.
router.post('/match', matchScore);

module.exports = router;
