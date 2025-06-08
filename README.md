# Malaysian Startup Ecosystem Platform

A comprehensive platform that connects startups, funders, and ecosystem builders through AI-powered matching, intelligent web scraping, and multi-role authentication.

## Features

### 🚀 Core Functionality
- **Intelligent Discovery Platform**: Find startups, funding opportunities, and ecosystem events
- **AI-Powered Matching**: Personalized recommendations using Google Gemini AI
- **Web Scraping Intelligence**: Real-time data collection without external API dependencies
- **Multi-Role Authentication**: Separate workflows for Founders, Funders, and Ecosystem Builders

### 🤖 AI Capabilities
- **Google Gemini Integration**: Intelligent chat responses and market insights
- **Web Search Service**: Autonomous data collection from Malaysian startup ecosystem
- **Smart Matching**: AI-driven startup-opportunity matching algorithms
- **Contextual Responses**: Role-based, location-aware assistance

### 🔐 Authentication & Security
- **Role-Based Access Control**: STARTUP_FOUNDER, FUNDER, ECOSYSTEM_BUILDER, ADMIN
- **Secure Session Management**: Database-backed session storage
- **Password Security**: bcrypt encryption for user credentials
- **Protected Routes**: Authentication middleware for sensitive operations

## Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database with Drizzle ORM
- **Google Gemini AI** for intelligent responses
- **Web Scraping** with autonomous search capabilities

### Frontend
- **React** with Vite
- **TypeScript**
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for routing

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/startup_ecosystem
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation
```bash
npm install
npm run db:push
npm run dev
```

### Seeding Sample Data
```bash
# Seed the database with Malaysian startup ecosystem data
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Startups & Opportunities
- `GET /api/startups` - List startups with filtering
- `GET /api/opportunities` - List funding opportunities
- `POST /api/startups` - Create startup (authenticated)
- `POST /api/opportunities` - Create opportunity (authenticated)

### AI & Intelligence
- `POST /api/ai/chat` - Intelligent chat with Gemini AI
- `POST /api/scraping/intelligent` - Web scraping for opportunities
- `GET /api/recommendations` - AI-powered recommendations

### Admin Features
- `GET /api/admin/users` - List all users (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (admin only)

## Test Accounts

The platform comes with pre-seeded test accounts:

### Startup Founder
- **Email**: alice.tan@ecobreeze.co
- **Password**: password123
- **Company**: EcoBreeze Solutions

### Funder/Investor
- **Email**: raj.kumar@klcapital.my
- **Password**: password123
- **Organization**: KL Venture Capital

### Ecosystem Builder
- **Email**: sarah.lim@techmalaysia.org
- **Password**: password123
- **Organization**: TechMalaysia

### Admin
- **Email**: admin@ecosystem.my
- **Password**: password123

## Sample Data

The platform includes authentic Malaysian startup ecosystem data:

### Startups
- MediAI (Healthcare AI)
- EcoBreeze Solutions (Climate Tech)
- FinFlow (Fintech)

### Funding Opportunities
- Cradle CIP Spark Grant (Up to MYR 50k)
- She Wins Climate Southeast Asia 2025
- Selangor Accelerator Programme 2024
- Asia Gender Equality Fund

### Events
- Startup Malaysia Summit 2025
- FinTech Festival KL
- Climate Tech Showcase

## Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database Migrations
```bash
npm run db:push  # Push schema changes
npm run db:studio  # Open Drizzle Studio
```

## Architecture

### Database Schema
- **users**: User accounts with role-based access
- **startups**: Startup profiles and information
- **opportunities**: Funding opportunities and grants
- **events**: Ecosystem events and networking
- **applications**: Startup applications to opportunities
- **saved_opportunities**: User bookmarks

### AI Integration
- **Gemini Service**: Intelligent chat and recommendations
- **Web Search Service**: Autonomous data collection
- **Embedding System**: Semantic search and matching

### Security Features
- Password hashing with bcrypt
- Session-based authentication
- CORS protection
- Input validation with Zod schemas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the GitHub repository.

---

**Built for the Malaysian startup ecosystem with ❤️**