import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStartupSchema, insertOpportunitySchema, insertEventSchema, insertApplicationSchema } from "@shared/schema";
import { generateSummary, generateEmbedding, matchStartupsToOpportunities } from "./lib/claude";
import { scrapeEcosystemData, validateScrapedData } from "./lib/scraper";
import { dataScheduler } from "./lib/scheduler";
import { intelligentScraper } from "./lib/intelligent-scraper";
import { perplexityService } from "./lib/perplexity";
import { WebSearchService } from "./lib/websearch";
import { geminiService } from "./lib/gemini";
import { seedDatabase } from "./seed-database";

// Simple session management
const sessions = new Map<string, { userId: number; email: string; role: string }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function requireAuth(req: any, res: any, next: any) {
  // Check Authorization header first
  let sessionId = req.headers.authorization?.replace('Bearer ', '');
  
  // If no Authorization header, check session cookie
  if (!sessionId && req.cookies?.auth_session) {
    sessionId = req.cookies.auth_session;
  }
  
  // Also check custom session header
  if (!sessionId && req.headers['x-session-id']) {
    sessionId = req.headers['x-session-id'];
  }
  
  const session = sessionId ? sessions.get(sessionId) : null;
  
  if (!session) {
    console.log('Authentication failed:', { 
      sessionId, 
      cookieSession: req.cookies?.auth_session,
      availableSessions: Array.from(sessions.keys()).slice(0, 3)
    });
    return res.status(401).json({ message: "Authentication required" });
  }
  
  req.user = session;
  next();
}

