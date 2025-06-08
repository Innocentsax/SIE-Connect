import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("GUEST"), // GUEST, STARTUP_FOUNDER, FUNDER, ECOSYSTEM_BUILDER, ADMIN
  name: text("name"),
  profileCompleted: boolean("profile_completed").default(false),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  // Profile fields
  company: text("company"),
  sector: text("sector"),
  location: text("location"),
  description: text("description"),
  interests: text("interests"),
  experience: text("experience"),
  stage: text("stage"), // For founders: startup stage
  website: text("website"),
  socialImpactFocus: text("social_impact_focus"),
  fundingStage: text("funding_stage"), // For founders
  investmentFocus: text("investment_focus"), // For funders
  investmentRange: text("investment_range"), // For funders
  employeeCount: integer("employee_count"),
  foundedYear: integer("founded_year"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const onboardingResponses = pgTable("onboarding_responses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  questionId: text("question_id").notNull(),
  response: text("response"),
  responseData: text("response_data"), // JSON for complex responses
  createdAt: timestamp("created_at").defaultNow(),
});

export const startups = pgTable("startups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sector: text("sector"), // HealthTech, EdTech, FinTech, AgriTech, etc.
  location: text("location"),
  website: text("website"),
  socialEnterpriseFlag: boolean("social_enterprise_flag").default(true),
  stage: text("stage"), // Seed, Series A, etc.
  employeeCount: integer("employee_count"),
  foundedYear: integer("founded_year"),
  ownerUserId: integer("owner_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  provider: text("provider"), // Government, Private, etc.
  type: text("type").notNull(), // Grant, Program, Investor
  criteria: text("criteria"),
  deadline: timestamp("deadline"),
  amount: text("amount"), // RM 500,000, etc.
  link: text("link"),
  sector: text("sector"),
  location: text("location"),
  creatorUserId: integer("creator_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  date: timestamp("date"),
  venue: text("venue"),
  link: text("link"),
  creatorUserId: integer("creator_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const embeddings = pgTable("embeddings", {
  id: serial("id").primaryKey(),
  rowType: text("row_type").notNull(), // startup, opportunity
  rowId: integer("row_id").notNull(),
  vector: real("vector").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedOpportunities = pgTable("saved_opportunities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id),
  status: text("status").notNull().default("SUBMITTED"), // SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED
  coverLetter: text("cover_letter"),
  fundingRequested: text("funding_requested"),
  projectDescription: text("project_description"),
  additionalData: text("additional_data"), // JSON for extra fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain number"),
  role: z.enum(["STARTUP_FOUNDER", "FUNDER", "ECOSYSTEM_BUILDER", "ADMIN", "GUEST"]),
});

export const insertStartupSchema = createInsertSchema(startups).omit({
  id: true,
  createdAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  opportunityId: z.number().positive("Opportunity ID must be a positive number"),
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
  projectDescription: z.string().min(100, "Project description must be at least 100 characters"),
  fundingRequested: z.string().optional(),
  additionalData: z.string().optional(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  startups: many(startups),
  opportunities: many(opportunities),
  events: many(events),
  savedOpportunities: many(savedOpportunities),
}));

export const startupsRelations = relations(startups, ({ one }) => ({
  owner: one(users, {
    fields: [startups.ownerUserId],
    references: [users.id],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  creator: one(users, {
    fields: [opportunities.creatorUserId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  creator: one(users, {
    fields: [events.creatorUserId],
    references: [users.id],
  }),
}));

export const savedOpportunitiesRelations = relations(savedOpportunities, ({ one }) => ({
  user: one(users, {
    fields: [savedOpportunities.userId],
    references: [users.id],
  }),
  opportunity: one(opportunities, {
    fields: [savedOpportunities.opportunityId],
    references: [opportunities.id],
  }),
}));

export const onboardingResponsesRelations = relations(onboardingResponses, ({ one }) => ({
  user: one(users, {
    fields: [onboardingResponses.userId],
    references: [users.id],
  }),
}));

export const insertOnboardingResponseSchema = createInsertSchema(onboardingResponses).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStartup = z.infer<typeof insertStartupSchema>;
export type Startup = typeof startups.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type Embedding = typeof embeddings.$inferSelect;
export type InsertOnboardingResponse = z.infer<typeof insertOnboardingResponseSchema>;
export type OnboardingResponse = typeof onboardingResponses.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
