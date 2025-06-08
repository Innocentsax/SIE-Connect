import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { httpClient, type HttpResponse } from "./http";

// Export httpClient for use in other modules
export { httpClient };

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Legacy function for backward compatibility
export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const sessionId = localStorage.getItem('sessionId');
  const headers: Record<string, string> = {};
  
  // Copy existing headers if they exist
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }
  
  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// New HTTP client methods for common API operations
export const api = {
  // GET requests
  get: <T = any>(endpoint: string, params?: Record<string, string | number | boolean>) =>
    httpClient.getData<T>(endpoint, { params }),

  // POST requests
  post: <T = any>(endpoint: string, data?: any) =>
    httpClient.postData<T>(endpoint, data),

  // PUT requests
  put: <T = any>(endpoint: string, data?: any) =>
    httpClient.putData<T>(endpoint, data),

  // PATCH requests
  patch: <T = any>(endpoint: string, data?: any) =>
    httpClient.patchData<T>(endpoint, data),

  // DELETE requests
  delete: <T = any>(endpoint: string) =>
    httpClient.deleteData<T>(endpoint),

  // File upload
  upload: <T = any>(endpoint: string, file: File, fieldName?: string, additionalData?: Record<string, string>) =>
    httpClient.uploadFile<T>(endpoint, file, fieldName, additionalData),
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
