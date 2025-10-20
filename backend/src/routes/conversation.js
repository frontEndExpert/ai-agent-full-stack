import express from 'express';
import {
	generateResponse,
	detectIntent,
} from '../services/conversationService.js';
import { generateTTS } from '../services/ttsService.js';

const router = express.Router();

/**
 * @route POST /api/conversation/chat
 * @desc Send message to AI agent and get response
 * @access Public
 */
router.post('/chat', async (req, res) => {
	try {
		const { message, agentId, conversationHistory = [], userId } = req.body;

		if (!message || !agentId) {
			return res.status(400).json({
				success: false,
				error: 'Message and agentId are required',
			});
		}

		// Detect user intent
		const intent = await detectIntent(message, agentId);

		// Generate AI response
		const response = await generateResponse({
			message,
			agentId,
			conversationHistory,
			intent,
			userId,
		});

		res.json({
			success: true,
			response: response.text,
			intent: intent,
			actions: response.actions || [],
			conversationId: response.conversationId,
		});
	} catch (error) {
		console.error('Error in conversation:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to process conversation',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route POST /api/conversation/speak
 * @desc Generate TTS audio for text
 * @access Public
 */
router.post('/speak', async (req, res) => {
	try {
		const { text, agentId, language = 'he' } = req.body;

		if (!text) {
			return res.status(400).json({
				success: false,
				error: 'Text is required for TTS',
			});
		}

		const audioResult = await generateTTS({
			text,
			agentId,
			language,
		});

		res.json({
			success: true,
			audioUrl: audioResult.audioUrl,
			duration: audioResult.duration,
		});
	} catch (error) {
		console.error('Error generating TTS:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to generate TTS audio',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route POST /api/conversation/intent
 * @desc Detect user intent from message
 * @access Public
 */
router.post('/intent', async (req, res) => {
	try {
		const { message, agentId } = req.body;

		if (!message || !agentId) {
			return res.status(400).json({
				success: false,
				error: 'Message and agentId are required',
			});
		}

		const intent = await detectIntent(message, agentId);

		res.json({
			success: true,
			intent: intent,
		});
	} catch (error) {
		console.error('Error detecting intent:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to detect intent',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

export default router;
