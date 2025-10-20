import express from 'express';
import Appointment from '../models/Appointment.js';
import {
	sendAppointmentConfirmation,
	sendAppointmentReminder,
} from '../services/emailService.js';

const router = express.Router();

/**
 * @route POST /api/appointments
 * @desc Schedule new appointment
 * @access Public (for widget)
 */
router.post('/', async (req, res) => {
	try {
		const {
			agentId,
			leadId,
			scheduledTime,
			duration = 30,
			meetingType = 'video',
		} = req.body;

		if (!agentId || !leadId || !scheduledTime) {
			return res.status(400).json({
				success: false,
				error: 'AgentId, leadId, and scheduledTime are required',
			});
		}

		// Check for conflicts
		const existingAppointment = await Appointment.findOne({
			agentId,
			scheduledTime: {
				$gte: new Date(scheduledTime),
				$lt: new Date(new Date(scheduledTime).getTime() + duration * 60000),
			},
			status: { $in: ['scheduled', 'confirmed'] },
		});

		if (existingAppointment) {
			return res.status(409).json({
				success: false,
				error: 'Time slot is already booked',
			});
		}

		const appointment = new Appointment({
			agentId,
			leadId,
			scheduledTime: new Date(scheduledTime),
			duration,
			meetingType,
		});

		await appointment.save();

		// Send confirmation email
		try {
			await sendAppointmentConfirmation(appointment);
		} catch (emailError) {
			console.error('Failed to send confirmation email:', emailError);
			// Don't fail the appointment creation if email fails
		}

		res.status(201).json({
			success: true,
			appointment: {
				id: appointment._id,
				scheduledTime: appointment.scheduledTime,
				duration: appointment.duration,
				status: appointment.status,
			},
		});
	} catch (error) {
		console.error('Error creating appointment:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to create appointment',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route GET /api/appointments
 * @desc Get appointments for an agent
 * @access Private
 */
router.get('/', async (req, res) => {
	try {
		const {
			agentId,
			status,
			startDate,
			endDate,
			page = 1,
			limit = 20,
		} = req.query;

		if (!agentId) {
			return res.status(400).json({
				success: false,
				error: 'AgentId is required',
			});
		}

		const query = { agentId };

		if (status) {
			query.status = status;
		}

		if (startDate || endDate) {
			query.scheduledTime = {};
			if (startDate) {
				query.scheduledTime.$gte = new Date(startDate);
			}
			if (endDate) {
				query.scheduledTime.$lte = new Date(endDate);
			}
		}

		const appointments = await Appointment.find(query)
			.sort({ scheduledTime: 1 })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.populate('leadId', 'contactInfo')
			.populate('agentId', 'name');

		const total = await Appointment.countDocuments(query);

		res.json({
			success: true,
			appointments,
			pagination: {
				current: parseInt(page),
				pages: Math.ceil(total / limit),
				total,
			},
		});
	} catch (error) {
		console.error('Error fetching appointments:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch appointments',
		});
	}
});

/**
 * @route GET /api/appointments/:appointmentId
 * @desc Get specific appointment
 * @access Private
 */
router.get('/:appointmentId', async (req, res) => {
	try {
		const { appointmentId } = req.params;

		const appointment = await Appointment.findById(appointmentId)
			.populate('leadId', 'contactInfo')
			.populate('agentId', 'name');

		if (!appointment) {
			return res.status(404).json({
				success: false,
				error: 'Appointment not found',
			});
		}

		res.json({
			success: true,
			appointment,
		});
	} catch (error) {
		console.error('Error fetching appointment:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch appointment',
		});
	}
});

/**
 * @route PUT /api/appointments/:appointmentId
 * @desc Update appointment
 * @access Private
 */
router.put('/:appointmentId', async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const updateData = req.body;

		const appointment = await Appointment.findByIdAndUpdate(
			appointmentId,
			updateData,
			{ new: true, runValidators: true }
		).populate('leadId', 'contactInfo');

		if (!appointment) {
			return res.status(404).json({
				success: false,
				error: 'Appointment not found',
			});
		}

		res.json({
			success: true,
			appointment,
		});
	} catch (error) {
		console.error('Error updating appointment:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to update appointment',
			details:
				process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

/**
 * @route DELETE /api/appointments/:appointmentId
 * @desc Cancel appointment
 * @access Private
 */
router.delete('/:appointmentId', async (req, res) => {
	try {
		const { appointmentId } = req.params;

		const appointment = await Appointment.findByIdAndUpdate(
			appointmentId,
			{ status: 'cancelled' },
			{ new: true }
		);

		if (!appointment) {
			return res.status(404).json({
				success: false,
				error: 'Appointment not found',
			});
		}

		res.json({
			success: true,
			message: 'Appointment cancelled successfully',
		});
	} catch (error) {
		console.error('Error cancelling appointment:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to cancel appointment',
		});
	}
});

/**
 * @route GET /api/appointments/agent/:agentId/availability
 * @desc Get available time slots for an agent
 * @access Public (for widget)
 */
router.get('/agent/:agentId/availability', async (req, res) => {
	try {
		const { agentId } = req.params;
		const { date, duration = 30 } = req.query;

		if (!date) {
			return res.status(400).json({
				success: false,
				error: 'Date is required',
			});
		}

		const startDate = new Date(date);
		const endDate = new Date(startDate);
		endDate.setDate(endDate.getDate() + 1);

		// Get existing appointments for the day
		const existingAppointments = await Appointment.find({
			agentId,
			scheduledTime: {
				$gte: startDate,
				$lt: endDate,
			},
			status: { $in: ['scheduled', 'confirmed'] },
		});

		// Generate available slots (simplified - in real app, consider working hours)
		const availableSlots = [];
		const slotDuration = parseInt(duration);

		for (let hour = 9; hour < 17; hour++) {
			for (let minute = 0; minute < 60; minute += slotDuration) {
				const slotTime = new Date(startDate);
				slotTime.setHours(hour, minute, 0, 0);

				// Check if slot conflicts with existing appointments
				const hasConflict = existingAppointments.some((apt) => {
					const aptStart = new Date(apt.scheduledTime);
					const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
					const slotEnd = new Date(slotTime.getTime() + slotDuration * 60000);

					return slotTime < aptEnd && slotEnd > aptStart;
				});

				if (!hasConflict && slotTime > new Date()) {
					availableSlots.push(slotTime.toISOString());
				}
			}
		}

		res.json({
			success: true,
			availableSlots,
		});
	} catch (error) {
		console.error('Error fetching availability:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch availability',
		});
	}
});

export default router;
