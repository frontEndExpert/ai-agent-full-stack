import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { useSocket } from '../contexts/SocketContext';

// 3D Avatar Component
function AvatarModel({ modelUrl, isAnimating, animationType }) {
  const meshRef = useRef();
  const { scene } = useGLTF(modelUrl);
  
  useFrame((state) => {
    if (meshRef.current && isAnimating) {
      // Simple animation based on type
      switch (animationType) {
        case 'talking':
          // Lip sync animation
          meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 10) * 0.1;
          break;
        case 'listening':
          // Nodding animation
          meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
          break;
        case 'thinking':
          // Slight rotation
          meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
          break;
        default:
          // Idle animation
          meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      }
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
  onLoad,
  onError 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const socket = useSocket();

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

  // Listen for lip sync events
  useEffect(() => {
    if (!socket) return;

    const handleLipSyncStart = (data) => {
      console.log('Lip sync started:', data);
    };

    const handleLipSyncResult = (data) => {
      console.log('Lip sync result:', data);
      // Play the generated video
      if (data.videoUrl) {
        // This would integrate with a video player
        console.log('Playing lip sync video:', data.videoUrl);
      }
    };

    socket.on('lipsync-result', handleLipSyncResult);
    socket.on('lipsync-stream-chunk', handleLipSyncStart);

    return () => {
      socket.off('lipsync-result', handleLipSyncResult);
      socket.off('lipsync-stream-chunk', handleLipSyncStart);
    };
  }, [socket]);

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
          isAnimating={isAnimating}
          animationType={animationType}
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
