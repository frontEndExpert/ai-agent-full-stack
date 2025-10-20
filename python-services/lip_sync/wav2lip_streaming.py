#!/usr/bin/env python3
"""
Wav2Lip Streaming Service
Real-time lip sync generation using Wav2Lip for 3D avatars
"""

import os
import sys
import cv2
import numpy as np
import torch
import tempfile
import json
import uuid
from pathlib import Path
import subprocess
import threading
import queue
import time

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Wav2LipStreamingService:
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = None
        self.output_dir = Path('/app/uploads/lipsync')
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize Wav2Lip model
        self.initialize_model()
        
        # Streaming queues
        self.streaming_queues = {}
    
    def initialize_model(self):
        """Initialize Wav2Lip model"""
        try:
            # This would load the actual Wav2Lip model
            # For now, we'll create a placeholder
            print(f"Initializing Wav2Lip on {self.device}")
            
            # In a real implementation, this would load the model:
            # self.model = load_wav2lip_model()
            
            print("✅ Wav2Lip model initialized (placeholder)")
            
        except Exception as e:
            print(f"❌ Failed to initialize Wav2Lip: {e}")
            self.model = None
    
    def generate_lip_sync(self, audio_path, avatar_id, agent_id):
        """Generate lip sync video from audio and avatar"""
        try:
            # Generate unique output ID
            output_id = str(uuid.uuid4())
            
            # Create output paths
            video_path = self.output_dir / f'{output_id}.mp4'
            frames_dir = self.output_dir / f'{output_id}_frames'
            frames_dir.mkdir(exist_ok=True)
            
            # Generate lip sync frames
            frames = self.generate_lip_sync_frames(audio_path, avatar_id, frames_dir)
            
            # Create video from frames
            video_path = self.create_video_from_frames(frames, video_path, audio_path)
            
            return {
                'video_url': f'/uploads/lipsync/{output_id}.mp4',
                'frames_dir': str(frames_dir),
                'frame_count': len(frames),
                'duration': self.get_audio_duration(audio_path),
                'success': True
            }
            
        except Exception as e:
            print(f"Error generating lip sync: {e}")
            return {
                'error': str(e),
                'success': False
            }
    
    def generate_lip_sync_frames(self, audio_path, avatar_id, frames_dir):
        """Generate individual lip sync frames"""
        try:
            # Load audio
            audio_data = self.load_audio(audio_path)
            
            # Get avatar face region (this would be more complex in reality)
            face_region = self.get_avatar_face_region(avatar_id)
            
            # Generate frames
            frames = []
            frame_rate = 25  # 25 FPS
            duration = len(audio_data) / 22050  # Assuming 22050 Hz sample rate
            total_frames = int(duration * frame_rate)
            
            for frame_idx in range(total_frames):
                # Calculate time for this frame
                time_sec = frame_idx / frame_rate
                
                # Generate lip sync for this time
                lip_frame = self.generate_frame_at_time(
                    audio_data, time_sec, face_region, frame_idx
                )
                
                # Save frame
                frame_path = frames_dir / f'frame_{frame_idx:04d}.jpg'
                cv2.imwrite(str(frame_path), lip_frame)
                
                frames.append(str(frame_path))
                
                # Yield control for streaming
                if frame_idx % 10 == 0:  # Every 10 frames
                    time.sleep(0.01)  # Small delay for streaming
            
            return frames
            
        except Exception as e:
            print(f"Error generating frames: {e}")
            raise
    
    def generate_frame_at_time(self, audio_data, time_sec, face_region, frame_idx):
        """Generate a single lip sync frame at specific time"""
        try:
            # Calculate audio sample for this time
            sample_rate = 22050
            sample_idx = int(time_sec * sample_rate)
            
            # Extract audio window around this time
            window_size = 1024
            start_idx = max(0, sample_idx - window_size // 2)
            end_idx = min(len(audio_data), sample_idx + window_size // 2)
            audio_window = audio_data[start_idx:end_idx]
            
            # Generate lip shape based on audio
            lip_shape = self.audio_to_lip_shape(audio_window)
            
            # Create frame with lip sync
            frame = self.create_lip_sync_frame(face_region, lip_shape, frame_idx)
            
            return frame
            
        except Exception as e:
            print(f"Error generating frame at time {time_sec}: {e}")
            # Return a default frame
            return self.create_default_frame(face_region)
    
    def audio_to_lip_shape(self, audio_window):
        """Convert audio window to lip shape parameters"""
        # This is a simplified version - in reality, this would use
        # the Wav2Lip model to predict lip movements
        
        # Calculate audio features
        audio_energy = np.mean(np.abs(audio_window))
        audio_freq = self.get_dominant_frequency(audio_window)
        
        # Map to lip shape parameters
        mouth_openness = min(1.0, audio_energy * 10)  # 0-1 scale
        lip_width = 0.5 + 0.3 * np.sin(audio_freq * 0.01)  # Vary with frequency
        
        return {
            'mouth_openness': mouth_openness,
            'lip_width': lip_width,
            'lip_height': 0.3 + 0.2 * mouth_openness
        }
    
    def get_dominant_frequency(self, audio_window):
        """Get dominant frequency from audio window"""
        try:
            # Simple FFT to get dominant frequency
            fft = np.fft.fft(audio_window)
            freqs = np.fft.fftfreq(len(audio_window))
            dominant_freq = freqs[np.argmax(np.abs(fft))]
            return abs(dominant_freq)
        except:
            return 0.1  # Default frequency
    
    def create_lip_sync_frame(self, face_region, lip_shape, frame_idx):
        """Create a frame with lip sync applied"""
        try:
            # Create base frame
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            frame.fill(128)  # Gray background
            
            # Draw face region
            cv2.rectangle(frame, face_region, (200, 200, 200), -1)
            
            # Draw lips based on shape parameters
            lip_center = (
                face_region[0] + face_region[2] // 2,
                face_region[1] + face_region[3] // 2
            )
            
            lip_width = int(face_region[2] * lip_shape['lip_width'])
            lip_height = int(face_region[3] * lip_shape['lip_height'])
            
            # Draw mouth
            mouth_rect = (
                lip_center[0] - lip_width // 2,
                lip_center[1] - lip_height // 2,
                lip_width,
                lip_height
            )
            
            if lip_shape['mouth_openness'] > 0.3:
                # Open mouth
                cv2.rectangle(frame, mouth_rect, (0, 0, 0), -1)
            else:
                # Closed mouth
                cv2.ellipse(frame, lip_center, (lip_width // 2, lip_height // 4), 0, 0, 360, (0, 0, 0), -1)
            
            # Add frame number for debugging
            cv2.putText(frame, f'Frame {frame_idx}', (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            
            return frame
            
        except Exception as e:
            print(f"Error creating lip sync frame: {e}")
            return self.create_default_frame(face_region)
    
    def create_default_frame(self, face_region):
        """Create a default frame when lip sync fails"""
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        frame.fill(128)
        
        # Draw simple face
        cv2.rectangle(frame, face_region, (200, 200, 200), -1)
        
        # Draw simple mouth
        mouth_center = (
            face_region[0] + face_region[2] // 2,
            face_region[1] + face_region[3] // 2
        )
        cv2.ellipse(frame, mouth_center, (30, 15), 0, 0, 360, (0, 0, 0), -1)
        
        return frame
    
    def get_avatar_face_region(self, avatar_id):
        """Get face region for avatar (simplified)"""
        # In a real implementation, this would load the avatar model
        # and extract the face region coordinates
        
        # For now, return a default face region
        return (200, 150, 240, 180)  # x, y, width, height
    
    def create_video_from_frames(self, frames, output_path, audio_path):
        """Create video from frames and audio"""
        try:
            if not frames:
                raise ValueError("No frames to create video")
            
            # Get frame dimensions
            first_frame = cv2.imread(frames[0])
            height, width = first_frame.shape[:2]
            
            # Create video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            video_writer = cv2.VideoWriter(
                str(output_path), fourcc, 25.0, (width, height)
            )
            
            # Write frames
            for frame_path in frames:
                frame = cv2.imread(frame_path)
                if frame is not None:
                    video_writer.write(frame)
            
            video_writer.release()
            
            # Add audio to video using ffmpeg
            self.add_audio_to_video(str(output_path), audio_path)
            
            return str(output_path)
            
        except Exception as e:
            print(f"Error creating video: {e}")
            raise
    
    def add_audio_to_video(self, video_path, audio_path):
        """Add audio to video using ffmpeg"""
        try:
            # Create temporary output file
            temp_path = video_path.replace('.mp4', '_temp.mp4')
            
            # Run ffmpeg command
            cmd = [
                'ffmpeg', '-y',
                '-i', video_path,
                '-i', audio_path,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-shortest',
                temp_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                # Replace original with audio version
                os.replace(temp_path, video_path)
            else:
                print(f"FFmpeg error: {result.stderr}")
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
        except Exception as e:
            print(f"Error adding audio: {e}")
    
    def load_audio(self, audio_path):
        """Load audio file"""
        try:
            import librosa
            audio_data, sample_rate = librosa.load(audio_path, sr=22050)
            return audio_data
        except ImportError:
            # Fallback using soundfile
            import soundfile as sf
            audio_data, sample_rate = sf.read(audio_path)
            return audio_data
        except Exception as e:
            print(f"Error loading audio: {e}")
            # Return silence
            return np.zeros(22050)  # 1 second of silence
    
    def get_audio_duration(self, audio_path):
        """Get audio duration in seconds"""
        try:
            import librosa
            duration = librosa.get_duration(filename=audio_path)
            return duration
        except:
            # Fallback
            return 5.0  # Default duration
    
    def start_streaming_lip_sync(self, audio_path, avatar_id, agent_id, callback):
        """Start streaming lip sync generation"""
        try:
            # Create streaming queue
            stream_id = str(uuid.uuid4())
            self.streaming_queues[stream_id] = queue.Queue()
            
            # Start streaming in background thread
            thread = threading.Thread(
                target=self._stream_lip_sync_worker,
                args=(stream_id, audio_path, avatar_id, agent_id, callback)
            )
            thread.daemon = True
            thread.start()
            
            return stream_id
            
        except Exception as e:
            print(f"Error starting streaming: {e}")
            return None
    
    def _stream_lip_sync_worker(self, stream_id, audio_path, avatar_id, agent_id, callback):
        """Worker thread for streaming lip sync"""
        try:
            # Generate frames and stream them
            frames_dir = self.output_dir / f'stream_{stream_id}_frames'
            frames_dir.mkdir(exist_ok=True)
            
            # Load audio
            audio_data = self.load_audio(audio_path)
            face_region = self.get_avatar_face_region(avatar_id)
            
            frame_rate = 25
            duration = len(audio_data) / 22050
            total_frames = int(duration * frame_rate)
            
            for frame_idx in range(total_frames):
                time_sec = frame_idx / frame_rate
                
                # Generate frame
                frame = self.generate_frame_at_time(audio_data, time_sec, face_region, frame_idx)
                
                # Save frame
                frame_path = frames_dir / f'frame_{frame_idx:04d}.jpg'
                cv2.imwrite(str(frame_path), frame)
                
                # Send to callback
                if callback:
                    callback({
                        'stream_id': stream_id,
                        'frame_idx': frame_idx,
                        'total_frames': total_frames,
                        'frame_path': str(frame_path),
                        'time_sec': time_sec
                    })
                
                # Small delay for streaming
                time.sleep(0.04)  # 25 FPS
            
            # Cleanup
            if stream_id in self.streaming_queues:
                del self.streaming_queues[stream_id]
                
        except Exception as e:
            print(f"Streaming worker error: {e}")
            if callback:
                callback({'error': str(e), 'stream_id': stream_id})

def main():
    """Main function for testing"""
    service = Wav2LipStreamingService()
    
    if len(sys.argv) > 2:
        audio_path = sys.argv[1]
        avatar_id = sys.argv[2]
        result = service.generate_lip_sync(audio_path, avatar_id, 'test_agent')
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python wav2lip_streaming.py <audio_path> <avatar_id>")

if __name__ == "__main__":
    main()
