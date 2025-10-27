import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import AvatarViewer from './AvatarViewer';
import ChatInterface from './ChatInterface';
import LeadForm from './LeadForm';
import AppointmentScheduler from './AppointmentScheduler';

const Widget = ({ agentId, onClose }) => {
  const [agent, setAgent] = useState(null);
  const [currentView, setCurrentView] = useState('chat');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showAppointmentScheduler, setShowAppointmentScheduler] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId);
    }
  }, [agentId]);

  const fetchAgent = async (id) => {
    try {
      const API_BASE_URL = 'https://ai-agent-backend-production-fb83.up.railway.app/api';
      const response = await fetch(`${API_BASE_URL}/agents/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setAgent(data.agent);
      } else {
        console.error('Failed to fetch agent:', data.error);
      }
    } catch (error) {
      console.error('Error fetching agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadCapture = () => {
    setShowLeadForm(true);
    setCurrentView('lead-form');
  };

  const handleAppointmentRequest = () => {
    setShowAppointmentScheduler(true);
    setCurrentView('appointment');
  };

  const handleLeadSubmit = (leadData) => {
    console.log('Lead submitted:', leadData);
    setShowLeadForm(false);
    setCurrentView('chat');
    // Show success message
    alert('Thank you! We will contact you soon.');
  };

  const handleAppointmentSubmit = (appointmentData) => {
    console.log('Appointment scheduled:', appointmentData);
    setShowAppointmentScheduler(false);
    setCurrentView('chat');
    // Show success message
    alert('Appointment scheduled successfully!');
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (loading) {
    return (
      <div className="widget-container">
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex items-center justify-center">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="widget-container">
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">⚠️</div>
            <p>Agent not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      {/* Widget Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="widget-button"
        title={isMinimized ? 'Open chat' : 'Close chat'}
      >
        {isMinimized ? '💬' : '✕'}
      </button>

      {/* Widget Content */}
      {!isMinimized && (
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {agent.avatar?.customAvatar ? (
                  <img 
                    src={agent.avatar.customAvatar} 
                    alt={agent.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {agent.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold">{agent.name}</h3>
                <p className="text-xs opacity-90">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMinimize}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Avatar Section */}
            <div className="w-1/3 bg-gray-50 border-r border-gray-200">
              <AvatarViewer
                modelUrl={agent.avatar?.customAvatar || '/public/avatars/default.glb'}
                isAnimating={currentView === 'chat'}
                animationType="talking"
              />
            </div>

            {/* Chat Section */}
            <div className="w-2/3">
              {currentView === 'chat' && (
                <ChatInterface
                  agentId={agentId}
                  onLeadCapture={handleLeadCapture}
                  onAppointmentRequest={handleAppointmentRequest}
                />
              )}
              
              {currentView === 'lead-form' && (
                <LeadForm
                  agentId={agentId}
                  onSubmit={handleLeadSubmit}
                  onCancel={() => setCurrentView('chat')}
                />
              )}
              
              {currentView === 'appointment' && (
                <AppointmentScheduler
                  agentId={agentId}
                  onSubmit={handleAppointmentSubmit}
                  onCancel={() => setCurrentView('chat')}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center">
            Powered by AI Agent
          </div>
        </div>
      )}
    </div>
  );
};

export default Widget;
