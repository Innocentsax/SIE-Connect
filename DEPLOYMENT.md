# Deployment Guide

## GitHub Setup

### 1. Create GitHub Repository
```bash
# Create a new repository on GitHub
# Then connect your local repository
git remote add origin https://github.com/yourusername/malaysian-startup-ecosystem.git
git branch -M main
git add .
git commit -m "Initial commit: Malaysian Startup Ecosystem Platform"
git push -u origin main
```

### 2. Environment Variables
Set up the following environment variables:

```env
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Optional (for enhanced features)
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

### Setup Steps
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Initialize database: `npm run db:push`
5. Seed sample data: `npm run seed`
6. Start development server: `npm run dev`

## Production Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway Deployment
1. Connect GitHub repository to Railway
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy with automatic builds

### Render Deployment
1. Create new Web Service from GitHub
2. Add PostgreSQL database
3. Set environment variables
4. Configure build and start commands

## Database Migration

### Initial Setup
```bash
npm run db:push
```

### Seeding Data
```bash
npm run seed
```

### Database Studio
```bash
npm run db:studio
```

## Security Checklist

- [x] Environment variables configured
- [x] Database credentials secured
- [x] API keys protected
- [x] Session security implemented
- [x] Input validation active
- [x] CORS configured

## Monitoring

### Health Checks
- Database connectivity
- API service availability
- Authentication system status
- Web scraping functionality

### Performance Metrics
- Response times
- Database query performance
- AI service latency
- User engagement metrics

## Troubleshooting

### Common Issues
1. **Database Connection**: Verify DATABASE_URL format
2. **API Keys**: Ensure GEMINI_API_KEY is valid
3. **Build Errors**: Check TypeScript compilation
4. **Authentication**: Verify session configuration

### Debug Commands
```bash
# Check database connection
npm run db:studio

# Verify environment variables
npm run env:check

# Test API endpoints
npm run test:api
```

## Backup Strategy

### Database Backups
- Daily automated backups
- Point-in-time recovery
- Cross-region replication

### Code Backups
- GitHub repository
- Deployment platform backups
- Local development copies