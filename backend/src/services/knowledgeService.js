import { ChromaClient } from 'chromadb';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize ChromaDB client
const chromaClient = new ChromaClient({
	path: process.env.CHROMA_URL || 'http://localhost:8000',
});

/**
 * Upload knowledge base documents for an agent
 */
export async function uploadKnowledgeBase(agentId, documents) {
	try {
		const collectionName = `agent_${agentId}_knowledge`;

		// Get or create collection
		let collection;
		try {
			collection = await chromaClient.getCollection({ name: collectionName });
		} catch (error) {
			// Collection doesn't exist, create it
			collection = await chromaClient.createCollection({
				name: collectionName,
				metadata: { agentId, createdAt: new Date().toISOString() },
			});
		}

		// Process each document
		const processedDocs = [];
		for (const doc of documents) {
			const processed = await processDocument(doc);
			processedDocs.push(processed);
		}

		// Add documents to collection
		if (processedDocs.length > 0) {
			const texts = processedDocs.map((doc) => doc.text);
			const metadatas = processedDocs.map((doc) => doc.metadata);
			const ids = processedDocs.map((doc) => doc.id);

			await collection.add({
				documents: texts,
				metadatas: metadatas,
				ids: ids,
			});
		}

		return {
			documentsProcessed: processedDocs.length,
			collectionName,
		};
	} catch (error) {
		console.error('Error uploading knowledge base:', error);
		throw new Error('Failed to upload knowledge base');
	}
}

/**
 * Retrieve relevant knowledge for a query
 */
export async function retrieveKnowledge(query, agentId, limit = 5) {
	try {
		const collectionName = `agent_${agentId}_knowledge`;

		// Get collection
		let collection;
		try {
			collection = await chromaClient.getCollection({ name: collectionName });
		} catch (error) {
			// Collection doesn't exist
			return [];
		}

		// Query collection
		const results = await collection.query({
			queryTexts: [query],
			nResults: limit,
		});

		// Format results
		const knowledge = [];
		if (results.documents && results.documents[0]) {
			for (let i = 0; i < results.documents[0].length; i++) {
				knowledge.push({
					text: results.documents[0][i],
					metadata: results.metadatas[0][i],
					distance: results.distances[0][i],
				});
			}
		}

		return knowledge;
	} catch (error) {
		console.error('Error retrieving knowledge:', error);
		return [];
	}
}

/**
 * Add conversation to knowledge base
 */
export async function addToKnowledgeBase(agentId, question, answer) {
	try {
		const collectionName = `agent_${agentId}_knowledge`;

		// Get collection
		let collection;
		try {
			collection = await chromaClient.getCollection({ name: collectionName });
		} catch (error) {
			// Collection doesn't exist, create it
			collection = await chromaClient.createCollection({
				name: collectionName,
				metadata: { agentId, createdAt: new Date().toISOString() },
			});
		}

		// Create knowledge entry
		const knowledgeId = `conv_${Date.now()}_${Math.random()
			.toString(36)
			.substr(2, 9)}`;
		const knowledgeText = `Q: ${question}\nA: ${answer}`;

		await collection.add({
			documents: [knowledgeText],
			metadatas: [
				{
					type: 'conversation',
					question: question,
					answer: answer,
					createdAt: new Date().toISOString(),
					source: 'user_conversation',
				},
			],
			ids: [knowledgeId],
		});

		return { success: true, knowledgeId };
	} catch (error) {
		console.error('Error adding to knowledge base:', error);
		throw new Error('Failed to add to knowledge base');
	}
}

/**
 * Delete knowledge base for an agent
 */
export async function deleteKnowledgeBase(agentId) {
	try {
		const collectionName = `agent_${agentId}_knowledge`;

		// Try to delete collection
		try {
			await chromaClient.deleteCollection({ name: collectionName });
		} catch (error) {
			// Collection might not exist
			console.log(
				`Collection ${collectionName} doesn't exist or already deleted`
			);
		}

		return { success: true };
	} catch (error) {
		console.error('Error deleting knowledge base:', error);
		throw new Error('Failed to delete knowledge base');
	}
}

/**
 * Process document for knowledge base
 */
async function processDocument(doc) {
	try {
		let text = '';
		let metadata = {
			type: doc.type || 'document',
			name: doc.name || 'Unknown',
			uploadedAt: new Date().toISOString(),
		};

		// Handle different document types
		if (doc.type === 'text' || doc.content) {
			text = doc.content;
		} else if (doc.type === 'file' && doc.path) {
			// Read file content
			const filePath = path.resolve(doc.path);
			const content = await fs.readFile(filePath, 'utf-8');

			// Extract text based on file type
			if (doc.name.endsWith('.md')) {
				text = extractMarkdownText(content);
			} else if (doc.name.endsWith('.txt')) {
				text = content;
			} else if (doc.name.endsWith('.json')) {
				const jsonData = JSON.parse(content);
				text = JSON.stringify(jsonData, null, 2);
			} else {
				text = content;
			}

			metadata.filePath = doc.path;
		}

		// Clean and chunk text
		const cleanedText = cleanText(text);
		const chunks = chunkText(cleanedText, 500); // 500 characters per chunk

		// Process each chunk
		const processedChunks = [];
		for (let i = 0; i < chunks.length; i++) {
			processedChunks.push({
				id: `${doc.id || 'doc'}_chunk_${i}`,
				text: chunks[i],
				metadata: {
					...metadata,
					chunkIndex: i,
					totalChunks: chunks.length,
				},
			});
		}

		return processedChunks;
	} catch (error) {
		console.error('Error processing document:', error);
		throw new Error('Failed to process document');
	}
}

/**
 * Extract text from markdown
 */
function extractMarkdownText(markdown) {
	// Simple markdown text extraction
	return markdown
		.replace(/#{1,6}\s+/g, '') // Remove headers
		.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
		.replace(/\*(.*?)\*/g, '$1') // Remove italic
		.replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
		.replace(/`(.*?)`/g, '$1') // Remove code
		.replace(/\n+/g, ' ') // Replace newlines with spaces
		.trim();
}

/**
 * Clean text for processing
 */
function cleanText(text) {
	return text
		.replace(/\s+/g, ' ') // Normalize whitespace
		.replace(/[^\u0000-\u007F\u0590-\u05FF\u0600-\u06FF]/g, '') // Keep ASCII, Hebrew, Arabic
		.trim();
}

/**
 * Chunk text into smaller pieces
 */
function chunkText(text, maxLength) {
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

/**
 * Search knowledge base
 */
export async function searchKnowledge(query, agentId, limit = 10) {
	try {
		const results = await retrieveKnowledge(query, agentId, limit);

		return results.map((result) => ({
			text: result.text,
			metadata: result.metadata,
			relevance: 1 - result.distance, // Convert distance to relevance score
		}));
	} catch (error) {
		console.error('Error searching knowledge:', error);
		return [];
	}
}
