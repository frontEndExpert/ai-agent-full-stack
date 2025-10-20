"""
Main FastAPI server for Python services
Handles face reconstruction, TTS, and lip sync
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn
import os
import tempfile
import asyncio
from typing import Optional

# Import service modules
from face_reconstruction import generate_avatar_from_photo
from tts import generate_hebrew_tts
from lip_sync import generate_lip_sync

app = FastAPI(title="AI Agent Python Services", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Agent Python Services", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "face_reconstruction": "available",
            "tts": "available", 
            "lip_sync": "available"
        }
    }

@app.post("/generate-avatar")
async def generate_avatar(
    photo: UploadFile = File(...),
    base_avatar_id: Optional[str] = None,
    description: Optional[str] = None
):
    """Generate 3D avatar from photo"""
    try:
        # Save uploaded photo
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            content = await photo.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Generate avatar
        result = await generate_avatar_from_photo(
            tmp_file_path, 
            base_avatar_id, 
            description
        )
        
        # Clean up
        os.unlink(tmp_file_path)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-tts")
async def generate_tts(
    text: str,
    language: str = "he",
    voice: str = "hebrew_female"
):
    """Generate Hebrew TTS audio"""
    try:
        result = await generate_hebrew_tts(text, language, voice)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-lipsync")
async def generate_lipsync(
    audio_file: UploadFile = File(...),
    avatar_id: str = "default"
):
    """Generate lip sync video"""
    try:
        # Save uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await audio_file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Generate lip sync
        result = await generate_lip_sync(tmp_file_path, avatar_id)
        
        # Clean up
        os.unlink(tmp_file_path)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