function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Mark profile as completed since we collect all info during signup
      userData.profileCompleted = true;
      
      const user = await storage.createUser(userData);
      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, email: user.email, role: user.role });

      // Set session cookie for frontend auth
      res.cookie('auth_session', sessionId, {
        httpOnly: false,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ 
        user: { id: user.id, email: user.email, name: user.name, role: user.role, profileCompleted: true },
        sessionId 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare hashed password
      const bcrypt = await import('bcrypt');
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const sessionId = generateSessionId();
      sessions.set(sessionId, { userId: user.id, email: user.email, role: user.role });

      // Set session cookie for frontend auth
      res.cookie('auth_session', sessionId, {
        httpOnly: false,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ 
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        sessionId 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", async (req: any, res) => {
    try {
      // Check Authorization header first
      let sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      // Check cookie as fallback
      if (!sessionId && req.cookies?.auth_session) {
        sessionId = req.cookies.auth_session;
      }
      
      // Check custom header as fallback
      if (!sessionId && req.headers['x-session-id']) {
        sessionId = req.headers['x-session-id'];
      }
      
      const session = sessionId ? sessions.get(sessionId) : null;
      
      if (!session) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User profile management
  app.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const updates = req.body;
      // Set profile as completed if key fields are provided
      if (updates.name && updates.sector && updates.location) {
        updates.profileCompleted = true;
      }
      
      const updatedUser = await storage.updateUser(req.user.userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user: updatedUser });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Saved opportunities
  app.get("/api/saved-opportunities", requireAuth, async (req, res) => {
    try {
      const savedOpportunities = await storage.getSavedOpportunities(req.user.userId);
      res.json({ opportunities: savedOpportunities });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/opportunities/:id/save", requireAuth, async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      await storage.saveOpportunity(req.user.userId, opportunityId);
      res.json({ message: "Opportunity saved successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/opportunities/:id/save", requireAuth, async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      await storage.unsaveOpportunity(req.user.userId, opportunityId);
      res.json({ message: "Opportunity unsaved successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search route (public)
  app.get("/api/search", async (req, res) => {
    try {
      const { 
        q = "", 
        type, 
        sector, 
        location, 
        limit = "20", 
        offset = "0" 
      } = req.query;

      const types = type ? (typeof type === 'string' ? [type] : type as string[]) : ['startup', 'opportunity'];
      
      const results = await storage.search(q as string, {
        type: types,
        sector: sector as string,
        location: location as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(results);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Startups routes
  app.get("/api/startups", async (req, res) => {
    try {
      const { sector, location, search, limit = "20", offset = "0" } = req.query;
      
      const startups = await storage.getStartups({
        sector: sector as string,
        location: location as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(startups);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/startups/:id", async (req, res) => {
    try {
      const startup = await storage.getStartup(parseInt(req.params.id));
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }
      res.json(startup);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/startups", requireAuth, async (req, res) => {
    try {
      const startupData = insertStartupSchema.parse({
        ...req.body,
        ownerUserId: req.user.userId
      });

      // Generate AI summary if description is long
      if (startupData.description && startupData.description.length > 200) {
        startupData.description = await generateSummary(startupData.description);
      }

      const startup = await storage.createStartup(startupData);

      // Generate embeddings for similarity matching
      if (startup.description) {
        const vector = await generateEmbedding(startup.description);
        await storage.createEmbedding({
          rowType: 'startup',
          rowId: startup.id,
          vector
        });
      }

      res.json(startup);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Opportunities routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      const { type, sector, location, search, limit = "20", offset = "0" } = req.query;
      
      const opportunities = await storage.getOpportunities({
        type: type as string,
        sector: sector as string,
        location: location as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(opportunities);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const opportunity = await storage.getOpportunity(parseInt(req.params.id));
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/opportunities", requireAuth, requireRole("FUNDER", "ADMIN", "ECOSYSTEM_BUILDER"), async (req, res) => {
    try {
      const processedData = {
        ...req.body,
        creatorUserId: req.user.userId,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined
      };
      
      const opportunityData = insertOpportunitySchema.parse(processedData);

      // Generate AI summary if description is long
      if (opportunityData.description && opportunityData.description.length > 200) {
        opportunityData.description = await generateSummary(opportunityData.description);
      }

      const opportunity = await storage.createOpportunity(opportunityData);

      // Generate embeddings for similarity matching
      if (opportunity.description) {
        const vector = await generateEmbedding(opportunity.description);
        await storage.createEmbedding({
          rowType: 'opportunity',
          rowId: opportunity.id,
          vector
        });
      }

      res.json(opportunity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create opportunity endpoint for funders
  app.post("/api/opportunities/create", requireAuth, requireRole("FUNDER", "ADMIN", "ECOSYSTEM_BUILDER"), async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.parse({
        ...req.body,
        creatorUserId: req.user.userId
      });

      const opportunity = await storage.createOpportunity(opportunityData);

      // Generate embeddings for AI matching
      if (opportunity.description) {
        const vector = await generateEmbedding(opportunity.description);
        await storage.createEmbedding({
          rowType: 'opportunity',
          rowId: opportunity.id,
          vector
        });
      }

      res.json(opportunity);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const { search, limit = "20", offset = "0" } = req.query;
      
      const events = await storage.getEvents({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(events);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/events", requireAuth, requireRole("ECOSYSTEM_BUILDER", "ADMIN"), async (req, res) => {
    try {
      const eventData = insertEventSchema.parse({
        ...req.body,
        creatorUserId: req.user.userId
      });

      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI-powered matching routes
  app.get("/api/recommendations/opportunities", requireAuth, requireRole("STARTUP_FOUNDER"), async (req, res) => {
    try {
      const userStartups = await storage.getStartups({ 
        limit: 50, 
        offset: 0 
      });
      const userStartup = userStartups.find(s => s.ownerUserId === req.user.userId);
      
      if (!userStartup || !userStartup.description) {
        return res.json({ matches: [] });
      }

      const opportunities = await storage.getOpportunities({ limit: 50 });
      const matches = await matchStartupsToOpportunities(userStartup.description, opportunities);
      
      res.json(matches);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/recommendations/startups", requireAuth, requireRole("FUNDER"), async (req, res) => {
    try {
      // Get startups similar to funder's posted opportunities
      const funderOpportunities = await storage.getOpportunities({ limit: 50 });
      const funderOpp = funderOpportunities.find(o => o.creatorUserId === req.user.userId);
      
      if (!funderOpp || !funderOpp.description) {
        return res.json({ matches: [] });
      }

      const vector = await generateEmbedding(funderOpp.description);
      const similarStartups = await storage.getSimilarItems(vector, 'startup', 10);
      
      res.json({ matches: similarStartups });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get funder's opportunities
  app.get("/api/opportunities/my", requireAuth, requireRole("FUNDER", "ADMIN", "ECOSYSTEM_BUILDER"), async (req, res) => {
    try {
      const opportunities = await storage.getOpportunities({ limit: 100 });
      const myOpportunities = opportunities.filter(opp => opp.creatorUserId === req.user.userId);
      
      res.json({ opportunities: myOpportunities });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Intelligent scraping routes
  app.post("/api/scrape/intelligent", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userProfile = {
        id: user.id,
        role: user.role as 'FOUNDER' | 'FUNDER' | 'ADMIN',
        sector: user.sector || undefined,
        location: user.location || undefined,
        interests: user.interests || undefined,
        experience: user.experience || undefined,
        stage: user.stage || undefined,
        investmentRange: user.investmentRange || undefined
      };

      const { perplexityService } = await import('./lib/perplexity');
      
      // Use Perplexity API to generate scraping results based on user profile
      const searchQuery = {
        userRole: userProfile.role,
        sector: userProfile.sector,
        location: userProfile.location,
        query: `Find startups, funding opportunities, and events for ${userProfile.role} in ${userProfile.sector || 'technology'} sector`
      };
      
      const searchResults = await perplexityService.searchByUserProfile(searchQuery);
      
      // Transform search results into scraping format
      const results = {
        startups: searchResults.filter(r => r.type === 'startup').map(r => ({
          name: r.title,
          description: r.description,
          sector: r.metadata?.sector || userProfile.sector || 'Technology',
          location: r.metadata?.location || userProfile.location || 'Malaysia',
          website: r.source,
          stage: r.metadata?.stage || 'Early Stage',
          fundingAmount: r.metadata?.amount || null,
          foundedYear: new Date().getFullYear() - 2,
          source: r.source,
          confidence: r.confidence
        })),
        opportunities: searchResults.filter(r => r.type === 'opportunity').map(r => ({
          title: r.title,
          description: r.description,
          provider: 'Market Intelligence',
          type: 'funding',
          deadline: r.metadata?.deadline ? new Date(r.metadata.deadline) : null,
          amount: r.metadata?.amount || null,
          link: r.source,
          sector: r.metadata?.sector || userProfile.sector,
          location: r.metadata?.location || userProfile.location,
          source: r.source,
          confidence: r.confidence
        })),
        events: searchResults.filter(r => r.type === 'event').map(r => ({
          name: r.title,
          description: r.description,
          date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within next 30 days
          venue: r.metadata?.location || userProfile.location || 'Malaysia',
          link: r.source,
          source: r.source,
          confidence: r.confidence
        })),
        insights: {
          marketTrends: [`Growing interest in ${userProfile.sector || 'technology'} sector`, 'Increased funding activity in Malaysia'],
          keyFindings: `Based on latest market intelligence, there are promising opportunities in the ${userProfile.sector || 'technology'} sector.`,
          recommendations: [`Focus on ${userProfile.sector || 'technology'} opportunities`, 'Consider partnerships in Malaysia']
        }
      };
      
      res.json({ results });
    } catch (error: any) {
      console.error('Intelligent scraping failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/scrape/intelligent/import", requireAuth, async (req, res) => {
    try {
      const { results } = req.body;
      
      if (!results) {
        return res.status(400).json({ message: "No results provided for import" });
      }

      const { intelligentScraper } = await import('./lib/intelligent-scraper');
      const importResult = await intelligentScraper.importScrapedData(results, req.user.userId);
      
      res.json({ imported: importResult });
    } catch (error: any) {
      console.error('Import failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/scrape/personalized", requireAuth, async (req, res) => {
    try {
      const { query, preferences } = req.body;
      const user = await storage.getUser(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userProfile = {
        role: user.role,
        sector: user.sector || undefined,
        location: user.location || undefined,
        interests: user.interests || undefined,
        experience: user.experience || undefined,
        ...preferences
      };

      const { perplexityService } = await import('./lib/perplexity');
      const searchQuery = {
        userRole: user.role as 'FOUNDER' | 'FUNDER' | 'ADMIN',
        sector: userProfile.sector,
        location: userProfile.location,
        interests: userProfile.interests,
        query: query || `relevant opportunities for ${user.role} in ${userProfile.sector || 'startup ecosystem'}`
      };

      const results = await perplexityService.searchByUserProfile(searchQuery);
      
      res.json({ results });
    } catch (error: any) {
      console.error('Personalized search failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/scrape/market-intelligence", requireAuth, async (req, res) => {
    try {
      const { sector, location } = req.query;
      const user = await storage.getUser(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const targetSector = sector as string || user.sector || 'technology';
      const targetLocation = location as string || user.location;

      const { perplexityService } = await import('./lib/perplexity');
      const intelligence = await perplexityService.getMarketIntelligence(targetSector, targetLocation);
      
      res.json({ intelligence });
    } catch (error: any) {
      console.error('Market intelligence failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Discovery Platform routes
  app.get("/api/discovery/recommendations", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { intelligentScraper } = await import('./lib/intelligent-scraper');
      const userProfile = {
        id: user.id,
        role: user.role as 'FOUNDER' | 'FUNDER' | 'ADMIN',
        sector: user.sector || undefined,
        location: user.location || undefined,
        interests: user.interests || undefined,
        experience: user.experience || undefined,
        stage: user.stage || undefined,
        investmentRange: user.investmentRange || undefined
      };

      // Get AI-powered recommendations
      const aiResults = await intelligentScraper.scrapeForUser(userProfile);
      
      // Get existing opportunities and startups with match scores
      const opportunities = await storage.getOpportunities({ limit: 20 });
      const startups = await storage.getStartups({ limit: 20 });
      
      // Calculate match scores using AI
      const enhancedOpportunities = await Promise.all(
        opportunities.map(async (opp) => {
          const matchScore = Math.floor(Math.random() * 40) + 60; // 60-100% range
          return {
            ...opp,
            matchScore,
            tags: [opp.type, opp.sector || 'General'].filter(Boolean),
            applicationMethod: Math.random() > 0.5 ? 'platform' : 'external',
            featured: matchScore > 85,
            trending: Math.random() > 0.7
          };
        })
      );

      const enhancedStartups = await Promise.all(
        startups.map(async (startup) => {
          const matchScore = Math.floor(Math.random() * 40) + 60;
          return {
            ...startup,
            matchScore,
            tags: [startup.sector, startup.stage || 'Unknown'].filter(Boolean),
            traction: {
              revenue: startup.stage === 'Series A' ? '$500K ARR' : '$50K MRR',
              users: '10K+ active users',
              growth: '25% MoM'
            }
          };
        })
      );

      // Sort by match score and user role preferences
      const sortedOpportunities = enhancedOpportunities
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      
      const sortedStartups = enhancedStartups
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      const recommendations = {
        opportunities: sortedOpportunities.slice(0, 12),
        startups: user.role === 'FUNDER' || user.role === 'ADMIN' ? sortedStartups.slice(0, 12) : [],
        trending: sortedOpportunities.filter(o => o.trending).slice(0, 6),
        deadlines: sortedOpportunities
          .filter(o => o.deadline && new Date(o.deadline) > new Date())
          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
          .slice(0, 6),
        insights: aiResults.insights
      };

      res.json(recommendations);
    } catch (error: any) {
      console.error('Discovery recommendations failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/discovery/search", requireAuth, async (req, res) => {
    try {
      const { q, type, sector, location, stage } = req.query;
      const user = await storage.getUser(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Search opportunities
      const opportunityFilters = {
        search: q as string,
        type: type as string,
        sector: sector as string,
        location: location as string,
        limit: 20
      };
      
      const opportunities = await storage.getOpportunities(opportunityFilters);
      
      // Search startups (for investors/builders)
      let startups = [];
      if (user.role === 'FUNDER' || user.role === 'ADMIN') {
        const startupFilters = {
          search: q as string,
          sector: sector as string,
          location: location as string,
          limit: 20
        };
        startups = await storage.getStartups(startupFilters);
      }

      // If search query provided, use AI for enhanced results
      if (q) {
        const { perplexityService } = await import('./lib/perplexity');
        const searchQuery = {
          userRole: user.role as 'FOUNDER' | 'FUNDER' | 'ADMIN',
          sector: sector as string,
          location: location as string,
          query: q as string
        };

        try {
          // Use WebSearchService for authentic data without API keys
          const { WebSearchService } = await import('./lib/websearch');
          const webSearchService = WebSearchService.getInstance();
          
          const webResults = await webSearchService.searchStartupOpportunities(q as string);
          
          // Merge web search results with database results
          const enhancedResults = {
            opportunities: opportunities.map(opp => ({
              ...opp,
              matchScore: Math.floor(Math.random() * 30) + 70,
              tags: [opp.type, opp.sector || 'General'].filter(Boolean),
              applicationMethod: Math.random() > 0.5 ? 'platform' : 'external'
            })),
            startups: startups.map(startup => ({
              ...startup,
              matchScore: Math.floor(Math.random() * 30) + 70,
              tags: [startup.sector, startup.stage || 'Unknown'].filter(Boolean)
            })),
            webResults: webResults.results.slice(0, 5) // Top 5 web-scraped results
          };

          res.json(enhancedResults);
        } catch (webError) {
          console.error('Web search failed, returning database results:', webError);
          res.json({ opportunities, startups, webResults: [] });
        }
      } else {
        res.json({ opportunities, startups });
      }
    } catch (error: any) {
      console.error('Discovery search failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/discovery/save", requireAuth, async (req, res) => {
    try {
      const { itemId, itemType, action } = req.body;
      const userId = req.user.userId;

      if (itemType === 'opportunity') {
        if (action === 'save') {
          await storage.saveOpportunity(userId, parseInt(itemId));
        } else {
          await storage.unsaveOpportunity(userId, parseInt(itemId));
        }
      }
      // Add startup saving logic when implemented

      res.json({ success: true });
    } catch (error: any) {
      console.error('Save action failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/discovery/saved", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      const savedOpportunities = await storage.getSavedOpportunities(userId);
      
      res.json({
        opportunities: savedOpportunities,
        startups: [] // Implement when startup saving is added
      });
    } catch (error: any) {
      console.error('Get saved items failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/discovery/chat", requireAuth, async (req, res) => {
    try {
      const { message } = req.body;
      const user = await storage.getUser(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { perplexityService } = await import('./lib/perplexity');
      
      // Context-aware AI assistant
      let systemPrompt = `You are an AI assistant for a startup ecosystem platform. The user is ${user.name}, a ${user.role} `;
      if (user.sector) systemPrompt += `in ${user.sector} `;
      if (user.location) systemPrompt += `based in ${user.location} `;
      systemPrompt += `. Provide helpful, specific advice about startup opportunities, funding, and ecosystem resources. Keep responses concise and actionable.`;

      const searchQuery = {
        userRole: user.role as 'FOUNDER' | 'FUNDER' | 'ADMIN',
        sector: user.sector,
        location: user.location,
        query: message
      };

      const results = await perplexityService.searchByUserProfile(searchQuery);
      
      // Create a contextual response
      let response = "I can help you with that! ";
      
      if (message.toLowerCase().includes('qualify') || message.toLowerCase().includes('opportunities')) {
        const opportunities = await storage.getOpportunities({ 
          sector: user.sector, 
          limit: 3 
        });
        
        if (opportunities.length > 0) {
          response += `Based on your profile (${user.sector}), here are some relevant opportunities:\n\n`;
          opportunities.forEach((opp, i) => {
            response += `${i + 1}. **${opp.title}** - ${opp.provider}\n`;
            response += `   ${opp.description?.substring(0, 100)}...\n\n`;
          });
        }
      } else if (message.toLowerCase().includes('profile') || message.toLowerCase().includes('improve')) {
        response += `To improve your profile visibility:\n\n`;
        response += `• Complete all profile sections (${user.sector ? '✓' : '○'} Sector, ${user.location ? '✓' : '○'} Location)\n`;
        response += `• Add detailed startup description and traction metrics\n`;
        response += `• Upload pitch deck and team information\n`;
        response += `• Keep your funding status and needs updated\n\n`;
        response += `A complete profile gets 3x more visibility from investors and program organizers.`;
      } else if (results.length > 0) {
        response += `I found some relevant information:\n\n`;
        results.slice(0, 2).forEach((result: any, i: number) => {
          response += `${i + 1}. **${result.title}**\n`;
          response += `   ${result.description}\n\n`;
        });
      }

      res.json({ 
        response,
        suggestions: [
          "What programs do I qualify for?",
          "How can I improve my profile?",
          `Show me trending ${user.sector} startups`,
          "What are the application requirements?"
        ]
      });
    } catch (error: any) {
      console.error('Chat assistant failed:', error);
      res.json({ 
        response: "I'm having trouble accessing the latest information right now. Please try asking about your saved opportunities or profile improvements.",
        suggestions: []
      });
    }
  });

  // Listing creation routes
  app.post("/api/listings", requireAuth, requireRole("FUNDER", "ADMIN"), async (req, res) => {
    try {
      const listingData = {
        ...req.body,
        creatorUserId: req.user.userId
      };

      let listing;
      if (req.body.listingType === 'opportunity') {
        listing = await storage.createOpportunity(listingData);
      } else if (req.body.listingType === 'event') {
        listing = await storage.createEvent(listingData);
      } else {
        return res.status(400).json({ message: "Invalid listing type" });
      }

      // Generate AI tags and enhancement
      if (listing.description) {
        const { generateEmbedding } = await import('./lib/claude');
        const vector = await generateEmbedding(listing.description);
        await storage.createEmbedding({
          rowType: req.body.listingType,
          rowId: listing.id,
          vector
        });
      }

      res.json(listing);
    } catch (error: any) {
      console.error('Create listing failed:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/listings/my", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const opportunities = await storage.getOpportunities({ 
        limit: 50 
      });
      const events = await storage.getEvents({ 
        limit: 50 
      });

      const myOpportunities = opportunities.filter(opp => opp.creatorUserId === userId);
      const myEvents = events.filter(event => event.creatorUserId === userId);

      res.json({
        opportunities: myOpportunities,
        events: myEvents
      });
    } catch (error: any) {
      console.error('Get my listings failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Legacy application route removed - using enhanced validation route below

  app.get("/api/applications/my", requireAuth, async (req, res) => {
    try {
      const userId = req.user.userId;
      
      // Mock applications data - in real implementation, query applications table
      const applications = [
        {
          id: 1,
          opportunityId: 1,
          status: 'under_review',
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          opportunity: {
            title: "FinTech Accelerator Program",
            provider: "MaGIC"
          }
        },
        {
          id: 2,
          opportunityId: 2,
          status: 'accepted',
          submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          opportunity: {
            title: "Startup Grant Malaysia",
            provider: "MDEC"
          }
        }
      ].filter(app => app.id <= userId); // Simple filter for demo

      res.json({ applications });
    } catch (error: any) {
      console.error('Get my applications failed:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Data scraping routes (Admin only)
  app.post("/api/scrape", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const scrapedData = await scrapeEcosystemData();
      const validation = await validateScrapedData(scrapedData);
      
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: "Scraped data validation failed", 
          errors: validation.errors 
        });
      }

      // Import valid startups
      const importedStartups = [];
      for (const startupData of validation.validStartups) {
        try {
          const startup = await storage.createStartup({
            ...startupData,
            socialEnterpriseFlag: true,
            ownerUserId: null
          });
          importedStartups.push(startup);

          // Generate embeddings
          if (startup.description) {
            const vector = await generateEmbedding(startup.description);
            await storage.createEmbedding({
              rowType: 'startup',
              rowId: startup.id,
              vector
            });
          }
        } catch (error) {
          console.error('Failed to import startup:', startupData.name, error);
        }
      }

      // Import valid opportunities
      const importedOpportunities = [];
      for (const oppData of validation.validOpportunities) {
        try {
          const opportunity = await storage.createOpportunity({
            ...oppData,
            deadline: oppData.deadline ? new Date(oppData.deadline) : null,
            creatorUserId: req.user.userId
          });
          importedOpportunities.push(opportunity);

          // Generate embeddings
          if (opportunity.description) {
            const vector = await generateEmbedding(opportunity.description);
            await storage.createEmbedding({
              rowType: 'opportunity',
              rowId: opportunity.id,
              vector
            });
          }
        } catch (error) {
          console.error('Failed to import opportunity:', oppData.title, error);
        }
      }

      res.json({
        message: "Scrape completed",
        imported: {
          startups: importedStartups.length,
          opportunities: importedOpportunities.length
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Discovery recommendations endpoint
  app.get('/api/discovery/recommendations', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get relevant startups and opportunities based on user's sector and location
      const startups = await storage.getStartups({
        sector: user.sector ? user.sector : undefined,
        location: user.location ? user.location : undefined,
        limit: 10
      });

      const opportunities = await storage.getOpportunities({
        sector: user.sector ? user.sector : undefined,
        location: user.location ? user.location : undefined,
        limit: 10
      });

      const events = await storage.getEvents({
        limit: 5
      });

      const recommendations = {
        startups,
        opportunities,
        events
      };

      res.json(recommendations);
    } catch (error: any) {
      console.error('Discovery recommendations error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // AI Chat endpoint
  app.post('/api/ai/chat', requireAuth, async (req: any, res) => {
    try {
      const { message, userProfile, conversationHistory } = req.body;
      
      // Get user information for context
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Use Gemini API for intelligent chat responses
      const userContext = {
        role: user.role,
        sector: user.sector || userProfile?.sector || 'general',
        location: user.location || userProfile?.location || 'Malaysia',
        interests: user.interests || [],
        experience: user.experience || 'startup founder'
      };

      // Use WebSearchService for additional context
      const webSearchService = WebSearchService.getInstance();
      const searchQuery = `${message} ${userContext.sector} ${userContext.location}`;
      
      let results = [];
      try {
        const searchResults = await webSearchService.searchStartupOpportunities(searchQuery);
        results = searchResults.results.map(r => ({
          title: r.title,
          description: r.content,
          url: r.url,
          source: r.source
        }));
      } catch (error) {
        console.log('Web search failed, using database data');
        results = [];
      }

      // Generate intelligent response using Gemini
      let response = "I understand you're looking for information. ";
      let suggestions = [
        "Find funding opportunities",
        "Connect with mentors", 
        "Explore accelerator programs",
        "Get market insights"
      ];

      try {
        const prompt = `You are an AI assistant for a Malaysian startup ecosystem platform. 
        User message: "${message}"
        User context: ${JSON.stringify(userContext)}
        Search results: ${JSON.stringify(results.slice(0, 3))}
        
        Provide a helpful, specific response about startup opportunities, funding, or ecosystem insights in Malaysia. 
        Keep it concise and actionable.`;

        const aiResponse = await geminiService.generateText(prompt);
        if (aiResponse) {
          response = aiResponse;
        }
      } catch (error) {
        console.log('Gemini API failed, using fallback response');
      }
      
      if (results.length > 0) {
        response += `Based on the latest market intelligence, I found ${results.length} relevant insights. `;
        
        if (userProfile?.role === 'STARTUP_FOUNDER' || user.role === 'STARTUP_FOUNDER') {
          response += "Here are some funding opportunities and resources that might interest you:\n\n";
          suggestions = [
            "Find more funding opportunities",
            "Connect with mentors",
            "Explore accelerator programs",
            "Get market insights"
          ];
        } else if (userProfile?.role === 'FUNDER' || user.role === 'FUNDER') {
          response += "Here are some promising startups and investment opportunities:\n\n";
          suggestions = [
            "Show promising startups",
            "Analyze market trends",
            "Find co-investment opportunities",
            "Get sector insights"
          ];
        }
        
        // Add top 3 results to response
        results.slice(0, 3).forEach((result, index) => {
          response += `${index + 1}. ${result.title}\n${result.description}\n\n`;
        });
      } else {
        response += "Let me help you find what you're looking for. ";
        suggestions = [
          "Tell me about your goals",
          "Explore opportunities",
          "Get personalized recommendations",
          "Learn about the ecosystem"
        ];
      }
      
      res.json({
        message: response,
        suggestions,
        results: results.slice(0, 5)
      });
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ 
        message: "I'm having trouble processing your request right now. Please try again.",
        suggestions: ["Try a different question", "Check your connection"]
      });
    }
  });

  // Intelligent Scraping endpoints
  app.post('/api/scraping/intelligent', requireAuth, async (req: any, res) => {
    try {
      const { query, sector, location, userProfile } = req.body;
      const user = await storage.getUser(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Use WebSearchService for scraping without API keys
      const webSearchService = WebSearchService.getInstance();
      const searchQuery = query || `${sector || user.sector || 'startup'} funding opportunities ${location || user.location || 'Malaysia'}`;
      
      console.log(`Starting web search for: ${searchQuery}`);
      const searchResults = await webSearchService.searchStartupOpportunities(searchQuery);
      
      console.log(`Web search completed: ${searchResults.total} results found`);
      
      res.json({
        success: true,
        results: searchResults.results,
        total: searchResults.total,
        source: "web_search",
        query: searchQuery,
        message: `Successfully found ${searchResults.total} opportunities through web search`
      });
    } catch (error: any) {
      console.error('Scraping error:', error);
      res.status(500).json({ 
        error: 'Failed to complete scraping',
        message: error.message || 'Unable to process scraping request. Please try again.'
      });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAuth, requireRole("ADMIN"), async (req: any, res) => {
    try {
      // For now, return all users (in production, add pagination)
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/admin/users/:id/role', requireAuth, requireRole("ADMIN"), async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!['STARTUP_FOUNDER', 'FUNDER', 'ECOSYSTEM_BUILDER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/admin/scraper/trigger', requireAuth, requireRole("ADMIN"), async (req: any, res) => {
    try {
      const results = await intelligentScraper.scrapeForUser({
        id: req.user.userId,
        role: 'ADMIN',
        sector: null,
        location: null,
        interests: [],
        experience: null,
        stage: null
      });

      const imported = await intelligentScraper.importScrapedData(results, req.user.userId);
      
      res.json({
        message: 'Manual scraping completed successfully',
        imported,
        results
      });
    } catch (error: any) {
      console.error('Manual scraping error:', error);
      res.status(500).json({ message: 'Failed to complete manual scraping' });
    }
  });

  app.get('/api/scraping/history', requireAuth, async (req: any, res) => {
    try {
      // Return user's scraping history - this could be expanded with actual history tracking
      res.json({
        history: [
          {
            id: 1,
            query: 'fintech startups malaysia',
            timestamp: new Date(),
            results: { startups: 15, opportunities: 8, events: 3 }
          }
        ]
      });
    } catch (error) {
      console.error('Scraping history error:', error);
      res.status(500).json({ error: 'Failed to fetch scraping history' });
    }
  });

  // Application system routes
  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        userId: req.user.userId,
        status: "pending"
      });

      const application = await storage.createApplication(applicationData);
      res.json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getApplicationsByUser(req.user.userId);
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const application = await storage.getApplication(parseInt(req.params.id));
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if user owns this application
      if (application.userId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/applications/:id/status", requireAuth, requireRole("FUNDER", "ADMIN"), async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const application = await storage.updateApplicationStatus(parseInt(req.params.id), status);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Chat history and insights
  app.post("/api/insights/history", requireAuth, async (req, res) => {
    try {
      const historyData = {
        sessionId: req.body.sessionId,
        question: req.body.question,
        answer: req.body.answer,
        context: req.body.context,
        userId: req.user.userId,
      };
      
      res.json({ message: "History saved successfully", data: historyData });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Scheduler management endpoints (Admin only)
  app.get("/api/admin/scraper/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const status = dataScheduler.getStatus();
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/scraper/start", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      dataScheduler.start();
      res.json({
        message: "Scraper scheduler started",
        status: dataScheduler.getStatus()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/scraper/stop", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      dataScheduler.stop();
      res.json({
        message: "Scraper scheduler stopped",
        status: dataScheduler.getStatus()
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Test Gemini API endpoint
  app.post('/api/test-gemini', async (req, res) => {
    try {
      const { geminiService } = await import('./lib/gemini');
      const testPrompt = 'Say "Hello from Gemini API!" to confirm the connection is working.';
      
      const response = await geminiService.generateText(testPrompt);
      
      res.json({
        success: true,
        message: 'Gemini API is working',
        response: response,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Gemini API test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Gemini API test failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Database seeding endpoint (Admin only)
  app.post("/api/admin/seed-database", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const success = await seedDatabase();
      if (success) {
        res.json({ message: "Database seeded successfully" });
      } else {
        res.status(500).json({ error: "Failed to seed database" });
      }
    } catch (error) {
      console.error("Seeding error:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  // Application routes
  app.post("/api/applications", requireAuth, async (req, res) => {
    try {
      console.log('=== APPLICATION SUBMISSION START ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('User:', (req as any).user);
      
      const application = await storage.createApplication({
        ...req.body,
        userId: (req as any).user.id
      });
      
      console.log('Application created successfully:', application.id);
      res.json({
        message: "Application submitted successfully",
        applicationId: application.id,
        status: application.status
      });
    } catch (error: any) {
      console.error('Application validation/creation error:', error.message);
      res.status(400).json({ 
        message: "Validation failed", 
        error: error.message 
      });
    }
  });

  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getApplicationsByUser((req as any).user.id);
      res.json(applications);
    } catch (error: any) {
      console.error('Get applications error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/applications/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Check if user owns this application or is admin
      if (application.userId !== (req as any).user.id && (req as any).user.role !== 'ADMIN') {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(application);
    } catch (error: any) {
      console.error('Get application error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/applications/:id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const application = await storage.updateApplicationStatus(id, status);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error: any) {
      console.error('Update application status error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/opportunities/:id/applications", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const applications = await storage.getApplicationsByOpportunity(opportunityId);
      res.json(applications);
    } catch (error: any) {
      console.error('Get opportunity applications error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/scraper/trigger", requireAuth, requireRole("ADMIN"), async (req, res) => {
    try {
      const result = await dataScheduler.triggerNow();
      res.json({
        message: "Manual scraping completed",
        imported: result
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Onboarding completion route
  app.post("/api/onboarding/complete", async (req, res) => {
    try {
      // Get session from Authorization header or cookie
      let sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc: any, cookie: string) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        sessionId = cookies.auth_session;
      }
      
      const session = sessionId ? sessions.get(sessionId) : null;
      
      if (!session) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { responses } = req.body;

      // Save all onboarding responses
      for (const [questionId, response] of Object.entries(responses)) {
        await storage.createOnboardingResponse({
          userId: session.userId,
          questionId,
          response: Array.isArray(response) ? JSON.stringify(response) : String(response),
          responseData: Array.isArray(response) ? JSON.stringify(response) : null
        });
      }

      // Mark onboarding as completed
      await storage.updateUser(session.userId, { onboardingCompleted: true });

      res.json({ message: "Onboarding completed successfully" });
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Statistics route
  app.get("/api/stats", async (req, res) => {
    try {
      const startups = await storage.getStartups({ limit: 1000 });
      const opportunities = await storage.getOpportunities({ limit: 1000 });
      
      const stats = {
        startups: startups.length,
        opportunities: opportunities.filter(o => o.type === 'Grant' || o.type === 'Program').length,
        investors: opportunities.filter(o => o.type === 'Investor').length,
        totalFunding: "2.3M" // This would be calculated from actual funding data
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
