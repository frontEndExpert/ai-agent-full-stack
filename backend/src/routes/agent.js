import express from 'express';
import Agent from '../models/Agent.js';
import {
	uploadKnowledgeBase,
	deleteKnowledgeBase,
} from '../services/knowledgeService.js';

const router = express.Router();

/**
 * @route GET /api/agents
 * @desc Get all agents for a user
 * @access Private (would need auth middleware)
 */
router.get('/', async (req, res) => {
	try {
		// In a real app, this would use req.user.id from auth middleware
		const userId = req.query.userId || 'default-user';

		const agents = await Agent.find({
			createdBy: userId,
			isActive: true,
		}).select('-knowledgeBase.vectorCollectionId');

		res.json({
			success: true,
			agents,
		});
	} catch (error) {
		console.error('Error fetching agents:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch agents',
		});
	}
});

/**
 * @route GET /api/agents/:agentId
 * @desc Get specific agent by ID
 * @access Public (for widget access)
 */
router.get('/:agentId', async (req, res) => {
	try {
		const { agentId } = req.params;

		const agent = await Agent.findById(agentId).select(
			'-knowledgeBase.vectorCollectionId'
		);

		if (!agent) {
			return res.status(404).json({
				success: false,
				error: 'Agent not found',
			});
		}

		res.json({
			success: true,
			agent,
		});
	} catch (error) {
		console.error('Error fetching agent:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch agent',
		});
	}
});

/**
 * @route POST /api/agents
 * @desc Create new agent
 * @access Private
 */
router.post('/', async (req, res) => {
	try {
		console.log('Creating agent with data:', req.body);

		// Create minimal agent data to avoid any external service calls
		const agentData = {
			name: req.body.name || 'Untitled Agent',
			description: req.body.description || '',
			createdBy: 'default-user',
		};

		console.log('Agent data to save:', agentData);

		// Validate the data before saving
		if (!agentData.name) {
			return res.status(400).json({
				success: false,
				error: 'Agent name is required',
			});
		}

		const agent = new Agent(agentData);
		await agent.save();

		console.log('Agent saved successfully:', agent._id);

		res.status(201).json({
			success: true,
			agent,
		});
	} catch (error) {
		console.error('Error creating agent:', error);
		console.error('Error details:', error.message);
		console.error('Error stack:', error.stack);

		res.status(500).json({
			success: false,
			error: 'Failed to create agent',
			details: error.message,
		});
	}
});

/**
 * @route PUT /api/agents/:agentId
 * @desc Update agent
 * @access Private
 */
router.put('/:agentId', async (req, res) => {
	try {
		const { agentId } = req.params;
		const updateData = req.body;

		const agent = await Agent.findByIdAndUpdate(agentId, updateData, {
			new: true,
			runValidators: true,
		});

		if (!agent) {
			return res.status(404).json({
				success: false,
				error: 'Agent not found',
			});
		}

		res.json({
			success: true,
			agent,
		});
	} catch (error) {
		console.error('Error updating agent:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to update agent',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route DELETE /api/agents/:agentId
 * @desc Delete agent (soft delete)
 * @access Private
 */
router.delete('/:agentId', async (req, res) => {
	try {
		const { agentId } = req.params;

		const agent = await Agent.findByIdAndUpdate(
			agentId,
			{ isActive: false },
			{ new: true }
		);

		if (!agent) {
			return res.status(404).json({
				success: false,
				error: 'Agent not found',
			});
		}

		res.json({
			success: true,
			message: 'Agent deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting agent:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to delete agent',
		});
	}
});

/**
 * @route POST /api/agents/:agentId/knowledge
 * @desc Upload knowledge base documents
 * @access Private
 */
router.post('/:agentId/knowledge', async (req, res) => {
	try {
		const { agentId } = req.params;
		const { documents } = req.body;

		const result = await uploadKnowledgeBase(agentId, documents);

		res.json({
			success: true,
			message: 'Knowledge base updated successfully',
			...result,
		});
	} catch (error) {
		console.error('Error uploading knowledge base:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to upload knowledge base',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route DELETE /api/agents/:agentId/knowledge
 * @desc Clear knowledge base
 * @access Private
 */
router.delete('/:agentId/knowledge', async (req, res) => {
	try {
		const { agentId } = req.params;

		await deleteKnowledgeBase(agentId);

		res.json({
			success: true,
			message: 'Knowledge base cleared successfully',
		});
	} catch (error) {
		console.error('Error clearing knowledge base:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to clear knowledge base',
		});
	}
});

export default router;
