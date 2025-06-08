/**
 * Usage examples for the HTTP client demonstrating reusable API patterns
 * This file shows how to use the HttpClient and api utilities for common operations
 */

import { api, httpClient } from './queryClient';
import type { User, Startup, Opportunity, Event } from '../../../shared/schema';

// ============= TYPE DEFINITIONS =============
interface SearchFilters {
  type?: string[];
  sector?: string;
  location?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
}

interface ApiResponse<T> {
  data: T;
  status: string;
  message?: string;
}

// ============= AUTHENTICATION OPERATIONS =============
export const authApi = {
  // User login
  login: async (credentials: LoginRequest): Promise<{ user: User; sessionId: string }> => {
    return api.post<{ user: User; sessionId: string }>('/api/login', credentials);
  },

  // User registration
  register: async (userData: RegisterRequest): Promise<{ user: User; sessionId: string }> => {
    return api.post<{ user: User; sessionId: string }>('/api/register', userData);
  },

  // Logout
  logout: async (): Promise<void> => {
    return api.post<void>('/api/logout');
  },

  // Check authentication status
  checkAuth: async (): Promise<{ user: User }> => {
    return api.get<{ user: User }>('/api/me');
  },
};

// ============= USER OPERATIONS =============
export const userApi = {
  // Get user profile
  getProfile: async (userId: number): Promise<User> => {
    return api.get<User>(`/api/users/${userId}`);
  },

  // Update user profile
  updateProfile: async (userId: number, updates: Partial<User>): Promise<User> => {
    return api.patch<User>(`/api/users/${userId}`, updates);
  },

  // Upload user avatar
  uploadAvatar: async (userId: number, file: File): Promise<{ avatarUrl: string }> => {
    const response = await api.upload<{ avatarUrl: string }>(`/api/users/${userId}/avatar`, file, 'avatar');
    return response;
  },

  // Submit onboarding responses
  submitOnboarding: async (responses: Record<string, any>): Promise<void> => {
    return api.post<void>('/api/users/onboarding', responses);
  },
};

// ============= STARTUP OPERATIONS =============
export const startupApi = {
  // Get all startups with filters
  getStartups: async (filters?: SearchFilters): Promise<Startup[]> => {
    return api.get<Startup[]>('/api/startups', filters);
  },

  // Get single startup
  getStartup: async (id: number): Promise<Startup> => {
    return api.get<Startup>(`/api/startups/${id}`);
  },

  // Create new startup
  createStartup: async (startupData: Omit<Startup, 'id' | 'createdAt'>): Promise<Startup> => {
    return api.post<Startup>('/api/startups', startupData);
  },

  // Update startup
  updateStartup: async (id: number, updates: Partial<Startup>): Promise<Startup> => {
    return api.patch<Startup>(`/api/startups/${id}`, updates);
  },

  // Delete startup
  deleteStartup: async (id: number): Promise<void> => {
    return api.delete<void>(`/api/startups/${id}`);
  },

  // Upload startup logo
  uploadLogo: async (id: number, file: File): Promise<{ logoUrl: string }> => {
    return api.upload<{ logoUrl: string }>(`/api/startups/${id}/logo`, file, 'logo');
  },
};

// ============= OPPORTUNITY OPERATIONS =============
export const opportunityApi = {
  // Get opportunities with filters
  getOpportunities: async (filters?: SearchFilters): Promise<Opportunity[]> => {
    return api.get<Opportunity[]>('/api/opportunities', filters);
  },

  // Get single opportunity
  getOpportunity: async (id: number): Promise<Opportunity> => {
    return api.get<Opportunity>(`/api/opportunities/${id}`);
  },

  // Create opportunity
  createOpportunity: async (data: Omit<Opportunity, 'id' | 'createdAt'>): Promise<Opportunity> => {
    return api.post<Opportunity>('/api/opportunities', data);
  },

  // Update opportunity
  updateOpportunity: async (id: number, updates: Partial<Opportunity>): Promise<Opportunity> => {
    return api.patch<Opportunity>(`/api/opportunities/${id}`, updates);
  },

  // Save opportunity
  saveOpportunity: async (opportunityId: number): Promise<void> => {
    return api.post<void>(`/api/opportunities/${opportunityId}/save`);
  },

  // Unsave opportunity
  unsaveOpportunity: async (opportunityId: number): Promise<void> => {
    return api.delete<void>(`/api/opportunities/${opportunityId}/save`);
  },

  // Get saved opportunities
  getSavedOpportunities: async (): Promise<Opportunity[]> => {
    return api.get<Opportunity[]>('/api/opportunities/saved');
  },
};

