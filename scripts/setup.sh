#!/bin/bash
LLM_PROVIDER=gemini-1.5-flash
OPENAI_API_KEY=AIzaSyDyZWCMNU2B-y3UGOl4fqWGkoXgG_F7xJ8
PORTIA_API_KEY=prt-Efed6dNJ.qfVo5kEnKq7rQ8JeXx8SSE11MsePlYX4
GEMINI_API_KEY=AIzaSyDyZWCMNU2B-y3UGOl4fqWGkoXgG_F7xJ8
# Dream-to-Task Agent Local Setup Script
# This script automates the local development setup

set -e  # Exit on any error

echo "🚀 Setting up Dream-to-Task Agent for local development..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ from https://python.org/"
    exit 1
fi

echo "✅ Python $(python3 --version) found"

# Check MongoDB
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo "⚠️  MongoDB CLI not found. Make sure MongoDB is installed and running."
    echo "   You can also use MongoDB Atlas (cloud) instead."
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Set up Python virtual environment
echo "🐍 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install -r scripts/requirements.txt

# Set up environment variables
echo "⚙️  Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "📝 Created .env.local file. Please edit it with your configuration:"
    echo "   - Add your OPENAI_API_KEY"
    echo "   - Add your PORTIA_API_KEY"
    echo "   - Configure MONGODB_URI"
    echo "   - Set a secure JWT_SECRET"
else
    echo "✅ .env.local already exists"
fi

# Test MongoDB connection
echo "🔍 Testing MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB connection successful"
    else
        echo "⚠️  Could not connect to MongoDB. Make sure it's running or configure MongoDB Atlas."
    fi
elif command -v mongo &> /dev/null; then
    if mongo --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB connection successful"
    else
        echo "⚠️  Could not connect to MongoDB. Make sure it's running or configure MongoDB Atlas."
    fi
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Edit .env.local with your API keys and configuration"
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see README.md and LOCAL_SETUP.md"
echo ""
echo "Happy coding! 🚀"
