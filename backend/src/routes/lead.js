import express from 'express';
import Lead from '../models/Lead.js';

const router = express.Router();

/**
 * @route POST /api/leads
 * @desc Create new lead
 * @access Public (for widget)
 */
router.post('/', async (req, res) => {
	try {
		const { agentId, contactInfo, customFields, conversationHistory } =
			req.body;

		if (!agentId || !contactInfo) {
			return res.status(400).json({
				success: false,
				error: 'AgentId and contactInfo are required',
			});
		}

		const lead = new Lead({
			agentId,
			contactInfo,
			customFields: customFields || [],
			conversationHistory: conversationHistory || [],
			source: 'widget',
		});

		await lead.save();

		res.status(201).json({
			success: true,
			lead: {
				id: lead._id,
				contactInfo: lead.contactInfo,
				status: lead.status,
				createdAt: lead.createdAt,
			},
		});
	} catch (error) {
		console.error('Error creating lead:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to create lead',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route GET /api/leads
 * @desc Get leads for an agent
 * @access Private
 */
router.get('/', async (req, res) => {
	try {
		const { agentId, status, page = 1, limit = 20 } = req.query;

		if (!agentId) {
			return res.status(400).json({
				success: false,
				error: 'AgentId is required',
			});
		}

		const query = { agentId };
		if (status) {
			query.status = status;
		}

		const leads = await Lead.find(query)
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.populate('agentId', 'name');

		const total = await Lead.countDocuments(query);

		res.json({
			success: true,
			leads,
			pagination: {
				current: parseInt(page),
				pages: Math.ceil(total / limit),
				total,
			},
		});
	} catch (error) {
		console.error('Error fetching leads:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch leads',
		});
	}
});

/**
 * @route GET /api/leads/:leadId
 * @desc Get specific lead
 * @access Private
 */
router.get('/:leadId', async (req, res) => {
	try {
		const { leadId } = req.params;

		const lead = await Lead.findById(leadId).populate('agentId', 'name');

		if (!lead) {
			return res.status(404).json({
				success: false,
				error: 'Lead not found',
			});
		}

		res.json({
			success: true,
			lead,
		});
	} catch (error) {
		console.error('Error fetching lead:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch lead',
		});
	}
});

/**
 * @route PUT /api/leads/:leadId
 * @desc Update lead
 * @access Private
 */
router.put('/:leadId', async (req, res) => {
	try {
		const { leadId } = req.params;
		const updateData = req.body;

		const lead = await Lead.findByIdAndUpdate(leadId, updateData, {
			new: true,
			runValidators: true,
		});

		if (!lead) {
			return res.status(404).json({
				success: false,
				error: 'Lead not found',
			});
		}

		res.json({
			success: true,
			lead,
		});
	} catch (error) {
		console.error('Error updating lead:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to update lead',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route POST /api/leads/:leadId/conversation
 * @desc Add conversation message to lead
 * @access Public (for widget)
 */
router.post('/:leadId/conversation', async (req, res) => {
	try {
		const { leadId } = req.params;
		const { message, sender, intent } = req.body;

		if (!message || !sender) {
			return res.status(400).json({
				success: false,
				error: 'Message and sender are required',
			});
		}

		const lead = await Lead.findById(leadId);

		if (!lead) {
			return res.status(404).json({
				success: false,
				error: 'Lead not found',
			});
		}

		lead.conversationHistory.push({
			message,
			sender,
			intent: intent || 'unknown',
		});

		lead.lastContact = new Date();
		await lead.save();

		res.json({
			success: true,
			message: 'Conversation added successfully',
		});
	} catch (error) {
		console.error('Error adding conversation:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to add conversation',
		});
	}
});

export default router;
