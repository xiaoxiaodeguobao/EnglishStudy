/**
 * Error and Logging Types
 * 
 * Defines the structure for error handling and logging.
 * Requirements: 12.5
 */

export interface ErrorLog {
  id: string;
  timestamp: Date;
  errorType: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: ErrorContext;
}

export type ErrorType = 
  | 'network' 
  | 'validation' 
  | 'storage' 
  | 'generation' 
  | 'data_integrity';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  userId?: string;
  planId?: string;
  action: string;
  additionalData?: Record<string, any>;
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationError';
  }
}
