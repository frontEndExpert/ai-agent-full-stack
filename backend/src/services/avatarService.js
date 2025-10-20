import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base avatar gallery data
const BASE_AVATARS = [
	{
		id: 'avatar-001',
		name: 'Professional Woman',
		description: 'Business professional with short hair',
		thumbnail: '/public/avatars/avatar-001_thumb.jpg',
		modelUrl: '/public/avatars/avatar-001.glb',
		gender: 'female',
		age: 'adult',
		style: 'professional',
	},
	{
		id: 'avatar-002',
		name: 'Friendly Man',
		description: 'Approachable man with glasses',
		thumbnail: '/public/avatars/avatar-002_thumb.jpg',
		modelUrl: '/public/avatars/avatar-002.glb',
		gender: 'male',
		age: 'adult',
		style: 'casual',
	},
	{
		id: 'avatar-003',
		name: 'Young Professional',
		description: 'Young woman with long hair',
		thumbnail: '/public/avatars/avatar-003_thumb.jpg',
		modelUrl: '/public/avatars/avatar-003.glb',
		gender: 'female',
		age: 'young',
		style: 'modern',
	},
	{
		id: 'avatar-004',
		name: 'Senior Executive',
		description: 'Mature man in suit',
		thumbnail: '/public/avatars/avatar-004_thumb.jpg',
		modelUrl: '/public/avatars/avatar-004.glb',
		gender: 'male',
		age: 'senior',
		style: 'executive',
	},
	{
		id: 'avatar-005',
		name: 'Tech Expert',
		description: 'Young man with casual style',
		thumbnail: '/public/avatars/avatar-005_thumb.jpg',
		modelUrl: '/public/avatars/avatar-005.glb',
		gender: 'male',
		age: 'young',
		style: 'tech',
	},
	{
		id: 'avatar-006',
		name: 'Creative Director',
		description: 'Artistic woman with unique style',
		thumbnail: '/public/avatars/avatar-006_thumb.jpg',
		modelUrl: '/public/avatars/avatar-006.glb',
		gender: 'female',
		age: 'adult',
		style: 'creative',
	},
	{
		id: 'avatar-007',
		name: 'Healthcare Professional',
		description: 'Medical professional in scrubs',
		thumbnail: '/public/avatars/avatar-007_thumb.jpg',
		modelUrl: '/public/avatars/avatar-007.glb',
		gender: 'female',
		age: 'adult',
		style: 'medical',
	},
	{
		id: 'avatar-008',
		name: 'Sales Manager',
		description: 'Confident man with tie',
		thumbnail: '/public/avatars/avatar-008_thumb.jpg',
		modelUrl: '/public/avatars/avatar-008.glb',
		gender: 'male',
		age: 'adult',
		style: 'sales',
	},
	{
		id: 'avatar-009',
		name: 'Customer Service Rep',
		description: 'Friendly woman with warm smile',
		thumbnail: '/public/avatars/avatar-009_thumb.jpg',
		modelUrl: '/public/avatars/avatar-009.glb',
		gender: 'female',
		age: 'adult',
		style: 'service',
	},
	{
		id: 'avatar-010',
		name: 'Tech Support',
		description: 'Helpful man with technical expertise',
		thumbnail: '/public/avatars/avatar-010_thumb.jpg',
		modelUrl: '/public/avatars/avatar-010.glb',
		gender: 'male',
		age: 'adult',
		style: 'support',
	},
];

/**
 * Get list of available base avatars
 */
export async function getAvatarGallery() {
	try {
		// In a real app, this might fetch from database
		// For now, return the static gallery
		return BASE_AVATARS;
	} catch (error) {
		console.error('Error fetching avatar gallery:', error);
		throw new Error('Failed to fetch avatar gallery');
	}
}

/**
 * Generate avatar based on provided options
 */
export async function generateAvatar({
	baseAvatarId,
	description,
	photo,
	agentId,
}) {
	try {
		let result = {};

		// If only baseAvatarId is provided, return the base avatar
		if (baseAvatarId && !description && !photo) {
			const baseAvatar = BASE_AVATARS.find(
				(avatar) => avatar.id === baseAvatarId
			);
			if (!baseAvatar) {
				throw new Error('Base avatar not found');
			}

			return {
				avatarId: baseAvatarId,
				modelUrl: baseAvatar.modelUrl,
				thumbnail: baseAvatar.thumbnail,
				type: 'gallery',
			};
		}

		// If photo is provided, use face reconstruction
		if (photo) {
			result = await generateFromPhoto(photo, baseAvatarId, description);
		}
		// If only description is provided, use text-to-avatar
		else if (description) {
			result = await generateFromDescription(description, baseAvatarId);
		}

		// Save avatar info to database (if agentId provided)
		if (agentId) {
			await saveAvatarToAgent(agentId, result);
		}

		return result;
	} catch (error) {
		console.error('Error generating avatar:', error);
		throw new Error('Failed to generate avatar');
	}
}

