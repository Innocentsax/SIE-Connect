# Manual GitHub Upload Instructions

## Step 1: Download Project Files
Download these essential files from your Replit workspace:

### Core Application Files
```
client/                     # React frontend (entire folder)
server/                     # Express backend (entire folder)  
shared/                     # Shared schemas (entire folder)
README.md                   # Project documentation
DEPLOYMENT.md               # Deployment guide
GITHUB_SETUP.md            # GitHub setup instructions
.gitignore                  # Git ignore rules
deploy-to-github.sh        # Deployment script
drizzle.config.ts          # Database configuration
tsconfig.json              # TypeScript configuration
tailwind.config.ts         # Styling configuration
vite.config.ts             # Build configuration
postcss.config.js          # PostCSS configuration
components.json            # UI components configuration
package.json               # Dependencies (from workspace)
package-lock.json          # Lock file (from workspace)
```

### Exclude These Files
```
attached_assets/           # Sample assets (not needed)
*_session.txt             # Session files
*_cookies.txt             # Cookie files
test-bcrypt.js            # Test file
.env                      # Environment file (create new one)
```

## Step 2: Create GitHub Repository
1. Go to GitHub.com
2. Click "New repository" 
3. Name: `malaysian-startup-ecosystem`
4. Keep public
5. Don't initialize with README (we have one)

## Step 3: Upload Files
1. Click "uploading an existing file"
2. Drag and drop all downloaded files
3. Commit message: "Initial commit: Malaysian Startup Ecosystem Platform"

## Step 4: Environment Variables
Create `.env` file with:
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 5: Production Deployment
Deploy to Vercel/Railway/Render with environment variables set.

Your platform includes:
- Multi-role authentication system
- Google Gemini AI integration  
- Web scraping capabilities
- Malaysian startup ecosystem data
- Production-ready architecture

Test accounts ready:
- Founder: alice.tan@ecobreeze.co / password123
- Funder: raj.kumar@klcapital.my / password123
- Ecosystem Builder: sarah.lim@techmalaysia.org / password123
- Admin: admin@ecosystem.my / password123