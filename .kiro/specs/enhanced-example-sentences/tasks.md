# Implementation Plan: Enhanced Example Sentences and Sentence Chains

## Overview

This implementation plan transforms the example sentence generation system from template-based to AI-powered generation with context awareness, quality control, and intelligent caching. The system will integrate with OpenAI/Claude APIs to generate natural, diverse, and scenario-specific example sentences and sentence chains.

## Tasks

### Phase 1: Foundation (AI Service Integration)

- [x] 1. Set up AI service infrastructure
  - [x] 1.1 Create AIService interface and type definitions
    - Create `src/services/ai/types.ts` with AIService interface, AIServiceConfig, AIGenerationRequest, and AIGenerationResponse types
    - Define error types: AIServiceError with provider, statusCode, and originalError properties
    - _Requirements: 6.1, 6.2_
  
  - [x] 1.2 Implement OpenAI adapter
    - Create `src/services/ai/OpenAIAdapter.ts` implementing AIService interface
    - Implement generateExamples method with proper prompt construction
    - Implement generateSentenceChains method for multi-word sentences
    - Implement validateConnection method for connectivity checks
    - Parse JSON responses from OpenAI API with error handling
    - _Requirements: 6.3, 3.1, 3.2_
  
  - [x] 1.3 Implement Claude adapter
    - Create `src/services/ai/ClaudeAdapter.ts` implementing AIService interface
    - Implement generateExamples method with Claude-specific prompt format
    - Implement generateSentenceChains method
    - Implement validateConnection method
    - Parse JSON responses from Claude API with error handling
    - _Requirements: 6.4, 3.1, 3.2_
  
  - [x] 1.4 Add retry logic and error handling
    - Create `src/services/ai/RetryHandler.ts` with exponential backoff
    - Implement withRetry utility function with configurable maxAttempts and backoffMs
    - Integrate retry logic into both adapters
    - Add comprehensive error logging for all AI service calls
    - _Requirements: 6.6, 6.7_
  
  - [ ]* 1.5 Write unit tests for AI adapters
    - Test OpenAI adapter with mocked HTTP client responses
    - Test Claude adapter with mocked HTTP client responses
    - Test retry logic with simulated failures
    - Test error handling for various API error scenarios
    - Test prompt construction and response parsing
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [x] 2. Checkpoint - Verify AI service integration
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Context Analysis

- [x] 3. Implement context analysis system
  - [x] 3.1 Create context type definitions
    - Create `src/types/context.ts` with ApplicationContext type union
    - Define ContextLabels mapping for UI display (Chinese labels)
    - Define ContextColors mapping for UI styling
    - Define ContextAnalysisResult interface with contexts, confidence, and primaryContext
    - _Requirements: 1.1, 1.4_
  
  - [x] 3.2 Implement ContextAnalyzer interface and implementation
    - Create `src/services/context/ContextAnalyzer.ts` with ContextAnalyzer interface
    - Implement ContextAnalyzerImpl class with AI-based context analysis
    - Implement heuristic fallback logic for when AI analysis fails
    - Use word characteristics (length, suffixes) to determine likely contexts
    - Return confidence scores for each context type
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 3.3 Write unit tests for context analysis
    - Test AI-based context analysis with mocked AI service
    - Test heuristic fallback logic with various word types
    - Test confidence score calculation
    - Test edge cases (empty words, special characters, very long words)
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Checkpoint - Verify context analysis
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Quality Assessment

