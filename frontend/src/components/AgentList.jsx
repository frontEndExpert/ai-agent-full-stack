import React, { useState } from 'react';
import { Edit, Trash2, Eye, Copy, MoreVertical } from 'lucide-react';

const AgentList = ({ agents, onEdit, onCreate, loading }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showActions, setShowActions] = useState(null);

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          // Refresh the list
          window.location.reload();
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };

  const handleCopyEmbedCode = (agentId) => {
    const embedCode = `<script src="${window.location.origin}/api/widget/${agentId}/script"></script>`;
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No agents yet</h3>
        <p className="mt-2 text-gray-500">Get started by creating your first AI agent.</p>
        <button
          onClick={onCreate}
          className="mt-4 btn-primary"
        >
          Create Agent
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Agents</h2>
        <button
          onClick={onCreate}
          className="btn-primary"
        >
          Create New Agent
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent._id} className="card hover:shadow-md transition-shadow">
            {/* Agent Avatar */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {agent.avatar?.customAvatar ? (
                  <img 
                    src={agent.avatar.customAvatar} 
                    alt={agent.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-semibold text-lg">
                    {agent.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-500">{agent.description || 'No description'}</p>
              </div>
            </div>

            {/* Agent Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {agent.analytics?.totalConversations || 0}
                </div>
                <div className="text-xs text-gray-500">Conversations</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {agent.analytics?.totalLeads || 0}
                </div>
                <div className="text-xs text-gray-500">Leads</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {agent.analytics?.totalAppointments || 0}
                </div>
                <div className="text-xs text-gray-500">Appointments</div>
              </div>
            </div>

            {/* Agent Status */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                agent.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {agent.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500">
                {agent.language?.toUpperCase() || 'HE'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(agent)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Agent"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopyEmbedCode(agent._id)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Copy Embed Code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.open(`/widget/${agent._id}`, '_blank')}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Preview Widget"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowActions(showActions === agent._id ? null : agent._id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showActions === agent._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onEdit(agent);
                          setShowActions(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit Agent
                      </button>
                      <button
                        onClick={() => {
                          handleCopyEmbedCode(agent._id);
                          setShowActions(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Copy Embed Code
                      </button>
                      <button
                        onClick={() => {
                          window.open(`/widget/${agent._id}`, '_blank');
                          setShowActions(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Preview Widget
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          handleDelete(agent._id);
                          setShowActions(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete Agent
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentList;
