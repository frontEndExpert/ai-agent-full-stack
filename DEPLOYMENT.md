# 🚀 AI Agent Full-Stack Deployment Guide

## ✅ Current Status

- **Backend**: ✅ Successfully deployed on Render.com
- **Frontend**: ✅ Ready for Vercel deployment
- **Database**: ⏳ Needs MongoDB Atlas setup

## 🎯 Complete Deployment Steps

### 1. MongoDB Atlas Setup (Required)

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create free account** and verify email
3. **Create a new project** called "AI Agent"
4. **Build a cluster**:
   - Choose **M0 Sandbox** (Free tier)
   - Select region closest to you
   - Name it "ai-agent-cluster"
5. **Create database user**:
   - Username: `ai-agent-user`
   - Password: Generate a strong password (save it!)
6. **Whitelist IP addresses**:
   - Add `0.0.0.0/0` for Render.com access
7. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://ai-agent-user:yourpassword@ai-agent-cluster.xxxxx.mongodb.net/ai-agent-db?retryWrites=true&w=majority`

### 2. Configure Render.com Environment Variables

1. **Go to [Render.com Dashboard](https://dashboard.render.com)**
2. **Find your backend service**
3. **Click "Environment" tab**
4. **Add these variables**:

```bash
# Database
MONGODB_URI=mongodb+srv://ai-agent-user:yourpassword@ai-agent-cluster.xxxxx.mongodb.net/ai-agent-db?retryWrites=true&w=majority

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app-name.vercel.app

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@yourcompany.com

# Python Services (for future use)
TTS_SERVICE_URL=http://localhost:8002
FACE_RECONSTRUCTION_URL=http://localhost:8001
PYTHON_SERVICES_URL=http://localhost:8000
CHROMA_URL=http://localhost:8000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

5. **Click "Save Changes"**
6. **Restart your service** (it will auto-restart)

### 3. Deploy Frontend to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import from GitHub**:
   - Select your `ai-agent-full-stack` repository
   - Choose the `main` branch
4. **Configure project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Set Environment Variables**:
   ```bash
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_WS_URL=wss://your-backend-url.onrender.com
   ```
6. **Click "Deploy"**

### 4. Update Backend with Frontend URL

1. **Copy your Vercel URL** (e.g., `https://ai-agent-frontend.vercel.app`)
2. **Go back to Render.com**
3. **Update the `FRONTEND_URL` environment variable** with your Vercel URL
4. **Restart the service**

## 🧪 Testing Your Deployment

### 1. Test Backend Health
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
    "python": "checking..."
  }
}
```

### 2. Test Frontend
- Visit your Vercel URL
- Check if the React app loads
- Test the avatar gallery
- Try uploading a photo

### 3. Test API Endpoints
```bash
# Test avatar gallery
curl https://your-backend-url.onrender.com/api/avatars/gallery

# Test conversation
curl -X POST https://your-backend-url.onrender.com/api/conversation/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "שלום", "agentId": "test-agent"}'
```

## 🔧 Troubleshooting

### Backend Issues

**MongoDB Connection Error**:
- Check if `MONGODB_URI` is correctly set
- Verify the password in the connection string
- Ensure IP whitelist includes `0.0.0.0/0`

**Service Won't Start**:
- Check Render.com logs for errors
- Verify all environment variables are set
- Check if all dependencies are installed

### Frontend Issues

**API Connection Error**:
- Verify `VITE_API_URL` points to your Render.com backend
- Check CORS settings in backend
- Ensure backend is running

**Build Errors**:
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## 📊 Monitoring

### Render.com
- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory, and response times
- **Uptime**: Check service availability

### Vercel
- **Analytics**: View page views and performance
- **Functions**: Monitor API calls and errors
- **Deployments**: Track deployment history

## 🚀 Next Steps

Once deployed, you can:

1. **Test the full system** with Hebrew text
2. **Upload knowledge base documents** for your agents
3. **Create your first AI agent** with custom avatar
4. **Embed the widget** on your website
5. **Monitor leads and appointments**

## 📞 Support

If you encounter issues:

1. **Check the logs** in Render.com and Vercel dashboards
2. **Verify environment variables** are correctly set
3. **Test API endpoints** individually
4. **Check MongoDB Atlas** connection status

## 🎉 Success!

Once everything is deployed and working:

- ✅ Backend running on Render.com
- ✅ Frontend running on Vercel
- ✅ Database connected via MongoDB Atlas
- ✅ Full-stack AI agent system ready!

Your AI agent system is now live and ready to use! 🚀
