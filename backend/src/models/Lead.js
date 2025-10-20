import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
	{
		agentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Agent',
			required: true,
		},
		contactInfo: {
			name: {
				type: String,
				required: true,
				trim: true,
			},
			email: {
				type: String,
				required: true,
				trim: true,
				lowercase: true,
			},
			phone: {
				type: String,
				trim: true,
			},
			company: {
				type: String,
				trim: true,
			},
		},
		customFields: [
			{
				name: String,
				value: String,
			},
		],
		conversationHistory: [
			{
				timestamp: { type: Date, default: Date.now },
				message: String,
				sender: { type: String, enum: ['user', 'agent'] },
				intent: String,
			},
		],
		status: {
			type: String,
			enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
			default: 'new',
		},
		source: {
			type: String,
			default: 'widget',
		},
		tags: [String],
		notes: String,
		lastContact: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
leadSchema.index({ agentId: 1, status: 1 });
leadSchema.index({ 'contactInfo.email': 1 });
leadSchema.index({ createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
