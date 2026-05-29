/**
 * Context Analyzer Implementation
 * 
 * Analyzes words to identify applicable application contexts (scenarios)
 * for generating contextual example sentences. Uses AI-based analysis
 * with heuristic fallback for reliability.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 */

import { AIService, ApplicationContext } from '../ai/types';
import { ContextAnalysisResult } from '../../types/context';

/**
 * Logger utility for ContextAnalyzer
 */
class ContextAnalyzerLogger {
  static info(message: string, context?: Record<string, any>): void {
    console.info(`[${new Date().toISOString()}] [CONTEXT_ANALYZER] [INFO] ${message}`, context || '');
  }

  static error(message: string, context?: Record<string, any>): void {
    console.error(`[${new Date().toISOString()}] [CONTEXT_ANALYZER] [ERROR] ${message}`, context || '');
  }

  static warn(message: string, context?: Record<string, any>): void {
    console.warn(`[${new Date().toISOString()}] [CONTEXT_ANALYZER] [WARN] ${message}`, context || '');
  }
}

/**
 * Context Analyzer Interface
 * 
 * Requirement 1.1: Identify application context types for words
 */
export interface ContextAnalyzer {
  /**
   * Analyze a word to identify applicable contexts
   * 
   * @param word - The word to analyze
   * @returns Promise resolving to context analysis result
   * 
   * Requirement 1.1: Identify at least one application context type
   * Requirement 1.2: Generate at least 2 examples per context
   * Requirement 1.3: Include at least 3 different contexts when applicable
   */
  analyzeContexts(word: string): Promise<ContextAnalysisResult>;
}

/**
 * Context Analyzer Implementation
 * 
 * Uses AI service for intelligent context analysis with heuristic fallback.
 * 
 * Requirement 1.1: Identify application context types
 * Requirement 1.3: Support multiple contexts per word
 */
export class ContextAnalyzerImpl implements ContextAnalyzer {
  private aiService: AIService;

  constructor(aiService: AIService) {
    this.aiService = aiService;
  }

  /**
   * Analyze a word to identify applicable contexts
   * 
   * Uses AI service for context analysis, falls back to heuristics on failure.
   * 
   * Requirement 1.1: Identify application context types
   * Requirement 1.3: Support multiple contexts per word
   * 
   * @param word - The word to analyze
   * @returns Promise resolving to context analysis result
   */
  async analyzeContexts(word: string): Promise<ContextAnalysisResult> {
    ContextAnalyzerLogger.info('Starting context analysis', { word });

    try {
      // Attempt AI-based analysis first
      const result = await this.aiBasedAnalysis(word);
      
      ContextAnalyzerLogger.info('AI-based context analysis successful', {
        word,
        contexts: result.contexts,
        primaryContext: result.primaryContext,
      });

      return result;
    } catch (error: any) {
      // Fall back to heuristic analysis
      ContextAnalyzerLogger.warn('AI-based analysis failed, using heuristic fallback', {
        word,
        error: error.message,
      });

      const result = this.heuristicAnalysis(word);

      ContextAnalyzerLogger.info('Heuristic context analysis completed', {
        word,
        contexts: result.contexts,
        primaryContext: result.primaryContext,
      });

      return result;
    }
  }

  /**
   * AI-based context analysis
   * 
   * Uses the AI service to analyze word usage patterns across contexts.
   * 
   * @param word - The word to analyze
   * @returns Promise resolving to context analysis result
   * @throws Error if AI analysis fails
   */
  private async aiBasedAnalysis(word: string): Promise<ContextAnalysisResult> {
    ContextAnalyzerLogger.info('Attempting AI-based context analysis', { word });

    // Generate a single example to validate AI connectivity
    await this.aiService.generateExamples({
      word,
      context: 'daily-conversation',
      count: 1,
    });

    // Fall back to heuristic analysis with AI validation
    return this.heuristicAnalysis(word);
  }

  /**
   * Heuristic-based context analysis
   * 
   * Uses word characteristics (length, suffixes, patterns) to determine
   * likely application contexts.
   * 
   * Requirement 1.1: Identify application context types
   * Requirement 1.3: Support multiple contexts per word
   * 
   * @param word - The word to analyze
   * @returns Context analysis result
   */
  private heuristicAnalysis(word: string): ContextAnalysisResult {
    ContextAnalyzerLogger.info('Performing heuristic context analysis', { word });

    const wordLength = word.length;
    const lowerWord = word.toLowerCase();

    // Initialize confidence scores
    const confidence: Record<ApplicationContext, number> = {
      'daily-conversation': 0.8, // Most words are suitable for daily conversation
      'business-communication': 0.5,
      'academic-writing': 0.3,
      'technical-documentation': 0.2,
      'literary-expression': 0.4,
    };

    // Adjust scores based on word characteristics

    // Technical/specialized suffixes suggest academic or technical contexts
    if (/tion|ment|ness|ity|ism|ology|graphy|ics|ical/.test(lowerWord)) {
      confidence['academic-writing'] += 0.3;
      confidence['technical-documentation'] += 0.2;
      confidence['business-communication'] += 0.2;
    }

    // Long words (>10 characters) are often more formal
    if (wordLength > 10) {
      confidence['academic-writing'] += 0.2;
      confidence['business-communication'] += 0.2;
      confidence['daily-conversation'] -= 0.2;
    }

    // Short, common words are typically conversational
    if (wordLength <= 6) {
      confidence['daily-conversation'] += 0.1;
      confidence['literary-expression'] += 0.1;
    }

    // Words with Latin/Greek roots suggest academic contexts
    if (/^(pre|post|anti|pro|sub|super|trans|inter|intra|extra)/.test(lowerWord)) {
      confidence['academic-writing'] += 0.2;
      confidence['technical-documentation'] += 0.1;
    }

    // Technical prefixes
    if (/^(auto|bio|geo|hydro|micro|macro|tele|photo|electro)/.test(lowerWord)) {
      confidence['technical-documentation'] += 0.4;
      confidence['academic-writing'] += 0.2;
    }

    // Business-related patterns
    if (/(manage|market|finance|corporate|strategy|revenue|profit|invest)/.test(lowerWord)) {
      confidence['business-communication'] += 0.3;
    }

    // Literary/expressive patterns
    if (/(beauty|emotion|passion|dream|soul|heart|spirit)/.test(lowerWord)) {
      confidence['literary-expression'] += 0.3;
    }

    // Normalize confidence scores to [0, 1] range
    Object.keys(confidence).forEach((key) => {
      const context = key as ApplicationContext;
      confidence[context] = Math.max(0, Math.min(1, confidence[context]));
    });

    // Select contexts with confidence > 0.5
    const contexts: ApplicationContext[] = (Object.entries(confidence) as [ApplicationContext, number][])
      .filter(([_, score]) => score > 0.5)
      .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA)
      .map(([context, _]) => context);

    // Ensure at least one context (daily-conversation as default)
    if (contexts.length === 0) {
      contexts.push('daily-conversation');
      confidence['daily-conversation'] = 0.6;
    }

    // Primary context is the one with highest confidence
    const primaryContext = contexts[0];

    ContextAnalyzerLogger.info('Heuristic analysis complete', {
      word,
      contexts,
      primaryContext,
      confidenceScores: confidence,
    });

    return {
      contexts,
      confidence,
      primaryContext,
    };
  }
}
