# 🐍 Python Services Deployment Guide

## Overview

Your AI agent system has three Python services that need to be deployed:
1. **Face Reconstruction** - 3D avatar generation from photos
2. **Hebrew TTS** - Text-to-speech in Hebrew
3. **Wav2Lip Lip Sync** - Real-time lip synchronization

## 🚀 Deployment Options

### Option 1: Deploy with Backend on Render.com (Recommended for Free Tier)

**Pros:**
- ✅ Single deployment
- ✅ No additional costs
- ✅ Direct communication
- ✅ Shared file system

**Cons:**
- ⚠️ Render.com free tier limitations
- ⚠️ Cold start delays

**Steps:**
1. **Update your Render.com service** to use the new Dockerfile
2. **Set environment variables** in Render.com dashboard
3. **Deploy** - Python services will run alongside Node.js

### Option 2: Separate Python Services on Railway (Recommended for Production)

**Pros:**
- ✅ Better resource management
- ✅ Independent scaling
- ✅ No cold start issues
- ✅ Better error isolation

**Cons:**
- 💰 Additional costs ($5/month per service)
- 🔧 More complex setup

**Steps:**
1. **Deploy to Railway**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Deploy Python services
   cd python-services
   railway up
   ```

2. **Get the service URL** from Railway dashboard
3. **Update backend environment variables** with the new URL

### Option 3: Separate Python Services on Render.com

**Steps:**
1. **Create new service** on Render.com
2. **Choose "Web Service"**
3. **Connect your GitHub repository**
4. **Set root directory** to `python-services`
5. **Use the provided `render.yaml`** configuration
6. **Deploy**

## 🔧 Configuration

### Environment Variables

Set these in your deployment platform:

```bash
# Python Services
PYTHON_ENV=production
PORT=8000

# Backend Integration
BACKEND_URL=https://your-backend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.vercel.app

# Optional: External services
OLLAMA_URL=http://localhost:11434
MONGODB_URI=mongodb+srv://...
```

### Backend Integration

Update your backend environment variables:

```bash
# If using separate Python services
PYTHON_SERVICES_URL=https://your-python-services-url.railway.app
TTS_SERVICE_URL=https://your-python-services-url.railway.app
FACE_RECONSTRUCTION_URL=https://your-python-services-url.railway.app

# If using integrated deployment
PYTHON_SERVICES_URL=http://localhost:8000
TTS_SERVICE_URL=http://localhost:8000
FACE_RECONSTRUCTION_URL=http://localhost:8000
```

## 📋 Service Endpoints

Your Python services will provide these endpoints:

### Face Reconstruction
- `POST /generate-avatar` - Generate 3D avatar from photo
- `POST /generate-avatar-text` - Generate avatar from text description

### TTS Service
- `POST /generate-tts` - Generate Hebrew TTS audio
- `GET /voices` - List available voices

### Lip Sync Service
- `POST /generate-lipsync` - Generate lip sync video
- `WebSocket /ws/lipsync` - Real-time lip sync streaming

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-python-services-url.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "face_reconstruction": "available",
    "tts": "available",
    "lip_sync": "available"
  }
}
```

### 2. Test TTS
```bash
curl -X POST https://your-python-services-url.railway.app/generate-tts \
  -H "Content-Type: application/json" \
  -d '{"text": "שלום עולם", "language": "he"}'
```

### 3. Test Face Reconstruction
```bash
curl -X POST https://your-python-services-url.railway.app/generate-avatar \
  -F "photo=@test-image.jpg" \
  -F "description=professional woman"
```

## 🔍 Troubleshooting

### Common Issues

**1. Import Errors**
- Check if all dependencies are in `requirements.txt`
- Ensure Python version compatibility

**2. Memory Issues**
- Python services can be memory-intensive
- Consider upgrading to paid plans for better resources

**3. Cold Start Delays**
- Use separate services to avoid cold starts
- Implement health checks and keep-alive

**4. File Upload Issues**
- Check file size limits
- Ensure proper CORS configuration

### Debugging

**Check logs:**
```bash
# Railway
railway logs

# Render.com
# Check in dashboard under "Logs" tab
```

**Test locally:**
```bash
cd python-services
python main.py
```

## 💰 Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render.com** | 750 hours/month | $7/month | Integrated deployment |
| **Railway** | $5 credit | $5/month | Separate services |
| **Heroku** | Not available | $7/month | Enterprise |

## 🎯 Recommended Setup

### For Development/Testing:
- **Use Option 1** (integrated with backend on Render.com)
- Free tier should be sufficient for testing

### For Production:
- **Use Option 2** (separate services on Railway)
- Better performance and reliability
- Independent scaling

## 🚀 Next Steps

1. **Choose your deployment option**
2. **Deploy the Python services**
3. **Update backend environment variables**
4. **Test the integration**
5. **Monitor performance and costs**

Your AI agent system will now have full Python service support! 🎉
