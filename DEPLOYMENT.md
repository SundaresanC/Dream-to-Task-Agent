# Deployment Guide

This guide covers deploying the Dream-to-Task Agent to various platforms.

## Vercel (Recommended)

### Quick Deploy

1. **One-Click Deploy**:
   - Click the "Deploy to Vercel" button in the README
   - Connect your GitHub account
   - Set environment variables
   - Deploy

2. **Manual Deploy**:
   \`\`\`bash
   npm i -g vercel
   vercel login
   vercel
   \`\`\`

### Environment Variables

Set these in your Vercel dashboard under Settings > Environment Variables:

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `NEXT_PUBLIC_APP_URL`: Your app's URL (e.g., https://your-app.vercel.app)

### Custom Domain

1. Go to your Vercel project dashboard
2. Navigate to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed

## GitHub Integration

### Automatic Deployments

1. **Setup Repository**:
   - Fork the repository
   - Enable GitHub Actions in your fork

2. **Configure Secrets**:
   Go to Settings > Secrets and variables > Actions and add:
   - `VERCEL_TOKEN`: Get from Vercel Account Settings
   - `VERCEL_ORG_ID`: Found in Vercel team settings
   - `VERCEL_PROJECT_ID`: Found in Vercel project settings
   - `OPENAI_API_KEY`: Your OpenAI API key

3. **Deployment Flow**:
   - Push to `main` → Production deployment
   - Create PR → Preview deployment
   - Merge PR → Production deployment

## Alternative Platforms

### Netlify

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy with automatic builds

### Docker

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

## Environment Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | App URL | `https://app.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |

## Performance Optimization

### Build Optimization

- Enable static optimization
- Use image optimization
- Implement proper caching headers
- Minimize bundle size

### Monitoring

- Set up error tracking (Sentry)
- Monitor performance (Vercel Analytics)
- Track user behavior (Google Analytics)

## Security Considerations

- Keep API keys secure
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs
- Use environment variables for secrets

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (18+)
   - Verify environment variables
   - Review build logs

2. **API Errors**:
   - Validate OpenAI API key
   - Check API rate limits
   - Review error logs

3. **Performance Issues**:
   - Optimize images
   - Implement caching
   - Use CDN for static assets

### Support

- Check GitHub Issues
- Review Vercel documentation
- Contact support team
