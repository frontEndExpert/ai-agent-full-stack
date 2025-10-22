import express from 'express';
import Agent from '../models/Agent.js';

const router = express.Router();

/**
 * @route GET /api/test/db-write
 * @desc Test database write operations
 * @access Public
 */
router.get('/db-write', async (req, res) => {
	try {
		console.log('Testing database write operation...');

		// Create a test agent with minimal required fields
		const testAgent = new Agent({
			name: 'Test Agent ' + Date.now(),
			description: 'Test agent for database write verification',
			avatar: {
				baseAvatarId: 'avatar-001',
				avatarType: 'gallery',
			},
			personality: 'friendly',
			language: 'he',
			createdBy: 'test-user',
			isActive: true,
		});

		console.log('Attempting to save test agent...');
		await testAgent.save();
		console.log('Test agent saved successfully:', testAgent._id);

		// Try to read it back
		const retrievedAgent = await Agent.findById(testAgent._id);
		console.log('Test agent retrieved:', retrievedAgent ? 'SUCCESS' : 'FAILED');

		// Clean up - delete the test agent
		await Agent.findByIdAndDelete(testAgent._id);
		console.log('Test agent cleaned up');

		res.json({
			success: true,
			message: 'Database write test successful',
			agentId: testAgent._id,
			operations: {
				create: 'SUCCESS',
				read: retrievedAgent ? 'SUCCESS' : 'FAILED',
				delete: 'SUCCESS',
			},
		});
	} catch (error) {
		console.error('Database write test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Database write test failed',
			details: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		});
	}
});

/**
 * @route GET /api/test/db-write-simple
 * @desc Test simple database write operations
 * @access Public
 */
router.get('/db-write-simple', async (req, res) => {
	try {
		console.log('Testing simple database write operation...');

		// Try to create a simple document first
		const mongoose = (await import('mongoose')).default;
		const TestSchema = new mongoose.Schema({
			name: String,
			createdAt: { type: Date, default: Date.now },
		});

		const TestModel = mongoose.model('TestDocument', TestSchema);

		console.log('Creating test document...');
		const testDoc = new TestModel({
			name: 'Test Document ' + Date.now(),
		});

		console.log('Saving test document...');
		await testDoc.save();
		console.log('Test document saved successfully:', testDoc._id);

		// Try to read it back
		const retrievedDoc = await TestModel.findById(testDoc._id);
		console.log(
			'Test document retrieved:',
			retrievedDoc ? 'SUCCESS' : 'FAILED'
		);

		// Clean up - delete the test document
		await TestModel.findByIdAndDelete(testDoc._id);
		console.log('Test document cleaned up');

		res.json({
			success: true,
			message: 'Simple database write test successful',
			documentId: testDoc._id,
			operations: {
				create: 'SUCCESS',
				read: retrievedDoc ? 'SUCCESS' : 'FAILED',
				delete: 'SUCCESS',
			},
		});
	} catch (error) {
		console.error('Simple database write test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Simple database write test failed',
			details: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		});
	}
});

/**
 * @route GET /api/test/db-read
 * @desc Test database read operations
 * @access Public
 */
router.get('/db-read', async (req, res) => {
	try {
		console.log('Testing database read operation...');

		// Try to count agents
		const agentCount = await Agent.countDocuments();
		console.log('Agent count:', agentCount);

		// Try to find agents
		const agents = await Agent.find().limit(5);
		console.log('Found agents:', agents.length);

		res.json({
			success: true,
			message: 'Database read test successful',
			agentCount,
			sampleAgents: agents.length,
		});
	} catch (error) {
		console.error('Database read test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Database read test failed',
			details: error.message,
		});
	}
});

/**
 * @route GET /api/test/db-connection
 * @desc Test database connection status
 * @access Public
 */
router.get('/db-connection', async (req, res) => {
	try {
		const mongoose = (await import('mongoose')).default;

		const connectionState = mongoose.connection.readyState;
		const connectionStates = {
			0: 'disconnected',
			1: 'connected',
			2: 'connecting',
			3: 'disconnecting',
		};

		const state = connectionStates[connectionState] || 'unknown';

		res.json({
			success: true,
			connectionState: state,
			readyState: connectionState,
			database: mongoose.connection.db
				? mongoose.connection.db.databaseName
				: 'unknown',
			host: mongoose.connection.host,
			port: mongoose.connection.port,
		});
	} catch (error) {
		console.error('Database connection test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Database connection test failed',
			details: error.message,
		});
	}
});

/**
 * @route POST /api/test/agent-create
 * @desc Test agent creation with exact frontend data
 * @access Public
 */
router.post('/agent-create', async (req, res) => {
	try {
		console.log('Testing agent creation with frontend data...');
		console.log('Request body:', req.body);

		// Use the same logic as the agent route
		const agentData = {
			...req.body,
			createdBy: req.body.userId || req.body.createdBy || 'default-user',
		};

		console.log('Agent data to save:', agentData);

		const agent = new Agent(agentData);
		await agent.save();

		console.log('Agent saved successfully:', agent._id);

		// Clean up - delete the test agent
		await Agent.findByIdAndDelete(agent._id);
		console.log('Test agent cleaned up');

		res.json({
			success: true,
			message: 'Agent creation test successful',
			agentId: agent._id,
		});
	} catch (error) {
		console.error('Agent creation test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Agent creation test failed',
			details: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		});
	}
});

/**
 * @route GET /api/test/agent-minimal
 * @desc Test minimal agent creation
 * @access Public
 */
router.get('/agent-minimal', async (req, res) => {
	try {
		console.log('Testing minimal agent creation...');

		// Create agent with absolute minimal data
		const agent = new Agent({
			name: 'Minimal Test Agent',
			createdBy: 'test-user',
		});

		console.log('Saving minimal agent...');
		await agent.save();
		console.log('Minimal agent saved:', agent._id);

		// Clean up
		await Agent.findByIdAndDelete(agent._id);
		console.log('Minimal agent cleaned up');

		res.json({
			success: true,
			message: 'Minimal agent creation successful',
			agentId: agent._id,
		});
	} catch (error) {
		console.error('Minimal agent creation failed:', error);
		res.status(500).json({
			success: false,
			error: 'Minimal agent creation failed',
			details: error.message,
		});
	}
});

/**
 * @route POST /api/test/agent-create-minimal
 * @desc Test agent creation with minimal data
 * @access Public
 */
router.post('/agent-create-minimal', async (req, res) => {
	try {
		console.log('Testing agent creation with minimal data...');
		console.log('Request body:', req.body);

		// Create agent with minimal required fields only
		const agentData = {
			name: req.body.name || 'Test Agent',
			createdBy: 'test-user',
		};

		console.log('Agent data to save:', agentData);

		const agent = new Agent(agentData);
		await agent.save();

		console.log('Agent saved successfully:', agent._id);

		// Clean up - delete the test agent
		await Agent.findByIdAndDelete(agent._id);
		console.log('Test agent cleaned up');

		res.json({
			success: true,
			message: 'Minimal agent creation test successful',
			agentId: agent._id,
		});
	} catch (error) {
		console.error('Minimal agent creation test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Minimal agent creation test failed',
			details: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		});
	}
});

export default router;
