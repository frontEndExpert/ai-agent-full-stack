import React, { useState, useEffect } from 'react';
import { Plus, Users, MessageSquare, Calendar, BarChart3, Settings } from 'lucide-react';
import AgentList from './AgentList';
import LeadsDashboard from './LeadsDashboard';
import AppointmentsDashboard from './AppointmentsDashboard';
import Analytics from './Analytics';

const AdminDashboard = ({ onSelectAgent, onViewChange }) => {
  const [activeTab, setActiveTab] = useState('agents');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    onSelectAgent(null);
    onViewChange('agent-editor');
  };

  const handleEditAgent = (agent) => {
    onSelectAgent(agent);
    onViewChange('agent-editor');
  };

  const tabs = [
    { id: 'agents', label: 'Agents', icon: Users, count: agents.length },
    { id: 'leads', label: 'Leads', icon: MessageSquare, count: 0 },
    { id: 'appointments', label: 'Appointments', icon: Calendar, count: 0 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: 0 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'agents':
        return (
          <AgentList 
            agents={agents} 
            onEdit={handleEditAgent}
            onCreate={handleCreateAgent}
            loading={loading}
          />
        );
      case 'leads':
        return <LeadsDashboard />;
      case 'appointments':
        return <AppointmentsDashboard />;
      case 'analytics':
        return <Analytics />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Agent Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateAgent}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Agent</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
