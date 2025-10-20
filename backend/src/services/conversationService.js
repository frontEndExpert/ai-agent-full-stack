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
		// Retrieve relevant knowledge for the agent
		const relevantKnowledge = await retrieveKnowledge(message, agentId);

		// Prepare context for the LLM
		const context = buildContext({
			message,
			agentId,
			conversationHistory,
			relevantKnowledge,
			intent,
			userId,
		});

		// Call Ollama API
		const response = await axios.post(
			`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/generate`,
			{
				model: process.env.OLLAMA_MODEL || 'llama3.2',
				prompt: context.prompt,
				stream: false,
				options: {
					temperature: 0.7,
					top_p: 0.9,
					max_tokens: 500,
				},
			},
			{
				timeout: 30000,
			}
		);

		const aiResponse = response.data.response;

		// Process response for actions
		const actions = processResponseForActions(aiResponse, intent);

		// Add to knowledge base if it's a learning opportunity
		if (shouldAddToKnowledgeBase(message, aiResponse)) {
			await addToKnowledgeBase(agentId, message, aiResponse);
		}

		return {
			text: aiResponse,
			actions,
			conversationId: generateConversationId(),
			intent,
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
		// Get agent configuration to understand available intents
		const agent = await getAgentConfig(agentId);

		const intentPrompt = `
Analyze the following message and classify the user's intent. Choose the most appropriate intent from the available options.

Message: "${message}"

Available intents:
- info: User is asking for information about products, services, or general questions
- lead: User is providing contact information or showing interest in being contacted
- appointment: User wants to schedule a meeting or appointment
- purchase: User is interested in buying something or making a purchase
- complaint: User has a complaint or issue
- support: User needs technical support or help
- other: Intent doesn't fit the above categories

Respond with only the intent name (e.g., "info", "lead", "appointment").
`;

		const response = await axios.post(
			`${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}/api/generate`,
			{
				model: process.env.OLLAMA_MODEL || 'llama3.2',
				prompt: intentPrompt,
				stream: false,
				options: {
					temperature: 0.1,
					max_tokens: 10,
				},
			},
			{
				timeout: 10000,
			}
		);

		const intent = response.data.response.trim().toLowerCase();

		// Validate intent
		const validIntents = [
			'info',
			'lead',
			'appointment',
			'purchase',
			'complaint',
			'support',
			'other',
		];
		return validIntents.includes(intent) ? intent : 'other';
	} catch (error) {
		console.error('Error detecting intent:', error);
		return 'other';
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
