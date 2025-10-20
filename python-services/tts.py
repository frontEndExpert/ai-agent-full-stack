"""
Hebrew TTS service using Coqui TTS and Piper TTS fallback
"""
import os
import tempfile
import asyncio
from typing import Optional
import time

# Try to import TTS libraries
try:
    from TTS.api import TTS
    COQUI_AVAILABLE = True
except ImportError:
    COQUI_AVAILABLE = False
    print("Coqui TTS not available")

try:
    import piper
    PIPER_AVAILABLE = True
except ImportError:
    PIPER_AVAILABLE = False
    print("Piper TTS not available")

async def generate_hebrew_tts(
    text: str, 
    language: str = "he", 
    voice: str = "hebrew_female"
):
    """
    Generate Hebrew TTS audio using available TTS engines
    """
    try:
        # Try Coqui TTS first
        if COQUI_AVAILABLE:
            return await generate_with_coqui(text, language, voice)
        
        # Fallback to Piper TTS
        elif PIPER_AVAILABLE:
            return await generate_with_piper(text, language, voice)
        
        # Final fallback - return placeholder
        else:
            return await generate_fallback_tts(text)
            
    except Exception as e:
        print(f"Error in TTS generation: {e}")
        # Return fallback
        return await generate_fallback_tts(text)

async def generate_with_coqui(text: str, language: str, voice: str):
    """Generate TTS using Coqui TTS"""
    try:
        # Initialize TTS
        tts = TTS("tts_models/he/fairseq/vits")
        
        # Generate audio
        audio_id = f"audio_{int(time.time())}"
        audio_path = f"uploads/audio/{audio_id}.wav"
        
        # Ensure directory exists
        os.makedirs("uploads/audio", exist_ok=True)
        
        # Generate audio
        tts.tts_to_file(text=text, file_path=audio_path)
        
        # Get duration (simplified)
        duration = estimate_duration(text)
        
        return {
            "audio_url": f"/uploads/audio/{audio_id}.wav",
            "duration": duration,
            "provider": "coqui"
        }
        
    except Exception as e:
        print(f"Coqui TTS error: {e}")
        raise e

async def generate_with_piper(text: str, language: str, voice: str):
    """Generate TTS using Piper TTS"""
    try:
        # This is a placeholder - implement actual Piper TTS integration
        audio_id = f"audio_{int(time.time())}"
        audio_path = f"uploads/audio/{audio_id}.wav"
        
        # Ensure directory exists
        os.makedirs("uploads/audio", exist_ok=True)
        
        # Generate placeholder audio
        await generate_placeholder_audio(text, audio_path)
        
        duration = estimate_duration(text)
        
        return {
            "audio_url": f"/uploads/audio/{audio_id}.wav",
            "duration": duration,
            "provider": "piper"
        }
        
    except Exception as e:
        print(f"Piper TTS error: {e}")
        raise e

async def generate_fallback_tts(text: str):
    """Generate fallback TTS (placeholder audio)"""
    try:
        audio_id = f"audio_{int(time.time())}"
        audio_path = f"uploads/audio/{audio_id}.wav"
        
        # Ensure directory exists
        os.makedirs("uploads/audio", exist_ok=True)
        
        # Generate placeholder audio
        await generate_placeholder_audio(text, audio_path)
        
        duration = estimate_duration(text)
        
        return {
            "audio_url": f"/uploads/audio/{audio_id}.wav",
            "duration": duration,
            "provider": "fallback"
        }
        
    except Exception as e:
        print(f"Fallback TTS error: {e}")
        raise e

async def generate_placeholder_audio(text: str, output_path: str):
    """Generate placeholder audio file"""
    import wave
    import struct
    
    # Create a simple WAV file with silence
    sample_rate = 22050
    duration = estimate_duration(text)
    num_samples = int(sample_rate * duration)
    
    # Create WAV file
    with wave.open(output_path, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # Write silence
        for _ in range(num_samples):
            wav_file.writeframes(struct.pack('<h', 0))

def estimate_duration(text: str) -> float:
    """Estimate audio duration based on text length"""
    # Rough estimation: ~150 words per minute for Hebrew
    words_per_minute = 150
    word_count = len(text.split())
    duration_minutes = word_count / words_per_minute
    
    # Minimum 2 seconds, maximum 30 seconds
    return max(2.0, min(30.0, duration_minutes * 60))
