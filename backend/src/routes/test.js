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
		
		// Create a test agent
		const testAgent = new Agent({
			name: 'Test Agent ' + Date.now(),
			description: 'Test agent for database write verification',
			avatar: {
				baseAvatarId: 'avatar-001',
				avatarType: 'gallery'
			},
			personality: 'friendly',
			language: 'he',
			createdBy: 'test-user'
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
				delete: 'SUCCESS'
			}
		});
	} catch (error) {
		console.error('Database write test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Database write test failed',
			details: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
			sampleAgents: agents.length
		});
	} catch (error) {
		console.error('Database read test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Database read test failed',
			details: error.message
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
			3: 'disconnecting'
		};

		const state = connectionStates[connectionState] || 'unknown';
		
		res.json({
			success: true,
			connectionState: state,
			readyState: connectionState,
			database: mongoose.connection.db ? mongoose.connection.db.databaseName : 'unknown',
			host: mongoose.connection.host,
			port: mongoose.connection.port
		});
	} catch (error) {
		console.error('Database connection test failed:', error);
		res.status(500).json({
			success: false,
			error: 'Database connection test failed',
			details: error.message
		});
	}
});

export default router;