- [x] 5. Implement quality assessment system
  - [x] 5.1 Create quality assessment interfaces
    - Create `src/services/quality/types.ts` with DiversityMetrics, NaturalnessMetrics, and QualityAssessment interfaces
    - Define QualityAssessor interface with assessExamples, calculateDiversityScore, and calculateNaturalnessScore methods
    - _Requirements: 2.3, 2.4, 2.5, 9.1, 9.2_
  
  - [x] 5.2 Implement diversity score calculation
    - Create `src/services/quality/QualityAssessor.ts` with QualityAssessorImpl class
    - Implement calculateDiversityScore method
    - Calculate sentence length variance (normalize to 0-1)
    - Calculate structural diversity based on unique sentence beginnings
    - Calculate vocabulary richness (unique words / total words)
    - Compute weighted overall diversity score
    - _Requirements: 2.3, 2.4, 2.6, 9.1, 9.2_
  
  - [x] 5.3 Implement naturalness score calculation
    - Implement calculateNaturalnessScore method with heuristic-based scoring
    - Assess grammar correctness (capitalization, punctuation, basic structure)
    - Assess idiomatic expression (avoid template patterns, check for natural connectors)
    - Assess context appropriateness (word usage, sentence length)
    - Compute weighted overall naturalness score
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 9.2, 9.3_
  
  - [x] 5.4 Implement quality filtering and assessment
    - Implement assessExamples method to score entire example collections
    - Filter examples below quality thresholds
    - Return enhanced examples with diversity and naturalness scores
    - _Requirements: 4.5, 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 5.5 Write unit tests for quality assessment
    - Test diversity score with known diverse and repetitive example sets
    - Test naturalness score with various sentence patterns
    - Test quality filtering logic
    - Test edge cases (empty examples, malformed sentences)
    - Verify score calculations match expected ranges
    - _Requirements: 2.3, 2.4, 2.5, 9.1, 9.2, 9.3_

- [x] 6. Checkpoint - Verify quality assessment
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Cache Management

- [x] 7. Implement caching system
  - [x] 7.1 Extend VocabularyDB schema for caching
    - Update `src/services/VocabularyDB.ts` to add exampleCache and sentenceChainCache tables
    - Define ExampleCacheEntry interface with id, word, examples, generatedAt, expiresAt
    - Define SentenceChainCacheEntry interface with id, wordIds, chains, generatedAt, expiresAt
    - Update database version and migration logic
    - _Requirements: 7.1, 7.5_
  
  - [x] 7.2 Implement CacheManager interface and implementation
    - Create `src/services/cache/CacheManager.ts` with CacheManager interface
    - Implement CacheManagerImpl class with StorageService integration
    - Implement get method to retrieve cached examples with expiration check
    - Implement set method to save examples with automatic expiration date calculation
    - Implement isExpired method to check cache validity (30-day default)
    - Implement clear and clearAll methods for cache management
    - Implement getStats method for cache statistics
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_
  
  - [ ]* 7.3 Write unit tests for cache management
    - Test cache hit/miss scenarios with mocked storage
    - Test expiration checking logic
    - Test cache statistics calculation
    - Test cache clearing operations
    - Test edge cases (corrupted cache data, missing entries)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 8. Checkpoint - Verify cache management
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Enhanced Services

