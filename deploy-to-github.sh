#!/bin/bash

# Malaysian Startup Ecosystem Platform - GitHub Deployment Script
# Run this script after downloading all files to your local machine

echo "🚀 Deploying Malaysian Startup Ecosystem Platform to GitHub..."

# Initialize git repository
git init

# Configure git user (replace with your details)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Malaysian Startup Ecosystem Platform

Features:
- Multi-role authentication (Founder/Funder/Ecosystem Builder/Admin)
- Google Gemini AI integration for intelligent responses
- Web scraping for Malaysian startup ecosystem data
- Comprehensive database with sample data
- Modern React frontend with TypeScript
- Production-ready Express.js backend

Test accounts:
- Founder: alice.tan@ecobreeze.co / password123
- Funder: raj.kumar@klcapital.my / password123
- Ecosystem Builder: sarah.lim@techmalaysia.org / password123
- Admin: admin@ecosystem.my / password123"

# Set main branch
git branch -M main

# Add remote origin (replace with your repository URL)
echo "📝 Please update the repository URL below with your GitHub username:"
echo "git remote add origin https://github.com/YOUR_USERNAME/malaysian-startup-ecosystem.git"
read -p "Press Enter after updating the URL above and running the command..."

# Push to GitHub
git push -u origin main

echo "✅ Deployment complete! Your platform is now on GitHub."
echo ""
echo "Next steps:"
echo "1. Set up environment variables on your hosting platform:"
echo "   - DATABASE_URL=your_postgresql_connection_string"
echo "   - GEMINI_API_KEY=your_gemini_api_key"
echo ""
echo "2. Deploy to production platform (Vercel/Railway/Render)"
echo "3. Run 'npm run seed' to populate with Malaysian startup data"
echo ""
echo "Your platform includes authentic Malaysian startup ecosystem data and AI-powered features!"