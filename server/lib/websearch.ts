import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

interface ArticleContent {
  url: string;
  content: string;
}

export interface IPageMetadata {
  url: string;
  favicon: string;
  title: string | undefined;
  content?: string;
  publishedDate?: Date;
  sourceReputation?: number;
}

interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

const WEB_SEARCH_CONFIG = {
  baseUrl: "https://duckduckgo.com/html/?",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
};

const generateQueryString = (query: string) =>
  `q=${encodeURIComponent(query)}`;

export class WebSearchService {
  private static instance: WebSearchService;
  private readonly baseUrl = WEB_SEARCH_CONFIG.baseUrl;
  private readonly logger: Logger;
  private readonly userAgent = WEB_SEARCH_CONFIG.userAgent;
  static readonly URL_PRIORITY_LIST = [
    "gov.my",
    "cradle.com.my", 
    "mosti.gov.my",
    "sidec.com.my",
    "mdec.my",
    "avpn.asia",
    "techcrunch.com",
    "startupmalaysia.com"
  ];

  private constructor(logger: Logger) {
    this.logger = logger;
  }

  public static getInstance(): WebSearchService {
    if (!WebSearchService.instance) {
      WebSearchService.instance = new WebSearchService({
        info: (msg: string, ...args: any[]) => console.log(`[WebSearch] ${msg}`, ...args),
        warn: (msg: string, ...args: any[]) => console.warn(`[WebSearch] ${msg}`, ...args),
        error: (msg: string, ...args: any[]) => console.error(`[WebSearch] ${msg}`, ...args),
      });
    }
    return WebSearchService.instance;
  }

