# Local Development Setup Guide

This guide provides detailed instructions for setting up the Dream-to-Task Agent application for local development.

## Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.8+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] Repository cloned
- [ ] Dependencies installed (Node.js and Python)
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Development server running

## Detailed Setup Instructions

### 1. System Requirements

#### Node.js Installation
\`\`\`bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Recommended: Use Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
\`\`\`

#### Python Installation
\`\`\`bash
# Check if Python is installed
python --version
python3 --version

# If not installed, download from https://www.python.org/
# On macOS with Homebrew:
brew install python

# On Ubuntu/Debian:
sudo apt update
sudo apt install python3 python3-pip python3-venv
\`\`\`

#### MongoDB Setup Options

##### Option A: Local MongoDB
\`\`\`bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows
# Download MongoDB Community Server from https://www.mongodb.com/try/download/community
# Follow the installation wizard
# Start MongoDB as a Windows Service
\`\`\`

##### Option B: MongoDB Atlas (Recommended for beginners)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string

### 2. Project Setup

#### Clone and Install
\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/dream-task-agent.git
cd dream-task-agent

# Install Node.js dependencies
npm install

# Create and activate Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r scripts/requirements.txt
\`\`\`

#### Environment Configuration
\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your preferred editor
nano .env.local
# or
code .env.local
\`\`\`

**Required Environment Variables:**
\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/dream-task-agent

# AI Services
OPENAI_API_KEY=sk-your-openai-key-here
PORTIA_API_KEY=your-portia-key-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random

# Optional: For production deployment
VERCEL_URL=your-vercel-url-here
\`\`\`

### 3. Database Initialization

\`\`\`bash
# Ensure MongoDB is running
# For local MongoDB:
mongosh # Should connect successfully

# Initialize database with Python script
python scripts/portia_agent.py
\`\`\`

### 4. Development Workflow

#### Starting the Application
\`\`\`bash
# Terminal 1: Start the Next.js development server
npm run dev

# Terminal 2: Keep Python virtual environment active for API calls
source venv/bin/activate  # or venv\Scripts\activate on Windows
\`\`\`

#### Development Commands
\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
\`\`\`

### 5. Testing Your Setup

#### 1. Basic Application Test
1. Open http://localhost:3000
2. You should see the Dream-to-Task Agent homepage
3. Try signing up with a test account

#### 2. Database Connection Test
\`\`\`bash
# Connect to MongoDB and check collections
mongosh
use dream-task-agent
show collections
db.users.find()
\`\`\`

#### 3. AI Integration Test
1. Log into the application
2. Go to Dashboard
3. Enter a test goal: "I want to learn web development"
4. Select "1 month" timeframe
5. Click "Process with AI"
6. You should see AI-generated tasks and analysis

#### 4. API Endpoints Test
\`\`\`bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test goal processing (after login)
curl -X POST http://localhost:3000/api/portia/process-goal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"goal":"Learn Python programming","timeframe":"1 month"}'
\`\`\`

## Development Tips

### Hot Reload and Live Updates
- Frontend changes reload automatically
- API route changes require server restart
- Python script changes require manual restart

### Database Management
\`\`\`bash
# View database contents
mongosh
use dream-task-agent
db.users.find().pretty()
db.goals.find().pretty()
db.tasks.find().pretty()

# Clear database for fresh start
db.users.deleteMany({})
db.goals.deleteMany({})
db.tasks.deleteMany({})
\`\`\`

### Debugging
- Use browser DevTools for frontend debugging
- Check terminal output for API errors
- Use `console.log("[v0] ...")` for debugging API routes
- Python errors will appear in the terminal when scripts run

### Common Development Patterns
\`\`\`javascript
// API route debugging
console.log("[v0] Processing goal:", goal);
console.log("[v0] User ID:", userId);

// Component debugging
useEffect(() => {
  console.log("[v0] Component mounted with props:", props);
}, []);
\`\`\`

## Troubleshooting Guide

### Port Conflicts
\`\`\`bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Use different port
npm run dev -- -p 3001
\`\`\`

### MongoDB Issues
\`\`\`bash
# Check MongoDB status
brew services list | grep mongodb  # macOS
sudo systemctl status mongod       # Linux

# Restart MongoDB
brew services restart mongodb/brew/mongodb-community  # macOS
sudo systemctl restart mongod                         # Linux
\`\`\`

### Python Environment Issues
\`\`\`bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r scripts/requirements.txt
\`\`\`

### Clear Application Data
\`\`\`bash
# Clear browser data for localhost:3000
# Or use incognito/private browsing

# Reset database
mongosh
use dream-task-agent
db.dropDatabase()
\`\`\`

## Next Steps

After successful setup:
1. Explore the codebase structure
2. Try creating different types of goals
3. Test all UI components and features
4. Experiment with the Portia AI integration
5. Customize the application for your needs

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
