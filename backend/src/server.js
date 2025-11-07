import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import avatarRoutes from './routes/avatar.js';
import conversationRoutes from './routes/conversation.js';
import agentRoutes from './routes/agent.js';
import leadRoutes from './routes/lead.js';
import appointmentRoutes from './routes/appointment.js';
import widgetRoutes from './routes/widget.js';
import testRoutes from './routes/test.js';

// Import socket handlers
import { setupSocketHandlers } from './services/socketService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: [
			process.env.FRONTEND_URL || 'http://localhost:3000',
			'https://ai-agent-full-stack.vercel.app',
			'http://localhost:3000',
		],
		methods: ['GET', 'POST', 'OPTIONS'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'],
	},
	transports: ['polling', 'websocket'],
	allowEIO3: true,
});

// Middleware
app.use(helmet());
app.use(
	cors({
		origin: [
			process.env.FRONTEND_URL || 'http://localhost:3000',
			'https://ai-agent-full-stack.vercel.app',
			'http://localhost:3000',
		],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	})
);
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
if (process.env.MONGODB_URI) {
	mongoose
		.connect(process.env.MONGODB_URI)
		.then(() => console.log('✅ Connected to MongoDB'))
		.catch((err) => {
			console.error('❌ MongoDB connection error:', err);
			console.log('⚠️  Server will continue without database connection');
		});
} else {
	console.log('⚠️  No MongoDB URI provided - running without database');
}

// Routes
app.use('/api/avatars', avatarRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/test', testRoutes);

// Health check
app.get('/api/health', (req, res) => {
	res.json({
		status: 'OK',
		timestamp: new Date().toISOString(),
		services: {
			database: process.env.MONGODB_URI
				? mongoose.connection.readyState === 1
					? 'connected'
					: 'disconnected'
				: 'not_configured',
			python: 'checking...', // Will be implemented
			websocket: 'available',
		},
	});
});

// Socket.IO health check
app.get('/socket.io/health', (req, res) => {
	res.json({
		status: 'OK',
		message: 'Socket.IO server is running',
		timestamp: new Date().toISOString(),
	});
});

// Handle Socket.IO CORS preflight requests
app.options('/socket.io/*', (req, res) => {
	res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, X-Requested-With'
	);
	res.header('Access-Control-Allow-Credentials', 'true');
	res.sendStatus(200);
});

// Setup socket handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err);
	res.status(500).json({
		error: 'Internal server error',
		message:
			process.env.NODE_ENV === 'development'
				? err.message
				: 'Something went wrong',
	});
});

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(
		`📱 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`
	);
	console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
