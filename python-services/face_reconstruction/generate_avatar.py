#!/usr/bin/env python3
"""
3D Face Reconstruction Service
Generates 3D avatars from photos using face recognition and 3D reconstruction
"""

import os
import sys
import cv2
import numpy as np
import face_recognition
import mediapipe as mp
import trimesh
from PIL import Image
import json
import uuid
from pathlib import Path

# Add the parent directory to the path so we can import other modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class FaceReconstructionService:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        
        # Base avatar templates (would be loaded from files)
        self.base_avatars = self.load_base_avatars()
        
    def load_base_avatars(self):
        """Load base avatar templates"""
        # In a real implementation, this would load actual 3D models
        return {
            'male_adult': {
                'vertices': self.generate_base_face_vertices('male', 'adult'),
                'faces': self.generate_base_face_faces(),
                'texture_coords': self.generate_base_texture_coords()
            },
            'female_adult': {
                'vertices': self.generate_base_face_vertices('female', 'adult'),
                'faces': self.generate_base_face_faces(),
                'texture_coords': self.generate_base_texture_coords()
            }
        }
    
    def generate_avatar(self, photo_path, base_avatar_id=None, description=None):
        """Generate 3D avatar from photo"""
        try:
            # Load and process image
            image = cv2.imread(photo_path)
            if image is None:
                raise ValueError("Could not load image")
            
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Detect face landmarks
            landmarks = self.detect_face_landmarks(image_rgb)
            if landmarks is None:
                raise ValueError("No face detected in image")
            
            # Extract facial features
            facial_features = self.extract_facial_features(landmarks, image_rgb)
            
            # Generate 3D mesh
            mesh_data = self.generate_3d_mesh(facial_features, base_avatar_id, description)
            
            # Apply texture mapping
            textured_mesh = self.apply_texture_mapping(mesh_data, image_rgb, facial_features)
            
            # Export as GLB
            avatar_id = str(uuid.uuid4())
            output_path = self.export_glb(textured_mesh, avatar_id)
            
            # Generate thumbnail
            thumbnail_path = self.generate_thumbnail(image_rgb, avatar_id)
            
            return {
                'avatar_id': avatar_id,
                'model_url': f'/public/avatars/{avatar_id}.glb',
                'thumbnail_url': f'/public/avatars/{avatar_id}_thumb.jpg',
                'success': True
            }
            
        except Exception as e:
            print(f"Error generating avatar: {e}")
            return {
                'error': str(e),
                'success': False
            }
    
    def detect_face_landmarks(self, image):
        """Detect facial landmarks using MediaPipe"""
        try:
            results = self.face_mesh.process(image)
            
            if not results.multi_face_landmarks:
                return None
            
            # Get the first face
            face_landmarks = results.multi_face_landmarks[0]
            
            # Convert to numpy array
            landmarks = []
            for landmark in face_landmarks.landmark:
                landmarks.append([landmark.x, landmark.y, landmark.z])
            
            return np.array(landmarks)
            
        except Exception as e:
            print(f"Error detecting landmarks: {e}")
            return None
    
    def extract_facial_features(self, landmarks, image):
        """Extract facial features from landmarks"""
        h, w = image.shape[:2]
        
        # Convert normalized coordinates to pixel coordinates
        landmarks_pixel = landmarks.copy()
        landmarks_pixel[:, 0] *= w
        landmarks_pixel[:, 1] *= h
        
        # Extract key facial features
        features = {
            'face_contour': landmarks_pixel[0:17],  # Face outline
            'left_eyebrow': landmarks_pixel[17:22],
            'right_eyebrow': landmarks_pixel[22:27],
            'nose': landmarks_pixel[27:36],
            'left_eye': landmarks_pixel[36:42],
            'right_eye': landmarks_pixel[42:48],
            'outer_lips': landmarks_pixel[48:60],
            'inner_lips': landmarks_pixel[60:68],
            'all_landmarks': landmarks_pixel
        }
        
        return features
    
    def generate_3d_mesh(self, facial_features, base_avatar_id, description):
        """Generate 3D mesh from facial features"""
        try:
            # Select base avatar template
            if base_avatar_id and base_avatar_id in self.base_avatars:
                base_template = self.base_avatars[base_avatar_id]
            else:
                # Default to female adult template
                base_template = self.base_avatars['female_adult']
            
            # Get base vertices and faces
            base_vertices = base_template['vertices'].copy()
            base_faces = base_template['faces'].copy()
            
            # Modify vertices based on facial features
            modified_vertices = self.modify_vertices_for_face(base_vertices, facial_features)
            
            # Apply description-based modifications if provided
            if description:
                modified_vertices = self.apply_description_modifications(modified_vertices, description)
            
            return {
                'vertices': modified_vertices,
                'faces': base_faces,
                'texture_coords': base_template['texture_coords']
            }
            
        except Exception as e:
            print(f"Error generating 3D mesh: {e}")
            raise
    
    def modify_vertices_for_face(self, base_vertices, facial_features):
        """Modify base vertices to match detected facial features"""
        # This is a simplified version - in reality, this would involve
        # complex 3D morphing algorithms
        
        modified_vertices = base_vertices.copy()
        
        # Calculate face dimensions
        face_contour = facial_features['face_contour']
        face_width = np.max(face_contour[:, 0]) - np.min(face_contour[:, 0])
        face_height = np.max(face_contour[:, 1]) - np.min(face_contour[:, 1])
        
        # Scale vertices based on face dimensions
        scale_x = face_width / 100.0  # Normalize to reasonable scale
        scale_y = face_height / 100.0
        
        modified_vertices[:, 0] *= scale_x
        modified_vertices[:, 1] *= scale_y
        
        return modified_vertices
    
    def apply_description_modifications(self, vertices, description):
        """Apply modifications based on text description"""
        # This would parse the description and apply appropriate modifications
        # For now, just return the vertices as-is
        return vertices
    
    def apply_texture_mapping(self, mesh_data, image, facial_features):
        """Apply texture mapping from the original image"""
        # This would map the 2D image texture to the 3D mesh
        # For now, just return the mesh data with texture coordinates
        return mesh_data
    
    def export_glb(self, mesh_data, avatar_id):
        """Export mesh as GLB file"""
        try:
            # Create trimesh object
            mesh = trimesh.Trimesh(
                vertices=mesh_data['vertices'],
                faces=mesh_data['faces']
            )
            
            # Ensure output directory exists
            output_dir = Path('/app/public/avatars')
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Export as GLB
            output_path = output_dir / f'{avatar_id}.glb'
            mesh.export(str(output_path), file_type='glb')
            
            return str(output_path)
            
        except Exception as e:
            print(f"Error exporting GLB: {e}")
            raise
    
    def generate_thumbnail(self, image, avatar_id):
        """Generate thumbnail image"""
        try:
            # Resize image to thumbnail size
            thumbnail_size = (200, 200)
            thumbnail = cv2.resize(image, thumbnail_size)
            
            # Ensure output directory exists
            output_dir = Path('/app/public/avatars')
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Save thumbnail
            thumbnail_path = output_dir / f'{avatar_id}_thumb.jpg'
            cv2.imwrite(str(thumbnail_path), cv2.cvtColor(thumbnail, cv2.COLOR_RGB2BGR))
            
            return str(thumbnail_path)
            
        except Exception as e:
            print(f"Error generating thumbnail: {e}")
            raise
    
    def generate_base_face_vertices(self, gender, age):
        """Generate base face vertices (simplified)"""
        # This would load actual 3D face templates
        # For now, generate a simple face shape
        vertices = []
        
        # Generate a basic face shape
        for y in np.linspace(-1, 1, 20):
            for x in np.linspace(-0.7, 0.7, 15):
                z = 0.1 * np.sin(np.pi * x) * np.cos(np.pi * y)
                vertices.append([x, y, z])
        
        return np.array(vertices)
    
    def generate_base_face_faces(self):
        """Generate base face faces (triangles)"""
        faces = []
        
        # Generate triangular faces for the mesh
        for i in range(19):  # 20 vertices in y direction
            for j in range(14):  # 15 vertices in x direction
                if i < 19 and j < 14:
                    # Two triangles per quad
                    v1 = i * 15 + j
                    v2 = i * 15 + j + 1
                    v3 = (i + 1) * 15 + j
                    v4 = (i + 1) * 15 + j + 1
                    
                    faces.append([v1, v2, v3])
                    faces.append([v2, v4, v3])
        
        return np.array(faces)
    
    def generate_base_texture_coords(self):
        """Generate base texture coordinates"""
        # Generate UV coordinates for texture mapping
        uvs = []
        
        for y in np.linspace(0, 1, 20):
            for x in np.linspace(0, 1, 15):
                uvs.append([x, y])
        
        return np.array(uvs)

def main():
    """Main function for testing"""
    service = FaceReconstructionService()
    
    # Test with a sample image
    if len(sys.argv) > 1:
        photo_path = sys.argv[1]
        result = service.generate_avatar(photo_path)
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python generate_avatar.py <photo_path>")

if __name__ == "__main__":
    main()
