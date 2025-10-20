import nodemailer from 'nodemailer';

// Create email transporter
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || 'smtp.gmail.com',
	port: process.env.SMTP_PORT || 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmation(appointment) {
	try {
		const { leadId, scheduledTime, duration, meetingType } = appointment;

		// Get lead information (this would typically fetch from database)
		const leadInfo = {
			name: 'Customer Name', // Would fetch from leadId
			email: 'customer@example.com', // Would fetch from leadId
		};

		const mailOptions = {
			from: process.env.SMTP_USER,
			to: leadInfo.email,
			subject: 'Appointment Confirmation - AI Agent',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Appointment Confirmation</h2>
          
          <p>Dear ${leadInfo.name},</p>
          
          <p>Your appointment has been confirmed for:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date & Time:</strong> ${new Date(
							scheduledTime
						).toLocaleString('he-IL')}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
            <p><strong>Meeting Type:</strong> ${meetingType}</p>
          </div>
          
          ${
						meetingType === 'video'
							? `
            <p><strong>Meeting Link:</strong> <a href="${
							appointment.meetingLink || '#'
						}">Join Meeting</a></p>
          `
							: ''
					}
          
          <p>If you need to reschedule or cancel, please contact us at your earliest convenience.</p>
          
          <p>Best regards,<br>AI Agent Team</p>
        </div>
      `,
		};

		const result = await transporter.sendMail(mailOptions);
		console.log('Appointment confirmation email sent:', result.messageId);

		return { success: true, messageId: result.messageId };
	} catch (error) {
		console.error('Error sending appointment confirmation:', error);
		throw new Error('Failed to send appointment confirmation');
	}
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminder(appointment) {
	try {
		const { leadId, scheduledTime, duration } = appointment;

		// Get lead information (this would typically fetch from database)
		const leadInfo = {
			name: 'Customer Name', // Would fetch from leadId
			email: 'customer@example.com', // Would fetch from leadId
		};

		const mailOptions = {
			from: process.env.SMTP_USER,
			to: leadInfo.email,
			subject: 'Appointment Reminder - AI Agent',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Appointment Reminder</h2>
          
          <p>Dear ${leadInfo.name},</p>
          
          <p>This is a friendly reminder about your upcoming appointment:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date & Time:</strong> ${new Date(
							scheduledTime
						).toLocaleString('he-IL')}</p>
            <p><strong>Duration:</strong> ${duration} minutes</p>
          </div>
          
          <p>We look forward to speaking with you!</p>
          
          <p>Best regards,<br>AI Agent Team</p>
        </div>
      `,
		};

		const result = await transporter.sendMail(mailOptions);
		console.log('Appointment reminder email sent:', result.messageId);

		return { success: true, messageId: result.messageId };
	} catch (error) {
		console.error('Error sending appointment reminder:', error);
		throw new Error('Failed to send appointment reminder');
	}
}

/**
 * Send lead notification email to admin
 */
export async function sendLeadNotification(lead) {
	try {
		const { contactInfo, agentId } = lead;

		const mailOptions = {
			from: process.env.SMTP_USER,
			to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
			subject: 'New Lead Captured - AI Agent',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Lead Captured</h2>
          
          <p>A new lead has been captured through the AI Agent:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${contactInfo.name}</p>
            <p><strong>Email:</strong> ${contactInfo.email}</p>
            ${
							contactInfo.phone
								? `<p><strong>Phone:</strong> ${contactInfo.phone}</p>`
								: ''
						}
            ${
							contactInfo.company
								? `<p><strong>Company:</strong> ${contactInfo.company}</p>`
								: ''
						}
            <p><strong>Agent ID:</strong> ${agentId}</p>
            <p><strong>Captured:</strong> ${new Date().toLocaleString(
							'he-IL'
						)}</p>
          </div>
          
          <p>Please follow up with this lead as soon as possible.</p>
        </div>
      `,
		};

		const result = await transporter.sendMail(mailOptions);
		console.log('Lead notification email sent:', result.messageId);

		return { success: true, messageId: result.messageId };
	} catch (error) {
		console.error('Error sending lead notification:', error);
		throw new Error('Failed to send lead notification');
	}
}

/**
 * Send welcome email to new lead
 */
export async function sendWelcomeEmail(lead) {
	try {
		const { contactInfo } = lead;

		const mailOptions = {
			from: process.env.SMTP_USER,
			to: contactInfo.email,
			subject: 'Welcome! - AI Agent',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome!</h2>
          
          <p>Dear ${contactInfo.name},</p>
          
          <p>Thank you for your interest! We've received your information and will be in touch soon.</p>
          
          <p>In the meantime, feel free to explore our website or contact us if you have any questions.</p>
          
          <p>Best regards,<br>AI Agent Team</p>
        </div>
      `,
		};

		const result = await transporter.sendMail(mailOptions);
		console.log('Welcome email sent:', result.messageId);

		return { success: true, messageId: result.messageId };
	} catch (error) {
		console.error('Error sending welcome email:', error);
		throw new Error('Failed to send welcome email');
	}
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration() {
	try {
		await transporter.verify();
		console.log('✅ Email configuration is valid');
		return { success: true };
	} catch (error) {
		console.error('❌ Email configuration error:', error);
		return { success: false, error: error.message };
	}
}
