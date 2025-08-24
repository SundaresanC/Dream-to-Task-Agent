# Portia AI Integration Setup Guide

This guide covers the enhanced Portia AI integration for the Dream-to-Task Agent.

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dream-task-agent
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dream-task-agent

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
PORTIA_API_KEY=your_portia_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Portia Configuration
PORTIA_LOG_LEVEL=INFO  # Options: INFO, DEBUG, TRACE
LLM_PROVIDER=gemini-2.5-flash  # Options: openai, anthropic, gemini, gemini-2.5-flash
GEMINI_MODEL=gemini-2.5-flash  # Options: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-pro

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_here_make_it_long_and_random

# Optional: Additional LLM Providers
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting API Keys

### Portia API Key
1. Visit [app.portialabs.ai](https://app.portialabs.ai)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Set it as `PORTIA_API_KEY` in your environment

### Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Go to "Get API key" in the left sidebar
4. Create a new API key
5. Set it as `GEMINI_API_KEY` in your environment

## Enhanced Features

### 1. Cloud Logging
- When `PORTIA_API_KEY` is set, all runs are logged to Portia's cloud dashboard
- View detailed execution logs, tool calls, and performance metrics
- Monitor agent performance and debug issues

### 2. Enhanced Goal Analysis
- Improved complexity analysis with risk factors
- Better categorization (learning, business, health, creative, etc.)
- More detailed task breakdown with dependencies and tags

### 3. User Attribution
- Track which user initiated which workflow
- Monitor user-specific patterns and preferences
- Better analytics and reporting

### 4. Advanced Logging
- Set `PORTIA_LOG_LEVEL=TRACE` for ultra-verbose logging
- Includes LLM calls, plan generation, and tool execution
- Debug complex workflows more effectively

### 5. Gemini 2.5 Flash Integration
- Latest Gemini model with enhanced reasoning capabilities
- Faster response times and better cost efficiency
- Advanced multimodal understanding for complex goals
- Configurable model selection (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-pro)

## Usage Examples

### Command Line
```bash
# Basic usage with Gemini 2.5 Flash
python scripts/portia_agent.py "Learn to play guitar" "3-months"

# With user ID and cloud logging
python scripts/portia_agent.py "Start a YouTube channel" "6-months" "user123" "true"

# With debug logging and specific Gemini model
PORTIA_LOG_LEVEL=DEBUG GEMINI_MODEL=gemini-2.0-flash python scripts/portia_agent.py "Build a mobile app" "1-year" "user456" "true"

# Using different Gemini models
GEMINI_MODEL=gemini-1.5-pro python scripts/portia_agent.py "Create a business plan" "6-months" "user789" "true"
```

### API Usage
The enhanced agent automatically:
- Extracts user ID from the request context
- Enables cloud logging if `PORTIA_API_KEY` is available
- Provides detailed error handling and fallback analysis
- Returns enhanced results with user attribution

## Troubleshooting

### Common Issues

1. **Portia SDK Not Available**
   ```bash
   pip install portia-sdk-python>=0.7.0
   ```

2. **Missing Environment Variables**
   - Ensure all required variables are set in `.env.local`
   - Check that `PORTIA_API_KEY` is valid
   - Verify `GEMINI_API_KEY` is set for Gemini integration

3. **Gemini API Issues**
   - Ensure `GEMINI_API_KEY` is valid and has sufficient quota
   - Check that the specified model (e.g., `gemini-2.5-flash`) is available
   - Verify network connectivity to Google AI services

4. **Cloud Logging Not Working**
   - Verify `PORTIA_API_KEY` is set correctly
   - Check network connectivity to Portia's servers
   - Review logs for authentication errors

5. **Python Dependencies**
   ```bash
   pip install -r scripts/requirements.txt
   ```

## Performance Monitoring

With cloud logging enabled, you can monitor:
- Agent execution times
- Tool call success rates
- User interaction patterns
- Goal complexity distribution
- Task generation quality

Visit [app.portialabs.ai](https://app.portialabs.ai) to view your dashboard and analytics.
