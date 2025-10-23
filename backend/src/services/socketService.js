import { generateTTS } from './ttsService.js';

/**
 * Setup WebSocket handlers for real-time communication
 */
export function setupSocketHandlers(io) {
	io.on('connection', (socket) => {
		console.log('Client connected:', socket.id);

		// Handle lip sync requests (disabled for now)
		socket.on('lipsync-request', async (data) => {
			try {
				const { text, agentId, avatarId } = data;

				if (!text || !agentId) {
					socket.emit('lipsync-error', {
						error: 'Text and agentId are required',
					});
					return;
				}

				// Return placeholder response (TTS service disabled)
				socket.emit('lipsync-result', {
					audioUrl: '/uploads/audio/placeholder.wav',
					videoUrl: '/uploads/lipsync/placeholder.mp4',
					duration: 5,
					frames: [],
				});
			} catch (error) {
				console.error('Lip sync error:', error);
				socket.emit('lipsync-error', {
					error: 'Failed to generate lip sync',
					details:
						process.env.NODE_ENV === 'development' ? error.message : undefined,
				});
			}
		});

		// Handle streaming lip sync (disabled for now)
		socket.on('lipsync-stream-start', async (data) => {
			try {
				const { text, agentId, avatarId } = data;

				if (!text || !agentId) {
					socket.emit('lipsync-stream-error', {
						error: 'Text and agentId are required',
					});
					return;
				}

				// Return placeholder streaming response (TTS service disabled)
				socket.emit('lipsync-stream-chunk', {
					chunkIndex: 0,
					totalChunks: 1,
					text: text,
					audioUrl: '/uploads/audio/placeholder.wav',
					videoUrl: '/uploads/lipsync/placeholder.mp4',
					duration: 5,
				});
				
				socket.emit('lipsync-stream-complete', {
					totalChunks: 1,
				});
			} catch (error) {
				console.error('Streaming lip sync error:', error);
				socket.emit('lipsync-stream-error', {
					error: 'Failed to start streaming lip sync',
				});
			}
		});

		// Handle conversation with real-time avatar (TTS disabled)
		socket.on('conversation-with-avatar', async (data) => {
			try {
				const { message, agentId, conversationHistory = [] } = data;

				if (!message || !agentId) {
					socket.emit('conversation-error', {
						error: 'Message and agentId are required',
					});
					return;
				}

				// Generate AI response (this would use the conversation service)
				const response = await generateAIResponse(
					message,
					agentId,
					conversationHistory
				);

				// Send response without TTS (TTS service disabled)
				socket.emit('conversation-response', {
					text: response.text,
					audioUrl: '/uploads/audio/placeholder.wav',
					videoUrl: '/uploads/lipsync/placeholder.mp4',
					duration: 5,
					intent: response.intent,
					actions: response.actions,
				});
			} catch (error) {
				console.error('Conversation with avatar error:', error);
				socket.emit('conversation-error', {
					error: 'Failed to process conversation',
				});
			}
		});

		// Handle avatar animation requests
		socket.on('avatar-animate', async (data) => {
			try {
				const { animationType, agentId, avatarId } = data;

				// Generate appropriate animation based on type
				const animation = await generateAvatarAnimation(
					animationType,
					agentId,
					avatarId
				);

				socket.emit('avatar-animation', {
					type: animationType,
					data: animation,
				});
			} catch (error) {
				console.error('Avatar animation error:', error);
				socket.emit('avatar-animation-error', {
					error: 'Failed to generate animation',
				});
			}
		});

		// Handle disconnect
		socket.on('disconnect', () => {
			console.log('Client disconnected:', socket.id);
		});
	});
}

/**
 * Start streaming lip sync process
 */
async function startStreamingLipSync(socket, text, agentId, avatarId) {
	try {
		// Split text into chunks for streaming
		const chunks = splitTextIntoChunks(text, 50); // 50 characters per chunk

		for (let i = 0; i < chunks.length; i++) {
			const chunk = chunks[i];

			// Generate TTS for chunk
			const ttsResult = await generateTTS({
				text: chunk,
				agentId,
				language: 'he',
			});

			// Generate lip sync for chunk
			const lipsyncResult = await generateLipSyncLocal({
				audioUrl: ttsResult.audioUrl,
				avatarId: avatarId || 'default',
				agentId,
			});

			// Stream chunk to client
			socket.emit('lipsync-stream-chunk', {
				chunkIndex: i,
				totalChunks: chunks.length,
				text: chunk,
				audioUrl: ttsResult.audioUrl,
				videoUrl: lipsyncResult.videoUrl,
				duration: ttsResult.duration,
			});

			// Small delay between chunks for smooth streaming
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		// Signal end of stream
		socket.emit('lipsync-stream-complete', {
			totalChunks: chunks.length,
		});
	} catch (error) {
		console.error('Streaming lip sync error:', error);
		socket.emit('lipsync-stream-error', {
			error: 'Failed to process streaming lip sync',
		});
	}
}

/**
 * Generate AI response (placeholder - would use conversation service)
 */
async function generateAIResponse(message, agentId, conversationHistory) {
	// This would typically call the conversation service
	// For now, return a simple response
	return {
		text: `תודה על ההודעה: "${message}". איך אני יכול לעזור לך?`,
		intent: 'info',
		actions: [],
	};
}

/**
 * Generate lip sync (placeholder - would call Python service)
 */
async function generateLipSyncLocal({ audioUrl, avatarId, agentId }) {
	try {
		// This would typically call the Python Wav2Lip service
		// For now, return placeholder data
		return {
			videoUrl: `/uploads/lipsync/${Date.now()}_${avatarId}.mp4`,
			frames: [], // Would contain actual video frames for streaming
			duration: 5, // seconds
		};
	} catch (error) {
		console.error('Lip sync generation error:', error);
		throw error;
	}
}

/**
 * Generate avatar animation (placeholder)
 */
async function generateAvatarAnimation(animationType, agentId, avatarId) {
	// This would generate appropriate animation data based on type
	const animations = {
		idle: { type: 'idle', duration: 2000, loop: true },
		talking: { type: 'talking', duration: 1000, loop: false },
		listening: { type: 'listening', duration: 1500, loop: true },
		thinking: { type: 'thinking', duration: 3000, loop: true },
		happy: { type: 'happy', duration: 1000, loop: false },
		confused: { type: 'confused', duration: 2000, loop: false },
	};

	return animations[animationType] || animations['idle'];
}

/**
 * Split text into chunks for streaming
 */
function splitTextIntoChunks(text, maxLength) {
	const chunks = [];
	const sentences = text.split(/[.!?]+/);

	let currentChunk = '';

	for (const sentence of sentences) {
		const trimmedSentence = sentence.trim();
		if (!trimmedSentence) continue;

		if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
			currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
		} else {
			if (currentChunk) {
				chunks.push(currentChunk + '.');
				currentChunk = trimmedSentence;
			} else {
				// Sentence is too long, split it
				chunks.push(trimmedSentence.substring(0, maxLength));
				currentChunk = trimmedSentence.substring(maxLength);
			}
		}
	}

	if (currentChunk) {
		chunks.push(currentChunk + '.');
	}

	return chunks;
}
