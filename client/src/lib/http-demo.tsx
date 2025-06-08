/**
 * Practical demonstration of the HTTP client usage
 * This component shows real implementation patterns for the ecosystem platform
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Startup {
  id: number;
  name: string;
  description: string;
  sector: string;
  location: string;
  website?: string;
}

interface Stats {
  startups: number;
  opportunities: number;
  investors: number;
  totalFunding: string;
}

export function HttpClientDemo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Simple GET request example
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get<Stats>('/api/stats'),
  });

  // GET with query parameters
  const { data: startups, isLoading: startupsLoading } = useQuery({
    queryKey: ['startups'],
    queryFn: () => api.get<Startup[]>('/api/startups', { 
      limit: 10,
      sector: 'HealthTech' 
    }),
  });

  // Search functionality with dynamic parameters
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => api.get('/api/search', { q: searchQuery }),
    enabled: searchQuery.length > 2,
  });

  // POST mutation example
  const createStartupMutation = useMutation({
    mutationFn: (newStartup: Omit<Startup, 'id'>) => 
      api.post<Startup>('/api/startups', newStartup),
    onSuccess: (startup) => {
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      toast({
        title: 'Success',
        description: `${startup.name} created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // PATCH mutation example
  const updateStartupMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Startup> }) => 
      api.patch<Startup>(`/api/startups/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      toast({
        title: 'Updated',
        description: 'Startup updated successfully',
      });
    },
  });

  const handleCreateStartup = () => {
    createStartupMutation.mutate({
      name: 'EcoTech Solutions',
      description: 'Sustainable technology for urban environments',
      sector: 'CleanTech',
      location: 'Kuala Lumpur',
      website: 'https://ecotech.my',
    });
  };

  const handleUpdateStartup = (id: number) => {
    updateStartupMutation.mutate({
      id,
      updates: { description: 'Updated description via HTTP client' }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">HTTP Client Demonstration</h2>
      
      {/* Stats Display - Simple GET */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics (GET /api/stats)</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div>Loading stats...</div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.startups}</div>
                <div className="text-sm text-muted-foreground">Startups</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.opportunities}</div>
                <div className="text-sm text-muted-foreground">Opportunities</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.investors}</div>
                <div className="text-sm text-muted-foreground">Investors</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalFunding}</div>
                <div className="text-sm text-muted-foreground">Total Funding</div>
              </div>
            </div>
          ) : (
            <div>No stats available</div>
          )}
        </CardContent>
      </Card>

      {/* Search Example - GET with parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Functionality (GET /api/search)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="text"
            placeholder="Search startups and opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
          {searchLoading && <div>Searching...</div>}
          {searchResults && (
            <div>
              <div className="text-sm text-muted-foreground">
                Found {searchResults.total} results
              </div>
              <div className="mt-2 space-y-2">
                {searchResults.startups?.slice(0, 3).map((startup: any) => (
                  <div key={startup.id} className="p-2 border rounded">
                    <div className="font-medium">{startup.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {startup.sector} • {startup.location}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Startups List - GET with filters */}
      <Card>
        <CardHeader>
          <CardTitle>HealthTech Startups (GET /api/startups?sector=HealthTech)</CardTitle>
        </CardHeader>
        <CardContent>
          {startupsLoading ? (
            <div>Loading startups...</div>
          ) : startups && startups.length > 0 ? (
            <div className="space-y-3">
              {startups.map((startup) => (
                <div key={startup.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{startup.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {startup.description?.slice(0, 100)}...
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {startup.location}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStartup(startup.id)}
                    disabled={updateStartupMutation.isPending}
                  >
                    Update
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div>No startups found</div>
          )}
        </CardContent>
      </Card>

      {/* Mutation Examples - POST */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Startup (POST /api/startups)</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleCreateStartup}
            disabled={createStartupMutation.isPending}
          >
            {createStartupMutation.isPending ? 'Creating...' : 'Create Test Startup'}
          </Button>
          {createStartupMutation.isSuccess && (
            <div className="mt-2 text-sm text-green-600">
              Startup created successfully!
            </div>
          )}
        </CardContent>
      </Card>

      {/* HTTP Client Features */}
      <Card>
        <CardHeader>
          <CardTitle>HTTP Client Features Demonstrated</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✓ <strong>GET requests</strong> with automatic JSON parsing</li>
            <li>✓ <strong>Query parameters</strong> with type safety</li>
            <li>✓ <strong>POST/PATCH mutations</strong> with data validation</li>
            <li>✓ <strong>Automatic authentication</strong> via session tokens</li>
            <li>✓ <strong>Error handling</strong> with user-friendly messages</li>
            <li>✓ <strong>React Query integration</strong> for caching and state management</li>
            <li>✓ <strong>TypeScript support</strong> for compile-time safety</li>
            <li>✓ <strong>Loading states</strong> and optimistic updates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Usage examples for direct API calls without React Query
export const directApiExamples = {
  // Simple data fetching
  fetchStats: async () => {
    try {
      const stats = await api.get<Stats>('/api/stats');
      console.log('Platform stats:', stats);
      return stats;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  },

  // Create with error handling
  createStartup: async (startupData: Omit<Startup, 'id'>) => {
    try {
      const startup = await api.post<Startup>('/api/startups', startupData);
      console.log('Created startup:', startup);
      return startup;
    } catch (error: any) {
      if (error.status === 401) {
        console.error('Unauthorized - please login');
        // Redirect to login
      } else if (error.status === 400) {
        console.error('Invalid data:', error.data);
      } else {
        console.error('Unexpected error:', error.message);
      }
      throw error;
    }
  },

  // Search with dynamic filters
  searchEcosystem: async (query: string, filters: Record<string, any> = {}) => {
    try {
      const results = await api.get('/api/search', {
        q: query,
        ...filters
      });
      console.log('Search results:', results);
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return { startups: [], opportunities: [], total: 0 };
    }
  },

  // Batch operations
  batchFetchStartups: async (ids: number[]) => {
    try {
      const promises = ids.map(id => api.get<Startup>(`/api/startups/${id}`));
      const startups = await Promise.all(promises);
      console.log('Fetched startups:', startups);
      return startups;
    } catch (error) {
      console.error('Batch fetch failed:', error);
      throw error;
    }
  }
};