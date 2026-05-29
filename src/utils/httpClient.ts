/**
 * HTTP Client Utility
 * 
 * Provides a robust HTTP client with retry logic, timeout handling, and error management.
 * Used for making API requests to external services (AI services, Dictionary API).
 * 
 * Requirements: 12.1, 12.2, 12.3
 */

import { envConfig } from './envConfig';
import { NetworkError } from '../types/error';

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * HTTP response wrapper
 */
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * Logger utility
 */
class Logger {
  static info(message: string, context?: Record<string, any>): void {
    if (envConfig.debugMode) {
      console.info(`[${new Date().toISOString()}] [HTTP] [INFO] ${message}`, context || '');
    }
  }

  static error(message: string, context?: Record<string, any>): void {
    console.error(`[${new Date().toISOString()}] [HTTP] [ERROR] ${message}`, context || '');
  }

  static warn(message: string, context?: Record<string, any>): void {
    if (envConfig.debugMode) {
      console.warn(`[${new Date().toISOString()}] [HTTP] [WARN] ${message}`, context || '');
    }
  }
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

/**
 * Delay execution for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Timeout errors are retryable
  if (error.name === 'AbortError') {
    return true;
  }

  // 5xx server errors are retryable
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // 429 Too Many Requests is retryable
  if (error.status === 429) {
    return true;
  }

  return false;
}

/**
 * HTTP Client class
 * 
 * Provides methods for making HTTP requests with built-in retry logic,
 * timeout handling, and error management.
 */
export class HttpClient {
  private readonly defaultTimeout: number;
  private readonly defaultRetries: number;
  private readonly defaultRetryDelay: number;

  constructor() {
    this.defaultTimeout = envConfig.apiTimeout;
    this.defaultRetries = envConfig.maxApiRetries;
    this.defaultRetryDelay = 1000; // 1 second
  }

  /**
   * Make an HTTP request with retry logic and timeout handling
   * 
   * Requirements: 12.1, 12.2, 12.3
   */
  private async makeRequest<T>(
    url: string,
    options: HttpRequestOptions,
    attempt: number = 1
  ): Promise<HttpResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
    } = options;

    const controller = createTimeoutController(timeout);

    try {
      Logger.info('Making HTTP request', {
        url,
        method,
        attempt,
        maxRetries: retries,
        timeout,
      });

      // Prepare request options
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: controller.signal,
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // Make the request
      const response = await fetch(url, fetchOptions);

      // Check if response is ok
      if (!response.ok) {
        const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;

        // Try to parse error response body
        try {
          const errorBody = await response.text();
          error.body = errorBody;
          Logger.error('HTTP request failed', {
            url,
            method,
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
          });
        } catch {
          Logger.error('HTTP request failed', {
            url,
            method,
            status: response.status,
            statusText: response.statusText,
          });
        }

        throw error;
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as any;
      }

      Logger.info('HTTP request successful', {
        url,
        method,
        status: response.status,
        attempt,
      });

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      // Handle timeout
      if (error.name === 'AbortError') {
        Logger.warn('HTTP request timeout', {
          url,
          method,
          timeout,
          attempt,
        });

        // Create a new error with timeout message instead of modifying the original
        const timeoutError: any = new Error(`Request timeout after ${timeout}ms`);
        timeoutError.name = 'AbortError';
        timeoutError.status = error.status;
        error = timeoutError;
      }

      // Retry logic
      if (attempt <= retries && isRetryableError(error)) {
        Logger.warn('Retrying HTTP request', {
          url,
          method,
          attempt,
          maxRetries: retries,
          retryDelay,
          error: error.message,
        });

        await delay(retryDelay * attempt); // Exponential backoff
        return this.makeRequest<T>(url, options, attempt + 1);
      }

      // Log final error
      Logger.error('HTTP request failed after retries', {
        url,
        method,
        attempts: attempt,
        error: error.message,
        stack: error.stack,
      });

      // Throw NetworkError
      throw new NetworkError(
        error.message || 'Network request failed'
      );
    }
  }

  /**
   * Make a GET request
   * 
   * @param url - The URL to request
   * @param options - Request options
   * @returns Promise with response data
   */
  async get<T = any>(url: string, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   * 
   * @param url - The URL to request
   * @param body - Request body
   * @param options - Request options
   * @returns Promise with response data
   */
  async post<T = any>(url: string, body?: any, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'POST', body });
  }

  /**
   * Make a PUT request
   * 
   * @param url - The URL to request
   * @param body - Request body
   * @param options - Request options
   * @returns Promise with response data
   */
  async put<T = any>(url: string, body?: any, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'PUT', body });
  }

  /**
   * Make a DELETE request
   * 
   * @param url - The URL to request
   * @param options - Request options
   * @returns Promise with response data
   */
  async delete<T = any>(url: string, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Make a PATCH request
   * 
   * @param url - The URL to request
   * @param body - Request body
   * @param options - Request options
   * @returns Promise with response data
   */
  async patch<T = any>(url: string, body?: any, options: Omit<HttpRequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'PATCH', body });
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
