import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAvatar, getAvatarGallery } from '../services/avatarService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../../uploads/'));
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
		);
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed!'), false);
		}
	},
});

/**
 * @route GET /api/avatars/gallery
 * @desc Get list of available base avatars
 * @access Public
 */
router.get('/gallery', async (req, res) => {
	try {
		const avatars = await getAvatarGallery();
		res.json({ success: true, avatars });
	} catch (error) {
		console.error('Error fetching avatar gallery:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch avatar gallery',
		});
	}
});

/**
 * @route POST /api/avatars/generate
 * @desc Generate avatar from photo, text description, or both
 * @access Public
 */
router.post('/generate', upload.single('photo'), async (req, res) => {
	try {
		const { baseAvatarId, description, agentId } = req.body;
		const photo = req.file;

		// Validate input
		if (!baseAvatarId && !description && !photo) {
			return res.status(400).json({
				success: false,
				error:
					'At least one of baseAvatarId, description, or photo must be provided',
			});
		}

		const result = await generateAvatar({
			baseAvatarId,
			description,
			photo,
			agentId,
		});

		res.json({ success: true, ...result });
	} catch (error) {
		console.error('Error generating avatar:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to generate avatar',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route GET /api/avatars/:avatarId
 * @desc Get avatar details by ID
 * @access Public
 */
router.get('/:avatarId', async (req, res) => {
	try {
		const { avatarId } = req.params;

		// This would typically fetch from database
		// For now, return basic info
		res.json({
			success: true,
			avatar: {
				id: avatarId,
				url: `/public/avatars/${avatarId}.glb`,
				thumbnail: `/public/avatars/${avatarId}_thumb.jpg`,
			},
		});
	} catch (error) {
		console.error('Error fetching avatar:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch avatar',
		});
	}
});

export default router;
