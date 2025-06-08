# HTTP Client Library

A comprehensive, reusable HTTP client for the Malaysian Social Enterprise Ecosystem Platform. This library provides a unified interface for all API communications with built-in authentication, error handling, and TypeScript support.

## Features

- **Type Safety**: Full TypeScript support with generic types
- **Authentication**: Automatic session token management
- **Error Handling**: Standardized error responses and timeout handling
- **File Uploads**: Built-in support for file uploads with progress tracking
- **Request Interceptors**: Automatic headers and authentication injection
- **Timeout Management**: Configurable request timeouts
- **Retry Logic**: Built-in retry mechanisms for failed requests
- **Query Parameters**: Easy URL parameter construction
- **Response Parsing**: Automatic JSON/text response parsing

## Quick Start

```typescript
import { api, httpClient } from '@/lib/queryClient';
import { startupApi, userApi } from '@/lib/api-examples';

// Simple GET request
const startups = await api.get('/api/startups');

// POST request with data
const newStartup = await api.post('/api/startups', {
  name: 'EcoTech Solutions',
  sector: 'CleanTech',
  location: 'Kuala Lumpur'
});

// Using specialized API modules
const opportunities = await startupApi.getStartups({ sector: 'HealthTech' });
const userProfile = await userApi.getProfile(123);
```

## API Modules

### Authentication API (`authApi`)
```typescript
// User login
const { user, sessionId } = await authApi.login({
  email: 'founder@startup.com',
  password: 'securePassword'
});

// User registration
const { user } = await authApi.register({
  email: 'new@user.com',
  password: 'password',
  name: 'John Doe',
  role: 'STARTUP_FOUNDER'
});

// Check authentication
const { user } = await authApi.checkAuth();

// Logout
await authApi.logout();
```

### User Management (`userApi`)
```typescript
// Get user profile
const user = await userApi.getProfile(userId);

// Update profile
const updatedUser = await userApi.updateProfile(userId, {
  company: 'My Startup',
  sector: 'FinTech'
});

// Upload avatar
const { avatarUrl } = await userApi.uploadAvatar(userId, avatarFile);

// Submit onboarding data
await userApi.submitOnboarding({
  startupStage: 'mvp',
  fundingNeeds: '100000',
  socialImpactFocus: 'education'
});
```

### Startup Operations (`startupApi`)
```typescript
// Get startups with filters
const startups = await startupApi.getStartups({
  sector: 'CleanTech',
  location: 'Kuala Lumpur',
  limit: 20
});

// Create new startup
const startup = await startupApi.createStartup({
  name: 'GreenTech Solutions',
  description: 'Sustainable technology for urban environments',
  sector: 'CleanTech',
  location: 'Penang',
  socialEnterpriseFlag: true
});

// Upload startup logo
const { logoUrl } = await startupApi.uploadLogo(startupId, logoFile);
```

### Opportunity Management (`opportunityApi`)
```typescript
// Get opportunities
const opportunities = await opportunityApi.getOpportunities({
  type: 'grant',
  sector: 'HealthTech'
});

// Save opportunity
await opportunityApi.saveOpportunity(opportunityId);

// Get saved opportunities
const saved = await opportunityApi.getSavedOpportunities();
```

### Search & Discovery (`searchApi`)
```typescript
// Universal search
const results = await searchApi.search('sustainable technology', {
  type: ['startup', 'opportunity'],
  sector: 'CleanTech'
});

// Platform statistics
const stats = await searchApi.getStats();
```

### AI Recommendations (`aiApi`)
```typescript
// Get opportunity recommendations
const { matches } = await aiApi.getOpportunityRecommendations();

// Get startup recommendations for funders
const { matches } = await aiApi.getStartupRecommendations();
```

## Advanced Usage

### Custom HTTP Client Instance
```typescript
// Create custom client for external APIs
const externalClient = new HttpClient('https://external-api.com', {
  'X-API-Key': 'your-api-key',
  'X-Client': 'EcosystemPlatform'
}, 30000); // 30 second timeout

const externalData = await externalClient.get('/external/endpoint');
```

### Error Handling with Retry Logic
```typescript
import { advancedExamples } from '@/lib/api-examples';

const data = await advancedExamples.retryableRequest(
  () => api.get('/api/unstable-endpoint'),
  3, // max retries
  1000 // delay between retries
);
```

