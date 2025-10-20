import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, Settings } from 'lucide-react';

const AgentEditor = ({ agent, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    personality: 'friendly and helpful',
    language: 'he',
    avatar: {
      baseAvatarId: '',
      customAvatar: '',
      avatarType: 'gallery'
    },
    salesConfig: {
      enabled: false,
      products: [],
      salesScript: '',
      qualifyingQuestions: []
    },
    leadCapture: {
      enabled: true,
      requiredFields: ['name', 'email'],
      customFields: []
    },
    appointmentConfig: {
      enabled: false,
      duration: 30,
      timezone: 'Asia/Jerusalem',
      workingHours: {
        monday: { start: '09:00', end: '17:00', enabled: true },
        tuesday: { start: '09:00', end: '17:00', enabled: true },
        wednesday: { start: '09:00', end: '17:00', enabled: true },
        thursday: { start: '09:00', end: '17:00', enabled: true },
        friday: { start: '09:00', end: '15:00', enabled: true },
        saturday: { start: '10:00', end: '14:00', enabled: false },
        sunday: { start: '10:00', end: '14:00', enabled: false }
      }
    },
    widgetConfig: {
      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      },
      position: 'bottom-right',
      size: 'medium'
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (agent) {
      setFormData(prev => ({
        ...prev,
        ...agent
      }));
    }
  }, [agent]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleNestedInputChange = (parent, child, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const url = agent ? `/api/agents/${agent._id}` : '/api/agents';
      const method = agent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert(agent ? 'Agent updated successfully!' : 'Agent created successfully!');
        onBack();
      } else {
        throw new Error(data.error || 'Failed to save agent');
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Failed to save agent. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'avatar', label: 'Avatar' },
    { id: 'personality', label: 'Personality' },
    { id: 'sales', label: 'Sales' },
    { id: 'leads', label: 'Lead Capture' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'widget', label: 'Widget' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter agent name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input-field"
                placeholder="Describe what this agent does..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="he">Hebrew</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>
        );
        
      case 'avatar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleNestedInputChange('avatar', 'avatarType', 'gallery')}
                  className={`p-3 border-2 rounded-lg text-center ${
                    formData.avatar.avatarType === 'gallery'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👥</div>
                  <div className="text-sm font-medium">Gallery</div>
                </button>
                <button
                  onClick={() => handleNestedInputChange('avatar', 'avatarType', 'custom')}
                  className={`p-3 border-2 rounded-lg text-center ${
                    formData.avatar.avatarType === 'custom'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🎨</div>
                  <div className="text-sm font-medium">Custom</div>
                </button>
                <button
                  onClick={() => handleNestedInputChange('avatar', 'avatarType', 'generated')}
                  className={`p-3 border-2 rounded-lg text-center ${
                    formData.avatar.avatarType === 'generated'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">✨</div>
                  <div className="text-sm font-medium">Generated</div>
                </button>
              </div>
            </div>
            
            {formData.avatar.avatarType === 'gallery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Base Avatar
                </label>
                <select
                  name="avatar.baseAvatarId"
                  value={formData.avatar.baseAvatarId}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Choose an avatar...</option>
                  <option value="avatar-001">Professional Woman</option>
                  <option value="avatar-002">Friendly Man</option>
                  <option value="avatar-003">Young Professional</option>
                  {/* Add more options */}
                </select>
              </div>
            )}
          </div>
        );
        
      case 'personality':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personality Description
              </label>
              <textarea
                name="personality"
                value={formData.personality}
                onChange={handleInputChange}
                rows={4}
                className="input-field"
                placeholder="Describe the agent's personality and communication style..."
              />
            </div>
          </div>
        );
        
      case 'sales':
        return (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="salesConfig.enabled"
                checked={formData.salesConfig.enabled}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Sales Features
              </label>
            </div>
            
            {formData.salesConfig.enabled && (
              <div className="space-y-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales Script
                  </label>
                  <textarea
                    name="salesConfig.salesScript"
                    value={formData.salesConfig.salesScript}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field"
                    placeholder="Enter the sales script or conversation flow..."
                  />
                </div>
              </div>
            )}
          </div>
        );
        
      case 'leads':
        return (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="leadCapture.enabled"
                checked={formData.leadCapture.enabled}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Lead Capture
              </label>
            </div>
            
            {formData.leadCapture.enabled && (
              <div className="space-y-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Fields
                  </label>
                  <div className="space-y-2">
                    {['name', 'email', 'phone', 'company'].map(field => (
                      <label key={field} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.leadCapture.requiredFields.includes(field)}
                          onChange={(e) => {
                            const newFields = e.target.checked
                              ? [...formData.leadCapture.requiredFields, field]
                              : formData.leadCapture.requiredFields.filter(f => f !== field);
                            handleNestedInputChange('leadCapture', 'requiredFields', newFields);
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm capitalize">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'appointments':
        return (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="appointmentConfig.enabled"
                checked={formData.appointmentConfig.enabled}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Enable Appointment Scheduling
              </label>
            </div>
            
            {formData.appointmentConfig.enabled && (
              <div className="space-y-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="appointmentConfig.duration"
                    value={formData.appointmentConfig.duration}
                    onChange={handleInputChange}
                    className="input-field"
                    min="15"
                    max="120"
                  />
                </div>
              </div>
            )}
          </div>
        );
        
      case 'widget':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Widget Position
              </label>
              <select
                name="widgetConfig.position"
                value={formData.widgetConfig.position}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Widget Size
              </label>
              <select
                name="widgetConfig.size"
                value={formData.widgetConfig.size}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <input
                type="color"
                name="widgetConfig.theme.primaryColor"
                value={formData.widgetConfig.theme.primaryColor}
                onChange={handleInputChange}
                className="w-12 h-8 border border-gray-300 rounded"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {agent ? 'Edit Agent' : 'Create New Agent'}
          </h3>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !formData.name}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex space-x-8 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AgentEditor;
