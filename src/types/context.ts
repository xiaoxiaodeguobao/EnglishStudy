/**
 * Context Type Definitions
 * 
 * Defines UI-related mappings and interfaces for application contexts.
 * ApplicationContext type is imported from AI service types.
 * 
 * **Validates: Requirements 1.1, 1.4**
 */

import { ApplicationContext } from '../services/ai/types';

/**
 * Chinese labels for application contexts
 * Used for displaying context names in the UI
 * 
 * Requirement 1.4: Label contexts in UI metadata
 * Requirement 8.2: Display scenario labels
 */
export const ContextLabels: Record<ApplicationContext, string> = {
  'daily-conversation': '日常对话',
  'business-communication': '商务交流',
  'academic-writing': '学术写作',
  'technical-documentation': '技术文档',
  'literary-expression': '文学表达',
};

/**
 * Color mappings for application contexts
 * Used for visual differentiation in the UI
 * 
 * Requirement 8.2: Display scenario labels with visual distinction
 * Requirement 8.5: Use different colors to highlight words
 */
export const ContextColors: Record<ApplicationContext, string> = {
  'daily-conversation': 'bg-blue-100 text-blue-800',
  'business-communication': 'bg-purple-100 text-purple-800',
  'academic-writing': 'bg-green-100 text-green-800',
  'technical-documentation': 'bg-orange-100 text-orange-800',
  'literary-expression': 'bg-pink-100 text-pink-800',
};

/**
 * Result of context analysis for a word
 * 
 * Requirement 1.1: Identify application context types
 * Requirement 1.3: Support multiple contexts per word
 */
export interface ContextAnalysisResult {
  /** List of applicable contexts for the word */
  contexts: ApplicationContext[];
  /** Confidence scores for each context (0-1) */
  confidence: Record<ApplicationContext, number>;
  /** The primary/most relevant context */
  primaryContext: ApplicationContext;
}

// Re-export ApplicationContext for convenience
export type { ApplicationContext };
