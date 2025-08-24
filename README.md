# Dream-to-Task Agent

An AI-powered system that transforms your dreams and goals into actionable tasks using Portia AI's agentic workflow system with intelligent scheduling and platform integrations.

## Features

- **Portia AI Agentic Workflows**: Advanced multi-agent planning and execution system
- **Gemini 2.5 Flash Integration**: Latest Google AI model with enhanced reasoning capabilities
- **AI-Powered Goal Processing**: Convert abstract dreams into specific, actionable tasks
- **Smart Task Management**: Kanban boards, calendar views, and progress tracking
- **Platform Integrations**: Connect with YouTube, Google Calendar, Notion, GitHub, and more
- **Intelligent Scheduling**: AI-generated timelines and realistic task planning
- **Modern UI**: Clean, accessible interface with dark/light mode support
- **MongoDB Integration**: Persistent data storage with user authentication

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI**: Portia AI SDK (Python) + Gemini 2.5 Flash / OpenAI GPT-4 via AI SDK
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Components**: Radix UI primitives with shadcn/ui
- **Authentication**: JWT-based session management
- **Deployment**: Vercel with automatic GitHub integration

## Local Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **Python 3.8+** (Download from [python.org](https://www.python.org/))
- **MongoDB** (Install locally or use MongoDB Atlas)
- **Git** (Download from [git-scm.com](https://git-scm.com/))

### Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/dream-task-agent.git
cd dream-task-agent
\`\`\`

### Step 2: Install Node.js Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 3: Install Python Dependencies

\`\`\`bash
# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r scripts/requirements.txt
\`\`\`

### Step 4: Set Up MongoDB

#### Option A: Local MongoDB Installation

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   \`\`\`bash
   # On Windows (as Administrator):
   net start MongoDB
   
   # On macOS:
   brew services start mongodb/brew/mongodb-community
   
   # On Linux:
   sudo systemctl start mongod
   \`\`\`

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string from the "Connect" button

### Step 5: Environment Variables Setup

1. Copy the example environment file:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Edit `.env.local` with your configuration:
   \`\`\`env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/dream-task-agent
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dream-task-agent

   # AI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   PORTIA_API_KEY=your_portia_api_key_here

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_here_make_it_long_and_random
   \`\`\`

### Step 6: Initialize the Database

Run the Python script to set up the database:

\`\`\`bash
# Make sure your virtual environment is activated
python scripts/portia_agent.py
\`\`\`

### Step 7: Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Testing the Application

### 1. User Registration and Authentication
- Navigate to the homepage
- Click "Sign Up" and create a new account
- Log in with your credentials

### 2. Goal Processing with Portia AI & Gemini 2.5 Flash
- Go to the Dashboard
- Enter a goal in the "Capture Your Dream" section
- Select a timeframe (1 week, 1 month, 3 months, 6 months)
- Click "Process with AI" to see Portia's agentic workflow powered by Gemini 2.5 Flash

### 3. Testing Gemini Integration
```bash
# Test Gemini configuration
python scripts/test_gemini.py

# Test goal processing with Gemini
python scripts/portia_agent.py "Learn to play guitar" "3-months" "test-user" "false"
```

### 4. Task Management
- Navigate to the Tasks page
- View tasks in different formats (Kanban, List, Calendar)
- Update task statuses and priorities
- Use filters and search functionality

### 5. Platform Integrations
- Go to the Integrations page
- Connect various platforms (mock integrations for local development)
- Configure automation settings

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Goals and Tasks
- `POST /api/portia/process-goal` - Process goals with Portia AI
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks` - Update task

### Integrations
- `POST /api/integrations/connect` - Connect platform integrations
- `POST /api/integrations/sync` - Sync platform data

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   \`\`\`
   Error: connect ECONNREFUSED 127.0.0.1:27017
   \`\`\`
   - Ensure MongoDB is running locally
   - Check your MONGODB_URI in .env.local

2. **Python Dependencies Error**
   \`\`\`
   ModuleNotFoundError: No module named 'portia'
   \`\`\`
   - Activate your virtual environment
   - Run `pip install -r scripts/requirements.txt`

3. **OpenAI API Error**
   \`\`\`
   Error: Invalid API key
   \`\`\`
   - Verify your OPENAI_API_KEY in .env.local
   - Ensure you have credits in your OpenAI account

4. **Port Already in Use**
   \`\`\`
   Error: Port 3000 is already in use
   \`\`\`
   - Kill the process using port 3000: `lsof -ti:3000 | xargs kill -9`
   - Or use a different port: `npm run dev -- -p 3001`

### Development Tips

1. **Hot Reload**: The development server supports hot reload for both frontend and API changes
2. **Database Inspection**: Use MongoDB Compass to inspect your local database
3. **API Testing**: Use tools like Postman or curl to test API endpoints
4. **Logs**: Check the terminal for detailed error messages and debug information

## Project Structure

\`\`\`
dream-task-agent/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── portia/        # Portia AI integration
│   │   ├── tasks/         # Task management
│   │   └── integrations/  # Platform integrations
│   ├── dashboard/         # Dashboard pages
│   ├── tasks/            # Task management pages
│   ├── integrations/     # Integration pages
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── task-management/  # Task-related components
│   └── integrations/     # Integration components
├── lib/                  # Utility functions
│   ├── database.ts       # MongoDB connection and models
│   ├── auth.ts          # Authentication utilities
│   └── portia-integration.ts # Portia AI integration
├── scripts/              # Python scripts
│   ├── portia_agent.py   # Main Portia AI agent
│   └── requirements.txt  # Python dependencies
└── public/              # Static assets
\`\`\`

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/dream-task-agent` |
| `OPENAI_API_KEY` | OpenAI API key for AI processing | Yes | `sk-...` |
| `PORTIA_API_KEY` | Portia AI API key | Yes | `portia_...` |
| `NEXT_PUBLIC_APP_URL` | Public URL of the application | Yes | `http://localhost:3000` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | `your_long_random_secret` |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@dreamtaskagent.com or create an issue on GitHub.
