import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { generateAvatar, getAvatarGallery } from '../services/avatarService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/');
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
	console.log('Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Ensure directory exists
		if (!fs.existsSync(uploadsDir)) {
			fs.mkdirSync(uploadsDir, { recursive: true });
		}
		cb(null, uploadsDir);
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
// Error handler for multer
const handleMulterError = (err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({
				success: false,
				error: 'File too large. Maximum size is 10MB.',
			});
		}
		return res.status(400).json({
			success: false,
			error: `Upload error: ${err.message}`,
		});
	}
	if (err) {
		return res.status(400).json({
			success: false,
			error: err.message || 'File upload error',
		});
	}
	next();
};

router.post('/generate', upload.single('photo'), handleMulterError, async (req, res) => {
	try {
		const { baseAvatarId, description, agentId } = req.body;
		const photo = req.file;

		console.log('Avatar generation request:', {
			hasPhoto: !!photo,
			hasDescription: !!description,
			baseAvatarId,
			agentId,
		});

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
		console.error('Error stack:', error.stack);
		res.status(500).json({
			success: false,
			error: 'Failed to generate avatar',
			message: error.message,
			details:
				process.env.NODE_ENV === 'development' ? error.stack : undefined,
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