### Batch Operations
```typescript
// Fetch multiple startups concurrently
const startupIds = [1, 2, 3, 4, 5];
const startups = await advancedExamples.batchGetStartups(startupIds);
```

### File Upload with Progress
```typescript
// Upload multiple files
const files = [file1, file2, file3];
const results = await advancedExamples.uploadMultipleFiles('/api/upload', files);
```

### Polling for Status Updates
```typescript
// Poll for job completion
const result = await advancedExamples.pollForStatus(
  '/api/jobs/123/status',
  2000, // check every 2 seconds
  30    // max 30 attempts
);
```

## React Query Integration

### Using with React Query Hooks
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startupApi, queryKeys } from '@/lib/api-examples';

function StartupsPage() {
  const queryClient = useQueryClient();
  
  // Fetch startups
  const { data: startups, isLoading } = useQuery({
    queryKey: queryKeys.startups,
    queryFn: () => startupApi.getStartups()
  });

  // Create startup mutation
  const createMutation = useMutation({
    mutationFn: startupApi.createStartup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.startups });
    }
  });

  const handleCreate = (data) => {
    createMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {startups?.map(startup => (
        <div key={startup.id}>{startup.name}</div>
      ))}
    </div>
  );
}
```

### Query Keys Convention
```typescript
import { queryKeys } from '@/lib/api-examples';

// Predefined query keys for consistent cache management
const keys = {
  startups: queryKeys.startups,           // ['startups']
  startup: queryKeys.startup(123),       // ['startups', 123]
  opportunities: queryKeys.opportunities, // ['opportunities']
  search: queryKeys.search('query', {}), // ['search', 'query', {}]
  stats: queryKeys.stats                  // ['stats']
};
```

## Configuration

### Default Headers
```typescript
// Set default headers for all requests
httpClient.setDefaultHeader('X-Client-Version', '1.0.0');
httpClient.setDefaultHeader('X-Platform', 'Web');

// Remove default header
httpClient.removeDefaultHeader('X-Client-Version');
```

### Base URL Configuration
```typescript
// Change base URL for different environments
httpClient.setBaseURL('https://api.staging.ecosystem.com');
```

### Request Timeouts
```typescript
// Custom timeout for specific request
const data = await httpClient.get('/api/slow-endpoint', {
  timeout: 30000 // 30 seconds
});
```

## Error Handling

### Error Types
```typescript
interface HttpError extends Error {
  status: number;
  statusText: string;
  data?: any;
}

try {
  await api.get('/api/protected-endpoint');
} catch (error: HttpError) {
  if (error.status === 401) {
    // Handle unauthorized
    redirectToLogin();
  } else if (error.status >= 500) {
    // Handle server errors
    showErrorToast('Server error occurred');
  }
}
```

### Automatic Error Handling
The HTTP client automatically handles:
- Network timeouts
- JSON parsing errors
- HTTP status error responses
- Authentication token injection
- Session management

## Best Practices

1. **Use TypeScript**: Always specify response types for better development experience
2. **Handle Errors**: Implement proper error handling for all API calls
3. **Cache Management**: Use React Query keys for consistent cache invalidation
4. **Loading States**: Show loading indicators during API calls
5. **Retry Logic**: Implement retry mechanisms for unstable endpoints
6. **Authentication**: Let the client handle authentication automatically
7. **File Uploads**: Use the built-in upload methods for file handling
8. **Batch Operations**: Use Promise.all for concurrent requests when appropriate

## Examples in Practice

### Creating a Custom Hook
```typescript
import { useQuery } from '@tanstack/react-query';
import { startupApi, queryKeys } from '@/lib/api-examples';

export const useStartupDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.startup(id),
    queryFn: () => startupApi.getStartup(id),
    enabled: !!id
  });
};
```

### Form Submission with Mutation
```typescript
import { useMutation } from '@tanstack/react-query';
import { startupApi } from '@/lib/api-examples';
import { useToast } from '@/hooks/use-toast';

export const useCreateStartup = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: startupApi.createStartup,
    onSuccess: (startup) => {
      toast({
        title: 'Success',
        description: `${startup.name} created successfully`
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};
```

This HTTP client provides a robust foundation for all API interactions in the Malaysian Social Enterprise Ecosystem Platform, ensuring type safety, error handling, and consistent patterns across the application.