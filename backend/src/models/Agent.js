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
			customAvatar: {
				type: String, // URL to custom avatar file
				default: null,
			},
			avatarType: {
				type: String,
				enum: ['gallery', 'custom', 'generated'],
				default: 'gallery',
			},
		},
		personality: {
			type: String,
			default: 'friendly and helpful',
		},
		language: {
			type: String,
			default: 'he',
			enum: ['he', 'en', 'ar'],
		},
		knowledgeBase: {
			documents: [
				{
					name: String,
					url: String,
					uploadedAt: { type: Date, default: Date.now },
				},
			],
			vectorCollectionId: String,
		},
		salesConfig: {
			enabled: { type: Boolean, default: false },
			products: [
				{
					name: String,
					description: String,
					price: Number,
					category: String,
				},
			],
			salesScript: String,
			qualifyingQuestions: [String],
		},
		leadCapture: {
			enabled: { type: Boolean, default: true },
			requiredFields: [
				{
					type: String,
					enum: ['name', 'email', 'phone', 'company'],
				},
			],
			customFields: [
				{
					name: String,
					type: { type: String, enum: ['text', 'email', 'phone', 'select'] },
					required: Boolean,
					options: [String], // for select type
				},
			],
		},
		appointmentConfig: {
			enabled: { type: Boolean, default: false },
			duration: { type: Number, default: 30 }, // minutes
			timezone: { type: String, default: 'Asia/Jerusalem' },
			workingHours: {
				monday: { start: String, end: String, enabled: Boolean },
				tuesday: { start: String, end: String, enabled: Boolean },
				wednesday: { start: String, end: String, enabled: Boolean },
				thursday: { start: String, end: String, enabled: Boolean },
				friday: { start: String, end: String, enabled: Boolean },
				saturday: { start: String, end: String, enabled: Boolean },
				sunday: { start: String, end: String, enabled: Boolean },
			},
		},
		widgetConfig: {
			theme: {
				primaryColor: { type: String, default: '#3b82f6' },
				backgroundColor: { type: String, default: '#ffffff' },
				textColor: { type: String, default: '#000000' },
			},
			position: {
				type: String,
				enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
				default: 'bottom-right',
			},
			size: {
				type: String,
				enum: ['small', 'medium', 'large'],
				default: 'medium',
			},
		},
		analytics: {
			totalConversations: { type: Number, default: 0 },
			totalLeads: { type: Number, default: 0 },
			totalAppointments: { type: Number, default: 0 },
			conversionRate: { type: Number, default: 0 },
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
