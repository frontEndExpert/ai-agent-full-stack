#!/usr/bin/env python3
"""
Hebrew TTS Service
Generates high-quality Hebrew speech using Coqui TTS and Piper TTS
"""

import os
import sys
import json
import uuid
import tempfile
from pathlib import Path
import numpy as np
import soundfile as sf

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from TTS.api import TTS
    COQUI_AVAILABLE = True
except ImportError:
    COQUI_AVAILABLE = False
    print("Warning: Coqui TTS not available")

try:
    import piper
    PIPER_AVAILABLE = True
except ImportError:
    PIPER_AVAILABLE = False
    print("Warning: Piper TTS not available")

class HebrewTTSService:
    def __init__(self):
        self.coqui_tts = None
        self.piper_tts = None
        self.output_dir = Path('/app/uploads/audio')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize TTS engines
        self.initialize_tts_engines()
    
    def initialize_tts_engines(self):
        """Initialize available TTS engines"""
        # Initialize Coqui TTS
        if COQUI_AVAILABLE:
            try:
                # Try to load Hebrew model
                self.coqui_tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
                print("✅ Coqui TTS initialized")
            except Exception as e:
                print(f"❌ Failed to initialize Coqui TTS: {e}")
                self.coqui_tts = None
        
        # Initialize Piper TTS
        if PIPER_AVAILABLE:
            try:
                # Try to load Hebrew model
                self.piper_tts = piper.PiperVoice.load("hebrew_model.onnx")
                print("✅ Piper TTS initialized")
            except Exception as e:
                print(f"❌ Failed to initialize Piper TTS: {e}")
                self.piper_tts = None
    
    def generate_speech(self, text, language='he', voice=None, agent_id=None):
        """Generate speech from text"""
        try:
            # Clean and preprocess text
            cleaned_text = self.preprocess_text(text, language)
            
            # Try Coqui TTS first
            if self.coqui_tts and language == 'he':
                return self.generate_with_coqui(cleaned_text, voice, agent_id)
            
            # Try Piper TTS as fallback
            elif self.piper_tts:
                return self.generate_with_piper(cleaned_text, language, voice, agent_id)
            
            # Fallback to simple synthesis
            else:
                return self.generate_fallback(cleaned_text, language, agent_id)
                
        except Exception as e:
            print(f"Error generating speech: {e}")
            return {
                'error': str(e),
                'success': False
            }
    
    def generate_with_coqui(self, text, voice, agent_id):
        """Generate speech using Coqui TTS"""
        try:
            # Generate unique filename
            audio_id = str(uuid.uuid4())
            output_path = self.output_dir / f'{audio_id}.wav'
            
            # Generate speech
            wav = self.coqui_tts.tts(
                text=text,
                language='he',  # Hebrew
                speaker_wav=None,  # Use default voice
                split_sentences=True
            )
            
            # Save audio file
            sf.write(str(output_path), wav, 22050)
            
            # Calculate duration
            duration = len(wav) / 22050
            
            return {
                'audio_url': f'/uploads/audio/{audio_id}.wav',
                'duration': duration,
                'provider': 'coqui',
                'success': True
            }
            
        except Exception as e:
            print(f"Coqui TTS error: {e}")
            raise
    
    def generate_with_piper(self, text, language, voice, agent_id):
        """Generate speech using Piper TTS"""
        try:
            # Generate unique filename
            audio_id = str(uuid.uuid4())
            output_path = self.output_dir / f'{audio_id}.wav'
            
            # Generate speech
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                self.piper_tts.synthesize(text, tmp_file.name)
                
                # Copy to final location
                import shutil
                shutil.copy2(tmp_file.name, str(output_path))
                os.unlink(tmp_file.name)
            
            # Calculate duration (simplified)
            duration = self.estimate_duration(text)
            
            return {
                'audio_url': f'/uploads/audio/{audio_id}.wav',
                'duration': duration,
                'provider': 'piper',
                'success': True
            }
            
        except Exception as e:
            print(f"Piper TTS error: {e}")
            raise
    
    def generate_fallback(self, text, language, agent_id):
        """Generate fallback speech (placeholder)"""
        try:
            # Generate unique filename
            audio_id = str(uuid.uuid4())
            output_path = self.output_dir / f'{audio_id}.wav'
            
            # Create a simple sine wave as placeholder
            duration = self.estimate_duration(text)
            sample_rate = 22050
            t = np.linspace(0, duration, int(sample_rate * duration))
            
            # Generate a simple tone
            frequency = 440  # A4 note
            audio_data = 0.1 * np.sin(2 * np.pi * frequency * t)
            
            # Add some variation to make it more interesting
            audio_data += 0.05 * np.sin(2 * np.pi * frequency * 1.5 * t)
            
            # Save as WAV file
            sf.write(str(output_path), audio_data, sample_rate)
            
            return {
                'audio_url': f'/uploads/audio/{audio_id}.wav',
                'duration': duration,
                'provider': 'fallback',
                'success': True
            }
            
        except Exception as e:
            print(f"Fallback TTS error: {e}")
            raise
    
    def preprocess_text(self, text, language):
        """Preprocess text for TTS"""
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Hebrew-specific preprocessing
        if language == 'he':
            # Remove Hebrew diacritics (optional)
            # text = self.remove_hebrew_diacritics(text)
            
            # Add pauses for better speech
            text = text.replace('.', '. ')
            text = text.replace(',', ', ')
            text = text.replace('?', '? ')
            text = text.replace('!', '! ')
        
        return text.strip()
    
    def remove_hebrew_diacritics(self, text):
        """Remove Hebrew diacritics (nikud)"""
        # Hebrew diacritics range
        diacritics = '\u0591-\u05C7'
        import re
        return re.sub(f'[{diacritics}]', '', text)
    
    def estimate_duration(self, text):
        """Estimate speech duration based on text length"""
        # Rough estimation: ~150 words per minute for Hebrew
        words_per_minute = 150
        word_count = len(text.split())
        duration_minutes = word_count / words_per_minute
        
        # Minimum 1 second, maximum 30 seconds
        return max(1.0, min(30.0, duration_minutes * 60))
    
    def get_available_voices(self, language='he'):
        """Get list of available voices"""
        voices = []
        
        if self.coqui_tts:
            voices.append({
                'id': 'coqui_hebrew',
                'name': 'Hebrew (Coqui)',
                'language': 'he',
                'provider': 'coqui'
            })
        
        if self.piper_tts:
            voices.append({
                'id': 'piper_hebrew',
                'name': 'Hebrew (Piper)',
                'language': 'he',
                'provider': 'piper'
            })
        
        # Add fallback voice
        voices.append({
            'id': 'fallback',
            'name': 'Fallback',
            'language': language,
            'provider': 'fallback'
        })
        
        return voices

def main():
    """Main function for testing"""
    service = HebrewTTSService()
    
    if len(sys.argv) > 1:
        text = sys.argv[1]
        result = service.generate_speech(text, language='he')
        print(json.dumps(result, indent=2))
    else:
        # Test with sample Hebrew text
        sample_text = "שלום! איך אני יכול לעזור לך היום?"
        result = service.generate_speech(sample_text, language='he')
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
