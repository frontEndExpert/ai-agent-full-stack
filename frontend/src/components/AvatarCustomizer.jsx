import React, { useState } from 'react';
import { ArrowLeft, Upload, Camera, Wand2 } from 'lucide-react';

const API_BASE_URL = 'https://ai-agent-backend-production-fb83.up.railway.app/api';

const AvatarCustomizer = ({ agentId, onAvatarGenerated, onBack }) => {
  const [customizationType, setCustomizationType] = useState('photo'); // 'photo' or 'text'
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [textDescription, setTextDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedPhoto(file);
      setCustomizationType('photo');
    }
  };

  const handleTextChange = (e) => {
    setTextDescription(e.target.value);
    setCustomizationType('text');
  };

  const handleGenerateAvatar = async () => {
    setIsGenerating(true);
    
    try {
      if (!uploadedPhoto && !textDescription) {
        alert('Please provide either a photo or text description');
        setIsGenerating(false);
        return;
      }

      const formData = new FormData();
      
      if (customizationType === 'photo' && uploadedPhoto) {
        formData.append('photo', uploadedPhoto);
      } else if (customizationType === 'text' && textDescription) {
        formData.append('description', textDescription);
      }
      
      if (agentId) {
        formData.append('agentId', agentId);
      }

      const response = await fetch(`${API_BASE_URL}/avatars/generate`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          // Try to parse as JSON first
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.message || errorText;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          console.error('Error reading error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        setGeneratedAvatar(data);
        // Call the callback with avatar data
        if (onAvatarGenerated) {
          onAvatarGenerated(data);
        }
        alert('Avatar generated successfully!');
      } else {
        throw new Error(data.error || 'Failed to generate avatar');
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
      const errorMessage = error.message || 'Failed to generate avatar. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseAvatar = () => {
    if (generatedAvatar && onAvatarGenerated) {
      onAvatarGenerated(generatedAvatar);
    }
    onBack();
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
          <h3 className="font-semibold text-gray-900">Customize Avatar</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Customization Type Selection */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Choose Customization Method</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCustomizationType('photo')}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  customizationType === 'photo'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Camera className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <h5 className="font-medium">Upload Photo</h5>
                <p className="text-sm text-gray-500">Generate from your photo</p>
              </button>
              
              <button
                onClick={() => setCustomizationType('text')}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  customizationType === 'text'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Wand2 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <h5 className="font-medium">Text Description</h5>
                <p className="text-sm text-gray-500">Describe your ideal avatar</p>
              </button>
            </div>
          </div>

          {/* Photo Upload */}
          {customizationType === 'photo' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Upload Your Photo</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {uploadedPhoto ? (
                  <div>
                    <img
                      src={URL.createObjectURL(uploadedPhoto)}
                      alt="Uploaded photo"
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                    />
                    <p className="text-sm text-gray-600">{uploadedPhoto.name}</p>
                    <button
                      onClick={() => setUploadedPhoto(null)}
                      className="text-red-500 text-sm mt-2"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="btn-primary cursor-pointer"
                    >
                      Choose Photo
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Text Description */}
          {customizationType === 'text' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Describe Your Avatar</h4>
              <textarea
                value={textDescription}
                onChange={handleTextChange}
                rows={4}
                className="input-field"
                placeholder="Describe your ideal avatar... (e.g., 'A professional woman in her 30s with short brown hair, wearing a business suit')"
              />
              <p className="text-sm text-gray-500 mt-1">
                Be specific about age, gender, hair color, clothing, and style preferences.
              </p>
            </div>
          )}

          {/* Generated Avatar Preview */}
          {generatedAvatar && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Generated Avatar</h4>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                {generatedAvatar.thumbnail ? (
                  <img
                    src={generatedAvatar.thumbnail}
                    alt="Generated avatar"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                  />
                ) : generatedAvatar.thumbnail_url ? (
                  <img
                    src={generatedAvatar.thumbnail_url}
                    alt="Generated avatar"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-4xl">👤</div>
                  </div>
                )}
                <p className="text-sm text-gray-600">Your custom avatar is ready!</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={handleGenerateAvatar}
              disabled={isGenerating || (!uploadedPhoto && !textDescription)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {isGenerating ? (
                <>
                  <div className="loading-spinner w-4 h-4"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Avatar</span>
                </>
              )}
            </button>
          </div>
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
        {generatedAvatar && (
          <button
            onClick={handleUseAvatar}
            className="btn-primary"
          >
            Use This Avatar
          </button>
        )}
      </div>
    </div>
  );
};

export default AvatarCustomizer;
