import { scrapeEcosystemData, validateScrapedData } from './scraper';
import { storage } from '../storage';
import { generateSummary, generateEmbedding } from './claude';

interface SchedulerConfig {
  scrapeInterval: number; // milliseconds
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
}

class DataScheduler {
  private config: SchedulerConfig = {
    scrapeInterval: 24 * 60 * 60 * 1000, // 24 hours
    enabled: process.env.NODE_ENV === 'production',
    maxRetries: 3,
    retryDelay: 5 * 60 * 1000, // 5 minutes
  };
  
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastRun: Date | null = null;
  private nextRun: Date | null = null;

  constructor(config?: Partial<SchedulerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  start() {
    if (this.isRunning || !this.config.enabled) {
      console.log('Scheduler not started: already running or disabled');
      return;
    }

    console.log('Starting data scraping scheduler...');
    this.isRunning = true;
    this.scheduleNext();
  }

  stop() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.nextRun = null;
    console.log('Data scraping scheduler stopped');
  }

  private scheduleNext() {
    if (!this.isRunning) return;

    this.nextRun = new Date(Date.now() + this.config.scrapeInterval);
    console.log(`Next scraping scheduled for: ${this.nextRun.toISOString()}`);

    this.intervalId = setTimeout(() => {
      this.executeScrapingJob();
    }, this.config.scrapeInterval);
  }

  private async executeScrapingJob() {
    console.log('Executing scheduled scraping job...');
    this.lastRun = new Date();

    let attempt = 1;
    while (attempt <= this.config.maxRetries) {
      try {
        const result = await this.performScraping();
        console.log('Scraping job completed successfully:', result);
        break;
      } catch (error) {
        console.error(`Scraping attempt ${attempt} failed:`, error);
        
        if (attempt === this.config.maxRetries) {
          console.error('All scraping attempts failed. Will retry on next schedule.');
          break;
        }

        attempt++;
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      }
    }

    this.scheduleNext();
  }

  private async performScraping() {
    const scrapedData = await scrapeEcosystemData();
    const validation = await validateScrapedData(scrapedData);

    if (!validation.isValid) {
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }

    const importStats = {
      startups: 0,
      opportunities: 0,
      errors: [] as string[]
    };

    // Import startups
    for (const startupData of validation.validStartups) {
      try {
        const startup = await storage.createStartup({
          name: startupData.name,
          description: startupData.description,
          sector: startupData.sector || null,
          location: startupData.location || null,
          website: startupData.website || null,
          socialEnterpriseFlag: true,
          stage: null,
          employeeCount: null,
          foundedYear: null,
          ownerUserId: null
        });

        // Generate AI summary and embeddings
        if (startup.description) {
          const vector = await generateEmbedding(startup.description);
          await storage.createEmbedding({
            rowType: 'startup',
            rowId: startup.id,
            vector
          });
        }

        importStats.startups++;
      } catch (error: any) {
        importStats.errors.push(`Startup import failed: ${startupData.name} - ${error.message}`);
      }
    }

    // Import opportunities
    for (const oppData of validation.validOpportunities) {
      try {
        const opportunity = await storage.createOpportunity({
          title: oppData.title,
          description: oppData.description,
          type: oppData.type || 'Grant',
          provider: oppData.provider || null,
          criteria: null,
          deadline: oppData.deadline ? new Date(oppData.deadline) : null,
          amount: oppData.amount || null,
          link: oppData.link || null,
          sector: null,
          location: null,
          creatorUserId: null
        });

        // Generate embeddings
        if (opportunity.description) {
          const vector = await generateEmbedding(opportunity.description);
          await storage.createEmbedding({
            rowType: 'opportunity',
            rowId: opportunity.id,
            vector
          });
        }

        importStats.opportunities++;
      } catch (error: any) {
        importStats.errors.push(`Opportunity import failed: ${oppData.title} - ${error.message}`);
      }
    }

    return importStats;
  }

  getStatus() {
    return {
      running: this.isRunning,
      enabled: this.config.enabled,
      lastRun: this.lastRun?.toISOString() || null,
      nextRun: this.nextRun?.toISOString() || null,
      interval: this.config.scrapeInterval,
      config: this.config
    };
  }

  // Manual trigger for testing or admin use
  async triggerNow() {
    if (this.isRunning) {
      console.log('Manual scraping triggered');
      return await this.performScraping();
    } else {
      throw new Error('Scheduler is not running');
    }
  }
}

// Global scheduler instance
export const dataScheduler = new DataScheduler();

// Auto-start scheduler in production
if (process.env.NODE_ENV === 'production') {
  dataScheduler.start();
}

export default dataScheduler;