- [x] 9. Implement enhanced example sentence service
  - [x] 9.1 Create enhanced service interfaces
    - Create `src/services/enhanced/types.ts` with EnhancedExampleSentence interface extending ExampleSentence
    - Add context, diversityScore, naturalnessScore, and metadata fields
    - Define ExampleGenerationOptions and ExampleGenerationResult interfaces
    - Define EnhancedExampleSentenceService interface
    - _Requirements: 1.4, 2.3, 4.6, 9.6_
  
  - [x] 9.2 Implement EnhancedExampleSentenceService
    - Create `src/services/enhanced/EnhancedExampleSentenceService.ts`
    - Implement generateEnhancedExamples method orchestrating all components
    - Integrate ContextAnalyzer to identify applicable contexts
    - Distribute example generation across contexts
    - Call AIService for each context with appropriate constraints
    - Apply QualityAssessor to filter and score examples
    - Implement retry logic for insufficient quality examples
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 9.3 Implement cache integration
    - Implement getExamplesWithCache method
    - Check cache first before generating new examples
    - Return cached examples if valid (not expired)
    - Generate and cache new examples on cache miss
    - Log cache hit/miss for monitoring
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 9.4 Maintain backward compatibility
    - Implement legacy getExamples method from ExampleSentenceService interface
    - Convert EnhancedExampleSentence to ExampleSentence format
    - Ensure existing code continues to work
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 10. Implement enhanced sentence chain service
  - [x] 10.1 Create sentence chain service interfaces
    - Update `src/services/enhanced/types.ts` with EnhancedSentenceChain interface
    - Add context, qualityScore, and metadata fields
    - Define SentenceChainGenerationOptions interface
    - Define SentenceChainService interface
    - _Requirements: 5.1, 5.3, 5.6_
  
  - [x] 10.2 Implement SentenceChainService
    - Create `src/services/enhanced/SentenceChainService.ts`
    - Implement generateSentenceChains method
    - Determine applicable contexts for word combinations
    - Generate word combinations (2-4 words per chain)
    - Call AIService to generate chains for each context
    - Assess chain quality based on length, word usage, and translation
    - Filter and sort chains by quality score
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 10.3 Implement cache integration for sentence chains
    - Implement getSentenceChainsWithCache method
    - Create cache key from sorted word IDs
    - Check cache and return if valid
    - Generate and cache new chains on miss
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 10.4 Write integration tests for enhanced services
    - Test complete example generation flow with mocked dependencies
    - Test cache integration (hit and miss scenarios)
    - Test quality filtering and retry logic
    - Test sentence chain generation with multiple words
    - Test error handling and fallback behavior
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 4.1, 4.2, 5.1, 5.2, 7.1, 7.2_

- [x] 11. Checkpoint - Verify enhanced services
  - Ensure all tests pass, ask the user if questions arise.

### Phase 6: Configuration Management

- [x] 12. Implement configuration system
  - [x] 12.1 Create configuration interfaces
    - Create `src/config/types.ts` with ExampleServiceConfig interface
    - Define AI provider configuration (apiKey, model, apiUrl, maxRetries, timeout)
    - Define generation parameters (exampleCount, sentenceLength ranges)
    - Define quality thresholds (diversityScore, naturalnessScore)
    - Define cache configuration (enabled, expirationDays)
    - Define context configuration (enabled contexts, default context)
    - Define retry configuration (maxAttempts, backoffMs)
    - _Requirements: 10.1, 10.2_
  
  - [x] 12.2 Implement ConfigManager
    - Create `src/config/ConfigManager.ts` with ConfigManager interface
    - Implement loadConfig method to read from environment variables
    - Implement validateConfig method with comprehensive validation rules
    - Implement getConfig and updateConfig methods
    - Define sensible default configuration values
    - Merge environment config with defaults
    - _Requirements: 10.1, 10.2, 10.5, 10.6_
  
  - [x] 12.3 Integrate configuration with environment
    - Update `src/utils/envConfig.ts` to include AI service configuration
    - Add VITE_AI_PROVIDER, VITE_OPENAI_API_KEY, VITE_CLAUDE_API_KEY environment variables
    - Add VITE_AI_MODEL, VITE_AI_API_URL configuration options
    - Update .env.example with new configuration options
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 12.4 Write unit tests for configuration
    - Test configuration validation with valid and invalid configs
    - Test default configuration loading
    - Test environment variable integration
    - Test configuration merging logic
    - Test error handling for missing required fields
    - _Requirements: 10.1, 10.2, 10.5, 10.6_

- [x] 13. Checkpoint - Verify configuration management
  - Ensure all tests pass, ask the user if questions arise.

### Phase 7: UI Updates

