import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

const ChatInterface = ({ agentId, onLeadCapture, onAppointmentRequest }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for agent responses
    const handleAgentResponse = (data) => {
      const newMessage = {
        id: Date.now(),
        text: data.text,
        sender: 'agent',
        timestamp: new Date(),
        intent: data.intent,
        actions: data.actions || []
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      
      // Play TTS audio if available
      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }
      
      // Handle actions
      if (data.actions) {
        handleActions(data.actions);
      }
    };

    const handleTyping = () => {
      setIsTyping(true);
    };

    const handleStopTyping = () => {
      setIsTyping(false);
    };

    socket.on('conversation-response', handleAgentResponse);
    socket.on('agent-typing', handleTyping);
    socket.on('agent-stop-typing', handleStopTyping);

    return () => {
      socket.off('conversation-response', handleAgentResponse);
      socket.off('agent-typing', handleTyping);
      socket.off('agent-stop-typing', handleStopTyping);
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !agentId) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send message to backend
      const API_BASE_URL = 'https://ai-agent-backend-production-fb83.up.railway.app/api';
      const response = await fetch(`${API_BASE_URL}/conversation/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          agentId: agentId,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Message sent successfully');
        
        // Add agent response to messages
        const agentMessage = {
          id: Date.now(),
          text: data.response,
          sender: 'agent',
          timestamp: new Date(),
          intent: data.intent,
          actions: data.actions || []
        };
        
        setMessages(prev => [...prev, agentMessage]);
        setIsTyping(false);
        
        // Handle actions if any
        if (data.actions && data.actions.length > 0) {
          handleActions(data.actions);
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Add error message
      const errorMessage = {
        id: Date.now(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'agent',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    // This would implement voice recording
    setIsRecording(true);
    console.log('Starting voice recording...');
  };

  const stopRecording = () => {
    // This would stop voice recording and process the audio
    setIsRecording(false);
    console.log('Stopping voice recording...');
  };

  const playAudio = (audioUrl) => {
    if (currentAudio) {
      currentAudio.pause();
    }

    const audio = new Audio(audioUrl);
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      console.error('Error playing audio');
      setIsPlaying(false);
    };

    audio.play();
    setCurrentAudio(audio);
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleActions = (actions) => {
    actions.forEach(action => {
      switch (action.type) {
        case 'capture_lead':
          if (onLeadCapture) {
            onLeadCapture();
          }
          break;
        case 'schedule_appointment':
          if (onAppointmentRequest) {
            onAppointmentRequest();
          }
          break;
        default:
          console.log('Unknown action:', action);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`chat-message ${
                message.sender === 'user' ? 'user' : 'agent'
              } ${message.isError ? 'bg-red-100 text-red-800' : ''}`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-message agent">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="input-field pr-10"
              disabled={isTyping}
            />
            {isPlaying && (
              <button
                onClick={stopAudio}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={handleVoiceInput}
            className={`p-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
