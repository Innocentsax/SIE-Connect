import { users, startups, opportunities, events, embeddings, savedOpportunities, onboardingResponses, applications, type User, type InsertUser, type Startup, type InsertStartup, type Opportunity, type InsertOpportunity, type Event, type InsertEvent, type Embedding, type InsertOnboardingResponse, type OnboardingResponse, type Application, type InsertApplication } from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  
  // Saved Opportunities
  saveOpportunity(userId: number, opportunityId: number): Promise<void>;
  unsaveOpportunity(userId: number, opportunityId: number): Promise<void>;
  getSavedOpportunities(userId: number): Promise<(Opportunity & { matchPercentage?: number })[]>;
  
  // Startups
  getStartup(id: number): Promise<Startup | undefined>;
  getStartups(filters?: {
    sector?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Startup[]>;
  createStartup(startup: InsertStartup): Promise<Startup>;
  updateStartup(id: number, startup: Partial<InsertStartup>): Promise<Startup | undefined>;
  
  // Opportunities
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  getOpportunities(filters?: {
    type?: string;
    sector?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  
  // Events
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(filters?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Search across all entities
  search(query: string, filters?: {
    type?: string[];
    sector?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    startups: Startup[];
    opportunities: Opportunity[];
    total: number;
  }>;
  
  // Embeddings
  createEmbedding(embedding: { rowType: string; rowId: number; vector: number[] }): Promise<Embedding>;
  getSimilarItems(vector: number[], rowType: string, limit?: number): Promise<{ item: Startup | Opportunity; similarity: number }[]>;
  
  // Onboarding Responses
  createOnboardingResponse(response: InsertOnboardingResponse): Promise<OnboardingResponse>;
  
  // Applications
  createApplication(application: InsertApplication): Promise<Application>;
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByUser(userId: number): Promise<Application[]>;
  getApplicationsByOpportunity(opportunityId: number): Promise<Application[]>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private startups: Map<number, Startup> = new Map();
  private opportunities: Map<number, Opportunity> = new Map();
  private events: Map<number, Event> = new Map();
  private embeddings: Map<number, Embedding> = new Map();
  private currentUserId = 1;
  private currentStartupId = 1;
  private currentOpportunityId = 1;
  private currentEventId = 1;
  private currentEmbeddingId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial data
    const adminUser: User = {
      id: this.currentUserId++,
      email: "admin@iechub.my",
      password: "password",
      role: "ADMIN",
      name: "Admin User",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    const founderUser: User = {
      id: this.currentUserId++,
      email: "founder@ecotech.my",
      password: "password",
      role: "STARTUP_FOUNDER",
      name: "Sarah Chen",
      createdAt: new Date(),
    };
    this.users.set(founderUser.id, founderUser);

    const funderUser: User = {
      id: this.currentUserId++,
      email: "investor@impact.my",
      password: "password",
      role: "FUNDER",
      name: "Ahmad Rahman",
      createdAt: new Date(),
    };
    this.users.set(funderUser.id, funderUser);

    // Seed startups
    const startup1: Startup = {
      id: this.currentStartupId++,
      name: "EcoWaste Solutions",
      description: "AI-powered waste sorting system that helps Malaysian communities achieve 80% recycling efficiency. Currently serving 15 residential areas in KL with plans to expand nationwide.",
      sector: "Waste Management",
      location: "Kuala Lumpur",
      website: "https://ecowaste.my",
      socialEnterpriseFlag: true,
      stage: "Series A",
      employeeCount: 12,
      foundedYear: 2022,
      ownerUserId: founderUser.id,
      createdAt: new Date(),
    };
    this.startups.set(startup1.id, startup1);

    const startup2: Startup = {
      id: this.currentStartupId++,
      name: "HealthConnect",
      description: "Telemedicine platform connecting rural communities with healthcare professionals. Serving over 50 villages across Malaysia with multilingual support.",
      sector: "HealthTech",
      location: "Penang",
      website: "https://healthconnect.my",
      socialEnterpriseFlag: true,
      stage: "Seed",
      employeeCount: 8,
      foundedYear: 2023,
      ownerUserId: founderUser.id,
      createdAt: new Date(),
    };
    this.startups.set(startup2.id, startup2);

    const startup3: Startup = {
      id: this.currentStartupId++,
      name: "EduBridge",
      description: "Digital learning platform providing vocational training for B40 communities. Partnership with 20+ government agencies for skills certification.",
      sector: "EdTech",
      location: "Johor",
      website: "https://edubridge.my",
      socialEnterpriseFlag: true,
      stage: "Pre-seed",
      employeeCount: 6,
      foundedYear: 2024,
      ownerUserId: founderUser.id,
      createdAt: new Date(),
    };
    this.startups.set(startup3.id, startup3);

    // Seed opportunities
    const opportunity1: Opportunity = {
      id: this.currentOpportunityId++,
      title: "MSC Malaysia Grant Program",
      description: "Up to RM 500,000 funding for Malaysian tech startups focusing on social impact and sustainability. Covers R&D, market validation, and scaling initiatives.",
      provider: "Government",
      type: "Grant",
      criteria: "Malaysian-owned tech startups with social impact focus",
      deadline: new Date("2024-03-15"),
      amount: "RM 500,000",
      link: "https://msc.my/grants",
      sector: "Technology",
      location: "Malaysia",
      creatorUserId: adminUser.id,
      createdAt: new Date(),
    };
    this.opportunities.set(opportunity1.id, opportunity1);

    const opportunity2: Opportunity = {
      id: this.currentOpportunityId++,
      title: "Cradle Fund",
      description: "Early-stage funding for innovative technology companies. Focus on commercializing R&D outputs from Malaysian universities and research institutions.",
      provider: "Government",
      type: "Grant",
      criteria: "Early-stage tech companies with innovative solutions",
      deadline: new Date("2024-04-30"),
      amount: "RM 250,000",
      link: "https://cradlefund.com.my",
      sector: "Technology",
      location: "Malaysia",
      creatorUserId: adminUser.id,
      createdAt: new Date(),
    };
    this.opportunities.set(opportunity2.id, opportunity2);

    const opportunity3: Opportunity = {
      id: this.currentOpportunityId++,
      title: "Impact Capital Malaysia",
      description: "Focus on early-stage social enterprises with proven market traction. Portfolio includes healthcare, education, and environmental startups across Southeast Asia.",
      provider: "Impact Capital Malaysia",
      type: "Investor",
      criteria: "Early-stage social enterprises with market traction",
      deadline: null,
      amount: "Seed - Series A",
      link: "https://impactcapital.my",
      sector: "Social Enterprise",
      location: "Kuala Lumpur",
      creatorUserId: funderUser.id,
      createdAt: new Date(),
    };
    this.opportunities.set(opportunity3.id, opportunity3);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      user.role = role;
      this.users.set(id, user);
      return user;
    }
    return undefined;
  }

  // Startup methods
  async getStartup(id: number): Promise<Startup | undefined> {
    return this.startups.get(id);
  }

  async getStartups(filters?: {
    sector?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Startup[]> {
    let results = Array.from(this.startups.values());

    if (filters?.sector) {
      results = results.filter(startup => 
        startup.sector?.toLowerCase().includes(filters.sector!.toLowerCase())
      );
    }

    if (filters?.location) {
      results = results.filter(startup => 
        startup.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(startup => 
        startup.name.toLowerCase().includes(searchTerm) ||
        startup.description?.toLowerCase().includes(searchTerm) ||
        startup.sector?.toLowerCase().includes(searchTerm)
      );
    }

    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return results.slice(offset, offset + limit);
  }

  async createStartup(insertStartup: InsertStartup): Promise<Startup> {
    const startup: Startup = {
      ...insertStartup,
      id: this.currentStartupId++,
      createdAt: new Date(),
    };
    this.startups.set(startup.id, startup);
    return startup;
  }

  async updateStartup(id: number, updates: Partial<InsertStartup>): Promise<Startup | undefined> {
    const startup = this.startups.get(id);
    if (startup) {
      const updated = { ...startup, ...updates };
      this.startups.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Opportunity methods
  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async getOpportunities(filters?: {
    type?: string;
    sector?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Opportunity[]> {
    let results = Array.from(this.opportunities.values());

    if (filters?.type) {
      results = results.filter(opp => 
        opp.type.toLowerCase() === filters.type!.toLowerCase()
      );
    }

    if (filters?.sector) {
      results = results.filter(opp => 
        opp.sector?.toLowerCase().includes(filters.sector!.toLowerCase())
      );
    }

    if (filters?.location) {
      results = results.filter(opp => 
        opp.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(opp => 
        opp.title.toLowerCase().includes(searchTerm) ||
        opp.description?.toLowerCase().includes(searchTerm) ||
        opp.provider?.toLowerCase().includes(searchTerm)
      );
    }

    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return results.slice(offset, offset + limit);
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const opportunity: Opportunity = {
      ...insertOpportunity,
      id: this.currentOpportunityId++,
      createdAt: new Date(),
    };
    this.opportunities.set(opportunity.id, opportunity);
    return opportunity;
  }

  async updateOpportunity(id: number, updates: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const opportunity = this.opportunities.get(id);
    if (opportunity) {
      const updated = { ...opportunity, ...updates };
      this.opportunities.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Event methods
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEvents(filters?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    let results = Array.from(this.events.values());

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(event => 
        event.name.toLowerCase().includes(searchTerm) ||
        event.description?.toLowerCase().includes(searchTerm)
      );
    }

    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    
    return results.slice(offset, offset + limit);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const event: Event = {
      ...insertEvent,
      id: this.currentEventId++,
      createdAt: new Date(),
    };
    this.events.set(event.id, event);
    return event;
  }

  // Search method
  async search(query: string, filters?: {
    type?: string[];
    sector?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    startups: Startup[];
    opportunities: Opportunity[];
    total: number;
  }> {
    const searchTerm = query.toLowerCase();
    const types = filters?.type || ['startup', 'opportunity'];
    
    let startups: Startup[] = [];
    let opportunities: Opportunity[] = [];

    if (types.includes('startup')) {
      startups = await this.getStartups({
        search: query,
        sector: filters?.sector,
        location: filters?.location,
        limit: filters?.limit,
        offset: filters?.offset,
      });
    }

    if (types.includes('opportunity')) {
      opportunities = await this.getOpportunities({
        search: query,
        sector: filters?.sector,
        location: filters?.location,
        limit: filters?.limit,
        offset: filters?.offset,
      });
    }

    return {
      startups,
      opportunities,
      total: startups.length + opportunities.length,
    };
  }

  // Embedding methods
  async createEmbedding(embedding: { rowType: string; rowId: number; vector: number[] }): Promise<Embedding> {
    const newEmbedding: Embedding = {
      id: this.currentEmbeddingId++,
      rowType: embedding.rowType,
      rowId: embedding.rowId,
      vector: embedding.vector,
      createdAt: new Date(),
    };
    this.embeddings.set(newEmbedding.id, newEmbedding);
    return newEmbedding;
  }

  async getSimilarItems(vector: number[], rowType: string, limit: number = 5): Promise<{ item: Startup | Opportunity; similarity: number }[]> {
    // Simple cosine similarity implementation
    const embeddings = Array.from(this.embeddings.values())
      .filter(emb => emb.rowType === rowType);

    const similarities = embeddings.map(emb => {
      const similarity = this.cosineSimilarity(vector, emb.vector || []);
      let item: Startup | Opportunity | undefined;
      
      if (rowType === 'startup') {
        item = this.startups.get(emb.rowId);
      } else if (rowType === 'opportunity') {
        item = this.opportunities.get(emb.rowId);
      }

      return { item, similarity };
    }).filter(result => result.item) as { item: Startup | Opportunity; similarity: number }[];

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// rewrite MemStorage to DatabaseStorage
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async saveOpportunity(userId: number, opportunityId: number): Promise<void> {
    await db
      .insert(savedOpportunities)
      .values({ userId, opportunityId })
      .onConflictDoNothing();
  }

  async unsaveOpportunity(userId: number, opportunityId: number): Promise<void> {
    await db
      .delete(savedOpportunities)
      .where(
        and(
          eq(savedOpportunities.userId, userId),
          eq(savedOpportunities.opportunityId, opportunityId)
        )
      );
  }

  async getSavedOpportunities(userId: number): Promise<(Opportunity & { matchPercentage?: number })[]> {
    const saved = await db
      .select({ opportunity: opportunities })
      .from(savedOpportunities)
      .leftJoin(opportunities, eq(savedOpportunities.opportunityId, opportunities.id))
      .where(eq(savedOpportunities.userId, userId))
      .orderBy(desc(savedOpportunities.createdAt));

    return saved
      .filter(row => row.opportunity)
      .map(row => ({
        ...row.opportunity!,
        matchPercentage: Math.floor(Math.random() * 20) + 80 // 80-99% for saved opportunities
      }));
  }

  async getStartup(id: number): Promise<Startup | undefined> {
    const [startup] = await db.select().from(startups).where(eq(startups.id, id));
    return startup || undefined;
  }

  async getStartups(filters?: {
    sector?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Startup[]> {
    let query = db.select().from(startups);
    
    const conditions = [];
    if (filters?.sector && filters.sector !== 'all') {
      conditions.push(eq(startups.sector, filters.sector));
    }
    if (filters?.location && filters.location !== 'all') {
      conditions.push(eq(startups.location, filters.location));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(startups.name, `%${filters.search}%`),
          ilike(startups.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(startups.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async createStartup(insertStartup: InsertStartup): Promise<Startup> {
    const [startup] = await db
      .insert(startups)
      .values(insertStartup)
      .returning();
    return startup;
  }

  async updateStartup(id: number, updates: Partial<InsertStartup>): Promise<Startup | undefined> {
    const [startup] = await db
      .update(startups)
      .set(updates)
      .where(eq(startups.id, id))
      .returning();
    return startup || undefined;
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity || undefined;
  }

  async getOpportunities(filters?: {
    type?: string;
    sector?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Opportunity[]> {
    let query = db.select().from(opportunities);
    
    const conditions = [];
    if (filters?.type) {
      conditions.push(eq(opportunities.type, filters.type));
    }
    if (filters?.sector && filters.sector !== 'all') {
      conditions.push(eq(opportunities.sector, filters.sector));
    }
    if (filters?.location && filters.location !== 'all') {
      conditions.push(eq(opportunities.location, filters.location));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(opportunities.title, `%${filters.search}%`),
          ilike(opportunities.description, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(opportunities.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db
      .insert(opportunities)
      .values(insertOpportunity)
      .returning();
    return opportunity;
  }

  async updateOpportunity(id: number, updates: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const [opportunity] = await db
      .update(opportunities)
      .set(updates)
      .where(eq(opportunities.id, id))
      .returning();
    return opportunity || undefined;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getEvents(filters?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    let query = db.select().from(events);
    
    if (filters?.search) {
      query = query.where(
        or(
          ilike(events.name, `%${filters.search}%`),
          ilike(events.description, `%${filters.search}%`)
        )
      );
    }

    query = query.orderBy(desc(events.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async search(query: string, filters?: {
    type?: string[];
    sector?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    startups: Startup[];
    opportunities: Opportunity[];
    total: number;
  }> {
    const includeStartups = !filters?.type || filters.type.includes('startup');
    const includeOpportunities = !filters?.type || filters.type.includes('opportunity');

    let startups: Startup[] = [];
    let opportunities: Opportunity[] = [];

    if (includeStartups) {
      startups = await this.getStartups({
        search: query,
        sector: filters?.sector,
        location: filters?.location,
        limit: filters?.limit,
        offset: filters?.offset,
      });
    }

    if (includeOpportunities) {
      opportunities = await this.getOpportunities({
        search: query,
        sector: filters?.sector,
        location: filters?.location,
        limit: filters?.limit,
        offset: filters?.offset,
      });
    }

    return {
      startups,
      opportunities,
      total: startups.length + opportunities.length,
    };
  }

  async createEmbedding(embedding: { rowType: string; rowId: number; vector: number[] }): Promise<Embedding> {
    const [newEmbedding] = await db
      .insert(embeddings)
      .values(embedding)
      .returning();
    return newEmbedding;
  }

  async getSimilarItems(vector: number[], rowType: string, limit: number = 5): Promise<{ item: Startup | Opportunity; similarity: number }[]> {
    // For simplicity, return empty array as similarity search requires vector extensions
    // In production, you would use pgvector or similar for actual vector similarity
    return [];
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async createOnboardingResponse(insertResponse: InsertOnboardingResponse): Promise<OnboardingResponse> {
    const [response] = await db
      .insert(onboardingResponses)
      .values(insertResponse)
      .returning();
    return response;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    console.log('=== STORAGE VALIDATION START ===');
    console.log('Input data:', JSON.stringify(insertApplication, null, 2));
    
    // Validate data integrity before insertion
    if (!insertApplication.opportunityId || insertApplication.opportunityId <= 0) {
      console.log('VALIDATION FAILED: Invalid opportunity ID');
      throw new Error("Invalid opportunity ID: must be a positive number");
    }
    
    if (!insertApplication.coverLetter || insertApplication.coverLetter.length < 50) {
      console.log('VALIDATION FAILED: Cover letter too short:', insertApplication.coverLetter?.length);
      throw new Error("Invalid cover letter: must be at least 50 characters");
    }
    
    if (!insertApplication.projectDescription || insertApplication.projectDescription.length < 100) {
      console.log('VALIDATION FAILED: Project description too short:', insertApplication.projectDescription?.length);
      throw new Error("Invalid project description: must be at least 100 characters");
    }
    
    if (!insertApplication.userId || insertApplication.userId <= 0) {
      console.log('VALIDATION FAILED: Invalid user ID');
      throw new Error("Invalid user ID: must be a positive number");
    }
    
    // Verify opportunity exists
    const opportunity = await this.getOpportunity(insertApplication.opportunityId);
    if (!opportunity) {
      console.log('VALIDATION FAILED: Opportunity not found');
      throw new Error("Opportunity not found");
    }
    
    // Verify user exists
    const user = await this.getUser(insertApplication.userId);
    if (!user) {
      console.log('VALIDATION FAILED: User not found');
      throw new Error("User not found");
    }
    
    console.log('All validations passed, creating application');
    const [application] = await db
      .insert(applications)
      .values({
        ...insertApplication,
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    console.log('Application created:', application.id);
    return application;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  async getApplicationsByOpportunity(opportunityId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.opportunityId, opportunityId));
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }
}

export const storage = new DatabaseStorage();
