import express from 'express';
import client from '../lib/anthropic.js';
import { buildAnalysisPrompt, parseAnalysisResponse } from '../lib/prompts.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { jobDescription, resumeText, coverLetterText } = req.body;

  if (!jobDescription || jobDescription.trim().length < 50) {
    return res.status(400).json({
      error: 'Job description is required and must be at least 50 characters'
    });
  }
  if (!resumeText || resumeText.trim().length < 100) {
    return res.status(400).json({
      error: 'Resume text is required and must be at least 100 characters'
    });
  }

  try {
    const { systemPrompt, userPrompt } = buildAnalysisPrompt({
      jobDescription,
      resumeText,
      coverLetterText,
    });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ],
    });

    const responseText = message.content[0].text;
    const parsed = parseAnalysisResponse(responseText);

    res.json({
      success: true,
      bulletPoints: parsed.bulletPoints,
      revisedResume: parsed.revisedResume,
      revisedCoverLetter: parsed.revisedCoverLetter,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      }
    });

  } catch (err) {
    console.error('Anthropic API error:', err);

    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid Anthropic API key' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    }

    res.status(500).json({ error: 'Failed to analyze resume', details: err.message });
  }
});

export default router;