  private async fetchArticleContent(
    url: string,
  ): Promise<ArticleContent | undefined> {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      const html = response.data;
      const dom = new JSDOM(html);
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      const content = article?.textContent
        ? article.textContent.trim().slice(0, 10000)
        : "No readable content found";
      return { url, content: content.trim() };
    } catch (error: any) {
      this.logger.warn(`Failed to fetch ${url}: ${error.message}`, error);
      return { url: "", content: "" };
    }
  }

  private async fetchSearchResultMetadata(
    searchUrl: string,
  ): Promise<IPageMetadata[]> {
    try {
      const response = await axios.get(searchUrl, {
        timeout: 10000,
        headers: {
          Accept: "text/html",
          "User-Agent": this.userAgent,
        },
      });

      const dom = new JSDOM(response.data);
      
      // DuckDuckGo link selectors
      const urlElements = dom.window.document.querySelectorAll("a[href*='uddg=']");

      const urls = Array.from(urlElements)
        .map((el: any) => {
          const href = el.getAttribute("href");
          if (href && href.includes("uddg=")) {
            try {
              const urlMatch = href.match(/uddg=([^&]+)/);
              return urlMatch ? decodeURIComponent(urlMatch[1]) : null;
            } catch (e) {
              return null;
            }
          }
          return null;
        })
        .filter((url): url is string => !!url && url.startsWith("http"))
        .slice(0, 8);

      const pagesMetaData: IPageMetadata[] = await Promise.all(
        urls.map(async (url) => {
          const metadata = await this.extracturlMetaData(url);
          return metadata;
        }),
      );

      this.logger.info(`Extracted URLs: ${urls.join(", ")}`);
      return pagesMetaData.filter(
        ({ url, favicon }) => url.length > 1 && favicon.length > 1,
      );
    } catch (error: any) {
      this.logger.error(
        `Error fetching or parsing search results: ${error.message}`,
        error,
      );
      return [];
    }
  }

  private async extracturlMetaData(
    url: string,
  ): Promise<{ url: string; title: string | undefined; favicon: string }> {
    try {
      const parsedUrl = new URL(url);
      const origin = parsedUrl.origin;
      let favicon = "";
      let title: string | undefined;

      try {
        const response = await axios.get(url, {
          timeout: 3000,
          headers: {
            "User-Agent": this.userAgent,
          },
        });

        const dom = new JSDOM(response.data);
        const doc = dom.window.document;

        title = this.extractTitle(doc);

        const faviconElement = doc.querySelector(
          'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]',
        );

        favicon = await this.extractFavicon(faviconElement, origin, parsedUrl);
      } catch (error) {
        favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`;
        title = parsedUrl.hostname.slice(0, 20);
        return { url: url ?? "", favicon: favicon ?? "", title: title ?? "" };
      }
      return { url, favicon, title };
    } catch (error: any) {
      this.logger.warn(
        `Error fetching favicon and title for ${url}: ${error.message}`,
      );
      return { url: "", title: "", favicon: "" };
    }
  }

  private extractTitle(doc: Document): string | undefined {
    let title: string | undefined;

    let titleElement = doc.querySelector("title");
    if (titleElement) {
      title = titleElement.textContent?.trim();
    }

    if (!title) {
      let ogTitle = doc.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        title = ogTitle.getAttribute("content")?.trim();
      }
    }

    if (!title) {
      let twitterTitle = doc.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        title = twitterTitle.getAttribute("content")?.trim();
      }
    }

    return title;
  }

  private async extractFavicon(
    faviconElement: Element | null,
    origin: string,
    parsedUrl: URL,
  ): Promise<string> {
    let favicon = "";

    if (faviconElement?.getAttribute("href")) {
      const faviconHref = faviconElement.getAttribute("href")!;
      favicon = faviconHref.startsWith("http")
        ? faviconHref
        : new URL(faviconHref, origin).href;
    }
    if (!favicon) {
      const rootFaviconUrl = `${origin}/favicon.ico`;

      try {
        const faviconResponse = await axios.head(rootFaviconUrl, {
          timeout: 5000,
        });
        if (faviconResponse.status === 200) {
          favicon = rootFaviconUrl;
        }
      } catch (error: any) {
        this.logger.info(`unable to fetch Favicons ${error.message}`, error);
        return "";
      }
    }
    if (!favicon) {
      favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=32`;
    }

    return favicon ?? "";
  }

  public async run(query: string): Promise<string[] | string> {
    // this.urlRanker.query = query;
    if (!query || query.trim().length < 2) {
      return "Query too short or invalid.";
    }

    const queryString = generateQueryString(query);
    const searchUrl = `${this.baseUrl}${queryString}`;

    try {
      const pageMetadata = await this.fetchSearchResultMetadata(searchUrl);
      if (pageMetadata.length === 0) {
        return `No web results found for "${query}" on Startpage.`;
      }
      const excludedURLs = [
        "medium.com",
        "linkedin.com",
        "naukri.com",
        "akamai.com",
        "x.com",
        "reuters.com",
        "cbinsights.com",
        "openai.com",
        "sp-edge.com",
        "accuweather.com",
        "www.blockchain-council.org",
      ];

      const crawleableMetadata: IPageMetadata[] = [];

      pageMetadata.forEach((meta) => {
        const urlObj = new URL(meta.url);
        const domain = urlObj.hostname.toLowerCase();
        if (!excludedURLs.some((ex) => domain.includes(ex))) {
          crawleableMetadata.push(meta);
        }
      });

      const urls = this.sortUrlsByPriority(
        crawleableMetadata,
        WebSearchService.URL_PRIORITY_LIST,
      ).filter((url) => !url.includes("youtube.com"));

      const contextPromises = urls
        .slice(0, 3)
        .map((url) => this.fetchArticleContent(url));
      const contextResults = await Promise.all(contextPromises);
      const filteredContext = contextResults.filter((c) => c !== undefined);
      return filteredContext.map((result) => result?.content).join("\n\n");
    } catch (error: any) {
      this.logger.info(`search error: ${error.message}`, error);
      return "";
    }
  }

  readonly sortUrlsByPriority = (
    metadata: IPageMetadata[],
    priorityDomains: string[],
  ): string[] => {
    const priorityUrls: string[] = [];
    const otherUrls: string[] = [];

    metadata.forEach((m) => {
      try {
        const urlObj = new URL(m.url);
        const domain = urlObj.hostname.toLowerCase();

        if (priorityDomains.some((priority) => domain.includes(priority))) {
          priorityUrls.push(m.url);
        } else {
          otherUrls.push(m.url);
        }
      } catch (error) {
        otherUrls.push(m.url);
      }
    });
    return [...priorityUrls, ...otherUrls];
  };

  // Enhanced method to search for Malaysian startup ecosystem opportunities
  public async searchStartupOpportunities(query: string): Promise<{
    results: Array<{
      title: string;
      url: string;
      content: string;
      source: string;
      type?: string;
      deadline?: string;
      amount?: string;
      sector?: string;
    }>;
    total: number;
  }> {
    const enhancedQuery = `${query} Malaysia startup grants funding opportunities`;
    
    try {
      const queryString = generateQueryString(enhancedQuery);
      const searchUrl = `${this.baseUrl}${queryString}`;
      
      const pageMetadata = await this.fetchSearchResultMetadata(searchUrl);
      
      if (pageMetadata.length === 0) {
        this.logger.warn(`No web results found for "${enhancedQuery}"`);
        return { results: [], total: 0 };
      }

      // Filter and prioritize Malaysian startup ecosystem URLs
      const relevantMetadata = pageMetadata.filter(meta => {
        const urlObj = new URL(meta.url);
        const domain = urlObj.hostname.toLowerCase();
        return !this.isExcludedDomain(domain) && this.isRelevantDomain(domain);
      });

      const sortedUrls = this.sortUrlsByPriority(relevantMetadata, WebSearchService.URL_PRIORITY_LIST);
      
      // Fetch content from top 5 URLs
      const contentPromises = sortedUrls.slice(0, 5).map(async (url) => {
        const articleContent = await this.fetchArticleContent(url);
        const metadata = pageMetadata.find(m => m.url === url);
        
        if (articleContent && articleContent.content.length > 50) {
          return {
            title: metadata?.title || `Startup Opportunity: ${query}`,
            url: articleContent.url,
            content: this.extractRelevantContent(articleContent.content),
            source: "Web Search",
            type: this.extractOpportunityType(articleContent.content),
            deadline: this.extractDeadline(articleContent.content),
            amount: this.extractFundingAmount(articleContent.content),
            sector: this.extractSector(articleContent.content)
          };
        }
        return null;
      });

      const results = (await Promise.all(contentPromises)).filter(r => r !== null);
      
      this.logger.info(`Found ${results.length} startup opportunities for query: ${query}`);
      
      return {
        results,
        total: results.length
      };
      
    } catch (error: any) {
      this.logger.error(`Error searching startup opportunities: ${error.message}`);
      return { results: [], total: 0 };
    }
  }

  private isExcludedDomain(domain: string): boolean {
    const excludedDomains = [
      "medium.com", "linkedin.com", "naukri.com", "akamai.com", "x.com",
      "reuters.com", "cbinsights.com", "openai.com", "sp-edge.com",
      "accuweather.com", "blockchain-council.org", "youtube.com"
    ];
    return excludedDomains.some(excluded => domain.includes(excluded));
  }

  private isRelevantDomain(domain: string): boolean {
    const relevantKeywords = [
      "gov.my", "cradle", "mosti", "sidec", "mdec", "malaysia", "startup",
      "funding", "grant", "accelerator", "venture", "capital", "entrepreneur"
    ];
    return relevantKeywords.some(keyword => domain.includes(keyword));
  }

  private extractRelevantContent(content: string): string {
    // Extract the most relevant parts of the content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for sentences containing funding-related keywords
    const relevantSentences = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return lower.includes('fund') || lower.includes('grant') || lower.includes('startup') ||
             lower.includes('entrepreneur') || lower.includes('malaysia') || lower.includes('rm ') ||
             lower.includes('million') || lower.includes('thousand') || lower.includes('capital');
    });
    
    const result = relevantSentences.slice(0, 3).join('. ').trim();
    return result.length > 50 ? result : content.substring(0, 300);
  }

  private extractOpportunityType(content: string): string {
    const lower = content.toLowerCase();
    if (lower.includes('grant')) return 'Grant';
    if (lower.includes('accelerator')) return 'Accelerator';
    if (lower.includes('incubator')) return 'Incubator';
    if (lower.includes('competition')) return 'Competition';
    if (lower.includes('fund')) return 'Fund';
    return 'Opportunity';
  }

  private extractDeadline(content: string): string | undefined {
    // Look for deadline patterns
    const deadlinePatterns = [
      /deadline[:\s]+([^.]+)/i,
      /apply by[:\s]+([^.]+)/i,
      /submission[:\s]+([^.]+)/i,
      /closes?[:\s]+([^.]+)/i
    ];
    
    for (const pattern of deadlinePatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim().substring(0, 50);
      }
    }
    return undefined;
  }

  private extractFundingAmount(content: string): string | undefined {
    // Look for funding amount patterns
    const amountPatterns = [
      /rm\s+[\d,]+(?:\s*(?:million|thousand))?/i,
      /usd?\s+[\d,]+(?:\s*(?:million|thousand))?/i,
      /\$[\d,]+(?:\s*(?:million|thousand))?/i,
      /up to\s+[\d,]+/i
    ];
    
    for (const pattern of amountPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    return undefined;
  }

  private extractSector(content: string): string | undefined {
    const sectors = [
      'fintech', 'healthtech', 'edtech', 'agtech', 'cleantech', 'blockchain',
      'ai', 'artificial intelligence', 'machine learning', 'iot', 'cybersecurity',
      'e-commerce', 'logistics', 'transportation', 'energy', 'sustainability'
    ];
    
    const lower = content.toLowerCase();
    for (const sector of sectors) {
      if (lower.includes(sector)) {
        return sector.charAt(0).toUpperCase() + sector.slice(1);
      }
    }
    return undefined;
  }

  // Public method to get market intelligence
  public async getMarketIntelligence(sector: string, location: string = "Malaysia"): Promise<{
    insights: string[];
    trends: string[];
    opportunities: string[];
  }> {
    const query = `${sector} market trends startup opportunities ${location} 2024 2025`;
    const content = await this.run(query);
    
    if (typeof content === 'string' && content.length > 50) {
      return {
        insights: [content.substring(0, 200) + "..."],
        trends: [`${sector} sector showing growth in ${location}`],
        opportunities: [`Multiple opportunities available in ${sector} sector`]
      };
    }
    
    return {
      insights: ["Market data available through web search"],
      trends: ["Growing ecosystem in Malaysia"],
      opportunities: ["Various funding opportunities available"]
    };
  }
}