- [x] 14. Update ExampleSentences component
  - [x] 14.1 Enhance ExampleSentences component interface
    - Update `src/components/ExampleSentences.tsx` to accept EnhancedExampleSentence[]
    - Add groupByContext prop (default: true)
    - Add showQualityIndicators prop (default: false)
    - Add filterContexts prop for context filtering
    - _Requirements: 8.1, 8.2, 8.6_
  
  - [x] 14.2 Implement context grouping display
    - Group examples by ApplicationContext when groupByContext is true
    - Display context headers with Chinese labels (ContextLabels)
    - Apply context-specific colors (ContextColors) to headers
    - Show example count per context group
    - _Requirements: 8.1, 8.2_
  
  - [x] 14.3 Add quality indicators
    - Display diversity score badge when showQualityIndicators is true
    - Display naturalness score badge when showQualityIndicators is true
    - Display sentence length (word count)
    - Use color-coded badges (green ≥80%, yellow ≥60%, red <60%)
    - _Requirements: 8.3, 9.6_
  
  - [ ]* 14.4 Write snapshot tests for ExampleSentences
    - Test component rendering with grouped examples
    - Test component rendering with quality indicators
    - Test component rendering with filtered contexts
    - Test empty state rendering
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 15. Update SentenceChainSection component
  - [x] 15.1 Enhance SentenceChainSection component interface
    - Update `src/components/SentenceChainSection.tsx` to accept EnhancedSentenceChain[]
    - Add showContextLabels prop (default: true)
    - Add filterContexts prop for context filtering
    - _Requirements: 8.4, 8.6_
  
  - [x] 15.2 Implement multi-color word highlighting
    - Assign different colors to each word in the chain (blue, green, purple, orange, pink)
    - Implement highlightMultipleWords helper function
    - Use regex to match and highlight multiple words with different colors
    - Display used word count and quality score
    - _Requirements: 8.5_
  
  - [x] 15.3 Add context labels to chains
    - Display context label badge for each chain when showContextLabels is true
    - Use context-specific colors for badges
    - Show Chinese context labels
    - _Requirements: 8.4_
  
  - [ ]* 15.4 Write snapshot tests for SentenceChainSection
    - Test component rendering with context labels
    - Test multi-color word highlighting
    - Test component rendering with filtered contexts
    - Test empty state rendering
    - _Requirements: 8.4, 8.5_

- [x] 16. Create ContextFilter component
  - [x] 16.1 Implement ContextFilter component
    - Create `src/components/ContextFilter.tsx` with ContextFilterProps interface
    - Display all available contexts as filter buttons
    - Implement toggle functionality for selecting/deselecting contexts
    - Add "Select All" and "Clear All" buttons
    - Apply context-specific colors to selected filters
    - _Requirements: 8.6_
  
  - [ ]* 16.2 Write snapshot tests for ContextFilter
    - Test component rendering with various context selections
    - Test select all and clear all functionality
    - Test toggle behavior
    - _Requirements: 8.6_

- [x] 17. Integrate enhanced services with UI
  - [x] 17.1 Update useExampleSentences hook
    - Update `src/hooks/useExampleSentences.ts` to use EnhancedExampleSentenceService
    - Call getExamplesWithCache instead of getExamples
    - Handle EnhancedExampleSentence type in return value
    - Maintain backward compatibility with existing usage
    - _Requirements: 1.1, 1.2, 1.3, 7.1, 7.2_
  
  - [x] 17.2 Update WordCard component integration
    - Update `src/components/WordCard.tsx` to pass enhanced examples to ExampleSentences
    - Add context filtering state management
    - Add quality indicator toggle
    - Integrate ContextFilter component
    - _Requirements: 8.1, 8.2, 8.3, 8.6_
  
  - [x] 17.3 Update DailyLearningPage integration
    - Update `src/pages/DailyLearningPage.tsx` to use enhanced sentence chains
    - Pass enhanced chains to SentenceChainSection component
    - Add context filtering for sentence chains
    - _Requirements: 5.1, 5.2, 5.3, 8.4, 8.5, 8.6_

- [x] 18. Checkpoint - Verify UI updates
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8: Integration and Testing

