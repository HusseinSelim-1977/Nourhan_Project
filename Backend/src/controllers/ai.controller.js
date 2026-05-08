const { extractSkillsFromText } = require('../services/skill-extraction.service');
const { success, error } = require('../utils/apiResponse');

const MAX_INPUT_CHARS = 8000;

// POST /api/ai/skills/extract
// Body: { text: string }
// Returns: { skills: string[], source: 'huggingface' | 'heuristic' | 'empty', model?: string }
exports.extractSkills = async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    if (!text.trim()) {
      return error(res, 'Field "text" is required and must be a non-empty string', 400);
    }
    const trimmed = text.slice(0, MAX_INPUT_CHARS);
    const result = await extractSkillsFromText(trimmed);
    return success(res, result);
  } catch (err) {
    return error(res, err.message || 'Failed to extract skills', err.status || 500);
  }
};
