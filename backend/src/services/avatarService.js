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

		// Validate that we have a result
		if (!result || !result.avatarId) {
			throw new Error('Failed to generate avatar - no result returned');
		}

		// Save avatar info to database (if agentId provided)
		if (agentId) {
			await saveAvatarToAgent(agentId, result);
		}

		return result;
	} catch (error) {
		console.error('Error generating avatar:', error);
		console.error('Error stack:', error.stack);
		// Preserve the original error message if available
		const errorMessage = error.message || 'Failed to generate avatar';
		throw new Error(errorMessage);
	}
}

/**
 * Generate avatar from photo using face reconstruction
 */
async function generateFromPhoto(photo, baseAvatarId, description) {
	try {
		console.log('Generating avatar from photo:', {
			filename: photo?.filename,
			originalname: photo?.originalname,
			path: photo?.path,
			baseAvatarId,
			description,
		});

		// Get Python service URL from environment
		const pythonServiceUrl = process.env.PYTHON_SERVICES_URL || 'http://localhost:8000';
		
		// Construct the photo URL that the Python service can access
		// The file is in uploads/ directory which is served as /uploads/
		const baseUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL?.replace(':3000', ':5000') || 'http://localhost:5000';
		const photoUrl = `${baseUrl}/uploads/${photo.filename}`;
		
		console.log('Calling Python service for avatar generation:', {
			pythonServiceUrl,
			photoUrl,
		});

		try {
			// Try to call the Python service
			const pythonResponse = await axios.post(
				`${pythonServiceUrl}/generate-avatar`,
				{
					photo_url: photoUrl,
					base_avatar_id: baseAvatarId,
					description: description,
				},
				{
					timeout: 60000, // 60 second timeout for avatar generation
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (pythonResponse.data && pythonResponse.data.success) {
				console.log('Python service returned avatar:', pythonResponse.data);
				
				// Use the Duck model as fallback if the Python service returns placeholder
				const modelUrl = pythonResponse.data.model_url && 
					!pythonResponse.data.model_url.includes('placeholder') 
					? pythonResponse.data.model_url 
					: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
				
				return {
					avatarId: pythonResponse.data.avatar_id || `photo_${Date.now()}`,
					modelUrl: modelUrl,
					thumbnail: pythonResponse.data.thumbnail_url || '/public/avatars/placeholder_thumb.jpg',
					type: 'photo-generated',
				};
			}
		} catch (pythonError) {
			console.warn('Python service call failed, using placeholder:', pythonError.message);
			// Fall through to placeholder response
		}

		// Fallback to placeholder if Python service is unavailable or returns error
		console.log('Using placeholder avatar (Python service unavailable or returned error)');
		const placeholderModelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
		
		return {
			avatarId: `photo_${Date.now()}`,
			modelUrl: placeholderModelUrl,
			thumbnail: '/public/avatars/placeholder_thumb.jpg',
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
		console.log('Generating avatar from description:', {
			description,
			baseAvatarId,
		});

		// Note: In a real implementation, this would call a Python text-to-avatar service
		// Return placeholder response (Python service disabled)
		// Use a working GLB model URL as placeholder (Duck model from Khronos)
		const placeholderModelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
		
		const response = {
			data: {
				avatar_id: `text_${Date.now()}`,
				model_url: placeholderModelUrl,
				thumbnail_url: '/public/avatars/placeholder_thumb.jpg',
			},
		};

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
		if (!agentId) {
			console.log('No agentId provided, skipping avatar save');
			return;
		}

		const Agent = (await import('../models/Agent.js')).default;
		
		// Update agent with avatar data
		const updateData = {
			avatar: {
				baseAvatarId: avatarData.avatarId || null,
				avatarType: avatarData.type === 'photo-generated' ? 'custom' : 
				           avatarData.type === 'text-generated' ? 'generated' : 'gallery',
				modelUrl: avatarData.modelUrl || null,
				customAvatar: avatarData.type === 'photo-generated' || avatarData.type === 'text-generated' 
					? avatarData.modelUrl : ''
			}
		};
		
		const result = await Agent.findByIdAndUpdate(agentId, updateData, { new: true });
		if (result) {
			console.log(`Avatar saved for agent ${agentId}`);
		} else {
			console.warn(`Agent ${agentId} not found, could not save avatar`);
		}
	} catch (error) {
		console.error('Error saving avatar to agent:', error);
		console.error('Error details:', error.message);
		// Don't throw error as this is not critical - avatar generation can succeed even if save fails
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