// ============= EVENT OPERATIONS =============
export const eventApi = {
  // Get events
  getEvents: async (filters?: { search?: string; limit?: number; offset?: number }): Promise<Event[]> => {
    return api.get<Event[]>('/api/events', filters);
  },

  // Get single event
  getEvent: async (id: number): Promise<Event> => {
    return api.get<Event>(`/api/events/${id}`);
  },

  // Create event
  createEvent: async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> => {
    return api.post<Event>('/api/events', eventData);
  },

  // Update event
  updateEvent: async (id: number, updates: Partial<Event>): Promise<Event> => {
    return api.patch<Event>(`/api/events/${id}`, updates);
  },
};

// ============= SEARCH OPERATIONS =============
export const searchApi = {
  // Universal search
  search: async (query: string, filters?: SearchFilters) => {
    return api.get('/api/search', { q: query, ...filters });
  },

  // Get platform statistics
  getStats: async () => {
    return api.get('/api/stats');
  },
};

// ============= AI & RECOMMENDATIONS =============
export const aiApi = {
  // Get AI recommendations for opportunities
  getOpportunityRecommendations: async (): Promise<{ matches: any[] }> => {
    return api.get<{ matches: any[] }>('/api/recommendations/opportunities');
  },

  // Get AI recommendations for startups
  getStartupRecommendations: async (): Promise<{ matches: any[] }> => {
    return api.get<{ matches: any[] }>('/api/recommendations/startups');
  },

  // Trigger data scraping (admin only)
  scrapeData: async (): Promise<{ success: boolean; message: string }> => {
    return api.post<{ success: boolean; message: string }>('/api/scrape');
  },
};

// ============= ADVANCED HTTP CLIENT USAGE =============
export const advancedExamples = {
  // Custom HTTP client instance with different base URL
  createExternalApiClient: () => {
    return new (httpClient.constructor as any)('https://external-api.com', {
      'X-API-Version': 'v1',
      'X-Client': 'EcosystemPlatform',
    }, 30000); // 30 second timeout
  },

  // Batch operations with Promise.all
  batchGetStartups: async (ids: number[]): Promise<Startup[]> => {
    const promises = ids.map(id => startupApi.getStartup(id));
    return Promise.all(promises);
  },

  // Error handling with retry logic
  retryableRequest: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    throw new Error('Max retries exceeded');
  },

  // Upload multiple files
  uploadMultipleFiles: async (endpoint: string, files: File[]): Promise<any[]> => {
    const uploads = files.map(file => 
      httpClient.uploadFile(endpoint, file, 'files[]')
    );
    const results = await Promise.all(uploads);
    return results.map(result => result.data);
  },

  // Request with custom timeout and headers
  customRequest: async (endpoint: string, data: any) => {
    return httpClient.post(endpoint, data, {
      timeout: 5000,
      headers: {
        'X-Custom-Header': 'custom-value',
        'Content-Type': 'application/json',
      },
    });
  },

  // Polling for status updates
  pollForStatus: async (
    endpoint: string,
    interval: number = 2000,
    maxAttempts: number = 30
  ): Promise<any> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await api.get(endpoint);
      if (response.status === 'completed' || response.status === 'failed') {
        return response;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Polling timeout exceeded');
  },
};

// ============= HOOKS FOR REACT QUERY INTEGRATION =============
export const queryKeys = {
  startups: ['startups'] as const,
  startup: (id: number) => ['startups', id] as const,
  opportunities: ['opportunities'] as const,
  opportunity: (id: number) => ['opportunities', id] as const,
  events: ['events'] as const,
  event: (id: number) => ['events', id] as const,
  user: (id: number) => ['users', id] as const,
  search: (query: string, filters?: SearchFilters) => ['search', query, filters] as const,
  stats: ['stats'] as const,
  recommendations: (type: string) => ['recommendations', type] as const,
};

// Example usage in React components:
/*
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startupApi, queryKeys } from '@/lib/api-examples';

// In your React component:
const useStartups = (filters?: SearchFilters) => {
  return useQuery({
    queryKey: queryKeys.startups,
    queryFn: () => startupApi.getStartups(filters),
  });
};

const useCreateStartup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: startupApi.createStartup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.startups });
    },
  });
};
*/

export default {
  authApi,
  userApi,
  startupApi,
  opportunityApi,
  eventApi,
  searchApi,
  aiApi,
  advancedExamples,
  queryKeys,
};