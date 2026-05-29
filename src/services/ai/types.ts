/**
 * AI Service Types and Interfaces
 * 
 * Defines the interfaces and types for AI service integration,
 * supporting both OpenAI and Claude adapters for generating
 * natural, contextual example sentences.
 * 
 * **Validates: Requirements 6.1, 6.2**
 */

/**
 * Application context types for scenario-based generation
 * Requirement 1.1: Scenario-based example generation
 */
export type ApplicationContext =
  | 'daily-conversation'
  | 'business-communication'
  | 'academic-writing'
  | 'technical-documentation'
  | 'literary-expression';

/**
 * Configuration for AI service providers
 * Requirement 6.1: AI service interface definition
 */
export interface AIServiceConfig {
  /** API key for authentication */
  apiKey: string;
  /** Model identifier (e.g., 'gpt-3.5-turbo', 'claude-3-sonnet') */
  model: string;
  /** Base API URL */
  apiUrl: string;
  /** Maximum number of retry attempts on failure */
  maxRetries: number;
  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Request parameters for AI example generation
 * Requirement 6.2: AI service parameter support
 */
export interface AIGenerationRequest {
  /** The word to generate examples for */
  word: string;
  /** Application context for scenario-based generation */
  context: ApplicationContext;
  /** Number of examples to generate */
  count: number;
  /** Optional constraints for generation */
  constraints?: {
    /** Minimum sentence length in words */
    minLength?: number;
    /** Maximum sentence length in words */
    maxLength?: number;
    /** Patterns to avoid in generated sentences */
    avoidPatterns?: string[];
  };
}

/**
 * Response from AI example generation
 * Requirement 6.1: AI service interface definition
 */
export interface AIGenerationResponse {
  /** Generated example sentences */
  examples: Array<{
    sentence: string;
    translation: string;
    highlightWord: string;
  }>;
  /** Metadata about the generation */
  metadata: {
    /** Model used for generation */
    model: string;
    /** Number of tokens consumed */
    tokensUsed: number;
    /** Generation time in milliseconds */
    generationTime: number;
  };
}

/**
 * AI Service Error
 * Requirement 6.5: Error handling for AI service failures
 */
export class AIServiceError extends Error {
  /** AI provider that generated the error */
  provider: string;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Original error from the provider */
  originalError?: Error;

  constructor(
    message: string,
    provider: string,
    statusCode?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AIServiceError';
    this.provider = provider;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Request parameters for AI word list generation
 * Requirements 3.1, 3.2: Generate complete daily learning content in a single call
 */
export interface WordListGenerationRequest {
  /** Number of words to generate */
  count: number;
  /** Words already learned/used, to avoid repetition */
  usedWords: string[];
  /** Optional theme for the word list */
  theme?: string;
  /** Optional difficulty level */
  difficulty?: string;
}

/**
 * Raw word data as returned by the AI
 * Requirement 3.1: Word data structure with phonetics, definitions, and examples
 */
export interface RawWordData {
  /** The word itself */
  word: string;
  /** IPA phonetic transcription */
  phonetic?: string;
  /** Array of definitions with part of speech and bilingual meanings */
  definitions: Array<{
    partOfSpeech: string;
    meaningCN: string;
    meaningEN: string;
  }>;
  /** Array of example sentences with translations */
  examples: Array<{
    sentence: string;
    translation: string;
    highlightWord: string;
  }>;
}

/**
 * Raw word association data as returned by the AI
 * Requirement 4.2: Word association structure
 */
export interface RawAssociationData {
  /** First word in the association */
  word1: string;
  /** Second word in the association */
  word2: string;
  /** Type of association (e.g., 'semantic', 'theme', 'root', 'context') */
  associationType: string;
  /** Human-readable description of the association */
  description: string;
}

/**
 * Raw sentence chain data as returned by the AI
 * Requirement 5.1: Sentence chain structure
 */
export interface RawSentenceChainData {
  /** The sentence using multiple words */
  sentence: string;
  /** Chinese translation of the sentence */
  translation: string;
  /** Words from the daily list used in this sentence */
  usedWords: string[];
}

/**
 * Response from AI word list generation
 * Requirements 3.1, 3.2, 6.1: Complete daily learning content response
 */
export interface WordListGenerationResponse {
  /** Generated word data */
  words: RawWordData[];
  /** Generated word associations */
  associations: RawAssociationData[];
  /** Generated sentence chains */
  sentenceChains: RawSentenceChainData[];
  /** Metadata about the generation */
  metadata: {
    /** Model used for generation */
    model: string;
    /** Number of tokens consumed */
    tokensUsed: number;
    /** Generation time in milliseconds */
    generationTime: number;
  };
}

/**
 * Main AI Service Interface
 * Requirement 6.1: AI service interface with generation methods
 * Requirement 6.2: Support for word, context, and count parameters
 */
export interface AIService {
  /**
   * Generate example sentences for a word in a specific context
   * 
   * @param request - Generation request parameters
   * @returns Promise resolving to generated examples with metadata
   * @throws AIServiceError when generation fails
   * 
   * Requirement 6.3: OpenAI adapter implementation
   * Requirement 6.4: Claude adapter implementation
   */
  generateExamples(request: AIGenerationRequest): Promise<AIGenerationResponse>;

  /**
   * Generate sentence chains using multiple words
   * 
   * @param words - Array of words to include in chains
   * @param context - Application context for generation
   * @param count - Number of sentence chains to generate
   * @returns Promise resolving to array of sentence chains
   * @throws AIServiceError when generation fails
   * 
   * Requirement 5.1: Generate 5-8 sentence chains per word group
   * Requirement 5.2: Each chain uses 2-4 words
   */
  generateSentenceChains(
    words: string[],
    context: ApplicationContext,
    count: number
  ): Promise<Array<{
    sentence: string;
    translation: string;
    usedWords: string[];
  }>>;

  /**
   * Generate a complete word list with associations and sentence chains
   * 
   * @param request - Word list generation request parameters
   * @returns Promise resolving to generated words, associations, sentence chains, and metadata
   * @throws AIServiceError when generation fails
   * 
   * Requirements 3.1, 3.2: Single-call generation of all daily learning content
   * Requirement 6.1: AI service interface definition
   */
  generateWordList(request: WordListGenerationRequest): Promise<WordListGenerationResponse>;

  /**
   * Validate service configuration and connectivity
   * 
   * @returns Promise resolving to true if connection is valid
   * 
   * Requirement 6.1: Service validation capability
   */
  validateConnection(): Promise<boolean>;
}
