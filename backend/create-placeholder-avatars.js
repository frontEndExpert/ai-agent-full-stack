import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create placeholder avatar files
const avatars = [
  { id: 'avatar-001', name: 'Professional Woman' },
  { id: 'avatar-002', name: 'Friendly Man' },
  { id: 'avatar-003', name: 'Young Professional' },
  { id: 'avatar-004', name: 'Senior Executive' },
  { id: 'avatar-005', name: 'Tech Expert' },
  { id: 'avatar-006', name: 'Creative Director' },
  { id: 'avatar-007', name: 'Healthcare Professional' },
  { id: 'avatar-008', name: 'Sales Manager' },
  { id: 'avatar-009', name: 'Customer Service Rep' },
  { id: 'avatar-010', name: 'Tech Support' }
];

// Create directories
const avatarsDir = path.join(__dirname, 'public/avatars');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create placeholder files
avatars.forEach(avatar => {
  // Create placeholder GLB file
  const glbPath = path.join(avatarsDir, `${avatar.id}.glb`);
  if (!fs.existsSync(glbPath)) {
    fs.writeFileSync(glbPath, 'PLACEHOLDER_GLB_FILE');
  }
  
  // Create placeholder thumbnail
  const thumbPath = path.join(avatarsDir, `${avatar.id}_thumb.jpg`);
  if (!fs.existsSync(thumbPath)) {
    fs.writeFileSync(thumbPath, 'PLACEHOLDER_IMAGE_FILE');
  }
});

console.log('✅ Placeholder avatar files created');
