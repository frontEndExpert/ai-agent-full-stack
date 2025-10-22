# 🚀 Render.com Integrated Deployment Guide

## Overview

This guide will help you deploy Python services integrated with your backend on Render.com using Option 1.

## ✅ Prerequisites

- ✅ Backend already deployed on Render.com
- ✅ GitHub repository with latest changes
- ✅ Render.com account

## 🔧 Step-by-Step Deployment

### Step 1: Update Render.com Service Configuration

1. **Go to [Render.com Dashboard](https://dashboard.render.com)**
2. **Find your backend service**
3. **Click "Settings" tab**

### Step 2: Configure Docker Deployment

**Update these settings:**

| Setting | Value |
|---------|-------|
| **Build Command** | *(leave empty)* |
| **Start Command** | *(leave empty)* |
| **Dockerfile Path** | `backend/Dockerfile` |
| **Docker Context** | `.` |

### Step 3: Add Environment Variables

**Add these environment variables in Render.com:**

```bash
# Python Services (integrated)
PYTHON_SERVICES_URL=http://localhost:8000
FACE_RECONSTRUCTION_URL=http://localhost:8001
TTS_SERVICE_URL=http://localhost:8002
LIPSYNC_SERVICE_URL=http://localhost:8003

# Python Environment
PYTHON_ENV=production
PYTHONPATH=/app/python-services

# File Storage
UPLOAD_DIR=/app/uploads
AVATAR_DIR=/app/public/avatars
TEMP_DIR=/app/temp

# Existing variables (keep these)
MONGODB_URI=your-mongodb-connection-string
FRONTEND_URL=https://your-frontend-url.vercel.app
JWT_SECRET=your-jwt-secret
```

### Step 4: Deploy

1. **Click "Save Changes"**
2. **Go to "Deploys" tab**
3. **Click "Manual Deploy"**
4. **Wait for deployment to complete** (5-10 minutes)

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "services": {
    "database": "connected",
    "python": "available"
  }
}
```

### 2. Test Python Services
```bash
# Test Python services health
curl https://your-backend-url.onrender.com/api/python-health

# Test avatar generation
curl -X POST https://your-backend-url.onrender.com/api/avatars/generate \
  -F "photo=@test-image.jpg"

# Test TTS
curl -X POST https://your-backend-url.onrender.com/api/conversation/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "שלום עולם", "language": "he"}'
```

## 🔍 Troubleshooting

### Common Issues

**1. Build Failures**
- Check Render.com logs for Python dependency issues
- Ensure all requirements.txt dependencies are compatible
- Check if system dependencies are properly installed

**2. Service Startup Issues**
- Check if both Node.js and Python services are starting
- Look for port conflicts (both services should use different ports)
- Verify environment variables are set correctly

**3. Memory Issues**
- Python services can be memory-intensive
- Consider upgrading to Render.com paid plan if needed
- Monitor memory usage in Render.com dashboard

### Debugging

**Check logs:**
1. **Go to Render.com dashboard**
2. **Click on your service**
3. **Go to "Logs" tab**
4. **Look for errors in startup process**

**Common log messages:**
- ✅ `Starting Python services...` - Python services starting
- ✅ `Starting Node.js backend...` - Node.js backend starting
- ❌ `ModuleNotFoundError` - Python dependency issue
- ❌ `Port already in use` - Port conflict

## 📊 Monitoring

### Render.com Dashboard
- **Logs**: Real-time logs for both services
- **Metrics**: CPU, memory, and response times
- **Uptime**: Service availability monitoring

### Health Endpoints
- `/api/health` - Overall system health
- `/api/python-health` - Python services health
- `/api/avatars/gallery` - Avatar service test
- `/api/conversation/speak` - TTS service test

## 🎯 What You'll Have

After successful deployment:

- ✅ **Integrated Backend** with Python services
- ✅ **3D Avatar Generation** from photos
- ✅ **Hebrew TTS** with Coqui/Piper fallback
- ✅ **Wav2Lip Lip Sync** for real-time video
- ✅ **Single deployment** - no additional costs
- ✅ **Shared file system** for temporary files
- ✅ **Direct communication** between services

## 🚀 Next Steps

1. **Test all endpoints** to ensure Python services are working
2. **Deploy your frontend** to Vercel (if not already done)
3. **Update frontend** to use the integrated backend
4. **Test the full system** with Hebrew text and avatar generation

## 💡 Tips

- **Monitor memory usage** - Python services can be resource-intensive
- **Check logs regularly** - Both services log to the same output
- **Test incrementally** - Start with simple endpoints, then complex features
- **Keep backups** - Render.com free tier has limitations

Your AI agent system will now have full Python service support integrated with your backend! 🎉
