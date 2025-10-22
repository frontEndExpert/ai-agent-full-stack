# Railway.app Deployment Guide

## 🚀 **Deploy to Railway.app**

Railway.app offers better free tier limits than Render.com, making it ideal for your AI agent application.

### **Free Tier Benefits:**
- ✅ **0.5 GB RAM** - Sufficient for Node.js + Python services
- ✅ **1 vCPU** - Good processing power
- ✅ **0.5 GB storage** - Enough for dependencies
- ✅ **$5 credits** - 30-day trial
- ✅ **Better resource management** than Render.com

### **Step 1: Create Railway Account**
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect your repository: `frontEndExpert/ai-agent-full-stack`

### **Step 2: Deploy Backend**
1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your repository**
4. **Railway will auto-detect the Dockerfile**

### **Step 3: Configure Environment Variables**
Set these in Railway dashboard:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-agent-db?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Python Services (internal)
PYTHON_SERVICES_URL=http://localhost:8000
PYTHON_ENV=production
PYTHONPATH=/app/python-services

# File Storage
UPLOAD_DIR=/app/uploads
AVATAR_DIR=/app/public/avatars
TEMP_DIR=/app/temp

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Frontend URL (for CORS)
FRONTEND_URL=https://ai-agent-full-stack.vercel.app

# Widget Configuration
WIDGET_DOMAIN=ai-agent-full-stack.vercel.app
```

### **Step 4: Deploy Frontend**
Your frontend is already deployed on Vercel, but update the WebSocket URL:

1. **Go to Vercel Dashboard**
2. **Go to your project settings**
3. **Add Environment Variable:**
   - **Name**: `VITE_WS_URL`
   - **Value**: `https://your-railway-app.up.railway.app`

### **Step 5: Test Deployment**
1. **Backend Health**: `https://your-app.up.railway.app/api/health`
2. **Database Test**: `https://your-app.up.railway.app/api/test/db-connection`
3. **Agent Creation**: Test on frontend

### **Step 6: Update Frontend**
Update `frontend/src/App.jsx`:

```javascript
// Initialize socket connection
const socket = io('https://your-app.up.railway.app');
```

And update `frontend/src/utils/api.js`:

```javascript
const API_BASE_URL = 'https://your-app.up.railway.app/api';
```

## 🔧 **Railway vs Render.com Comparison**

| Feature | Railway.app | Render.com |
|---------|-------------|------------|
| **Free RAM** | 0.5 GB | 0.5 GB |
| **Free CPU** | 1 vCPU | 0.1 vCPU |
| **Free Storage** | 0.5 GB | 1 GB |
| **Resource Management** | Better | Limited |
| **Cold Starts** | Faster | Slower |
| **Python Support** | Excellent | Good |
| **Docker Support** | Native | Good |

## 🎯 **Expected Results**

With Railway.app's better resource management:
- ✅ **Agent Creation**: Should work without 500 errors
- ✅ **Database Writes**: Should complete successfully
- ✅ **Python Services**: Should run smoothly
- ✅ **WebSocket**: Should maintain stable connections

## 🚀 **Migration Steps**

1. **Deploy to Railway.app** (5 minutes)
2. **Update environment variables** (2 minutes)
3. **Update frontend URLs** (2 minutes)
4. **Test agent creation** (1 minute)

**Total time**: ~10 minutes for full migration!

## 💡 **Pro Tips**

- **Railway.app** has better resource allocation
- **Faster cold starts** than Render.com
- **Better Python support** for your ML services
- **More reliable** for complex applications
- **Easy scaling** when you need more resources

Your AI agent application should work much better on Railway.app! 🚀
