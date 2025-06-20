import config from '../config/environment';

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  context?: Record<string, any>;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public context?: Record<string, any>;

  constructor(message: string, status: number, code?: string, context?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.context = context;
  }
}

export class NetworkError extends Error {
  public isNetworkError = true;

  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  public field: string;
  public value?: any;

  constructor(message: string, field: string, value?: any) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

class ErrorHandler {
  private static errorQueue: ErrorLog[] = [];
  private static maxQueueSize = 100;

  /**
   * Log an error with context
   */
  static logError(
    error: Error | string,
    level: 'error' | 'warning' | 'info' = 'error',
    context?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      context
    };

    // Add to queue
    this.errorQueue.push(errorLog);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console in development
    if (config.IS_DEVELOPMENT) {
      console.error('Error logged:', errorLog);
    }

    // Send to error tracking service in production
    if (config.IS_PRODUCTION) {
      this.sendToErrorService(errorLog);
    }
  }

  /**
   * Handle API errors with user-friendly messages
   */
  static handleApiError(error: any): string {
    if (error instanceof ApiError) {
      return this.getApiErrorMessage(error);
    }

    if (error instanceof NetworkError) {
      return 'Network connection error. Please check your internet connection and try again.';
    }

    if (error instanceof ValidationError) {
      return `Invalid ${error.field}: ${error.message}`;
    }

    // Generic error handling
    if (error?.message) {
      // Handle common backend error messages
      if (error.message.includes('Network request failed')) {
        return 'Unable to connect to our servers. Please try again.';
      }
      
      if (error.message.includes('timeout')) {
        return 'The request timed out. Please try again.';
      }

      if (error.message.includes('Session expired')) {
        return 'Your session has expired. Please log in again.';
      }

      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get user-friendly message for API errors
   */
  private static getApiErrorMessage(error: ApiError): string {
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 409:
        return 'Conflict: ' + (error.message || 'This action conflicts with existing data.');
      case 422:
        return 'Validation error: ' + (error.message || 'Please check your input.');
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. We\'re working to fix this issue.';
      case 502:
        return 'Service temporarily unavailable. Please try again.';
      case 503:
        return 'Service maintenance in progress. Please try again later.';
      default:
        return error.message || 'An error occurred while processing your request.';
    }
  }

  /**
   * Parse fetch response and throw appropriate error
   */
  static async parseResponseError(response: Response): Promise<never> {
    let errorMessage = response.statusText;
    let errorCode = response.status.toString();
    let context: any = {};

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
        errorCode = errorData.code || errorCode;
        context = errorData;
      } else {
        errorMessage = await response.text() || errorMessage;
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
    }

    throw new ApiError(errorMessage, response.status, errorCode, context);
  }

  /**
   * Wrap fetch with error handling
   */
  static async fetchWithErrorHandling(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        await this.parseResponseError(response);
      }

      return response;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new NetworkError('Network request failed');
      }
      throw error;
    }
  }

  /**
   * Send error to external error tracking service
   */
  private static async sendToErrorService(errorLog: ErrorLog): Promise<void> {
    try {
      // In a real production app, you'd send to services like Sentry, LogRocket, etc.
      // For now, we'll just log to a backend endpoint if available
      await fetch(`${config.API_BASE_URL}/api/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorLog)
      });
    } catch (error) {
      console.warn('Failed to send error to tracking service:', error);
    }
  }

  /**
   * Get all logged errors (for debugging)
   */
  static getErrorLogs(): ErrorLog[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error logs
   */
  static clearErrorLogs(): void {
    this.errorQueue = [];
  }

  /**
   * Generate unique error ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Setup global error handlers
   */
  static setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason || 'Unhandled promise rejection',
        'error',
        { type: 'unhandledrejection' }
      );
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.logError(
        event.error || event.message || 'Uncaught error',
        'error',
        { 
          type: 'uncaughterror',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      );
    });
  }
}

// Setup global error handlers when the module loads
if (typeof window !== 'undefined') {
  ErrorHandler.setupGlobalErrorHandlers();
}

export default ErrorHandler; 