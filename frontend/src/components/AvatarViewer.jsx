import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { useSocket } from '../contexts/SocketContext';

// 3D Avatar Component
function AvatarModel({ modelUrl, isAnimating, animationType, isSpeaking }) {
  const meshRef = useRef();
  const { scene } = useGLTF(modelUrl);
  const mouthOpenRef = useRef(0);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Always apply some subtle idle animation
    const idleRotation = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    
    switch (animationType) {
      case 'talking':
        if (isSpeaking) {
          // Enhanced lip sync animation - mouth movement simulation
          const talkingSpeed = 8; // Speed of mouth movement
          mouthOpenRef.current = Math.abs(Math.sin(state.clock.elapsedTime * talkingSpeed));
          
          // Rotate head slightly while talking
          meshRef.current.rotation.y = idleRotation + Math.sin(state.clock.elapsedTime * 3) * 0.05;
          
          // Slight head nod while talking
          meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.03;
          
          // Scale mouth area (if we had access to mesh parts, we'd animate the mouth directly)
          // For now, we use a subtle scale on the whole model to simulate mouth movement
          const mouthScale = 1 + mouthOpenRef.current * 0.02;
          meshRef.current.scale.y = mouthScale;
        } else {
          meshRef.current.rotation.y = idleRotation;
          meshRef.current.rotation.x = 0;
          meshRef.current.scale.y = 1;
        }
        break;
      case 'listening':
        // Nodding animation
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.rotation.y = idleRotation;
        meshRef.current.scale.y = 1;
        break;
      case 'thinking':
        // Slight rotation and head tilt
        meshRef.current.rotation.y = idleRotation + state.clock.elapsedTime * 0.3;
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1) * 0.02;
        meshRef.current.scale.y = 1;
        break;
      default:
        // Idle animation - subtle breathing
        meshRef.current.rotation.y = idleRotation;
        meshRef.current.rotation.x = 0;
        meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01; // Subtle breathing
    }
  });

  return (
    <primitive 
      ref={meshRef} 
      object={scene} 
      scale={[1, 1, 1]} 
      position={[0, -1, 0]}
    />
  );
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="loading-spinner"></div>
    </div>
  );
}

// Error Component
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-red-500 text-lg mb-2">⚠️</div>
        <p className="text-gray-600 mb-4">{message}</p>
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );
}

const AvatarViewer = ({ 
  modelUrl, 
  isAnimating = false, 
  animationType = 'idle',
  agentId,
  onLoad,
  onError 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [currentAnimationType, setCurrentAnimationType] = useState(animationType);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const socket = useSocket();
  const animationRef = useRef(null);

  useEffect(() => {
    if (modelUrl) {
      setLoading(true);
      setError(null);
    }
  }, [modelUrl]);

  const handleModelLoad = () => {
    setLoading(false);
    setIsModelLoaded(true);
    if (onLoad) onLoad();
  };

  const handleModelError = (error) => {
    setLoading(false);
    setError(error.message || 'Failed to load 3D model');
    if (onError) onError(error);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Force reload by changing the key
    window.location.reload();
  };

  // Update animation type when prop changes
  useEffect(() => {
    setCurrentAnimationType(animationType);
  }, [animationType]);

  // Listen for lip sync events and conversation responses
  useEffect(() => {
    if (!socket) return;

    const handleLipSyncStart = (data) => {
      console.log('Lip sync started:', data);
      setIsSpeaking(true);
      setCurrentAnimationType('talking');
      
      // If we have video URL, we could play it here
      if (data.videoUrl) {
        console.log('Playing lip sync video:', data.videoUrl);
      }
    };

    const handleLipSyncResult = (data) => {
      console.log('Lip sync result:', data);
      setIsSpeaking(true);
      setCurrentAnimationType('talking');
      
      // Play the generated video if available
      if (data.videoUrl) {
        console.log('Playing lip sync video:', data.videoUrl);
        // Set timeout to stop animation after duration
        if (data.duration) {
          setTimeout(() => {
            setIsSpeaking(false);
            setCurrentAnimationType('idle');
          }, data.duration * 1000);
        }
      }
    };

    const handleConversationResponse = (data) => {
      // When agent responds, trigger talking animation
      if (data.text) {
        setIsSpeaking(true);
        setCurrentAnimationType('talking');
        
        // Estimate duration based on text length (rough estimate: 150 words per minute)
        const wordCount = data.text.split(/\s+/).length;
        const estimatedDuration = (wordCount / 150) * 60; // in seconds
        const minDuration = 1; // minimum 1 second
        const maxDuration = 10; // maximum 10 seconds
        const duration = Math.max(minDuration, Math.min(maxDuration, estimatedDuration));
        
        setTimeout(() => {
          setIsSpeaking(false);
          setCurrentAnimationType('idle');
        }, duration * 1000);
      }
    };

    const handleAgentTyping = () => {
      setCurrentAnimationType('thinking');
    };

    const handleAgentStopTyping = () => {
      if (!isSpeaking) {
        setCurrentAnimationType('idle');
      }
    };

    socket.on('lipsync-result', handleLipSyncResult);
    socket.on('lipsync-stream-chunk', handleLipSyncStart);
    socket.on('conversation-response', handleConversationResponse);
    socket.on('agent-typing', handleAgentTyping);
    socket.on('agent-stop-typing', handleAgentStopTyping);

    return () => {
      socket.off('lipsync-result', handleLipSyncResult);
      socket.off('lipsync-stream-chunk', handleLipSyncStart);
      socket.off('conversation-response', handleConversationResponse);
      socket.off('agent-typing', handleAgentTyping);
      socket.off('agent-stop-typing', handleAgentStopTyping);
    };
  }, [socket, isSpeaking]);

  if (!modelUrl) {
    return (
      <div className="avatar-container flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">👤</div>
          <p>No avatar selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar-container relative">
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} onRetry={handleRetry} />}
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        onCreated={() => handleModelLoad()}
        onError={handleModelError}
        className="three-canvas"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Environment preset="studio" />
        
        <AvatarModel 
          modelUrl={modelUrl} 
          isAnimating={isAnimating || isSpeaking}
          animationType={currentAnimationType}
          isSpeaking={isSpeaking}
        />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>
      
      {/* Animation Controls */}
      {isModelLoaded && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white bg-opacity-90 rounded-lg p-3 flex justify-center space-x-2">
            <button
              onClick={() => {/* Trigger idle animation */}}
              className={`px-3 py-1 rounded text-xs ${
                animationType === 'idle' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Idle
            </button>
            <button
              onClick={() => {/* Trigger talking animation */}}
              className={`px-3 py-1 rounded text-xs ${
                animationType === 'talking' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Talking
            </button>
            <button
              onClick={() => {/* Trigger listening animation */}}
              className={`px-3 py-1 rounded text-xs ${
                animationType === 'listening' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Listening
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarViewer;
