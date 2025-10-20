import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, Check } from 'lucide-react';

const AppointmentScheduler = ({ agentId, onSubmit, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    meetingType: 'video',
    notes: ''
  });

  useEffect(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, agentId]);

  const fetchAvailableSlots = async (date) => {
    if (!agentId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/agent/${agentId}/availability?date=${date}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.availableSlots);
      } else {
        console.error('Failed to fetch available slots:', data.error);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime(''); // Reset selected time when date changes
  };

  const handleTimeSelect = (timeSlot) => {
    setSelectedTime(timeSlot);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      alert('Please select a date and time');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First, create a lead if we don't have contact info
      let leadId = null;
      if (formData.name && formData.email) {
        const leadResponse = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: agentId,
            contactInfo: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            }
          })
        });
        
        const leadData = await leadResponse.json();
        if (leadData.success) {
          leadId = leadData.lead.id;
        }
      }
      
      // Schedule the appointment
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentId,
          leadId: leadId,
          scheduledTime: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
          duration: 30,
          meetingType: formData.meetingType
        })
      });
      
      const appointmentData = await appointmentResponse.json();
      
      if (appointmentData.success) {
        onSubmit(appointmentData.appointment);
      } else {
        throw new Error(appointmentData.error || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      alert('Failed to schedule appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeSlot = (timeSlot) => {
    const date = new Date(timeSlot);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-gray-900">Schedule Appointment</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Available Times
            </label>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="loading-spinner"></div>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTimeSelect(slot)}
                    className={`p-2 text-sm rounded border transition-colors ${
                      selectedTime === slot
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {formatTimeSlot(slot)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No available slots for this date</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Contact Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="meetingType"
                  value="video"
                  checked={formData.meetingType === 'video'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Video Call
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="meetingType"
                  value="phone"
                  checked={formData.meetingType === 'phone'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Phone Call
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="input-field"
              placeholder="Any specific topics you'd like to discuss?"
            />
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedDate || !selectedTime || isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner w-4 h-4"></div>
              <span>Scheduling...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Schedule</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AppointmentScheduler;
