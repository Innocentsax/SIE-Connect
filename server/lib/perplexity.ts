interface PerplexitySearchQuery {
  userRole: 'FOUNDER' | 'FUNDER' | 'ADMIN';
  sector?: string | null;
  location?: string | null;
  query: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface SearchResult {
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

export class PerplexitySearchService {
  private readonly apiKey: string;
  private readonly openaiApiKey: string;
  private readonly baseUrl = 'https://api.perplexity.ai/chat/completions';
  private readonly openaiBaseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey && !this.openaiApiKey) {
      console.warn('Neither PERPLEXITY_API_KEY nor OPENAI_API_KEY provided - AI search will be limited');
    }
  }

  async search(query: string): Promise<{ results: SearchResult[] }> {
    // Try Perplexity first
    if (this.apiKey) {
      try {
        const response = await this.makePerplexityRequest(query);
        
        if (response.choices && response.choices.length > 0) {
          const content = response.choices[0].message.content;
          const results = this.parseSearchResults(content, { userRole: 'FOUNDER', query });
          return { results };
        }
      } catch (error) {
        console.error('Perplexity search failed:', error);
        console.log('Falling back to OpenAI...');
      }
    }

    // Fallback to OpenAI GPT-4o-mini
    if (this.openaiApiKey) {
      try {
        const response = await this.makeOpenAIRequest(query);
        
        if (response.choices && response.choices.length > 0) {
          const content = response.choices[0].message.content;
          const results = this.parseSearchResults(content, { userRole: 'FOUNDER', query });
          return { results };
        }
      } catch (error) {
        console.error('OpenAI search failed:', error);
      }
    }

    console.log('No API keys available, returning empty results');
    return { results: [] };
  }

  async searchByUserProfile(searchQuery: PerplexitySearchQuery): Promise<SearchResult[]> {
    const query = this.buildSearchQuery(searchQuery);
    
    // Try Perplexity first
    if (this.apiKey) {
      try {
        const response = await this.makePerplexityRequest(query);
        
        if (response.choices && response.choices.length > 0) {
          const content = response.choices[0].message.content;
          return this.parseSearchResults(content, searchQuery);
        }
      } catch (error) {
        console.error('Perplexity search failed:', error);
        console.log('Falling back to OpenAI...');
      }
    }

    // Fallback to OpenAI GPT-4o-mini
    if (this.openaiApiKey) {
      try {
        const response = await this.makeOpenAIRequest(query);
        
        if (response.choices && response.choices.length > 0) {
          const content = response.choices[0].message.content;
          return this.parseSearchResults(content, searchQuery);
        }
      } catch (error) {
        console.error('OpenAI search failed:', error);
      }
    }

    console.log('No API keys available, returning empty results');
    return [];
  }

  private buildSearchQuery(searchQuery: PerplexitySearchQuery): string {
    let query = '';

    // Role-specific search strategies
    if (searchQuery.userRole === 'FOUNDER') {
      query = `Find startup funding opportunities, accelerators, grants, and competitions in Malaysia for ${searchQuery.sector || 'startups'}`;
      if (searchQuery.location) {
        query += ` based in ${searchQuery.location}`;
      }
      query += '. Include application deadlines, funding amounts, and requirements. Focus on recent programs in 2024-2025.';
    } else if (searchQuery.userRole === 'FUNDER') {
      query = `Find promising startups and investment opportunities in Malaysia`;
      if (searchQuery.sector) {
        query += ` in ${searchQuery.sector} sector`;
      }
      if (searchQuery.location) {
        query += ` located in ${searchQuery.location}`;
      }
      query += '. Include information about funding rounds, traction, team, and growth metrics. Focus on seed to Series A companies.';
    } else {
      query = `Find startup ecosystem updates, accelerator programs, and partnership opportunities in Malaysia`;
      if (searchQuery.sector) {
        query += ` related to ${searchQuery.sector}`;
      }
      query += '. Include information about new programs, government initiatives, and industry trends.';
    }

    // Add specific user query if provided
    if (searchQuery.query && searchQuery.query.length > 3) {
      query += ` Additionally, ${searchQuery.query}`;
    }

    return query;
  }

  private async makePerplexityRequest(query: string): Promise<PerplexityResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant that finds startup ecosystem opportunities and information. Return results in a structured format with clear titles, descriptions, sources, and relevant metadata like deadlines, amounts, locations, and sectors.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 500,
          temperature: 0.2,
          top_p: 0.9,
          search_recency_filter: 'month',
          return_images: false,
          return_related_questions: false,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Perplexity API error details:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Perplexity API request timed out');
      }
      throw error;
    }
  }

  private async makeOpenAIRequest(query: string): Promise<PerplexityResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      // Ensure query is a string for OpenAI API
      const queryText = typeof query === 'string' ? query : JSON.stringify(query);
      
      const response = await fetch(this.openaiBaseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant that provides information about Malaysian startups, funding opportunities, and business ecosystem. Focus on providing accurate, current information about the Malaysian startup and investment landscape.'
            },
            {
              role: 'user',
              content: queryText
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('OpenAI API request timed out');
      }
      throw error;
    }
  }

  private parseSearchResults(content: string, searchQuery: PerplexitySearchQuery): SearchResult[] {
    const results: SearchResult[] = [];
    
    try {
      // Split content into sections and extract structured information
      const lines = content.split('\n').filter(line => line.trim());
      
      let currentResult: Partial<SearchResult> = {};
      let isProcessingResult = false;

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Check for potential title (numbered list or header)
        if (this.isLikelyTitle(trimmedLine)) {
          // Save previous result if we have one
          if (isProcessingResult && currentResult.title && currentResult.description) {
            results.push(this.completeResult(currentResult, searchQuery));
          }
          
          // Start new result
          currentResult = {
            title: this.cleanTitle(trimmedLine),
            type: this.determineType(trimmedLine, searchQuery.userRole)
          };
          isProcessingResult = true;
        } else if (isProcessingResult && trimmedLine.length > 20) {
          // Add to description
          if (!currentResult.description) {
            currentResult.description = trimmedLine;
          } else {
            currentResult.description += ' ' + trimmedLine;
          }
        }
      }

      // Add final result
      if (isProcessingResult && currentResult.title && currentResult.description) {
        results.push(this.completeResult(currentResult, searchQuery));
      }

      // If no structured results found, create general results from content
      if (results.length === 0 && content.length > 100) {
        const generalResult: SearchResult = {
          title: `${searchQuery.userRole === 'FOUNDER' ? 'Funding Opportunities' : 'Market Intelligence'} Found`,
          description: content.substring(0, 300) + '...',
          source: 'Perplexity AI Search',
          confidence: 0.7,
          type: searchQuery.userRole === 'FOUNDER' ? 'opportunity' : 'insight',
          metadata: {
            sector: searchQuery.sector || undefined,
            location: searchQuery.location || undefined
          }
        };
        results.push(generalResult);
      }

    } catch (error) {
      console.error('Error parsing search results:', error);
    }

    return results.slice(0, 10); // Limit to top 10 results
  }

  private isLikelyTitle(line: string): boolean {
    return /^\d+\./.test(line) || // Numbered list
           /^[A-Z]/.test(line) && line.length < 100 && line.endsWith(':') || // Header with colon
           /^\*\*.*\*\*/.test(line) || // Bold text
           line.includes('Program') || 
           line.includes('Fund') ||
           line.includes('Grant') ||
           line.includes('Accelerator') ||
           line.includes('Startup');
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^\*\*/, '').replace(/\*\*$/, '') // Remove bold markers
      .replace(/:$/, '') // Remove trailing colon
      .trim();
  }

  private determineType(title: string, userRole: string): 'opportunity' | 'startup' | 'event' | 'insight' {
    const lowerTitle = title.toLowerCase();
    
    if (userRole === 'FOUNDER') {
      if (lowerTitle.includes('grant') || lowerTitle.includes('fund') || 
          lowerTitle.includes('accelerator') || lowerTitle.includes('program')) {
        return 'opportunity';
      }
      if (lowerTitle.includes('event') || lowerTitle.includes('conference') || 
          lowerTitle.includes('demo')) {
        return 'event';
      }
    } else if (userRole === 'FUNDER') {
      if (lowerTitle.includes('startup') || lowerTitle.includes('company')) {
        return 'startup';
      }
    }
    
    return 'insight';
  }

  private completeResult(partial: Partial<SearchResult>, searchQuery: PerplexitySearchQuery): SearchResult {
    return {
      title: partial.title || 'Untitled',
      description: partial.description || 'No description available',
      source: 'Perplexity AI Search',
      confidence: this.calculateConfidence(partial, searchQuery),
      type: partial.type || 'insight',
      metadata: {
        sector: this.extractMetadata(partial.description || '', 'sector') || searchQuery.sector || undefined,
        location: this.extractMetadata(partial.description || '', 'location') || searchQuery.location || undefined,
        deadline: this.extractMetadata(partial.description || '', 'deadline'),
        amount: this.extractMetadata(partial.description || '', 'amount'),
        stage: this.extractMetadata(partial.description || '', 'stage')
      }
    };
  }

  private calculateConfidence(result: Partial<SearchResult>, searchQuery: PerplexitySearchQuery): number {
    let confidence = 0.8; // Base confidence for Perplexity results
    
    const description = (result.description || '').toLowerCase();
    const title = (result.title || '').toLowerCase();
    
    // Boost confidence for sector matches
    if (searchQuery.sector && (description.includes(searchQuery.sector.toLowerCase()) || 
        title.includes(searchQuery.sector.toLowerCase()))) {
      confidence += 0.1;
    }
    
    // Boost confidence for location matches
    if (searchQuery.location && (description.includes(searchQuery.location.toLowerCase()) || 
        title.includes(searchQuery.location.toLowerCase()))) {
      confidence += 0.1;
    }
    
    // Boost confidence for detailed descriptions
    if (description.length > 200) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 1.0);
  }

  private extractMetadata(text: string, type: string): string | undefined {
    const lowerText = text.toLowerCase();
    
    switch (type) {
      case 'deadline':
        const deadlineMatch = text.match(/deadline[:\s]+([^.]+)/i) || 
                            text.match(/apply by[:\s]+([^.]+)/i) ||
                            text.match(/closes?[:\s]+([^.]+)/i);
        return deadlineMatch ? deadlineMatch[1].trim() : undefined;
        
      case 'amount':
        const amountMatch = text.match(/(\$[\d,]+(?:\.\d{2})?(?:[kmb])?|\d+[kmb]?[\s]*(?:million|thousand))/i) ||
                          text.match(/funding[:\s]+([^.]+)/i);
        return amountMatch ? amountMatch[1].trim() : undefined;
        
      case 'stage':
        if (lowerText.includes('seed')) return 'Seed';
        if (lowerText.includes('series a')) return 'Series A';
        if (lowerText.includes('series b')) return 'Series B';
        if (lowerText.includes('pre-seed')) return 'Pre-Seed';
        if (lowerText.includes('early stage')) return 'Early Stage';
        return undefined;
        
      case 'sector':
        const sectors = ['fintech', 'healthtech', 'edtech', 'cleantech', 'agritech', 'proptech'];
        for (const sector of sectors) {
          if (lowerText.includes(sector)) {
            return sector.charAt(0).toUpperCase() + sector.slice(1);
          }
        }
        return undefined;
        
      case 'location':
        const locations = ['malaysia', 'singapore', 'kuala lumpur', 'klang valley', 'penang', 'johor'];
        for (const location of locations) {
          if (lowerText.includes(location)) {
            return location.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
          }
        }
        return undefined;
        
      default:
        return undefined;
    }
  }

  // Method for testing API connectivity
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await this.makePerplexityRequest('Test connection to startup ecosystem in Malaysia');
      return response.choices && response.choices.length > 0;
    } catch (error) {
      console.error('Perplexity connection test failed:', error);
      return false;
    }
  }
}

export const perplexityService = new PerplexitySearchService();