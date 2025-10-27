"""
Minimal Python FastAPI service for Railway deployment
Removes heavy ML dependencies to stay under 4GB limit
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from typing import Optional

app = FastAPI(title="AI Agent Python Services - Minimal", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class TTSRequest(BaseModel):
    text: str
    language: str = "he"
    voice: Optional[str] = None

class AvatarRequest(BaseModel):
    description: str
    base_avatar_id: Optional[str] = None

class PhotoAvatarRequest(BaseModel):
    photo_url: str
    base_avatar_id: Optional[str] = None
    description: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "AI Agent Python Services - Minimal Version",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "tts": "available (minimal)",
            "avatar": "available (minimal)",
            "lipsync": "available (minimal)"
        }
    }

@app.post("/generate-tts")
async def generate_tts(request: TTSRequest):
    """
    Minimal TTS endpoint - returns placeholder response
    In production, this would integrate with actual TTS services
    """
    try:
        # Simulate processing time
        import time
        time.sleep(0.5)
        
        # Return placeholder response
        return {
            "success": True,
            "audio_url": f"/uploads/audio/placeholder_{hash(request.text)}.wav",
            "duration": len(request.text) * 0.1,  # Rough estimate
            "provider": "minimal-tts",
            "message": "TTS service running in minimal mode"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@app.post("/generate-avatar")
async def generate_avatar_from_photo(request: PhotoAvatarRequest):
    """
    Minimal avatar generation from photo - returns placeholder response
    """
    try:
        # Simulate processing time
        import time
        time.sleep(1.0)
        
        return {
            "success": True,
            "avatar_id": f"avatar_{hash(request.photo_url)}",
            "model_url": "/public/avatars/placeholder_avatar.glb",
            "thumbnail_url": "/public/avatars/placeholder_thumb.jpg",
            "message": "Avatar generation service running in minimal mode"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Avatar generation failed: {str(e)}")

@app.post("/generate-avatar-text")
async def generate_avatar_from_text(request: AvatarRequest):
    """
    Minimal avatar generation from text - returns placeholder response
    """
    try:
        # Simulate processing time
        import time
        time.sleep(1.0)
        
        return {
            "success": True,
            "avatar_id": f"text_avatar_{hash(request.description)}",
            "model_url": "/public/avatars/placeholder_avatar.glb",
            "thumbnail_url": "/public/avatars/placeholder_thumb.jpg",
            "message": "Text-to-avatar service running in minimal mode"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-avatar generation failed: {str(e)}")

@app.post("/generate-lipsync")
async def generate_lipsync(request: dict):
    """
    Minimal lip sync generation - returns placeholder response
    """
    try:
        # Simulate processing time
        import time
        time.sleep(2.0)
        
        return {
            "success": True,
            "video_url": f"/uploads/lipsync/placeholder_{hash(str(request))}.mp4",
            "duration": 5.0,
            "message": "Lip sync service running in minimal mode"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lip sync generation failed: {str(e)}")

if __name__ == "__main__":
    # Railway sets PORT environment variable
    # For now, keep Python service on 8000, Node.js on 5000
    port = int(os.getenv("PYTHON_PORT", 8000))
    print(f"Starting Python services on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
