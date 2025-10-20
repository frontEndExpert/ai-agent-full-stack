import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
	{
		agentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Agent',
			required: true,
		},
		leadId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Lead',
			required: true,
		},
		scheduledTime: {
			type: Date,
			required: true,
		},
		duration: {
			type: Number,
			default: 30, // minutes
		},
		status: {
			type: String,
			enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
			default: 'scheduled',
		},
		meetingType: {
			type: String,
			enum: ['video', 'phone', 'in-person'],
			default: 'video',
		},
		meetingLink: {
			type: String,
		},
		notes: {
			type: String,
		},
		reminderSent: {
			type: Boolean,
			default: false,
		},
		confirmationSent: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Index for efficient queries
appointmentSchema.index({ agentId: 1, scheduledTime: 1 });
appointmentSchema.index({ leadId: 1 });
appointmentSchema.index({ status: 1, scheduledTime: 1 });

export default mongoose.model('Appointment', appointmentSchema);
