interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

interface HttpError extends Error {
  status: number;
  statusText: string;
  data?: any;
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(baseURL: string = '', defaultHeaders: Record<string, string> = {}, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
    this.defaultTimeout = timeout;
  }

  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseURL || window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  private getHeaders(customHeaders?: HeadersInit): Record<string, string> {
    const sessionId = localStorage.getItem('sessionId');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
    };

    // Handle different types of HeadersInit
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    if (sessionId) {
      headers['Authorization'] = `Bearer ${sessionId}`;
    }

    return headers;
  }

  private async createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  private async handleResponse<T>(response: Response): Promise<HttpResponse<T>> {
    let data: T;
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = (await response.text()) as unknown as T;
    }

    if (!response.ok) {
      const error: HttpError = new Error(response.statusText || `HTTP ${response.status}`) as HttpError;
      error.status = response.status;
      error.statusText = response.statusText;
      error.data = data;
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<HttpResponse<T>> {
    const { params, timeout = this.defaultTimeout, headers: customHeaders, body, ...restConfig } = config;
    
    const url = this.buildURL(endpoint, params);
    const headers = this.getHeaders(customHeaders);

    const requestConfig: RequestInit = {
      method,
      headers,
      credentials: 'include',
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      ...restConfig,
    };

    const fetchPromise = fetch(url, requestConfig);
    const timeoutPromise = this.createTimeoutPromise(timeout);

    try {
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, config: RequestConfig = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, config);
  }

  async post<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, {
      ...config,
      body: data,
    });
  }

  async put<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, {
      ...config,
      body: data,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('PATCH', endpoint, {
      ...config,
      body: data,
    });
  }

  async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, config);
  }

  // Utility methods for direct data access (returns just the data)
  async getData<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.get<T>(endpoint, config);
    return response.data;
  }

  async postData<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const response = await this.post<T>(endpoint, data, config);
    return response.data;
  }

  async putData<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const response = await this.put<T>(endpoint, data, config);
    return response.data;
  }

  async patchData<T = any>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const response = await this.patch<T>(endpoint, data, config);
    return response.data;
  }

  async deleteData<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.delete<T>(endpoint, config);
    return response.data;
  }

  // Configuration methods
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  // File upload utility
  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData?: Record<string, string>,
    config: RequestConfig = {}
  ): Promise<HttpResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const { headers: customHeaders, ...restConfig } = config;
    
    // For file uploads, we need to handle headers differently
    const sessionId = localStorage.getItem('sessionId');
    const headers: Record<string, string> = { ...this.defaultHeaders };
    
    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(customHeaders)) {
        customHeaders.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    if (sessionId) {
      headers['Authorization'] = `Bearer ${sessionId}`;
    }
    
    // Remove Content-Type to let browser set it with boundary for multipart/form-data
    delete headers['Content-Type'];

    const url = this.buildURL(endpoint, config.params);
    const requestConfig: RequestInit = {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
      ...restConfig,
    };

    const fetchPromise = fetch(url, requestConfig);
    const timeoutPromise = this.createTimeoutPromise(config.timeout || this.defaultTimeout);

    try {
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }
}

// Create a default instance
export const httpClient = new HttpClient();

// Export types for consumers
export type { RequestConfig, HttpResponse, HttpError };