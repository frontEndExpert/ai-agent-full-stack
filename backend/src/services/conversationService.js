import axios from 'axios';
import { retrieveKnowledge, addToKnowledgeBase } from './knowledgeService.js';

/**
 * Generate AI response using Ollama with RAG
 */
export async function generateResponse({
	message,
	agentId,
	conversationHistory,
	intent,
	userId,
}) {
	try {
		console.log('Generating response for:', message);

		// Use Perplexity API for intelligent responses
		if (process.env.PERPLEXITY_API_KEY) {
			const response = await axios.post(
				'https://api.perplexity.ai/chat/completions',
				{
					model: 'llama-3.1-sonar-small-128k-online',
					messages: [
						{
							role: 'system',
							content: `You are a helpful AI assistant for a business. You should be friendly, professional, and helpful. 
							Respond in Hebrew if the user writes in Hebrew, otherwise respond in English.
							Keep responses concise but informative.`,
						},
						{
							role: 'user',
							content: message,
						},
					],
					max_tokens: 200,
					temperature: 0.7,
					top_p: 0.9,
				},
				{
					headers: {
						Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
						'Content-Type': 'application/json',
					},
					timeout: 15000,
				}
			);

			const aiResponse = response.data.choices[0].message.content;

			return {
				text: aiResponse,
				actions: [],
				conversationId: generateConversationId(),
				intent: intent || 'info',
			};
		}

		// Fallback to simple responses if no API key
		let responseText = 'Thank you for your message! How can I help you today?';

		if (
			message.toLowerCase().includes('hello') ||
			message.toLowerCase().includes('hi')
		) {
			responseText = 'Hello! Welcome! How can I assist you today?';
		} else if (message.toLowerCase().includes('help')) {
			responseText = "I'm here to help! What would you like to know?";
		} else if (
			message.toLowerCase().includes('price') ||
			message.toLowerCase().includes('cost')
		) {
			responseText =
				"I'd be happy to help you with pricing information. Could you tell me more about what you're looking for?";
		} else if (
			message.toLowerCase().includes('contact') ||
			message.toLowerCase().includes('phone') ||
			message.toLowerCase().includes('email')
		) {
			responseText =
				'I can help you get in touch with our team. Would you like to schedule a call or leave your contact information?';
		}

		return {
			text: responseText,
			actions: [],
			conversationId: generateConversationId(),
			intent: intent || 'info',
		};
	} catch (error) {
		console.error('Error generating AI response:', error);

		// Fallback response
		return {
			text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
			actions: [],
			conversationId: generateConversationId(),
			intent: 'error',
		};
	}
}

/**
 * Detect user intent from message
 */
export async function detectIntent(message, agentId) {
	try {
		// Simple intent detection without external LLM
		const lowerMessage = message.toLowerCase();

		if (
			lowerMessage.includes('schedule') ||
			lowerMessage.includes('appointment') ||
			lowerMessage.includes('meeting')
		) {
			return 'appointment';
		} else if (
			lowerMessage.includes('buy') ||
			lowerMessage.includes('purchase') ||
			lowerMessage.includes('order')
		) {
			return 'purchase';
		} else if (
			lowerMessage.includes('support') ||
			lowerMessage.includes('help') ||
			lowerMessage.includes('problem')
		) {
			return 'support';
		} else if (
			lowerMessage.includes('contact') ||
			lowerMessage.includes('phone') ||
			lowerMessage.includes('email')
		) {
			return 'lead';
		} else {
			return 'info';
		}
	} catch (error) {
		console.error('Error detecting intent:', error);
		return 'info';
	}
}

/**
 * Build context for the LLM
 */
function buildContext({
	message,
	agentId,
	conversationHistory,
	relevantKnowledge,
	intent,
	userId,
}) {
	const agent = getAgentConfig(agentId); // This would fetch from database

	let systemPrompt = `You are a helpful AI assistant for ${
		agent?.name || 'our business'
	}. `;

	if (agent?.personality) {
		systemPrompt += `Your personality: ${agent.personality}. `;
	}

	if (agent?.language === 'he') {
		systemPrompt += `Respond in Hebrew. `;
	}

	systemPrompt += `
You are designed to help users with information, capture leads, schedule appointments, and guide them through purchases.

Current conversation context:
- User intent: ${intent}
- Agent capabilities: Lead capture, appointment scheduling, product information, sales guidance

Relevant knowledge base information:
${relevantKnowledge}

Previous conversation:
${conversationHistory.map((msg) => `${msg.sender}: ${msg.message}`).join('\n')}

User message: ${message}

Instructions:
1. Provide helpful, accurate information based on the knowledge base
2. If the user provides contact information, acknowledge it and ask if they'd like to be contacted
3. If they want to schedule an appointment, guide them through the process
4. If they're interested in purchasing, ask qualifying questions and recommend products
5. Be conversational and engaging
6. If you don't know something, say so and offer to help them find the information

Respond naturally and helpfully:`;

	return {
		prompt: systemPrompt,
		context: {
			agentId,
			userId,
			intent,
			hasKnowledge: relevantKnowledge.length > 0,
		},
	};
}

/**
 * Process AI response to extract actionable items
 */
function processResponseForActions(response, intent) {
	const actions = [];

	// Check for lead capture opportunities
	if (
		intent === 'lead' ||
		response.toLowerCase().includes('contact') ||
		response.toLowerCase().includes('email')
	) {
		actions.push({
			type: 'capture_lead',
			priority: 'high',
		});
	}

	// Check for appointment scheduling
	if (
		intent === 'appointment' ||
		response.toLowerCase().includes('schedule') ||
		response.toLowerCase().includes('meeting')
	) {
		actions.push({
			type: 'schedule_appointment',
			priority: 'high',
		});
	}

	// Check for product recommendations
	if (
		intent === 'purchase' ||
		response.toLowerCase().includes('product') ||
		response.toLowerCase().includes('buy')
	) {
		actions.push({
			type: 'product_recommendation',
			priority: 'medium',
		});
	}

	return actions;
}

/**
 * Check if conversation should be added to knowledge base
 */
function shouldAddToKnowledgeBase(message, response) {
	// Add to knowledge base if it's a good Q&A pair
	const hasQuestion =
		message.includes('?') ||
		message.toLowerCase().includes('what') ||
		message.toLowerCase().includes('how');
	const hasAnswer = response.length > 50; // Substantial answer

	return hasQuestion && hasAnswer;
}

/**
 * Get agent configuration (placeholder - would fetch from database)
 */
async function getAgentConfig(agentId) {
	// This would typically fetch from database
	// For now, return a default configuration
	return {
		id: agentId,
		name: 'AI Assistant',
		personality: 'friendly and helpful',
		language: 'he',
		salesConfig: {
			enabled: true,
			products: [
				{ name: 'Basic Plan', price: 99, description: 'Basic service package' },
				{
					name: 'Premium Plan',
					price: 199,
					description: 'Premium service package',
				},
			],
		},
	};
}

/**
 * Generate unique conversation ID
 */
function generateConversationId() {
	return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
