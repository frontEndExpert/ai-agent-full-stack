import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Wand2 } from 'lucide-react';

const AvatarGallery = ({ onSelectAvatar, onBack }) => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      const response = await fetch('/api/avatars/gallery');
      const data = await response.json();
      
      if (data.success) {
        setAvatars(data.avatars);
      } else {
        console.error('Failed to fetch avatars:', data.error);
      }
    } catch (error) {
      console.error('Error fetching avatars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleConfirmSelection = () => {
    if (selectedAvatar) {
      onSelectAvatar(selectedAvatar);
    }
  };

  const handleCustomizeAvatar = () => {
    // This would open the avatar customizer
    console.log('Open avatar customizer');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
          <h3 className="font-semibold text-gray-900">Choose Avatar</h3>
        </div>
        <button
          onClick={handleCustomizeAvatar}
          className="btn-secondary flex items-center space-x-1"
        >
          <Wand2 className="w-4 h-4" />
          <span>Customize</span>
        </button>
      </div>

      {/* Avatar Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="avatar-grid">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              onClick={() => handleAvatarSelect(avatar)}
              className={`avatar-card ${selectedAvatar?.id === avatar.id ? 'selected' : ''}`}
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {avatar.thumbnail ? (
                  <img
                    src={avatar.thumbnail}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl">👤</div>
                )}
              </div>
              <div className="p-2">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {avatar.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {avatar.description}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400 capitalize">
                    {avatar.gender}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {avatar.style}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmSelection}
          disabled={!selectedAvatar}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Select Avatar
        </button>
      </div>
    </div>
  );
};

export default AvatarGallery;