/**
 * Generate avatar from photo using face reconstruction
 */
async function generateFromPhoto(photo, baseAvatarId, description) {
	try {
		// Call Python face reconstruction service
		const formData = new FormData();
		formData.append('photo', photo);
		if (baseAvatarId) formData.append('base_avatar_id', baseAvatarId);
		if (description) formData.append('description', description);

		const response = await axios.post(
			`${
				process.env.FACE_RECONSTRUCTION_URL || 'http://localhost:8001'
			}/generate`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				timeout: 60000, // 60 seconds timeout
			}
		);

		return {
			avatarId: response.data.avatar_id,
			modelUrl: response.data.model_url,
			thumbnail: response.data.thumbnail_url,
			type: 'photo-generated',
		};
	} catch (error) {
		console.error('Error in face reconstruction:', error);
		// Fallback to base avatar if face reconstruction fails
		if (baseAvatarId) {
			const baseAvatar = BASE_AVATARS.find(
				(avatar) => avatar.id === baseAvatarId
			);
			if (baseAvatar) {
				return {
					avatarId: baseAvatarId,
					modelUrl: baseAvatar.modelUrl,
					thumbnail: baseAvatar.thumbnail,
					type: 'gallery-fallback',
				};
			}
		}
		throw error;
	}
}

/**
 * Generate avatar from text description
 */
async function generateFromDescription(description, baseAvatarId) {
	try {
		// Call Python text-to-avatar service
		const response = await axios.post(
			`${
				process.env.PYTHON_SERVICES_URL || 'http://localhost:8000'
			}/generate-avatar`,
			{
				description,
				base_avatar_id: baseAvatarId,
			},
			{
				timeout: 30000, // 30 seconds timeout
			}
		);

		return {
			avatarId: response.data.avatar_id,
			modelUrl: response.data.model_url,
			thumbnail: response.data.thumbnail_url,
			type: 'text-generated',
		};
	} catch (error) {
		console.error('Error in text-to-avatar generation:', error);
		// Fallback to base avatar if text generation fails
		if (baseAvatarId) {
			const baseAvatar = BASE_AVATARS.find(
				(avatar) => avatar.id === baseAvatarId
			);
			if (baseAvatar) {
				return {
					avatarId: baseAvatarId,
					modelUrl: baseAvatar.modelUrl,
					thumbnail: baseAvatar.thumbnail,
					type: 'gallery-fallback',
				};
			}
		}
		throw error;
	}
}

/**
 * Save avatar information to agent
 */
async function saveAvatarToAgent(agentId, avatarData) {
	try {
		// This would typically update the agent in the database
		// For now, just log the information
		console.log(`Saving avatar for agent ${agentId}:`, avatarData);
	} catch (error) {
		console.error('Error saving avatar to agent:', error);
		// Don't throw error as this is not critical
	}
}

/**
 * Create placeholder avatar files for development
 */
export async function createPlaceholderAvatars() {
	try {
		const avatarsDir = path.join(__dirname, '../../public/avatars');

		// Create avatars directory if it doesn't exist
		await fs.mkdir(avatarsDir, { recursive: true });

		// Create placeholder files for each base avatar
		for (const avatar of BASE_AVATARS) {
			const modelPath = path.join(avatarsDir, `${avatar.id}.glb`);
			const thumbPath = path.join(avatarsDir, `${avatar.id}_thumb.jpg`);

			// Create placeholder files if they don't exist
			try {
				await fs.access(modelPath);
			} catch {
				// Create a simple placeholder GLB file (this would be replaced with actual 3D models)
				await fs.writeFile(modelPath, 'PLACEHOLDER_GLB_FILE');
			}

			try {
				await fs.access(thumbPath);
			} catch {
				// Create a simple placeholder image (this would be replaced with actual thumbnails)
				await fs.writeFile(thumbPath, 'PLACEHOLDER_IMAGE_FILE');
			}
		}

		console.log('✅ Placeholder avatar files created');
	} catch (error) {
		console.error('Error creating placeholder avatars:', error);
	}
}
