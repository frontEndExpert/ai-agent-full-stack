# AI Agent Full-Stack Application

A comprehensive full-stack web application that generates live AI agents with 3D avatars, Hebrew TTS, lip sync, and conversational AI capabilities. Perfect for businesses looking to create interactive AI assistants for their websites.

## 🚀 Features

### Core Features
- **3D Avatar Generation**: Create avatars from photos, text descriptions, or choose from 10+ pre-made avatars
- **Real-time Lip Sync**: Wav2Lip integration for natural lip movement synchronized with speech
- **Hebrew TTS**: High-quality Hebrew text-to-speech using Coqui TTS and Piper TTS
- **Conversational AI**: Ollama-powered LLM for intelligent conversations
- **Lead Capture**: Automatic lead collection and CRM integration
- **Appointment Scheduling**: Built-in calendar and booking system
- **Multi-Agent Management**: Create and manage multiple AI agents
- **Embeddable Widget**: Deploy agents as widgets on any website

### Technical Features
- **RAG Knowledge Base**: Vector database for custom business knowledge
- **Real-time Communication**: WebSocket support for live interactions
- **Responsive Design**: Mobile and desktop optimized
- **Modular Architecture**: Easy to extend and customize
- **Cost Optimized**: Uses only free and open-source libraries

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Python        │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • 3D Avatar     │    │ • REST API      │    │ • Face Recon    │
│ • Chat UI       │    │ • WebSocket     │    │ • Hebrew TTS    │
│ • Admin Panel   │    │ • Database      │    │ • Wav2Lip       │
│ • Widget        │    │ • Auth          │    │ • Knowledge     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   External      │
                    │   Services      │
                    │                 │
                    │ • Ollama LLM    │
                    │ • MongoDB       │
                    │ • ChromaDB      │
                    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Three.js** for 3D avatar rendering
- **@react-three/fiber** for React Three.js integration
- **Tailwind CSS** for styling
- **Socket.io-client** for real-time communication

### Backend
- **Node.js** with Express
- **MongoDB** for data storage
- **ChromaDB** for vector database
- **Socket.io** for WebSocket support
- **Multer** for file uploads

### Python Services
- **FastAPI** for Python microservices
- **face_recognition** for facial feature extraction
- **MediaPipe** for 3D face reconstruction
- **Coqui TTS** for Hebrew text-to-speech
- **Wav2Lip** for lip synchronization
- **ChromaDB** for vector operations

### AI/ML
- **Ollama** for local LLM inference
- **sentence-transformers** for embeddings
- **ChromaDB** for RAG implementation

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- Ollama
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-agent-full-stack
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or install MongoDB locally
   ```

5. **Start Ollama**
   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh
   
   # Pull a model
   ollama pull llama3.2
   
   # Start Ollama
   ollama serve
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Or start services individually
   npm run dev:frontend  # Frontend on :3000
   npm run dev:backend   # Backend on :5000
   ```

### Docker Deployment

1. **Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. Add environment variable: `VITE_BACKEND_URL`

### Render.com (Backend)
1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration
3. Set environment variables in Render dashboard
4. Deploy the backend service

### Manual Deployment
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the backend to your server
3. Set up reverse proxy (nginx/Apache)
4. Configure SSL certificates

## 📖 Usage

### Creating an AI Agent

1. **Access Admin Panel**
   - Navigate to http://localhost:3000/admin
   - Click "Create New Agent"

2. **Configure Basic Info**
   - Enter agent name and description
   - Select language (Hebrew/English/Arabic)
   - Set personality traits

3. **Choose Avatar**
   - Select from 10+ pre-made avatars
   - Upload custom photo for face reconstruction
   - Or describe your ideal avatar

4. **Set Up Knowledge Base**
   - Upload documents (PDF, TXT, MD)
   - Add product information
   - Configure sales scripts

5. **Enable Features**
   - Lead capture
   - Appointment scheduling
   - Sales automation

6. **Deploy Widget**
   - Copy embed code
   - Add to your website
   - Customize appearance

### Embedding the Widget

Add this code to your website before the closing `</body>` tag:

```html
<script src="https://your-domain.com/api/widget/AGENT_ID/script"></script>
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ai-agent

# AI Services
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Python Services
PYTHON_SERVICES_URL=http://localhost:8000
FACE_RECONSTRUCTION_URL=http://localhost:8001
TTS_SERVICE_URL=http://localhost:8002
LIPSYNC_SERVICE_URL=http://localhost:8003

# File Storage
UPLOAD_DIR=./uploads
AVATAR_DIR=./public/avatars
TEMP_DIR=./temp

# Email (for appointments)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:5000
```

### Agent Configuration

Each agent can be configured with:
- **Personality**: Communication style and tone
- **Knowledge Base**: Custom documents and information
- **Sales Scripts**: Conversation flows for sales
- **Lead Capture**: Required fields and validation
- **Appointments**: Working hours and availability
- **Widget Theme**: Colors, position, and size

## 🧪 Testing

### Hebrew TTS Testing
```bash
# Test Hebrew TTS
cd python-services
python tts/hebrew_tts.py "שלום! איך אני יכול לעזור לך היום?"
```

### Avatar Generation Testing
```bash
# Test face reconstruction
cd python-services
python face_reconstruction/generate_avatar.py path/to/photo.jpg
```

### API Testing
```bash
# Test conversation API
curl -X POST http://localhost:5000/api/conversation/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "שלום", "agentId": "your-agent-id"}'
```

## 📊 Monitoring

### Health Checks
- Backend: `GET /api/health`
- Python Services: `GET /health`
- Database connectivity
- Ollama status

### Analytics
- Conversation metrics
- Lead conversion rates
- Appointment bookings
- Agent performance

## 🔒 Security

### Authentication
- JWT-based authentication
- Role-based access control
- API rate limiting

### Data Protection
- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Environment variable protection

## 🐛 Troubleshooting

### Common Issues

1. **Ollama not responding**
   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/tags
   
   # Restart Ollama
   ollama serve
   ```

2. **Python services failing**
   ```bash
   # Check Python dependencies
   pip install -r python-services/requirements.txt
   
   # Check service logs
   docker logs ai-agent-python
   ```

3. **Avatar generation errors**
   - Ensure photo is clear and well-lit
   - Check file size (max 10MB)
   - Verify Python dependencies are installed

4. **TTS not working**
   - Check if Coqui TTS models are downloaded
   - Verify audio file permissions
   - Check Python service logs

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Three.js** for 3D graphics
- **Coqui TTS** for Hebrew text-to-speech
- **Wav2Lip** for lip synchronization
- **Ollama** for local LLM inference
- **ChromaDB** for vector database
- **MediaPipe** for face detection

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

## 🔄 Updates

### Version 1.0.0
- Initial release
- 3D avatar generation
- Hebrew TTS support
- Real-time lip sync
- Multi-agent management
- Embeddable widgets
- Lead capture and CRM
- Appointment scheduling

---

**Built with ❤️ for the AI community**
#   a i - a g e n t - f u l l - s t a c k  
 