- [x] 19. End-to-end integration
  - [x] 19.1 Create service factory and dependency injection
    - Create `src/services/enhanced/ServiceFactory.ts`
    - Implement factory methods to create configured service instances
    - Wire together AIService, ContextAnalyzer, QualityAssessor, CacheManager
    - Initialize ConfigManager and load configuration
    - Create singleton instances for application-wide use
    - _Requirements: 6.1, 6.2, 10.1, 10.2, 10.3_
  
  - [x] 19.2 Add error boundaries and fallback UI
    - Create error boundary component for AI service failures
    - Display user-friendly error messages for network errors
    - Implement fallback to cached examples when AI service fails
    - Add retry button for failed generations
    - _Requirements: 6.5, 6.6_
  
  - [x] 19.3 Add loading states and progress indicators
    - Add loading spinner during example generation
    - Show progress indicator for multi-context generation
    - Display cache status (cached vs. newly generated)
    - Add skeleton loaders for better UX
    - _Requirements: 4.6, 7.1, 7.2_
  
  - [ ]* 19.4 Write integration tests
    - Test complete user flow: view word → generate examples → display with context grouping
    - Test cache behavior: first load (miss) → second load (hit)
    - Test context filtering: select contexts → see filtered examples
    - Test quality indicators: toggle on/off → verify display
    - Test sentence chains: view daily words → see chains with multi-color highlighting
    - Test error scenarios: API failure → fallback to cache → display error message
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 5.1, 5.2, 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 20. Performance optimization and monitoring
  - [x] 20.1 Add performance monitoring
    - Create `src/utils/MetricsLogger.ts` for logging AI service calls, cache operations, and quality assessments
    - Log API call duration, token usage, and success/failure
    - Log cache hit/miss rates and operation duration
    - Log quality assessment statistics (average scores, filtered count)
    - _Requirements: 6.7, 9.6_
  
  - [x] 20.2 Optimize rendering performance
    - Add React.memo to ExampleSentences and SentenceChainSection components
    - Implement virtual scrolling for large example lists (if needed)
    - Optimize highlighting algorithm for better performance
    - Add lazy loading for examples by context
    - _Requirements: 8.1, 8.2, 8.4, 8.5_
  
  - [x] 20.3 Implement request deduplication
    - Add request deduplication to prevent duplicate AI API calls
    - Use TanStack Query's built-in deduplication for example requests
    - Add request cancellation for unmounted components
    - _Requirements: 6.6, 7.1_

- [x] 21. Documentation and cleanup
  - [x] 21.1 Update API documentation
    - Document all new interfaces and types in code comments
    - Create API_SETUP.md section for AI service configuration
    - Document environment variables in .env.example
    - Add JSDoc comments to all public methods
    - _Requirements: 10.1, 10.2, 10.6_
  
  - [x] 21.2 Update user documentation
    - Update README.md with new features (context-aware examples, quality indicators)
    - Document how to configure AI providers (OpenAI vs. Claude)
    - Add troubleshooting section for common issues
    - Document cache management and clearing
    - _Requirements: 10.1, 10.2_
  
  - [x] 21.3 Code cleanup and refactoring
    - Remove any unused imports and dead code
    - Ensure consistent code formatting with Prettier
    - Run ESLint and fix all warnings
    - Verify all TypeScript types are properly defined
    - _Requirements: All_

- [x] 22. Final checkpoint - Complete feature verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are met and documented.
  - Confirm the feature is ready for user testing.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- The implementation uses TypeScript with React, Vitest for testing, Dexie for IndexedDB, and TanStack Query for data fetching
- AI service integration requires API keys to be configured in environment variables
- Cache expiration is set to 30 days by default but can be configured
- Quality thresholds (diversity ≥0.6, naturalness ≥0.7) can be adjusted in configuration
- Context filtering and quality indicators are optional UI features that can be toggled
- The design maintains backward compatibility with existing ExampleSentenceService interface
