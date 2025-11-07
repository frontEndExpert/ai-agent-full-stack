import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate TTS audio from text
 */
export async function generateTTS({ text, agentId, language = 'he' }) {
	try {
		// Temporarily use fallback TTS to avoid Python service dependency
		console.log('Using fallback TTS for:', text);
		return await generateFallbackTTS(text, agentId);
	} catch (error) {
		console.error('Error generating TTS:', error);
		throw new Error('Failed to generate TTS audio');
	}
}

/**
 * Generate TTS using Coqui TTS
 */
async function generateWithCoquiTTS(text, agentId, language) {
	try {
		const response = await axios.post(
			`${
				process.env.PYTHON_SERVICES_URL || 'http://localhost:8000'
			}/generate-tts`,
			{
				text,
				language,
				voice: getHebrewVoice(language),
			},
			{
				timeout: 30000,
				responseType: 'arraybuffer',
			}
		);

		// Save audio file
		const audioId = generateAudioId();
		const audioPath = path.join(
			__dirname,
			'../../uploads/audio',
			`${audioId}.wav`
		);

		// Ensure directory exists
		await fs.mkdir(path.dirname(audioPath), { recursive: true });

		// Save audio file
		await fs.writeFile(audioPath, response.data);

		// Get audio duration (simplified)
		const duration = estimateAudioDuration(text);

		return {
			audioUrl: `/uploads/audio/${audioId}.wav`,
			duration,
			provider: 'coqui',
		};
	} catch (error) {
		console.error('Coqui TTS error:', error);
		throw error;
	}
}

/**
 * Generate TTS using Piper TTS
 */
async function generateWithPiperTTS(text, agentId, language) {
	try {
		const response = await axios.post(
			`${
				process.env.PYTHON_SERVICES_URL || 'http://localhost:8000'
			}/generate-tts`,
			{
				text,
				language,
				voice: getPiperVoice(language),
			},
			{
				timeout: 30000,
				responseType: 'arraybuffer',
			}
		);

		// Save audio file
		const audioId = generateAudioId();
		const audioPath = path.join(
			__dirname,
			'../../uploads/audio',
			`${audioId}.wav`
		);

		// Ensure directory exists
		await fs.mkdir(path.dirname(audioPath), { recursive: true });

		// Save audio file
		await fs.writeFile(audioPath, response.data);

		// Get audio duration (simplified)
		const duration = estimateAudioDuration(text);

		return {
			audioUrl: `/uploads/audio/${audioId}.wav`,
			duration,
			provider: 'piper',
		};
	} catch (error) {
		console.error('Piper TTS error:', error);
		throw error;
	}
}

/**
 * Generate fallback TTS (placeholder)
 */
async function generateFallbackTTS(text, agentId) {
	try {
		// Create a simple placeholder audio file
		const audioId = generateAudioId();
		const audioPath = path.join(
			__dirname,
			'../../uploads/audio',
			`${audioId}.wav`
		);

		// Ensure directory exists
		await fs.mkdir(path.dirname(audioPath), { recursive: true });

		// Create a simple WAV file header (44 bytes) + silence
		const duration = estimateAudioDuration(text);
		const sampleRate = 22050;
		const numSamples = Math.floor(duration * sampleRate);
		const buffer = Buffer.alloc(44 + numSamples * 2); // 16-bit audio

		// WAV header
		buffer.write('RIFF', 0);
		buffer.writeUInt32LE(36 + numSamples * 2, 4);
		buffer.write('WAVE', 8);
		buffer.write('fmt ', 12);
		buffer.writeUInt32LE(16, 16);
		buffer.writeUInt16LE(1, 20); // PCM
		buffer.writeUInt16LE(1, 22); // Mono
		buffer.writeUInt32LE(sampleRate, 24);
		buffer.writeUInt32LE(sampleRate * 2, 28);
		buffer.writeUInt16LE(2, 32); // Block align
		buffer.writeUInt16LE(16, 34); // Bits per sample
		buffer.write('data', 36);
		buffer.writeUInt32LE(numSamples * 2, 40);

		// Fill with silence (zeros)
		buffer.fill(0, 44);

		await fs.writeFile(audioPath, buffer);

		return {
			audioUrl: `/uploads/audio/${audioId}.wav`,
			duration,
			provider: 'fallback',
		};
	} catch (error) {
		console.error('Fallback TTS error:', error);
		throw error;
	}
}

/**
 * Get appropriate Hebrew voice for Coqui TTS
 */
function getHebrewVoice(language) {
	const voices = {
		he: 'hebrew_female', // Hebrew female voice
		en: 'english_female',
		ar: 'arabic_female',
	};

	return voices[language] || voices['he'];
}

/**
 * Get appropriate voice for Piper TTS
 */
function getPiperVoice(language) {
	const voices = {
		he: 'hebrew', // Hebrew voice
		en: 'english',
		ar: 'arabic',
	};

	return voices[language] || voices['he'];
}

/**
 * Estimate audio duration based on text length
 */
function estimateAudioDuration(text) {
	// Rough estimation: ~150 words per minute for Hebrew
	const wordsPerMinute = 150;
	const wordCount = text.split(/\s+/).length;
	const durationInMinutes = wordCount / wordsPerMinute;

	// Minimum 2 seconds, maximum 30 seconds
	return Math.max(2, Math.min(30, durationInMinutes * 60));
}

/**
 * Generate unique audio ID
 */
function generateAudioId() {
	return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Clean up old audio files
 */
export async function cleanupOldAudioFiles() {
	try {
		const audioDir = path.join(__dirname, '../../uploads/audio');
		const files = await fs.readdir(audioDir);

		const now = Date.now();
		const maxAge = 24 * 60 * 60 * 1000; // 24 hours

		for (const file of files) {
			const filePath = path.join(audioDir, file);
			const stats = await fs.stat(filePath);

			if (now - stats.mtime.getTime() > maxAge) {
				await fs.unlink(filePath);
				console.log(`Cleaned up old audio file: ${file}`);
			}
		}
	} catch (error) {
		console.error('Error cleaning up audio files:', error);
	}
}
