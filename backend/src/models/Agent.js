import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
			default: '',
		},
		avatar: {
			baseAvatarId: {
				type: String,
				default: 'avatar-001',
			},
			avatarType: {
				type: String,
				enum: ['gallery', 'custom', 'generated'],
				default: 'gallery',
			},
			modelUrl: {
				type: String,
				default:
					'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
			},
			customAvatar: {
				type: String,
				default: '',
			},
		},
		personality: {
			type: String,
			default: 'friendly and helpful',
		},
		language: {
			type: String,
			default: 'en',
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		createdBy: {
			type: String,
			required: true,
			default: 'default-user',
		},
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
agentSchema.index({ createdBy: 1, isActive: 1 });
agentSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Agent', agentSchema);
