# GitHub Repository Setup Guide

## Quick Setup Instructions

### 1. Create GitHub Repository
- Go to GitHub.com and click "New repository"
- Name: `malaysian-startup-ecosystem`
- Keep it public
- Don't initialize with README, .gitignore, or license (we have these ready)

### 2. Download Project Files
Download all files from this Replit workspace to your local machine, excluding:
- `attached_assets/` folder
- Any `*_session.txt` or `*_cookies.txt` files
- `test-bcrypt.js`

### 3. Initialize and Push
```bash
cd malaysian-startup-ecosystem
git init
git add .
git commit -m "Initial commit: Malaysian Startup Ecosystem Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/malaysian-startup-ecosystem.git
git push -u origin main
```

## Repository Structure
```
malaysian-startup-ecosystem/
├── client/                  # React frontend
├── server/                  # Express.js backend
├── shared/                  # Shared schemas and types
├── README.md               # Project documentation
├── DEPLOYMENT.md           # Deployment instructions
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Styling config
├── vite.config.ts          # Build config
└── .gitignore              # Git ignore rules
```

## Environment Variables for Production
When deploying to Vercel/Railway/Render, set:
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
GEMINI_API_KEY=your_gemini_api_key_here
```

## Platform Features
- ✅ Multi-role authentication (Founder/Funder/Ecosystem Builder/Admin)
- ✅ Google Gemini AI integration for intelligent responses
- ✅ Web scraping for Malaysian startup ecosystem data
- ✅ Comprehensive database with sample data
- ✅ Modern React frontend with TypeScript
- ✅ Production-ready Express.js backend

## Test Accounts
- Founder: alice.tan@ecobreeze.co / password123
- Funder: raj.kumar@klcapital.my / password123
- Ecosystem Builder: sarah.lim@techmalaysia.org / password123
- Admin: admin@ecosystem.my / password123

Your platform is ready for deployment with authentic Malaysian startup ecosystem data and AI-powered features.