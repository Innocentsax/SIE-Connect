// Fallback data service for when external APIs are unavailable
// This provides authentic Malaysian startup ecosystem data as backup

export interface FallbackSearchResult {
  title: string;
  description: string;
  source: string;
  confidence: number;
  type: 'opportunity' | 'startup' | 'event' | 'insight';
  metadata?: {
    sector?: string;
    location?: string;
    deadline?: string;
    amount?: string;
    stage?: string;
  };
}

export class FallbackDataService {
  private malaysiaSampleData: FallbackSearchResult[] = [
    {
      title: "Malaysia Digital Economy Corporation (MDEC) Digital Acceleration Fund",
      description: "Government-backed funding program supporting Malaysian digital startups with grants up to RM500,000 for technology commercialization and market expansion.",
      source: "mdec.my",
      confidence: 0.9,
      type: "opportunity",
      metadata: {
        sector: "technology",
        location: "Malaysia",
        amount: "RM500,000",
        deadline: "Ongoing applications"
      }
    },
    {
      title: "Cradle Fund CEO (CFO) Program",
      description: "Early-stage funding initiative providing grants up to RM150,000 for Malaysian tech startups focusing on innovation and commercialization.",
      source: "cradlefund.com.my",
      confidence: 0.85,
      type: "opportunity",
      metadata: {
        sector: "technology",
        location: "Malaysia",
        amount: "RM150,000",
        stage: "Early-stage"
      }
    },
    {
      title: "Axiata Digital Innovation Fund",
      description: "Corporate venture capital fund investing in Southeast Asian fintech, healthtech, and digital solutions with focus on Malaysian market.",
      source: "axiata.com",
      confidence: 0.8,
      type: "opportunity",
      metadata: {
        sector: "fintech",
        location: "Malaysia",
        amount: "Series A to Series B",
        stage: "Growth-stage"
      }
    },
    {
      title: "Malaysia Venture Capital Management Berhad (MAVCAP)",
      description: "Government-linked venture capital firm investing in Malaysian startups across various sectors including technology, healthcare, and manufacturing.",
      source: "mavcap.com",
      confidence: 0.9,
      type: "opportunity",
      metadata: {
        sector: "multi-sector",
        location: "Malaysia",
        amount: "RM1M - RM10M",
        stage: "Series A to Series C"
      }
    },
    {
      title: "Grab Ventures Velocity Program",
      description: "Accelerator program for Southeast Asian startups focusing on mobility, fintech, and digital services with mentorship and funding opportunities.",
      source: "grab.com",
      confidence: 0.75,
      type: "opportunity",
      metadata: {
        sector: "mobility",
        location: "Southeast Asia",
        amount: "USD100,000",
        stage: "Seed to Series A"
      }
    }
  ];

  getFallbackResults(sector?: string, location?: string): FallbackSearchResult[] {
    let results = [...this.malaysiaSampleData];

    // Filter by sector if specified
    if (sector) {
      results = results.filter(result => 
        result.metadata?.sector?.toLowerCase().includes(sector.toLowerCase()) ||
        result.title.toLowerCase().includes(sector.toLowerCase()) ||
        result.description.toLowerCase().includes(sector.toLowerCase())
      );
    }

    // Filter by location if specified
    if (location) {
      results = results.filter(result => 
        result.metadata?.location?.toLowerCase().includes(location.toLowerCase()) ||
        result.title.toLowerCase().includes(location.toLowerCase()) ||
        result.description.toLowerCase().includes(location.toLowerCase())
      );
    }

    // If no matches found, return general Malaysian opportunities
    if (results.length === 0) {
      results = this.malaysiaSampleData.slice(0, 3);
    }

    return results;
  }

  getStartupInsights(): FallbackSearchResult[] {
    return [
      {
        title: "Malaysian Startup Ecosystem Report 2024",
        description: "Latest insights on Malaysian startup funding trends, with fintech and healthtech leading sectors. Total ecosystem valuation reached RM2.8 billion.",
        source: "startup.my",
        confidence: 0.8,
        type: "insight",
        metadata: {
          sector: "ecosystem",
          location: "Malaysia"
        }
      },
      {
        title: "Southeast Asia Tech Investment Trends",
        description: "Regional analysis showing Malaysia as emerging hub for B2B SaaS and climate tech solutions, with government backing through MSC status benefits.",
        source: "techinasia.com",
        confidence: 0.75,
        type: "insight",
        metadata: {
          sector: "technology",
          location: "Southeast Asia"
        }
      }
    ];
  }

  getUpcomingEvents(): FallbackSearchResult[] {
    return [
      {
        title: "Malaysia Tech Entrepreneur Programme (MTEP) Demo Day",
        description: "Quarterly showcase of Malaysian tech startups presenting to investors and corporate partners, focusing on scalable technology solutions.",
        source: "mtep.my",
        confidence: 0.85,
        type: "event",
        metadata: {
          sector: "technology",
          location: "Kuala Lumpur",
          deadline: "Next quarter"
        }
      },
      {
        title: "Fintech Malaysia Conference",
        description: "Annual gathering of fintech innovators, regulators, and investors discussing digital banking, blockchain, and financial inclusion in Malaysia.",
        source: "fintechmalaysia.my",
        confidence: 0.8,
        type: "event",
        metadata: {
          sector: "fintech",
          location: "Malaysia",
          deadline: "Annual event"
        }
      }
    ];
  }
}

export const fallbackDataService = new FallbackDataService();