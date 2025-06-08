import { QueryClient } from "@tanstack/react-query";

// N8N Configuration
interface N8nConfig {
  baseUrl: string;
  webhookUrl?: string;
  apiKey?: string;
  workflowEndpoints: {
    auth: {
      login: string;
      register: string;
      logout: string;
      me: string;
    };
    search: {
      opportunities: string;
      startups: string;
      general: string;
    };
    scraping: {
      websearch: string;
      marketIntelligence: string;
    };
    profile: {
      update: string;
      onboarding: string;
    };
    recommendations: {
      opportunities: string;
      startups: string;
    };
    applications: {
      submit: string;
      status: string;
      list: string;
    };
  };
}

// Default N8N configuration - update these URLs to match your n8n workflows
const defaultN8nConfig: N8nConfig = {
  baseUrl: process.env.VITE_N8N_BASE_URL || 'http://localhost:5678',
  webhookUrl: process.env.VITE_N8N_WEBHOOK_URL,
  apiKey: process.env.VITE_N8N_API_KEY,
  workflowEndpoints: {
    auth: {
      login: '/webhook/auth/login',
      register: '/webhook/auth/register',
      logout: '/webhook/auth/logout',
      me: '/webhook/auth/me'
    },
    search: {
      opportunities: '/webhook/search/opportunities',
      startups: '/webhook/search/startups',
      general: '/webhook/search/general'
    },
    scraping: {
      websearch: '/webhook/scraping/websearch',
      marketIntelligence: '/webhook/scraping/market-intelligence'
    },
    profile: {
      update: '/webhook/profile/update',
      onboarding: '/webhook/profile/onboarding'
    },
    recommendations: {
      opportunities: '/webhook/recommendations/opportunities',
      startups: '/webhook/recommendations/startups'
    },
    applications: {
      submit: '/webhook/applications/submit',
      status: '/webhook/applications/status',
      list: '/webhook/applications/list'
    }
  }
};

class N8nClient {
  private config: N8nConfig;
  private sessionToken: string | null = null;

  constructor(config: N8nConfig = defaultN8nConfig) {
    this.config = config;
    this.sessionToken = localStorage.getItem('n8n_session_token');
  }

  // Set session token for authenticated requests
  setSessionToken(token: string) {
    this.sessionToken = token;
    localStorage.setItem('n8n_session_token', token);
  }

  // Clear session token
  clearSessionToken() {
    this.sessionToken = null;
    localStorage.removeItem('n8n_session_token');
  }

  // Generic method to call n8n webhooks
  private async callWebhook<T = any>(
    endpoint: string, 
    data?: any, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication if available
    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    if (this.config.apiKey) {
      headers['X-N8N-API-KEY'] = this.config.apiKey;
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`N8N API Error: ${response.status} - ${error}`);
    }

    return await response.json();
  }

  // Authentication methods
  async login(email: string, password: string) {
    const result = await this.callWebhook(this.config.workflowEndpoints.auth.login, {
      email,
      password
    });
    
    if (result.token) {
      this.setSessionToken(result.token);
    }
    
    return result;
  }

  async register(userData: any) {
    const result = await this.callWebhook(this.config.workflowEndpoints.auth.register, userData);
    
    if (result.token) {
      this.setSessionToken(result.token);
    }
    
    return result;
  }

  async logout() {
    await this.callWebhook(this.config.workflowEndpoints.auth.logout);
    this.clearSessionToken();
  }

  async getCurrentUser() {
    return await this.callWebhook(this.config.workflowEndpoints.auth.me, undefined, 'GET');
  }

  // Search methods
  async searchOpportunities(query: string, filters?: any) {
    return await this.callWebhook(this.config.workflowEndpoints.search.opportunities, {
      query,
      filters
    });
  }

  async searchStartups(query: string, filters?: any) {
    return await this.callWebhook(this.config.workflowEndpoints.search.startups, {
      query,
      filters
    });
  }

  async generalSearch(query: string, type?: string) {
    return await this.callWebhook(this.config.workflowEndpoints.search.general, {
      query,
      type
    });
  }

  // Webscraping methods
  async performWebsearch(query: string, options?: any) {
    return await this.callWebhook(this.config.workflowEndpoints.scraping.websearch, {
      query,
      options
    });
  }

  async getMarketIntelligence(sector: string, location?: string) {
    return await this.callWebhook(this.config.workflowEndpoints.scraping.marketIntelligence, {
      sector,
      location
    });
  }

  // Profile methods
  async updateProfile(profileData: any) {
    return await this.callWebhook(this.config.workflowEndpoints.profile.update, profileData, 'PUT');
  }

  async completeOnboarding(onboardingData: any) {
    return await this.callWebhook(this.config.workflowEndpoints.profile.onboarding, onboardingData);
  }

  // Recommendations
  async getOpportunityRecommendations(userProfile?: any) {
    return await this.callWebhook(this.config.workflowEndpoints.recommendations.opportunities, userProfile);
  }

  async getStartupRecommendations(investorProfile?: any) {
    return await this.callWebhook(this.config.workflowEndpoints.recommendations.startups, investorProfile);
  }

  // Applications
  async submitApplication(applicationData: any) {
    return await this.callWebhook(this.config.workflowEndpoints.applications.submit, applicationData);
  }

  async getApplicationStatus(applicationId: string) {
    return await this.callWebhook(`${this.config.workflowEndpoints.applications.status}/${applicationId}`, undefined, 'GET');
  }

  async getUserApplications() {
    return await this.callWebhook(this.config.workflowEndpoints.applications.list, undefined, 'GET');
  }

  // Update configuration
  updateConfig(newConfig: Partial<N8nConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export n8n client instance
export const n8nClient = new N8nClient();

// Export configuration for external updates
export { type N8nConfig, defaultN8nConfig };