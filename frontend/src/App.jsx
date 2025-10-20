import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';

// Components
import AdminDashboard from './components/AdminDashboard';
import AgentEditor from './components/AgentEditor';
import AvatarGallery from './components/AvatarGallery';
import AvatarCustomizer from './components/AvatarCustomizer';
import AvatarViewer from './components/AvatarViewer';
import ChatInterface from './components/ChatInterface';
import LeadForm from './components/LeadForm';
import AppointmentScheduler from './components/AppointmentScheduler';
import Widget from './components/Widget';

// Context
import { SocketProvider } from './contexts/SocketContext';
import { AgentProvider } from './contexts/AgentContext';

function App() {
  const [currentView, setCurrentView] = useState('admin');
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Initialize socket connection
  const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminDashboard onSelectAgent={setSelectedAgent} onViewChange={setCurrentView} />;
      case 'agent-editor':
        return <AgentEditor agent={selectedAgent} onBack={() => setCurrentView('admin')} />;
      case 'avatar-gallery':
        return <AvatarGallery onSelectAvatar={(avatar) => {
          setSelectedAgent(prev => ({ ...prev, avatar }));
          setCurrentView('agent-editor');
        }} onBack={() => setCurrentView('agent-editor')} />;
      case 'avatar-customizer':
        return <AvatarCustomizer onBack={() => setCurrentView('avatar-gallery')} />;
      case 'widget':
        return <Widget agentId={selectedAgent?.id} onClose={() => setCurrentView('admin')} />;
      default:
        return <AdminDashboard onSelectAgent={setSelectedAgent} onViewChange={setCurrentView} />;
    }
  };

  return (
    <SocketProvider value={socket}>
      <AgentProvider value={{ selectedAgent, setSelectedAgent }}>
        <div className="min-h-screen bg-gray-50">
          <Router>
            <Routes>
              <Route path="/" element={renderCurrentView()} />
              <Route path="/admin" element={<AdminDashboard onSelectAgent={setSelectedAgent} onViewChange={setCurrentView} />} />
              <Route path="/agent/:agentId" element={<AgentEditor agent={selectedAgent} onBack={() => setCurrentView('admin')} />} />
              <Route path="/widget/:agentId" element={<Widget agentId={selectedAgent?.id} onClose={() => setCurrentView('admin')} />} />
            </Routes>
          </Router>
        </div>
      </AgentProvider>
    </SocketProvider>
  );
}

export default App;
